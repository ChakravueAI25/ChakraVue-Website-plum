/**
 * Site palettes, and the colour transform that moves the original design
 * (warm near-blacks and amber light) into each of them.
 *
 * Every colour is taken apart in OKLCH (perceptual lightness, chroma, hue):
 * - near-whites become neutral white, so text is always white;
 * - dark colours take the palette's background hue and depth;
 * - lit colours take the palette's accent hue, keeping their lightness and
 *   the small hue differences between them (amber vs red vs gold);
 * - everything in between is blended in OKLab, so there are no muddy hue
 *   sweeps between the two.
 */

export type ThemeId = "original" | "plum" | "navy";

export type Theme = {
  id: ThemeId;
  name: string;
  /** Swatches shown on the switcher. */
  swatches: [string, string];
  /** Page background (dark end). */
  base: string;
  /** Shade that carries the accent (surfaces, glows, light). */
  tone: string;
  /** How saturated the accent light stays, relative to the original amber. */
  accentChroma: number;
  /** Accent lightness offset (a little brighter reads better on dark hues). */
  accentLift: number;
  /** Extra chroma for dark surfaces (cards, panels), so they carry the palette's shade instead of reading as grey. */
  surfaceTint: number;
  /** Strength of the palette's ambient light over the page (theme.css), 0 to 1. */
  ambient: number;
};

export const THEMES: Theme[] = [
  { id: "original", name: "Ember", swatches: ["#030303", "#ff8b12"], base: "#030303", tone: "#ff8b12", accentChroma: 1, accentLift: 0, surfaceTint: 0, ambient: 0 },
  { id: "plum", name: "Plum", swatches: ["#000000", "#331a31"], base: "#000000", tone: "#331a31", accentChroma: 0.62, accentLift: 0.03, surfaceTint: 0.04, ambient: 1 },
  { id: "navy", name: "Midnight", swatches: ["#090c13", "#352315"], base: "#090c13", tone: "#352315", accentChroma: 0.58, accentLift: 0.02, surfaceTint: 0.012, ambient: 0.75 },
];

export type RGBA = [number, number, number, number];

/* --- sRGB <-> OKLab ---------------------------------------------------------- */

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = toLinear(r / 255);
  const lg = toLinear(g / 255);
  const lb = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const out = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return out.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255)) as [number, number, number];
}

export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The original design's accent hue (amber #ff8b12), which every lit colour is measured from. */
const ORIGINAL_HUE = (() => {
  const [, a, b] = rgbToOklab(255, 139, 18);
  return Math.atan2(b, a);
})();

/** Lightness of the original page background (#030303). */
const PAGE_L = rgbToOklab(3, 3, 3)[0];

/* --- The transform ---------------------------------------------------------------- */

export type Transform = (r: number, g: number, b: number) => [number, number, number];

export function makeTransform(theme: Theme): Transform {
  const [baseL, baseA, baseB] = rgbToOklab(...parseHex(theme.base));
  const [, toneA, toneB] = rgbToOklab(...parseHex(theme.tone));
  const toneHue = Math.atan2(toneB, toneA);
  const toneChroma = Math.hypot(toneA, toneB);
  const baseChroma = Math.hypot(baseA, baseB);
  const baseHue = baseChroma > 0.004 ? Math.atan2(baseB, baseA) : toneHue;
  // Darks carry a trace of the tone even on a pure-black base.
  const darkChroma = Math.max(baseChroma, 0.012);

  return (r, g, b) => {
    const [L, a, bb] = rgbToOklab(r, g, b);
    const C = Math.hypot(a, bb);
    const h = Math.atan2(bb, a);

    // Near-white text and highlights: pure, neutral white.
    const white = smoothstep(0.045, 0.02, C) * smoothstep(0.78, 0.9, L);

    // Lit colours: the tone's hue, keeping half of their spread around amber.
    let dh = h - ORIGINAL_HUE;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    const litHue = toneHue + dh * 0.5;
    const surface = smoothstep(0.12, 0.24, L) * smoothstep(0.5, 0.3, L) * smoothstep(0.004, 0.02, C);
    const litC = Math.max(C * theme.accentChroma, toneChroma * surface);
    const litA = Math.cos(litHue) * litC;
    const litB = Math.sin(litHue) * litC;

    // Darks: the base's own hue and depth, so black becomes exactly the base.
    // Surfaces a little above the page (cards, panels) take more of the shade.
    const dC = darkChroma + theme.surfaceTint * smoothstep(PAGE_L + 0.01, 0.22, L);
    const darkA = Math.cos(baseHue) * dC;
    const darkB = Math.sin(baseHue) * dC;

    const dark = smoothstep(0.34, 0.12, L);
    let outA = litA + (darkA - litA) * dark;
    let outB = litB + (darkB - litB) * dark;
    outA *= 1 - white;
    outB *= 1 - white;

    // Lift the darks so the original page background lands on the base,
    // fading out through the mid-tones; anything darker than that
    // background stays just under the base. Lift only: a black base leaves
    // the original darks as they are.
    const lift = Math.max(0, baseL - PAGE_L);
    const liftedL = lift === 0 ? L : L < PAGE_L ? baseL - (PAGE_L - L) * 0.3 : L + lift * (1 - smoothstep(PAGE_L, 0.5, L));
    const outL = Math.min(1, Math.max(0, liftedL + theme.accentLift * (1 - dark) * (1 - white)));
    return oklabToRgb(outL, outA, outB);
  };
}

/* --- An affine colour matrix fitted to the transform, for canvases and art ----------- */

/**
 * Least-squares 3x4 matrix (rows r, g, b; columns r, g, b, 1, in 0..1 sRGB)
 * that best reproduces `transform` over the site's own colours. Used by the
 * WebGL scenes (theme/grade.ts) and, as an SVG feColorMatrix, by decorative
 * renders, which the stylesheet rewrite can't reach.
 */
export function fitMatrix(transform: Transform, samples: Array<[number, number, number]>): number[] {
  const rows = samples.map(([r, g, b]) => [r / 255, g / 255, b / 255, 1]);
  const targets = samples.map(([r, g, b]) => transform(r, g, b).map((v) => v / 255));
  // Normal equations: (XᵀX) w = Xᵀy, solved once per output channel.
  const xtx = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => rows.reduce((s, x) => s + x[i] * x[j], 0)));
  for (let i = 0; i < 4; i++) xtx[i][i] += 1e-4;
  const out: number[] = [];
  for (let c = 0; c < 3; c++) {
    const xty = Array.from({ length: 4 }, (_, i) => rows.reduce((s, x, k) => s + x[i] * targets[k][c], 0));
    out.push(...solve4(xtx.map((row) => [...row]), xty));
  }
  return out;
}

function solve4(m: number[][], v: number[]) {
  const n = 4;
  const a = m.map((row, i) => [...row, v[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col] / a[col][col];
      for (let k = col; k <= n; k++) a[r][k] -= f * a[col][k];
    }
  }
  return a.map((row, i) => row[n] / row[i]);
}
