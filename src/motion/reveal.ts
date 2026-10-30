import { gsap, ScrollTrigger } from "./gsap";

/**
 * The site's one text entrance (owner, 2026-10-30): as text comes into view
 * it fades in and rises a few pixels, once. Everything uses it, so
 * components only carry attributes, or nothing at all:
 *
 *   data-split, data-scramble, data-reveal   opt an element in (the values
 *                                            the old variants took, such as
 *                                            "fade", "chars", "digits" or
 *                                            "pop", are still accepted and
 *                                            all mean the same entrance)
 *   (no attribute)                           headings, labels, paragraphs,
 *                                            list items, quotes and section
 *                                            links (.hsec-link) in the
 *                                            page's sections are picked up
 *                                            automatically
 *   data-motion="own"                        on a container that animates its
 *                                            own text (the hero, slideshows,
 *                                            state crossfades): left alone
 *   data-speed="0.2"                         scroll parallax for art, as a
 *                                            fraction of the viewport
 *
 * Elements are hidden from script only, so the text is there if scripts
 * fail, and the whole thing is skipped under reduced motion (useMotion).
 */

/** How far text rises, in px. */
const RISE = 16;
/** Each element's entrance, in seconds. */
const DURATION = 0.55;
/** Between elements that come into view together. */
const STAGGER = 0.07;
/** A batch never takes longer than this to start its last element. */
const MAX_SPREAD = 0.35;
/** Starts when the element's top is 10% into the viewport. */
const START = "top 90%";

const TAGGED = "[data-split], [data-scramble], [data-reveal]";
const AUTO = "section h1, section h2, section h3, section h4, section p, section li, section blockquote, section figcaption, .section-label, .hsec-link";
/** Containers whose text has its own motion, or isn't page copy. */
const SKIP = [
  '[data-motion="own"]',
  "[aria-hidden='true']",
  "[inert]",
  "[role='dialog']",
  "form",
  "nav",
  "button",
  "svg",
].join(", ");

const num = (value: string | undefined, fallback: number) => {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
};

/** Visible text that isn't already driven by a stylesheet state (opacity 0). */
function eligible(el: HTMLElement) {
  if (el.closest(SKIP)) return false;
  if (!el.textContent?.trim() && !el.matches(TAGGED)) return false;
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
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

/** Fades each element up as it comes into view, staggering those that arrive together. */
export function riseReveal(elements: HTMLElement[]) {
  if (!elements.length) return;
  // CSS hover transitions on transform would smear the tween, so they're
  // switched off for the entrance and handed back afterwards.
  gsap.set(elements, { autoAlpha: 0, y: RISE, transition: "none" });

  ScrollTrigger.batch(elements, {
    start: START,
    once: true,
    interval: 0.06,
    onEnter: (batch) => {
      const each = Math.min(STAGGER, MAX_SPREAD / Math.max(1, batch.length - 1));
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: DURATION,
        ease: "power2.out",
        stagger: each,
        overwrite: true,
        onComplete: () => gsap.set(batch, { clearProps: "transform,opacity,visibility,transition" }),
      });
    },
  });
}

export function initDeclarative(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-speed]").forEach(parallax);

  // Tagged elements first, then the page's other text; anything inside an
  // element already chosen rises with it rather than on its own.
  const candidates = [...root.querySelectorAll<HTMLElement>(TAGGED), ...root.querySelectorAll<HTMLElement>(AUTO)];
  const chosen = new Set<HTMLElement>();
  for (const el of candidates) {
    if (chosen.has(el) || !eligible(el)) continue;
    chosen.add(el);
  }
  const list = [...chosen].filter((el) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (chosen.has(p)) return false;
    return true;
  });
  // Document order, so a heading always comes in before its paragraph.
  list.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  riseReveal(list);
}
