import { THEMES, fitMatrix, makeTransform, parseHex, type ThemeId, type Transform } from "./palette";

/**
 * Applies the site's palette (Plum) at runtime.
 *
 * 1. Stylesheets: every colour value in every same-origin rule (including
 *    media queries and keyframes) is rewritten through the palette's
 *    transform. The stylesheets themselves are written in the original
 *    Ember colours; the transform turns them into Plum.
 * 2. Canvases and decorative renders, which CSS can't recolour, get an SVG
 *    colour-matrix filter fitted to the same transform (html[data-theme]
 *    rules in theme.css). Photographs of people and places are left alone.
 * 3. Stylesheets added later (hot reload, lazy chunks) are recoloured too.
 */

// Hex colours, and the three channels of rgb()/rgba(): only those, since the
// alpha may be a calc() with brackets of its own; it is kept as written.
const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(\s*[\d.]+(?:\s*,\s*|\s+)[\d.]+(?:\s*,\s*|\s+)[\d.]+/gi;
const FILTER_ID = "cv-theme-filter";
const SHORTHANDS = ["background", "border", "border-top", "border-right", "border-bottom", "border-left", "border-color", "outline", "mask", "-webkit-mask", "text-decoration", "column-rule"];

type Saved = { style: CSSStyleDeclaration; prop: string; value: string; priority: string };
const saved = new WeakMap<CSSStyleSheet, Saved[]>();
const seen = new Set<CSSStyleSheet>();

let current: ThemeId = "original";
let transform: Transform | null = null;
let grade: number[] | null = null;
const listeners = new Set<(id: ThemeId) => void>();

function collect(rules: CSSRuleList, out: Saved[]) {
  for (const rule of Array.from(rules)) {
    if ("style" in rule && rule.style instanceof CSSStyleDeclaration) {
      const style = rule.style;
      const keep = (prop: string) => {
        let value = style.getPropertyValue(prop);
        // `background: <gradient>, #colour` reads back its image list as
        // "<gradient>, initial", which isn't valid to write back, so the
        // rewrite would be dropped and the glow left in its original colour.
        if (prop.endsWith("-image")) value = value.replace(/\binitial\b/g, "none");
        COLOUR.lastIndex = 0;
        if (COLOUR.test(value)) out.push({ style, prop, value, priority: style.getPropertyPriority(prop) });
      };
      for (let i = 0; i < style.length; i++) keep(style[i]);
      // A shorthand containing var() reports its longhands as empty, so its
      // colours are only visible on the shorthand itself.
      for (const prop of SHORTHANDS) if (style.getPropertyValue(prop).includes("var(")) keep(prop);
    }
    if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) collect((rule as CSSGroupingRule).cssRules, out);
  }
}

function entries(sheet: CSSStyleSheet) {
  let list = saved.get(sheet);
  if (list) return list;
  list = [];
  try {
    collect(sheet.cssRules, list);
  } catch {
    // Cross-origin (the web font stylesheet): nothing of ours in there.
  }
  saved.set(sheet, list);
  return list;
}

const toHex = (n: number) => n.toString(16).padStart(2, "0");

/** A matched colour's red, green and blue (0 to 255). */
function channels(token: string): [number, number, number] {
  if (!token.startsWith("#")) return token.match(/[\d.]+/g)!.map(Number) as [number, number, number];
  const hex = token.slice(1);
  return parseHex(hex.length === 4 || hex.length === 8 ? hex.slice(0, hex.length === 4 ? 3 : 6) : hex);
}

function recolour(value: string, t: Transform) {
  return value.replace(COLOUR, (token) => {
    const next = t(...channels(token));
    if (!token.startsWith("#")) {
      let i = 0;
      return token.replace(/[\d.]+/g, () => String(next[i++]));
    }
    const hex = token.slice(1);
    const alpha = hex.length === 4 ? toHex(parseInt(hex[3] + hex[3], 16)) : hex.length === 8 ? hex.slice(6) : "";
    return `#${next.map(toHex).join("")}${alpha}`;
  });
}

function applySheet(sheet: CSSStyleSheet) {
  for (const { style, prop, value, priority } of entries(sheet)) {
    style.setProperty(prop, transform ? recolour(value, transform) : value, priority);
  }
}

function sheets() {
  return Array.from(document.styleSheets);
}

/** The colour-matrix filter the canvases and renders use, rebuilt per palette. */
function writeFilter() {
  let svg: Element | null = document.getElementById("cv-theme-defs");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "cv-theme-defs";
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    document.body.appendChild(svg);
  }
  if (!transform) {
    grade = null;
    svg.innerHTML = "";
    return;
  }
  // Fitted over the site's own colours plus a sweep of the warm range.
  const samples: Array<[number, number, number]> = [];
  for (const sheet of sheets()) {
    for (const { value } of entries(sheet)) {
      for (const token of value.match(COLOUR) ?? []) samples.push(channels(token));
    }
  }
  for (let v = 0; v <= 255; v += 17) samples.push([v, v * 0.62, v * 0.28], [v, v, v], [v, v * 0.45, v * 0.08]);
  const m = fitMatrix(transform, samples);
  grade = m;
  const f = (i: number) => m[i].toFixed(4);
  const matrix = (offset: boolean) =>
    [0, 1, 2].map((row) => `${f(row * 4)} ${f(row * 4 + 1)} ${f(row * 4 + 2)} 0 ${offset ? f(row * 4 + 3) : 0}`).join("  ") + "  0 0 0 1 0";
  // The full grade for art that fills its frame; a colour-only one (black
  // stays black) for renders shot on black, which blend into their panel.
  svg.innerHTML =
    `<filter id="${FILTER_ID}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix(true)}"/></filter>` +
    `<filter id="${FILTER_ID}-light" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix(false)}"/></filter>`;
}

export function setTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  current = theme.id;
  transform = theme.id === "original" ? null : makeTransform(theme);
  sheets().forEach((sheet) => {
    seen.add(sheet);
    applySheet(sheet);
  });
  writeFilter();
  document.documentElement.dataset.theme = theme.id;
  // The ambient light (theme.css) reads its colour from here: inline, so the
  // stylesheet rewrite never touches it.
  document.documentElement.style.setProperty("--cv-ambient", theme.tone);
  document.documentElement.style.setProperty("--cv-ambient-a", String(theme.ambient));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.base);
  listeners.forEach((listener) => listener(theme.id));
}

export const getTheme = () => current;

/** The palette's 3x4 colour matrix (rows r, g, b), or null on the original palette. */
export const getGrade = () => grade;

export function onThemeChange(listener: (id: ThemeId) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The site's one palette. */
const SITE_THEME: ThemeId = "plum";

/** Applies the site's palette and keeps late stylesheets in step. */
export function initTheme() {
  setTheme(SITE_THEME);

  let queued = 0;
  new MutationObserver(() => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(() => {
      for (const sheet of sheets()) {
        if (seen.has(sheet)) continue;
        seen.add(sheet);
        if (transform) applySheet(sheet);
      }
    });
  }).observe(document.head, { childList: true, subtree: true, characterData: true });
}
