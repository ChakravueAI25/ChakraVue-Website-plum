import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";

export function BlogHero() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const bg = root.querySelector(".blog-hero__bg");

    // The doorway's light switches on, catching once before it holds. The
    // flicker runs through --glow so the palette's grade (theme.css) stays on.
    gsap
      .timeline({ delay: 0.15 })
      .fromTo(bg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" })
      .set(bg, { "--glow": 0.35 }, 0)
      .to(
        bg,
        {
          keyframes: [
            { "--glow": 1.25, duration: 0.07 },
            { "--glow": 0.5, duration: 0.09 },
            { "--glow": 1.1, duration: 0.1 },
            { "--glow": 0.8, duration: 0.06 },
            { "--glow": 1, duration: 1.1 },
          ],
          ease: "none",
        },
        0.3,
      );

    // ...and scrolling walks you toward it.
    gsap.to(bg, {
      scale: 1.22,
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
    });
  });

  return (
    <section ref={ref} className="blog-hero section">
      <div className="blog-hero__bg" aria-hidden="true" />
      <div className="section__inner">
        <h2 className="section-label" data-scramble>
          Blog
        </h2>
        <h1 className="blog-hero__heading" data-split="chars" data-delay="0.2">
          The Future,
          <br />
          With Us.
        </h1>
        <p className="blog-hero__sub" data-split="fade" data-delay="0.7">
          Notes on clinical AI, device engineering and building for the operating room.
        </p>
      </div>
    </section>
  );
}
