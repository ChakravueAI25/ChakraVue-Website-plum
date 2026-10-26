import { useEffect, useRef } from "react";
import { reduceMotion } from "../../motion/env";
import { whenRevealed } from "../../motion/gate";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import "./growRail.css";

/** Cells in the toddler strip (frames of the campaign clip, cut out). */
const FRAMES = 35;
/** The cells where he waves, played when the pointer finds him. */
const WAVE = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];

// Where the page's scroll hands over: the toddler's clip plays through the
// first part, he becomes the doctor, and the doctor grows to full height.
const KID_END = 0.56;
const MORPH_END = 0.68;

// Figure heights on the rail (px) and the readout (m), for each stage.
const KID_PX = [96, 120];
const DOC_PX = [150, 214];
const KID_M = [0.95, 1.1];
const DOC_M = [1.55, 1.74];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The campaign's kid growing up beside the page as it scrolls: a fixed
 * height chart in the right margin with the toddler from the clip (flying in,
 * waving, pointing), who becomes the doctor and grows to full height by the
 * end of the page. On narrower screens it's a small badge whose ring fills
 * as you read. Decorative: hidden from assistive tech, never focusable.
 */
export function GrowRail() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reading = root.querySelector<HTMLElement>(".grow-rail__reading");
    let frame = 0;
    let waving: gsap.core.Tween | undefined;
    let trigger: ScrollTrigger | undefined;

    const apply = (p: number) => {
      const kid = clamp01(p / KID_END);
      const morph = clamp01((p - KID_END) / (MORPH_END - KID_END));
      const grow = clamp01((p - MORPH_END) / (1 - MORPH_END));
      frame = Math.round(kid * (FRAMES - 1));
      const kidPx = lerp(KID_PX[0], KID_PX[1], kid);
      const docPx = lerp(DOC_PX[0], DOC_PX[1], grow);
      const metres = morph < 1 ? lerp(lerp(KID_M[0], KID_M[1], kid), DOC_M[0], morph) : lerp(DOC_M[0], DOC_M[1], grow);

      if (!waving) root.style.setProperty("--frame", String(frame));
      root.style.setProperty("--p", p.toFixed(4));
      root.style.setProperty("--morph", morph.toFixed(4));
      root.style.setProperty("--burst", (1 - Math.abs(2 * morph - 1)).toFixed(4));
      root.style.setProperty("--kid-h", `${kidPx.toFixed(1)}px`);
      root.style.setProperty("--doc-h", `${docPx.toFixed(1)}px`);
      root.style.setProperty("--top", `${lerp(kidPx * 0.97, docPx, morph).toFixed(1)}px`);
      root.classList.toggle("is-doctor", morph >= 0.5);
      if (reading) reading.textContent = `${metres.toFixed(2)} m`;
    };

    // Shown once the hero has scrolled away; the curtain (intro, page
    // transition) has to have opened first.
    // The badge steps aside for the footer, whose links sit in its corner.
    const show = () => {
      root.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.55);
      const footer = document.querySelector("footer");
      root.classList.toggle("is-at-footer", !!footer && footer.getBoundingClientRect().top < window.innerHeight - 120);
    };

    const off = whenRevealed(() => {
      trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          apply(self.progress);
          show();
        },
        onRefresh: (self) => {
          apply(self.progress);
          show();
        },
      });
    });

    // The toddler waves back at the pointer (not under reduced motion).
    const stage = root.querySelector<HTMLElement>(".grow-rail__stage");
    const wave = () => {
      if (reduceMotion || waving || root.classList.contains("is-doctor")) return;
      const step = { i: 0 };
      waving = gsap.to(step, {
        i: WAVE.length - 1,
        duration: 1.1,
        ease: "none",
        onUpdate: () => root.style.setProperty("--frame", String(WAVE[Math.round(step.i)])),
        onComplete: () => {
          waving = undefined;
          root.style.setProperty("--frame", String(frame));
        },
      });
    };
    stage?.addEventListener("pointerenter", wave);

    return () => {
      off();
      trigger?.kill();
      waving?.kill();
      stage?.removeEventListener("pointerenter", wave);
    };
  }, []);

  return (
    <aside ref={ref} className="grow-rail" aria-hidden="true">
      {/* Wide screens: the height chart and the figure growing beside it. */}
      <div className="grow-rail__chart">
        <span className="grow-rail__ruler" />
        <span className="grow-rail__mark">
          <span className="grow-rail__reading">0.95 m</span>
        </span>
        <div className="grow-rail__stage">
          <span className="grow-rail__burst" />
          <span className="grow-rail__kid" />
          <span className="grow-rail__doctor" />
        </div>
        <span className="grow-rail__note">Every doctor started small.</span>
      </div>

      {/* Narrow screens: a badge whose ring fills as the page is read. */}
      <div className="grow-rail__badge">
        <svg viewBox="0 0 52 52" className="grow-rail__ring">
          <circle cx="26" cy="26" r="24" pathLength="1" />
          <circle cx="26" cy="26" r="24" pathLength="1" className="grow-rail__ring-fill" />
        </svg>
        <span className="grow-rail__face grow-rail__face--kid" />
        <span className="grow-rail__face grow-rail__face--doctor" />
      </div>
    </aside>
  );
}
