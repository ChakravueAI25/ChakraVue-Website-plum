import { useEffect, useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { mountMinds } from "./minds";

/**
 * The About hero: the page's statement set over a network of minds (a live
 * canvas, minds.ts), the people behind the technology linking up and
 * passing ideas between them.
 */
export function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // The network runs with or without motion (a still frame when reduced).
  useEffect(() => {
    if (!canvas.current || !ref.current) return;
    return mountMinds(canvas.current, ref.current);
  }, []);

  // Scrolling on, the statement lifts away faster than the network behind it.
  useMotion(ref, (root) => {
    const scroll = { trigger: root, start: "top top", end: "bottom top", scrub: true };
    gsap.to(root.querySelector(".about-hero__copy"), { yPercent: -22, autoAlpha: 0, ease: "none", scrollTrigger: scroll });
    gsap.to(root.querySelector(".about-hero__minds"), { yPercent: 10, ease: "none", scrollTrigger: scroll });
  });

  return (
    <section ref={ref} className="about-hero section">
      <canvas ref={canvas} className="about-hero__minds" aria-hidden="true" />
      <div className="section__inner about-hero__copy">
        <p className="section-label" data-scramble>
          About Us
        </p>
        <h1 className="about-hero__quote" data-split>
          The Technology Is Only as Strong as the <em>Minds</em> Behind It.
        </h1>
      </div>
    </section>
  );
}
