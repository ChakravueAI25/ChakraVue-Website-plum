import { gsap } from "./gsap";

/*
 * The intro as two films (2026-10-26, owner's request): the superhero kid
 * flies in and says hi (his clip carries the sound), then, while he
 * finishes speaking, the ChakraVue AI mark gathers out of a particle burst
 * behind him. The camera then flies through the mark's ring: its clear
 * centre opens onto the page, so the logo itself is the door to the hero.
 * The logo is only faded and scaled, never turned.
 *
 * Browsers won't start sound before the visitor has touched the page, so
 * if the kid can't play aloud he plays muted with a "Sound on" button, and
 * the first click, tap or key anywhere turns the sound on. Skip (or Esc)
 * goes straight to the fly-through.
 */

const KID = "/images/intro/intro-kid.mp4";
const LOGO = "/images/intro/intro-logo.mp4";
// The logo film's own background, so its frame never shows as an edge.
const LOGO_BG = "#06050a";

const KID_HANDOFF = 8; // s into the kid's clip: the logo starts gathering behind him
const LOGO_FORMED = 3; // s into the logo's clip: the mark has settled
// The ring's clear centre, as a fraction of the logo film's width.
const RING_HOLE = 0.15;
const FLY_SCALE = 9;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function film(src: string, muted: boolean) {
  const v = document.createElement("video");
  v.src = src;
  v.preload = "auto";
  v.playsInline = true;
  v.muted = muted;
  v.setAttribute("playsinline", "");
  v.disablePictureInPicture = true;
  return v;
}

/** Resolves once the video can play through its start, or rejects after `maxMs`. */
function playable(v: HTMLVideoElement, maxMs: number) {
  return new Promise<void>((resolve, reject) => {
    if (v.readyState >= 3) return resolve();
    const timer = setTimeout(() => reject(new Error(`${v.src} took too long to load`)), maxMs);
    v.addEventListener("canplay", () => (clearTimeout(timer), resolve()), { once: true });
    v.addEventListener("error", () => (clearTimeout(timer), reject(new Error(`${v.src} failed to load`))), { once: true });
  });
}

/** Resolves when `test()` holds (checked every frame), or at once if `skip()` does. */
function until(test: () => boolean, skip: () => boolean) {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (test() || skip()) {
        gsap.ticker.remove(check);
        resolve();
      }
    };
    gsap.ticker.add(check);
    check();
  });
}

/**
 * Plays inside the iris `root`. `ready` holds the fly-through until the page
 * underneath can be shown; `onOpen` fires as it begins (unlock scroll, start
 * the page's entrances). Rejects, before anything is shown, if the films
 * can't load, so the caller can fall back to the drawn intro.
 */
export async function playVideoIntro(root: HTMLElement, ready: Promise<unknown>, onOpen: () => void): Promise<void> {
  const layer = document.createElement("div");
  layer.className = "vintro";
  layer.style.background = LOGO_BG;
  layer.innerHTML = `
    <div class="vintro__logo"></div>
    <div class="vintro__kid"></div>
    <div class="vintro__controls">
      <button type="button" class="vintro__btn vintro__sound" hidden></button>
      <button type="button" class="vintro__btn vintro__skip">Skip intro</button>
    </div>`;
  const logoBox = layer.querySelector<HTMLElement>(".vintro__logo")!;
  const kidBox = layer.querySelector<HTMLElement>(".vintro__kid")!;
  const soundBtn = layer.querySelector<HTMLButtonElement>(".vintro__sound")!;
  const skipBtn = layer.querySelector<HTMLButtonElement>(".vintro__skip")!;

  const kid = film(KID, false);
  const logo = film(LOGO, true);
  kidBox.appendChild(kid);
  logoBox.appendChild(logo);
  gsap.set(layer, { autoAlpha: 0 });
  root.appendChild(layer);

  try {
    await playable(kid, 4000);
  } catch (error) {
    layer.remove();
    throw error;
  }

  // Sound: try aloud first; browsers usually refuse until the visitor interacts.
  const showSound = () => {
    soundBtn.hidden = false;
    soundBtn.textContent = kid.muted ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-pressed", String(!kid.muted));
  };
  try {
    await kid.play();
  } catch {
    kid.muted = true;
    try {
      await kid.play();
    } catch (error) {
      layer.remove();
      throw error;
    }
  }
  showSound();

  let skipped = false;
  let touched = false;
  const unmute = () => {
    if (touched) return;
    touched = true;
    if (kid.muted && !kid.ended) {
      kid.muted = false;
      showSound();
    }
  };
  const onSound = (event: Event) => {
    event.stopPropagation();
    touched = true;
    kid.muted = !kid.muted;
    showSound();
  };
  const onSkip = (event: Event) => {
    event.stopPropagation();
    skipped = true;
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") skipped = true;
    else unmute();
  };
  soundBtn.addEventListener("click", onSound);
  skipBtn.addEventListener("click", onSkip);
  layer.addEventListener("pointerdown", unmute);
  window.addEventListener("keydown", onKey);

  // On upright screens the kid's shot doesn't fill the height: the space
  // above and below takes the colour of the shot's top and bottom edges.
  const edges = window.innerHeight > window.innerWidth ? document.createElement("canvas").getContext("2d", { willReadFrequently: true }) : null;
  const paintEdges = () => {
    if (!edges || kid.readyState < 2) return;
    edges.canvas.width = 1;
    edges.canvas.height = 2;
    edges.drawImage(kid, 0, 0, kid.videoWidth, 8, 0, 0, 1, 1);
    edges.drawImage(kid, 0, kid.videoHeight - 8, kid.videoWidth, 8, 0, 1, 1, 1);
    const [r1, g1, b1, , r2, g2, b2] = edges.getImageData(0, 0, 1, 2).data;
    kidBox.style.setProperty("--kid-top", `rgb(${r1} ${g1} ${b1})`);
    kidBox.style.setProperty("--kid-bottom", `rgb(${r2} ${g2} ${b2})`);
  };
  if (edges) gsap.ticker.add(paintEdges);

  gsap.to(layer, { autoAlpha: 1, duration: 0.5, ease: "none" });
  void logo.load();

  // 1. The kid flies in and says hi. Near the end of his lines the logo
  //    starts to gather behind him, and he fades back into it.
  await until(() => kid.ended || kid.currentTime >= KID_HANDOFF, () => skipped);
  if (!skipped) {
    void logo.play().catch(() => undefined);
    gsap.fromTo(logo, { scale: 1.08 }, { scale: 1, duration: 2.6, ease: "power2.out" });
    gsap.to(kidBox, { autoAlpha: 0, scale: 0.94, duration: 1.1, ease: "power2.inOut" });
    // 2. The mark settles while he finishes speaking.
    await until(() => (logo.ended || logo.currentTime >= LOGO_FORMED) && (kid.ended || kid.currentTime >= kid.duration - 0.15), () => skipped);
  }
  await Promise.race([ready, wait(skipped ? 1200 : 3000)]);

  // 3. Through the ring: the film grows toward the viewer while a hole,
  //    held inside the ring's clear centre, opens onto the page.
  if (skipped) {
    // Skipped before the mark formed: show it whole, briefly, to fly through.
    gsap.killTweensOf([kidBox, logo]);
    gsap.set(kidBox, { autoAlpha: 0 });
    gsap.set(logo, { scale: 1 });
    logo.pause();
    if (logo.readyState >= 1) logo.currentTime = Math.min(logo.duration || LOGO_FORMED, LOGO_FORMED + 1);
  }
  soundBtn.hidden = true;
  skipBtn.hidden = true;
  // The curtain behind the films steps aside, so the hole shows the page.
  const veil = root.querySelector<HTMLElement>(".iris__veil");
  if (veil) veil.style.visibility = "hidden";
  onOpen();

  const size = logo.getBoundingClientRect().width || Math.min(window.innerWidth, window.innerHeight);
  const hole = size * RING_HOLE;
  const fly = { p: 0 };
  const volume = kid.volume;
  await new Promise<void>((resolve) => {
    gsap.to(fly, {
      p: 1,
      duration: skipped ? 1.1 : 1.6,
      ease: "power2.in",
      onUpdate: () => {
        const s = 1 + (FLY_SCALE - 1) * fly.p;
        const r = hole * s * Math.min(1, fly.p * 4);
        gsap.set(logo, { scale: s });
        layer.style.setProperty("--vr", `${r.toFixed(1)}px`);
        kid.volume = volume * (1 - fly.p);
      },
      onComplete: () => resolve(),
    });
  });

  soundBtn.removeEventListener("click", onSound);
  skipBtn.removeEventListener("click", onSkip);
  layer.removeEventListener("pointerdown", unmute);
  window.removeEventListener("keydown", onKey);
  if (edges) gsap.ticker.remove(paintEdges);
  kid.pause();
  logo.pause();
  layer.remove();
  if (veil) veil.style.visibility = "";
}
