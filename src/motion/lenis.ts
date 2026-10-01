import Lenis from "lenis";
import { reduceMotion } from "./env";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;

/** Smooth wheel scrolling, driven by GSAP's ticker so scroll and animation share one clock. */
export function initLenis() {
  if (lenis || reduceMotion) return;
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    smoothWheel: true,
    anchors: { duration: 1.4 },
    stopInertiaOnNavigate: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  if (immediate || !lenis) window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
}

export function scrollToTarget(target: string | HTMLElement, immediate = false) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { immediate, force: true });
  else el.scrollIntoView({ behavior: immediate ? "instant" : "smooth" });
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate, force: true, duration: 1.6 });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

export function lockScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
