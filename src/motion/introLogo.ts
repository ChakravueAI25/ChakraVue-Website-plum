import { gsap } from "./gsap";

/*
 * The intro (2026-10-27, owner's request): the ChakraVue AI mark gathers
 * out of a particle burst (the owner's film), then the camera flies
 * through its ring: the ring's clear centre opens onto the page, so the
 * logo itself is the door to the hero. The logo is only scaled, never
 * turned. Click, tap or Esc goes straight to the fly-through.
 */

const LOGO = "/images/intro/intro-logo.mp4";
// The page's own black (body in global.css). The film is graded to the
// same black, so neither its frame nor the hand-off to the page shows.
const LOGO_BG = "#000";

const LOGO_FORMED = 3.2; // s into the film: the mark has settled
// The ring's clear centre, as a fraction of the film's width.
const RING_HOLE = 0.15;
const FLY_SCALE = 9;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
 * the page's entrances). Rejects, before anything is shown, if the film
 * can't load, so the caller can fall back to a plain iris open.
 */
export async function playLogoIntro(root: HTMLElement, ready: Promise<unknown>, onOpen: () => void): Promise<void> {
  const layer = document.createElement("div");
  layer.className = "lintro";
  layer.style.background = LOGO_BG;
  layer.innerHTML = `<button type="button" class="lintro__skip">Skip intro</button>`;
  const skipBtn = layer.querySelector<HTMLButtonElement>(".lintro__skip")!;

  const logo = document.createElement("video");
  logo.src = LOGO;
  logo.preload = "auto";
  logo.muted = true;
  logo.playsInline = true;
  logo.setAttribute("playsinline", "");
  logo.disablePictureInPicture = true;
  layer.prepend(logo);
  root.appendChild(layer);

  try {
    await playable(logo, 3500);
    await logo.play();
  } catch (error) {
    layer.remove();
    throw error;
  }

  let skipped = false;
  const onSkip = (event: Event) => {
    if (event instanceof KeyboardEvent && !["Escape", "Enter", " "].includes(event.key)) return;
    skipped = true;
  };
  layer.addEventListener("pointerdown", onSkip);
  window.addEventListener("keydown", onSkip);
  gsap.fromTo(logo, { scale: 1.08 }, { scale: 1, duration: 2.6, ease: "power2.out" });

  // 1. The mark gathers and settles.
  await until(() => logo.ended || logo.currentTime >= LOGO_FORMED, () => skipped);
  await Promise.race([ready, wait(skipped ? 1200 : 3000)]);
  if (skipped) {
    // Skipped before the mark formed: show it whole, to fly through.
    gsap.killTweensOf(logo);
    gsap.set(logo, { scale: 1 });
    logo.pause();
    logo.currentTime = Math.min(logo.duration || LOGO_FORMED, LOGO_FORMED + 1);
  }

  // 2. Through the ring: the film grows toward the viewer while a hole,
  //    held inside the ring's clear centre, opens onto the page.
  skipBtn.hidden = true;
  // The curtain behind the film steps aside, so the hole shows the page.
  const veil = root.querySelector<HTMLElement>(".iris__veil");
  if (veil) veil.style.visibility = "hidden";
  onOpen();

  const hole = (logo.getBoundingClientRect().width || Math.min(window.innerWidth, window.innerHeight)) * RING_HOLE;
  const fly = { p: 0 };
  await new Promise<void>((resolve) => {
    gsap.to(fly, {
      p: 1,
      duration: skipped ? 1.1 : 1.6,
      ease: "power2.in",
      onUpdate: () => {
        const s = 1 + (FLY_SCALE - 1) * fly.p;
        gsap.set(logo, { scale: s });
        layer.style.setProperty("--lr", `${(hole * s * Math.min(1, fly.p * 4)).toFixed(1)}px`);
      },
      onComplete: () => resolve(),
    });
  });

  layer.removeEventListener("pointerdown", onSkip);
  window.removeEventListener("keydown", onSkip);
  logo.pause();
  layer.remove();
  if (veil) veil.style.visibility = "";
}
