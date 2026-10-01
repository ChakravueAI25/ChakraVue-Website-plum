import { useEffect, useRef } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import { gsap, SplitText } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import type { DataHorizon } from "../../../motion/webgl/dataHorizon";
import { Logo } from "../../../brand/Logo";
import { Link } from "../../../shared/components/Link";
import { products } from "../../product-suite/data";

type HeroProps = {
  /** Called as the headline lands, so the nav can follow it in. */
  onIntroDone?: () => void;
};

/**
 * The original sunset hero, working as a company homepage hero: the
 * headline, one line on what ChakraVue does, the two next steps, and a
 * direct way into each product along the horizon.
 */
export function Hero({ onIntroDone }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const horizon = useRef<DataHorizon | null>(null);
  const introDone = useRef(onIntroDone);
  introDone.current = onIntroDone;

  // The WebGL landscape loads after first paint as its own chunk. The painted
  // CSS gradient underneath is the hero until then, and stays the hero if
  // WebGL isn't available.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let offReveal = () => {};
    import("../../../motion/webgl/dataHorizon")
      .then(({ createDataHorizon }) => {
        if (cancelled) return;
        horizon.current = createDataHorizon(canvas, { reduced: reduceMotion });
        offReveal = whenRevealed(() => horizon.current?.start());
      })
      .catch((error) => console.warn("[hero] WebGL unavailable; keeping the painted hero.", error));
    return () => {
      cancelled = true;
      offReveal();
      horizon.current?.destroy();
      horizon.current = null;
    };
  }, []);

  useMotion(ref, (root) => {
    const title = root.querySelector<HTMLElement>("h1");
    if (!title) return;

    // Letters flip up out of a blur; then the line, the buttons and the
    // product shortcuts follow in order.
    const split = SplitText.create(title, { type: "words,chars", charsClass: "hero-char" });
    gsap.set(title, { autoAlpha: 1 });
    gsap
      .timeline({ delay: 0.2 })
      .from(split.chars, {
        yPercent: 90,
        rotationX: -75,
        autoAlpha: 0,
        filter: "blur(12px)",
        transformOrigin: "50% 100%",
        transformPerspective: 700,
        duration: 1.5,
        stagger: 0.032,
      })
      // The mark settles in behind the copy, then its glyphs light in turn
      // round the ring.
      .from(root.querySelector(".hero__emblem"), { autoAlpha: 0, scale: 0.92, duration: 2.2, ease: "cv.out" }, 0.2)
      .from(
        root.querySelectorAll(".hero__emblem .logo__glyph"), // in order round the ring
        { opacity: 0.1, duration: 0.5, stagger: 0.03, ease: "power1.out" },
        0.6,
      )
      .add(() => introDone.current?.(), 0.95)
      .from(
        root.querySelectorAll(".hero__lead, .hero__actions > *"),
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
    <section ref={ref} className="hero section">
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      {/* The mark as supplied (never turned), whole and centred behind the
          copy: its top and bottom arcs lit, quiet where the words sit. */}
      <div className="hero__mark" aria-hidden="true">
        {/* Light glyphs on the dark sky, deepening to amber toward the
            bright horizon, so the whole ring reads on both. */}
        <svg className="hero__mark-defs" width="0" height="0">
          <linearGradient id="hero-mark-fill" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="870">
            <stop className="hero__mark-stop hero__mark-stop--top" offset="0" />
            <stop className="hero__mark-stop hero__mark-stop--mid" offset="0.55" />
            <stop className="hero__mark-stop hero__mark-stop--low" offset="1" />
          </linearGradient>
        </svg>
        <Logo className="hero__emblem" disc={false} />
      </div>
      <div className="hero__glow" />
      <div className="section__inner hero__content">
        <div className="hero__copy">
          <h1>
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
