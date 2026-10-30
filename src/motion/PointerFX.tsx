import { useEffect, useRef } from "react";
import { finePointer, reduceMotion } from "./env";
import { gsap } from "./gsap";

/** The OS cursor stays for typing and for embeds, which own their own pointer. */
const NATIVE = "input, textarea, select, iframe";

/**
 * Everything the pointer drives, from one set of window listeners:
 *   - the cursor stays the standard system one; over [data-cursor="Label"]
 *     a small tag beside it names the action (Drag, View)
 *   - [data-magnetic="0.35"]: the element leans toward the pointer
 *   - [data-spotlight]: --mx / --my follow the pointer for a CSS glow
 * Mouse and trackpad only; touch devices keep the native behaviour.
 */
export function PointerFX() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    if (reduceMotion || !finePointer || !cursor) return;
    const label = cursor.querySelector<HTMLElement>(".cursor__label")!;
    const html = document.documentElement;

    // The tag rides just below and right of the system pointer.
    gsap.set(label, { x: -100, y: -100 });
    const moveX = gsap.quickTo(label, "x", { duration: 0.12, ease: "power3" });
    const moveY = gsap.quickTo(label, "y", { duration: 0.12, ease: "power3" });

    let visible = false;
    const show = (on: boolean) => {
      if (on === visible) return;
      visible = on;
      gsap.to(cursor, { autoAlpha: on ? 1 : 0, duration: 0.25, overwrite: true });
    };

    const setLabel = (text: string) => {
      if (label.textContent !== text) label.textContent = text;
    };

    let magnet: HTMLElement | null = null;
    let rest: DOMRect | null = null;
    let magX: ((value: number) => void) | null = null;
    let magY: ((value: number) => void) | null = null;
    const releaseMagnet = () => {
      if (!magnet) return;
      gsap.to(magnet, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: true });
      magnet = rest = magX = magY = null;
    };

    let lastX = -1;
    let lastY = -1;

    const track = (target: Element, x: number, y: number) => {
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      if (labelled) setLabel(labelled.dataset.cursor ?? "");
      show(Boolean(labelled) && !target.closest(NATIVE));

      const spot = target.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${x - r.left}px`);
        spot.style.setProperty("--my", `${y - r.top}px`);
      }

      // Magnetic: measured against the element's resting box, so it can't
      // chase itself out from under the pointer and jitter at the edge.
      if (magnet && rest) {
        const pad = 26;
        const inside = x > rest.left - pad && x < rest.right + pad && y > rest.top - pad && y < rest.bottom + pad;
        if (!inside) releaseMagnet();
      }
      if (!magnet) {
        const candidate = target.closest<HTMLElement>("[data-magnetic]");
        if (candidate) {
          const box = candidate.getBoundingClientRect();
          const tx = Number(gsap.getProperty(candidate, "x")) || 0;
          const ty = Number(gsap.getProperty(candidate, "y")) || 0;
          magnet = candidate;
          rest = new DOMRect(box.left - tx, box.top - ty, box.width, box.height);
          magX = gsap.quickTo(candidate, "x", { duration: 0.6, ease: "power3" });
          magY = gsap.quickTo(candidate, "y", { duration: 0.6, ease: "power3" });
        }
      }
      if (magnet && rest && magX && magY) {
        const strength = Number(magnet.dataset.magnetic) || 0.35;
        magX((x - (rest.left + rest.width / 2)) * strength);
        magY((y - (rest.top + rest.height / 2)) * strength);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      lastX = event.clientX;
      lastY = event.clientY;
      moveX(lastX);
      moveY(lastY);
      if (event.target instanceof Element) track(event.target, lastX, lastY);
    };
    // Scrolling moves content under a still pointer; re-read what's there,
    // at most every 100ms (each read forces a layout mid-scroll).
    let scrollTimer = 0;
    const onScroll = () => {
      if (lastX < 0 || scrollTimer) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        const target = document.elementFromPoint(lastX, lastY);
        if (target) track(target, lastX, lastY);
      }, 100);
    };
    const onLeave = () => {
      show(false);
      releaseMagnet();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    html.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimer);
      html.removeEventListener("mouseleave", onLeave);
      releaseMagnet();
    };
  }, []);

  if (reduceMotion || !finePointer) return null;

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor__label" />
    </div>
  );
}
