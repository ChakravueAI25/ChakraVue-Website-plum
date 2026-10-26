import { useEffect, useRef, useState } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import { gsap, SplitText } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import { products } from "../../product-suite/data";

// The film's first five and a half seconds: the boy walks the blueprint and
// strikes the match. The burn itself is saved for the discovery further down.
// Phones get a lighter encode of the same cut.
const FILM = window.matchMedia("(max-width: 760px)").matches
  ? "/images/campaign/analogue-to-ai-dream-sm.mp4"
  : "/images/campaign/analogue-to-ai-dream.mp4";
const POSTER = "/images/campaign/analogue-to-ai-poster.jpg";

type HeroProps = {
  /** Called as the headline lands, so the nav can follow it in. */
  onIntroDone?: () => void;
};

/**
 * The homepage hero, and the dream: the boy, who wants to be a doctor, walks
 * across an old engineering blueprint and strikes a match. The film plays
 * once and holds on the lit match; what it sets alight is the discovery,
 * further down the page. Over it: the story line, the headline, one line on
 * what ChakraVue does, the two next steps, and a way into each product. The
 * film starts once the curtain opens (never under the intro), pauses when
 * the hero is off screen, and waits on its poster under reduced motion until
 * someone presses play.
 */
export function Hero({ onIntroDone }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introDone = useRef(onIntroDone);
  introDone.current = onIntroDone;
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  // Someone pressed pause: scrolling back up doesn't override them.
  const held = useRef(reduceMotion);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let observer: IntersectionObserver | undefined;
    const off = whenRevealed(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !held.current && !video.ended) video.play().catch(() => {});
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

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      held.current = false;
      if (video.ended) video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      held.current = true;
      video.pause();
    }
  };

  useMotion(ref, (root) => {
    const title = root.querySelector<HTMLElement>("h1");
    if (!title) return;

    // Letters flip up out of a blur; then the line, the buttons, the film's
    // caption and the product shortcuts follow in order.
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
        root.querySelectorAll(".hero__eyebrow, .hero__lead, .hero__actions > *, .hero__chip"),
        { autoAlpha: 0, y: 18, duration: 1, stagger: 0.08, clearProps: "transform,opacity,visibility" },
        0.9,
      )
      .from(
        root.querySelectorAll(".hero__product"),
        { autoAlpha: 0, y: 24, duration: 1, stagger: 0.07, clearProps: "transform,opacity,visibility" },
        1.15,
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
        playsInline
        preload="metadata"
        aria-describedby="hero-film-desc"
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
      />
      <p id="hero-film-desc" className="sr-only">
        A short film without sound: a boy walks across an old engineering blueprint, kneels, and strikes a match.
      </p>
      <div className="hero__shade" aria-hidden="true" />

      <div className="section__inner hero__content">
        <div className="hero__copy">
          <p className="hero__eyebrow">Every doctor started small</p>
          <h1 id="hero-title">
            Add <em>Intelligence</em> To Your Practice
          </h1>
          <p className="hero__lead">
            ChakraVue AI develops intelligent software, device integrations and clinical systems for ophthalmic healthcare.
          </p>
          <div className="hero__actions">
            <Link href="/product-suite" className="hero__btn hero__btn--primary" data-magnetic="0.2">
              Explore products
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact-us" className="hero__btn hero__btn--ghost">
              Contact us
            </Link>
          </div>
        </div>

        <div className="hero__chip">
          <span className="hero__chip-label">{ended ? "Play again" : "The campaign film"}</span>
          <button
            type="button"
            className="hero__chip-toggle"
            onClick={toggle}
            aria-label={playing ? "Pause the film" : ended ? "Play the film again" : "Play the film"}
          >
            {playing ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" width="12" height="12">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" width="12" height="12">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav className="hero__products" aria-label="Products">
        {products.map((product) => (
          <Link key={product.id} href={`/product-suite#${product.id}`} className="hero__product">
            <span className="hero__product-index">{product.index}</span>
            <span className="hero__product-name">{product.title}</span>
            <span className="hero__product-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
