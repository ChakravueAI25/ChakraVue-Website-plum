import { useEffect, useRef } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import { gsap, SplitText } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";

// The whole film, looping (owner's request, 2026-10-27): the boy walks the
// blueprint, strikes the match, and it burns open onto the circuit. The cut
// dissolves from its last moment back into its first, so the loop has no
// seam. Phones get a lighter encode of the same cut.
const FILM = window.matchMedia("(max-width: 760px)").matches
  ? "/images/campaign/analogue-to-ai-loop-sm.mp4"
  : "/images/campaign/analogue-to-ai-loop.mp4";
const POSTER = "/images/campaign/analogue-to-ai-poster.jpg";

type HeroProps = {
  /** Called as the headline lands, so the nav can follow it in. */
  onIntroDone?: () => void;
};

/**
 * The homepage hero, and the dream: the boy walks across an old engineering
 * blueprint and strikes a match, and the blueprint burns open onto a
 * circuit. The film loops. Over it, only the headline and the two next steps
 * (owner, 2026-10-29: the story line, the summary, the film's play/pause chip
 * and the product shortcuts were taken out). The film starts once the
 * curtain opens (never under the intro), pauses when the hero is off screen,
 * and stays on its poster under reduced motion.
 */
export function Hero({ onIntroDone }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introDone = useRef(onIntroDone);
  introDone.current = onIntroDone;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let observer: IntersectionObserver | undefined;
    const off = whenRevealed(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !reduceMotion) video.play().catch(() => {});
          else if (!entry.isIntersecting) video.pause();
        },
        { threshold: 0.2 },
      );
      observer.observe(video);
    });
    return () => {
      off();
      observer?.disconnect();
    };
  }, []);

  useMotion(ref, (root) => {
    const title = root.querySelector<HTMLElement>("h1");
    if (!title) return;

    // Letters flip up out of a blur; then the buttons follow.
    const split = SplitText.create(title, { type: "words,chars", charsClass: "hero-char" });
    gsap.set(title, { autoAlpha: 1 });
    gsap
      .timeline({ delay: 0.2 })
      .from(root.querySelector(".hero__film"), { autoAlpha: 0, scale: 1.04, duration: 2.2, ease: "cv.out" }, 0)
      .from(
        split.chars,
        {
          yPercent: 90,
          rotationX: -75,
          autoAlpha: 0,
          filter: "blur(12px)",
          transformOrigin: "50% 100%",
          transformPerspective: 700,
          duration: 1.5,
          stagger: 0.032,
        },
        0.2,
      )
      .add(() => introDone.current?.(), 0.95)
      .from(
        root.querySelectorAll(".hero__actions > *"),
        { autoAlpha: 0, y: 18, duration: 1, stagger: 0.08, clearProps: "transform,opacity,visibility" },
        0.9,
      );

    // Nothing in the hero moves with scroll: it simply scrolls away whole.
  });

  return (
    <section ref={ref} className="hero section" aria-labelledby="hero-title">
      <video
        ref={videoRef}
        className="hero__film"
        src={FILM}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="metadata"
        aria-describedby="hero-film-desc"
      />
      <p id="hero-film-desc" className="sr-only">
        A short looping film without sound: a boy walks across an old engineering blueprint, kneels and strikes a match, and the blueprint burns open onto a glowing circuit.
      </p>
      <div className="hero__shade" aria-hidden="true" />

      <div className="section__inner hero__content">
        <div className="hero__copy">
          <h1 id="hero-title">
            Add <em>Intelligence</em> to Your Practice
          </h1>
          <div className="hero__actions">
            <Link href="/product-suite" className="hero__btn hero__btn--primary" data-magnetic="0.2">
              Explore products
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/try-demo" className="hero__btn hero__btn--ghost">
              Book a demo
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
