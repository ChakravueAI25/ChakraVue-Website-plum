import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { Link } from "../../../shared/components/Link";
import { audiences } from "../../../shared/data/audiences";
import { reduceMotion } from "../../../motion/env";
import { gsap } from "../../../motion/gsap";
import { scrollToY } from "../../../motion/lenis";
import { useMotion } from "../../../motion/useMotion";
import { products } from "../data";

/** How long each product stays up while the slideshow plays (seconds). */
const HOLD = 4.5;
const total = String(products.length).padStart(2, "0");

/**
 * Each product in a sentence, paraphrasing its own description (data.ts),
 * and the render on its slide (rendered on black from the 3D models, so it
 * shows the site's palette and screens; see README "Product Suite").
 */
const SLIDES: Record<string, { brief: string; alt: string }> = {
  "surgical-assistant": {
    brief: "Real-time overlays and guidance in the surgeon’s field of view, with structured data captured for surgical analysis.",
    alt: "The Digital Surgical Assistant: an open field case with the surgical interface on its display",
  },
  "slit-lamp-module": {
    brief: "Captures every slit lamp examination, highlights relevant findings in real time and files them to the patient history.",
    alt: "The Slit Lamp Module: an open field case with the slit lamp analytics on its display",
  },
  "ai-powered-emr": {
    brief: "A clinical records system built around ophthalmic workflows: imaging, device output and clinical notes in one timeline.",
    alt: "The ChakraVue System: an open field case with the patient dashboard, showing test patients, on its display",
  },
  "integrated-devices": {
    brief: "Connects the equipment you already own and routes its data into your patient records in real time.",
    alt: "The Integrated Devices connectivity module in its clear enclosure",
  },
};

/** Who each product is for, from the audience mapping (shared/data/audiences.ts). */
const builtFor = (id: string) => audiences.filter((a) => a.items.some((item) => item.key === id)).map((a) => a.label);

/** Land on a product's row further down the page. */
function openProduct(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const row = document.getElementById(id);
  if (!row) return;
  event.preventDefault();
  scrollToY(row.getBoundingClientRect().top + window.scrollY - 40);
}

/**
 * The Product Suite hero: an editorial slideshow of the four products. One
 * product at a time, large on the left (a render from its 3D model), and on
 * the right the product's number, name, tagline, brief and Built for between
 * hairlines. Arrows, the numbered indicators, the arrow keys and a swipe
 * change slides; it plays continuously in a loop, pausing only when off-screen
 * or when the tab is hidden.
 */
export function SuiteHero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const previous = useRef(0);
  const direction = useRef(1);
  const timer = useRef<gsap.core.Tween | null>(null);
  const hold = useRef({ hidden: false });
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);

  const go = useCallback((to: number, dir?: number) => {
    setActive((from) => {
      const next = (to + products.length) % products.length;
      if (next === from) return from;
      direction.current = dir ?? (next > from ? 1 : -1);
      previous.current = from;
      return next;
    });
  }, []);
  const step = useCallback((dir: number) => setActive((from) => {
    const next = (from + dir + products.length) % products.length;
    direction.current = dir;
    previous.current = from;
    return next;
  }), []);

  // The change of slide, short and in step: the outgoing product and copy
  // fade a few pixels away, then the new ones come in from the side asked
  // for, the copy a beat behind its product. Before paint, so the class
  // change and the tweens land in the same frame. A new choice mid-change
  // kills the running tweens and starts from where things are.
  useLayoutEffect(() => {
    const root = ref.current;
    const from = previous.current;
    if (!root || from === active || reduceMotion) return;
    const shots = root.querySelectorAll<HTMLElement>(".ps-slide__shot");
    const copies = root.querySelectorAll<HTMLElement>(".ps-slide__copy");
    const dir = direction.current;
    gsap.killTweensOf([...shots, ...copies, ...root.querySelectorAll(".ps-slide__copy > *")]);
    gsap.set([...shots, ...copies], { clearProps: "all" });

    gsap.fromTo(shots[from], { autoAlpha: 1 }, { autoAlpha: 0, x: -24 * dir, duration: 0.28, ease: "power2.in", clearProps: "all" });
    gsap.from(shots[active], { autoAlpha: 0, x: 32 * dir, duration: 0.45, delay: 0.14, ease: "power3.out", clearProps: "all" });
    gsap.fromTo(copies[from], { autoAlpha: 1 }, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in", clearProps: "all" });
    gsap.from(copies[active].children, { autoAlpha: 0, y: 10, duration: 0.4, stagger: 0.03, delay: 0.18, ease: "power3.out", clearProps: "all" });
  }, [active]);

  // Autoplay, shown as the active indicator's line filling up. It restarts
  // on every change and loops continuously.
  const syncTimer = useCallback(() => {
    const paused = hold.current.hidden || document.hidden;
    if (paused) timer.current?.pause();
    else timer.current?.resume();
  }, []);

  useEffect(() => {
    const root = ref.current;
    const bar = root?.querySelector<HTMLElement>(`.ps-dots__item:nth-child(${active + 1}) .ps-dots__fill`);
    if (reduceMotion || !bar) return;
    timer.current = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: "none", onComplete: () => step(1) });
    syncTimer();
    return () => {
      timer.current?.kill();
      timer.current = null;
      gsap.set(bar, { clearProps: "transform" });
    };
  }, [active, step, syncTimer]);

  // Off screen (or in a background tab) it holds.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const seen = new IntersectionObserver(([entry]) => {
      hold.current.hidden = !entry.isIntersecting;
      syncTimer();
    });
    seen.observe(root);
    document.addEventListener("visibilitychange", syncTimer);
    return () => {
      seen.disconnect();
      document.removeEventListener("visibilitychange", syncTimer);
    };
  }, [syncTimer]);

  // The opening: the first product rises in, then its copy.
  useMotion(ref, (root) => {
    gsap
      .timeline({ delay: 0.15 })
      .from(root.querySelector(".ps-slide__shot.is-active"), { autoAlpha: 0, y: 40, scale: 0.96, duration: 1.2, ease: "cv.out", clearProps: "all" })
      .from(root.querySelector(".ps-hero__glow"), { autoAlpha: 0, scale: 0.8, duration: 1.4, ease: "cv.out", clearProps: "all" }, 0)
      // Opacity only: the platform is centred with CSS translate.
      .from(root.querySelector(".ps-hero__base"), { autoAlpha: 0, duration: 1.2, ease: "power2.out", clearProps: "opacity,visibility" }, 0.15)
      .from(root.querySelectorAll(".ps-slide__copy.is-active > *"), { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.07, ease: "cv.out", clearProps: "all" }, 0.35)
      .from(root.querySelectorAll(".ps-hero__nav > *"), { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.05, ease: "cv.out", clearProps: "all" }, 0.6);
  });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  // A horizontal swipe on the product changes slide.
  const onSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const onSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(event.clientY - start.y)) step(dx < 0 ? 1 : -1);
  };

  return (
    <section
      ref={ref}
      className="ps-hero"
      data-motion="own"
      aria-label="Product Suite"
      onKeyDown={onKeyDown}
    >
      <div className="ps-hero__show" role="region" aria-roledescription="carousel" aria-label="Products">
        {/* The renders are on black and blend onto the glow and the platform
            (lighten, on .ps-hero__float), so the stage must not start a
            stacking context of its own: no transform, opacity or z-index on
            .ps-hero__stage. */}
        <div
          className="ps-hero__stage"
          data-shape={products[active].id === "integrated-devices" ? "module" : "case"}
          onPointerDown={onSwipeStart}
          onPointerUp={onSwipeEnd}
          onPointerCancel={() => (swipe.current = null)}
        >
          <span className="ps-hero__glow" aria-hidden="true" />
          {/* The platform each product stands on, fitted to its footprint. */}
          <span className="ps-hero__base" aria-hidden="true" />
          {/* The products hover together, a few pixels, over the platform. */}
          <div className="ps-hero__float">
            {products.map((product, i) => (
              <img
                key={product.id}
                className={`ps-slide__shot ps-slide__shot--${product.id}${i === active ? " is-active" : ""}`}
                src={`/images/product-suite/slides/${product.id}.webp`}
                alt={SLIDES[product.id].alt}
                width="1500"
                height="1200"
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                aria-hidden={i !== active}
              />
            ))}
          </div>
        </div>

        <div className="ps-hero__side">
          <div className="ps-hero__copy" aria-live={reduceMotion ? "polite" : "off"}>
            {products.map((product, i) => {
              const roles = builtFor(product.id);
              return (
                <article
                  key={product.id}
                  className={`ps-slide__copy${i === active ? " is-active" : ""}`}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${products.length}: ${product.label}`}
                  aria-hidden={i !== active}
                  inert={i !== active}
                >
                  <p className="ps-slide__number">
                    <span className="sr-only">Product </span>
                    {product.index}
                    <small>/ {total}</small>
                  </p>
                  <h1 className="ps-slide__title">{product.label}</h1>
                  <p className="ps-slide__tagline">{product.tagline}</p>
                  <dl className="ps-slide__facts">
                    <div>
                      <dt>Brief</dt>
                      <dd>{SLIDES[product.id].brief}</dd>
                    </div>
                    {roles.length > 0 && (
                      <div>
                        <dt>Built for</dt>
                        <dd>{roles.join(" · ")}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="ps-slide__actions">
                    <a className="ps-btn ps-btn--primary" href={`#${product.id}`} onClick={(event) => openProduct(event, product.id)} data-magnetic="0.2">
                      View product <span aria-hidden="true">↓</span>
                    </a>
                    <Link className="ps-btn ps-btn--ghost" href={product.cta.href}>
                      {product.cta.label}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <nav className="ps-hero__nav" aria-label="Choose a product">
          <button type="button" className="ps-arrow" onClick={() => step(-1)} aria-label="Previous product">
            <span aria-hidden="true">←</span>
          </button>
          <ol className="ps-dots">
            {products.map((product, i) => (
              <li key={product.id} className={`ps-dots__item${i === active ? " is-active" : ""}`}>
                <button type="button" onClick={() => go(i)} aria-current={i === active ? "true" : undefined}>
                  <span className="ps-dots__index">{product.index}</span>
                  <span className="ps-dots__name">{product.label}</span>
                  <span className="ps-dots__line" aria-hidden="true">
                    <span className="ps-dots__fill" />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="ps-arrow" onClick={() => step(1)} aria-label="Next product">
            <span aria-hidden="true">→</span>
          </button>
        </nav>
      </div>
    </section>
  );
}
