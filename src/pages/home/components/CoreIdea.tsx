import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { clinicalCopy } from "../../../shared/data/content";

export function CoreIdea() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const copy = root.querySelector(".core-copy");
    const glow = root.querySelector(".core-copy__glow");

    // The eclipse glow rises behind "The Core Idea" like a sunrise.
    gsap.fromTo(
      glow,
      { scale: 0.62, yPercent: 24, autoAlpha: 0.15 },
      {
        scale: 1,
        yPercent: 0,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: copy,
          start: "top 95%",
          end: "top 20%",
          scrub: 1,
        },
      },
    );
  });

  return (
    <section ref={ref} className="core section">
      <div className="core-copy">
        <div className="core-copy__glow" aria-hidden="true" />
        <p className="eyebrow" data-scramble>
          The Core Idea
        </p>
        <h2 data-split>
          We don&apos;t replace your doctor&apos;s equipment.
          <br />
          We give it a new lease of life.
        </h2>
        <p data-split="fade" data-delay="0.2">
          {clinicalCopy}
        </p>
      </div>
    </section>
  );
}
