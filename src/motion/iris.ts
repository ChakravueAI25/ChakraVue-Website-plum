import { logoMarkup } from "../brand/logoData";
import { gsap } from "./gsap";

/**
 * The iris: one fixed overlay whose circular opening closes onto the point
 * you clicked and reopens from the centre, like an eye refocusing. It is the
 * preloader's curtain and every page transition. The opening is a CSS mask
 * driven by three custom properties (--ix, --iy, --ir).
 */
type Point = { x: number; y: number };

let root: HTMLDivElement | null = null;
let ring: HTMLDivElement | null = null;
let label: HTMLDivElement | null = null;
let mark: HTMLDivElement | null = null;
const iris = { x: 0, y: 0, r: 0 };

function paint() {
  if (!root) return;
  root.style.setProperty("--ix", `${iris.x}px`);
  root.style.setProperty("--iy", `${iris.y}px`);
  root.style.setProperty("--ir", `${Math.max(0, iris.r)}px`);
}

function farthestCorner(x: number, y: number) {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 80;
}

/** Mounted closed, before React's first paint, so the page never flashes in unanimated. */
export function mountIris(): HTMLDivElement {
  if (root) return root;
  root = document.createElement("div");
  root.className = "iris is-active";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<div class="iris__veil"></div><div class="iris__ring"></div><div class="iris__mark">${logoMarkup("", { disc: false })}</div><div class="iris__label"></div>`;
  document.body.appendChild(root);
  ring = root.querySelector(".iris__ring");
  label = root.querySelector(".iris__label");
  mark = root.querySelector(".iris__mark");
  iris.x = window.innerWidth / 2;
  iris.y = window.innerHeight / 2;
  iris.r = 0;
  paint();
  return root;
}

export function closeIris(origin?: Point, text?: string): Promise<void> {
  const el = mountIris();
  gsap.killTweensOf([iris, ring, label, mark]);
  iris.x = origin?.x ?? window.innerWidth / 2;
  iris.y = origin?.y ?? window.innerHeight / 2;
  iris.r = farthestCorner(iris.x, iris.y);
  paint();
  el.classList.add("is-active");
  if (label) label.textContent = "";

  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: () => resolve() });
    tl.to(iris, { r: 0, duration: 0.78, ease: "cv.inOut", onUpdate: paint })
      .fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0)
      .to(ring, { opacity: 0, duration: 0.14, ease: "none" }, 0.64);
    // The logo settles in above the destination's name, exactly as supplied (never turned).
    tl.fromTo(mark, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "cv.out" }, 0.42);
    if (text && label) {
      // The company name keeps its own casing; page names are set in capitals.
      label.classList.toggle("brand-name", text === "ChakraVue AI");
      tl.set(label, { autoAlpha: 1, y: 0 }, 0.52).to(
        label,
        { duration: 0.55, ease: "none", scrambleText: { text, chars: "upperCase", speed: 0.8, revealDelay: 0.2 } },
        0.52,
      );
    }
  });
}

/** Lifts the curtain at once, for an intro that has already opened onto the page itself. */
export function releaseIris() {
  if (!root) return;
  gsap.killTweensOf([iris, ring, label, mark]);
  iris.r = farthestCorner(window.innerWidth / 2, window.innerHeight / 2);
  paint();
  root.classList.remove("is-active");
}

export function openIris(duration = 1.1): Promise<void> {
  const el = mountIris();
  gsap.killTweensOf([iris, ring, label, mark]);
  // Always reopen from the centre: the new page opens straight toward you.
  iris.x = window.innerWidth / 2;
  iris.y = window.innerHeight / 2;
  iris.r = 0;
  paint();
  const target = farthestCorner(iris.x, iris.y);

  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          el.classList.remove("is-active");
          resolve();
        },
      })
      .to(label, { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, 0)
      .to(mark, { autoAlpha: 0, scale: 2.4, duration: duration * 0.6, ease: "power2.in" }, 0)
      .fromTo(ring, { opacity: 1 }, { opacity: 0, duration: duration * 0.85, ease: "power2.in" }, 0.05)
      .to(iris, { r: target, duration, ease: "cv.inOut", onUpdate: paint }, 0.04);
  });
}
