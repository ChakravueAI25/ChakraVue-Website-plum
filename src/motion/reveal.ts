import { gsap, ScrollTrigger, SplitText } from "./gsap";

/**
 * Declarative entrances, so components only carry attributes:
 *
 *   data-split="lines"   headline lines rise out of a mask (default)
 *   data-split="fade"    paragraph lines drift up and fade in
 *   data-split="chars"   characters rise out of a blur
 *   data-scramble        text decodes from random glyphs ("digits" for numbers)
 *   data-reveal          block fades up ("pop" | "flip" variants), staggered
 *                        with neighbours that enter at the same time
 *   data-speed="0.2"     scroll parallax, as a fraction of the viewport
 *
 *   data-delay / data-start tune any of the above.
 */

const START = "top 88%";

const num = (value: string | undefined, fallback: number) => {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
};

export function splitReveal(el: HTMLElement) {
  const mode = el.dataset.split || "lines";
  const delay = num(el.dataset.delay, 0);
  const scrollTrigger = { trigger: el, start: el.dataset.start || START, once: true };
  const done = () => el.classList.add("is-revealed");

  if (mode === "chars") {
    const split = SplitText.create(el, { type: "words,chars", charsClass: "st-char" });
    gsap.set(el, { autoAlpha: 1 });
    gsap.from(split.chars, {
      yPercent: 70,
      autoAlpha: 0,
      filter: "blur(12px)",
      duration: 1.3,
      stagger: 0.026,
      delay,
      scrollTrigger,
      onComplete: done,
    });
    return;
  }

  // Line splits re-run on resize and when fonts land (autoSplit); returning
  // the tween lets SplitText carry its progress over to the new lines.
  SplitText.create(el, {
    type: "lines",
    mask: mode === "lines" ? "lines" : undefined,
    linesClass: "st-line",
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { autoAlpha: 1 });
      if (mode === "fade") {
        return gsap.from(self.lines, { y: 22, autoAlpha: 0, duration: 1.1, stagger: 0.08, delay, scrollTrigger, onComplete: done });
      }
      return gsap.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.1, delay, scrollTrigger, onComplete: done });
    },
  });
}

export function scrambleReveal(el: HTMLElement) {
  const text = (el.textContent ?? "").trim();
  if (!text) return;
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", text);
  const chars = el.dataset.scramble === "digits" ? "0123456789" : "upperCase";

  gsap
    .timeline({
      delay: num(el.dataset.delay, 0),
      scrollTrigger: { trigger: el, start: el.dataset.start || START, once: true },
    })
    .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none" }, 0)
    .to(el, { duration: 1.2, ease: "none", scrambleText: { text, chars, revealDelay: 0.35, speed: 0.55 } }, 0);
}

export function parallax(el: HTMLElement) {
  const speed = num(el.dataset.speed, 0);
  if (!speed) return;
  gsap.fromTo(
    el,
    { y: () => -speed * window.innerHeight * 0.3 },
    {
      y: () => speed * window.innerHeight * 0.3,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}

const VARIANTS: Record<string, gsap.TweenVars> = {
  up: { y: 56 },
  pop: { y: 36, scale: 0.84, filter: "blur(12px)" },
  flip: { y: 80, rotationX: -28, transformPerspective: 1100, transformOrigin: "50% 0%" },
};

export function batchReveal(elements: Element[]) {
  const groups = new Map<string, HTMLElement[]>();
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;
    const variant = el.dataset.reveal && VARIANTS[el.dataset.reveal] ? el.dataset.reveal : "up";
    groups.set(variant, [...(groups.get(variant) ?? []), el]);
  }

  groups.forEach((list, variant) => {
    const from = VARIANTS[variant];
    // CSS hover transitions on transform would smear the tween, so they're
    // switched off for the entrance and handed back afterwards.
    gsap.set(list, { autoAlpha: 0, transition: "none", ...from });
    const to: gsap.TweenVars = { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationX: 0, duration: 1.25, stagger: 0.1, overwrite: true };
    if (from.filter) to.filter = "blur(0px)";

    ScrollTrigger.batch(list, {
      start: "top 90%",
      once: true,
      interval: 0.08,
      onEnter: (batch) =>
        gsap.to(batch, {
          ...to,
          onComplete: () =>
            batch.forEach((el) => {
              el.classList.add("is-in");
              gsap.set(el, { clearProps: "transform,opacity,visibility,filter,transition" });
            }),
        }),
    });
  });
}

export function initDeclarative(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-split]").forEach(splitReveal);
  root.querySelectorAll<HTMLElement>("[data-scramble]").forEach(scrambleReveal);
  root.querySelectorAll<HTMLElement>("[data-speed]").forEach(parallax);
  batchReveal([...root.querySelectorAll("[data-reveal]")]);
}
