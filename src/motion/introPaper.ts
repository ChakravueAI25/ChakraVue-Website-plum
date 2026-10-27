import { finePointer } from "./env";
import { fontsReady } from "./fonts";
import { gsap } from "./gsap";
import { logoMarkup } from "../brand/logoData";
import "../brand/logo.css";

/*
 * The intro without WebGL: the same story told with DOM layers. The sheet
 * tears along a clipped edge, the right side is pulled away onto "VUE AI",
 * then the rest goes and the mark lights. Used when the film (introFilm.ts)
 * can't run.
 */

// The drawing is a landscape sheet; phones get it turned on its side, as supplied.
const SHEET_WIDE = "/images/intro/archive-sheet-wide.webp";
const SHEET_TALL = "/images/intro/archive-sheet.webp";

// The archive keeps its sepia whatever the palette. Its colours are set
// inline, where the palette rewrite (which works on stylesheets) leaves them.
const PAPER_TOKENS =
  "--desk:#0d0906;--plate:rgba(236,222,192,.9);--ink:#2b1d10;--ink-soft:rgba(43,29,16,.6);--rust:#a2480f;--fibre:#f8f1e2;--fibre-shade:rgba(96,66,34,.42)";

type Pt = [number, number];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const played = (tl: gsap.core.Animation) => new Promise<void>((resolve) => tl.eventCallback("onComplete", () => resolve()));
const letters = (text: string) => [...text].map((c) => `<span><i>${c === " " ? "&nbsp;" : c}</i></span>`).join("");

function imageReady(src: string, maxMs: number) {
  const img = new Image();
  img.src = src;
  return Promise.race([img.decode().catch(() => undefined), wait(maxMs)]);
}

/** Small seeded generator, so the tear has the same character every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A torn edge from top to bottom: a slow sway, ragged mid-scale bites (the
 * steps of the reference tear) and fine fibre jitter. It never strays more
 * than `reach` from `cx`, and across the rows of `band` it runs straight
 * through `cx`, so it can pass between two letters.
 */
function tearLine(cx: number, reach: number, h: number, band: [number, number]): Pt[] {
  const rand = seeded(1887);
  const sway = (reach - 4) / 1.45;
  const knots = Array.from({ length: 15 }, () => rand() - 0.5);
  const pts: Pt[] = [];
  for (let y = -40; y <= h + 40; y += 7) {
    const t = (y + 40) / (h + 80);
    const k = t * (knots.length - 1);
    const i = Math.min(knots.length - 2, Math.floor(k));
    const f = k - i;
    const bite = knots[i] + (knots[i + 1] - knots[i]) * (f * f * (3 - 2 * f));
    const jitter = (rand() - 0.5) * 7;
    const off = Math.max(band[0] - y, y - band[1], 0);
    const free = Math.min(1, off / 70);
    const hold = free * free * (3 - 2 * free);
    pts.push([cx + (sway * Math.sin(t * Math.PI * 2.1 + 0.6) + bite * sway * 0.9) * hold + jitter * (0.35 + 0.65 * hold), y]);
  }
  return pts;
}

const polygon = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)}px ${y}px`).join(",");
const pathOf = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(" L")}`;

/** Plays until the page can open; the returned function tidies up once it has. */
export async function playPaper(root: HTMLElement, ready: Promise<unknown>): Promise<(opening: Promise<void>) => void> {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h > w;
  const sheet = portrait ? SHEET_TALL : SHEET_WIDE;

  const intro = document.createElement("div");
  intro.className = "intro";
  intro.setAttribute("style", PAPER_TOKENS);
  intro.innerHTML = `
    <div class="intro__stage">
      <div class="intro__glow"></div>
      <div class="intro__lockup">
        ${logoMarkup("intro__logo")}
        <p class="intro__name"><span class="intro__chakra">${letters("Chakra")}</span><span class="intro__vue">${letters("Vue AI")}</span></p>
      </div>
    </div>
    <div class="intro__half intro__half--a">
      <div class="intro__paper">
        <img class="intro__sheet" src="${sheet}" alt="" decoding="async" />
        <div class="intro__caption">
          <p class="intro__quote">
            <span class="intro__line"><span class="intro__word"><i>Transformation</i></span></span>
            <span class="intro__line"><span class="intro__word"><i>from</i></span> <span class="intro__word"><i>Analog</i></span> <span class="intro__word"><i>to</i></span> <span class="intro__word"><i class="intro__ai">AI.</i></span></span>
          </p>
        </div>
        <p class="intro__skip">${finePointer ? "Click" : "Tap"} to skip</p>
      </div>
    </div>
    <div class="intro__half intro__half--b"></div>`;
  root.appendChild(intro);

  const halfA = intro.querySelector<HTMLElement>(".intro__half--a")!;
  const halfB = intro.querySelector<HTMLElement>(".intro__half--b")!;
  const paper = halfA.querySelector<HTMLElement>(".intro__paper")!;
  const caption = paper.querySelector<HTMLElement>(".intro__caption")!;
  const q = (sel: string) => [...paper.querySelectorAll(sel)];

  // Skipping only hurries the reading; the page still has to be ready.
  let read: gsap.core.Timeline | null = null;
  let skipped = false;
  const onSkip = (e: Event) => {
    if (e instanceof KeyboardEvent && !["Escape", "Enter", " "].includes(e.key)) return;
    skipped = true;
    read?.timeScale(8);
  };
  intro.addEventListener("pointerdown", onSkip);
  window.addEventListener("keydown", onSkip);

  // 1. The sheet, full screen, and the caption written onto it. The name
  // stays hidden until the paper tears.
  const stage = intro.querySelector<HTMLElement>(".intro__stage")!;
  gsap.set([paper, stage], { autoAlpha: 0 });
  await Promise.race([Promise.all([imageReady(sheet, 1800), fontsReady]), wait(2200)]);
  read = gsap
    .timeline()
    .to(paper, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0)
    .from(q(".intro__sheet"), { scale: 1.07, duration: 3.6, ease: "cv.out" }, 0)
    .from(q(".intro__sheet"), { filter: "sepia(0.6) contrast(0.5) brightness(1.2) blur(2px)", duration: 1.6, ease: "power2.out" }, 0)
    .fromTo(caption, { clipPath: "inset(-14px 100% -48px -14px)" }, { clipPath: "inset(-14px -14px -48px -14px)", duration: 0.9, ease: "cv.inOut" }, 0.55)
    .from(q(".intro__word i"), { yPercent: 110, rotate: 3, duration: 0.9, stagger: 0.09, ease: "cv.out" }, 0.9)
    .fromTo(q(".intro__ai"), { textShadow: "0 0 0px rgba(255,138,40,0)" }, { textShadow: "0 0 18px rgba(255,138,40,0.75)", duration: 0.5, yoyo: true, repeat: 1, ease: "power2.inOut" }, 1.9)
    .from(q(".intro__skip"), { autoAlpha: 0, duration: 0.6 }, 1.4)
    .to({}, { duration: 0.01 }, 3.6);
  if (skipped) read.timeScale(8);

  await played(read);
  await ready;
  intro.removeEventListener("pointerdown", onSkip);
  window.removeEventListener("keydown", onSkip);

  // Measured now, with the typeface certainly in. "VUE AI" is set a little
  // apart from "CHAKRA" and starts right of centre; the tear runs through the
  // gap between them, so the paper still covers the logo and "CHAKRA".
  const lockup = intro.querySelector<HTMLElement>(".intro__lockup")!;
  const vue = intro.querySelector<HTMLElement>(".intro__vue")!;
  const name = intro.querySelector<HTMLElement>(".intro__name")!;
  const gap = Math.max(22, parseFloat(getComputedStyle(name).fontSize) * 0.55);
  gsap.set(vue, { x: gap });
  const vueBox = vue.getBoundingClientRect();
  const vueLeft = Math.min(w * (portrait ? 0.54 : 0.58), w * 0.95 - vueBox.width);
  const shift = vueLeft - vueBox.left;
  gsap.set(lockup, { x: shift });
  const nameBox = name.getBoundingClientRect();
  const reach = portrait ? 18 : Math.min(w * 0.03, 44);
  const cx = vueLeft - gap / 2;
  const pts = tearLine(cx, reach, h, [nameBox.top - 12, nameBox.bottom + 12]);
  const foot = pts[pts.length - 1];
  const keepCaption = caption.getBoundingClientRect().right < cx - reach - 12;

  // 2. The tear. The sheet is copied into the second half, each half is
  // clipped to its side of one ragged line with a frayed white edge, and the
  // right half is pulled away.
  halfB.appendChild(paper.cloneNode(true));
  halfA.style.clipPath = `polygon(-60px -60px,${polygon(pts)},-60px ${h + 60}px)`;
  halfB.style.clipPath = `polygon(${polygon(pts)},${w + 60}px ${h + 60}px,${w + 60}px -60px)`;
  const wrap = (half: HTMLElement, side: "a" | "b") => {
    const piece = document.createElement("div");
    piece.className = `intro__piece intro__piece--${side}`;
    intro.insertBefore(piece, half);
    piece.appendChild(half);
    piece.insertAdjacentHTML(
      "beforeend",
      `<svg class="intro__edge" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
        <path class="intro__edge-shade" d="${pathOf(pts)}" transform="translate(${side === "a" ? -9 : 9} 0)" />
        <path class="intro__edge-fibre" d="${pathOf(pts)}" />
      </svg>`,
    );
    return piece;
  };
  const pieceA = wrap(halfA, "a");
  const pieceB = wrap(halfB, "b");
  intro.insertAdjacentHTML(
    "afterbegin",
    `<svg class="intro__defs" aria-hidden="true"><filter id="intro-fray" x="-5%" y="-2%" width="110%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09 0.05" numOctaves="2" seed="4" />
      <feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G" />
    </filter></svg>`,
  );
  gsap.set([pieceA, pieceB], { transformOrigin: `${foot[0]}px ${h}px` });

  const logo = intro.querySelector<SVGSVGElement>(".intro__logo")!;
  const disc = logo.querySelector<SVGPathElement>(".logo__disc")!;
  const glyphs = [...logo.querySelectorAll<SVGPathElement>(".logo__glyph")];
  const glow = intro.querySelector<HTMLElement>(".intro__glow")!;
  const vueLetters = intro.querySelectorAll(".intro__vue i");
  const allLetters = intro.querySelectorAll(".intro__name i");
  gsap.set(glyphs, { opacity: 0.15, transformOrigin: "50% 50%", transformBox: "fill-box" });
  gsap.set(vueLetters, { opacity: 0.12 });
  gsap.set(glow, { x: vueLeft + vueBox.width / 2 - w / 2 });

  const tear = gsap
    .timeline()
    .set(stage, { autoAlpha: 1 }, 0)
    .fromTo(intro.querySelectorAll(".intro__edge"), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, 0)
    .fromTo([pieceA, pieceB], { x: 0 }, { x: (i) => (i ? 1.5 : -1.5), duration: 0.04, repeat: 3, yoyo: true, ease: "none" }, 0)
    // Ripped from the top down: the right side hinges open from the foot…
    .to(pieceB, { rotation: 2.6, x: 16, duration: 0.6, ease: "power2.out" }, 0.18)
    .to(pieceA, { rotation: -0.4, x: -3, duration: 0.6, ease: "power2.out" }, 0.18)
    // …then is pulled away to the right.
    .to(pieceB, { x: w * 0.8, y: h * 0.12, rotation: 13, duration: 1.25, ease: "power2.inOut" }, 0.6)
    // Behind it, "VUE AI" powers on letter by letter.
    .fromTo(glow, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: "cv.out" }, 0.4)
    .to(
      vueLetters,
      { keyframes: { opacity: [0.12, 1, 0.35, 1, 0.7, 1], ease: "none" }, duration: 0.55, stagger: 0.08 },
      0.75,
    );
  if (!keepCaption) tear.to(caption, { autoAlpha: 0, duration: 0.3 }, 0);
  tear.to(intro.querySelectorAll(".intro__skip"), { autoAlpha: 0, duration: 0.2 }, 0);
  await played(tear);
  pieceB.remove();
  await wait(skipped ? 500 : 1300);

  // 3. The rest of the sheet goes: the whole name centres and the logo lights.
  const full = gsap
    .timeline()
    .to(pieceA, { x: -w * 0.85, y: h * 0.1, rotation: -11, duration: 1.15, ease: "power2.inOut" }, 0)
    .to(lockup, { x: 0, duration: 1.2, ease: "cv.inOut" }, 0.15)
    .to(vue, { x: 0, duration: 1.2, ease: "cv.inOut" }, 0.15)
    .to(glow, { x: 0, duration: 1.2, ease: "cv.inOut" }, 0.15)
    .to(
      glyphs,
      {
        keyframes: [
          { opacity: 1, scale: 1.4, fill: "#ffd29a", duration: 0.01 },
          { scale: 1, fill: "#ffffff", duration: 0.6, ease: "cv.out" },
        ],
        stagger: 0.02,
      },
      0.45,
    );
  await played(full);
  pieceA.remove();
  await wait(550);

  // 4. The name steps back, the mark centres, and the page opens through it.
  const box = logo.getBoundingClientRect();
  const dx = w / 2 - (box.left + box.width / 2);
  gsap
    .timeline()
    .to(allLetters, { yPercent: -115, duration: 0.55, stagger: { each: 0.025, from: "end" }, ease: "power3.in" }, 0)
    .to(lockup, { x: dx, duration: 0.8, ease: "cv.inOut" }, 0.15)
    .to(glyphs, { fill: "#ffd29a", duration: 0.18, stagger: { each: 0.008, from: "start" }, yoyo: true, repeat: 1 }, 0.3)
    .to(disc, { opacity: 0, duration: 0.6, ease: "power2.in" }, 0.85)
    .to(glow, { autoAlpha: 0, duration: 0.8, ease: "power2.in" }, 0.85)
    .to(logo, { scale: 9, duration: 1.3, ease: "power3.in", transformOrigin: "50% 50%" }, 0.9)
    .to(glyphs, { opacity: 0, duration: 0.5, ease: "power2.in" }, 1.65);
  await wait(1150);

  return (opening) => void opening.then(() => intro.remove());
}
