import { useEffect, useRef, useState, type PointerEvent } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import { gsap, ScrollTrigger } from "../../../motion/gsap";
import { scrollToY } from "../../../motion/lenis";
import { useMotion } from "../../../motion/useMotion";
import type { Theater } from "../../../motion/webgl/theater/engine";
import { products } from "../data";
import "./theater.css";

const total = String(products.length).padStart(2, "0");

/**
 * The product suite as one continuous 3D scene. A studio stage stays fixed
 * while each product's chapter scrolls over it. The product builds up
 * through a scan line, turns, comes apart to show what's inside (labelled),
 * goes back together and hands over to the next.
 *
 * Without WebGL, or with reduced motion, the chapters become a plain
 * product list with the photographs.
 */
export function ProductTheater() {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const theater = useRef<Theater | null>(null);
  const triggers = useRef<ScrollTrigger[]>([]);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [mode, setMode] = useState<"3d" | "static">(reduceMotion ? "static" : "3d");

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = ref.current;
    if (mode !== "3d" || !canvas || !root) return;
    let cancelled = false;
    let offReveal = () => {};
    import("../../../motion/webgl/theater/engine")
      .then(({ createTheater }) => {
        if (cancelled) return;
        theater.current = createTheater(canvas, {
          mode: "stage",
          products: products.map(({ id, anatomy }) => ({ id, anatomy })),
          labelLayer: labelsRef.current,
          onExplode: (explode) => root.style.setProperty("--explode", explode.toFixed(2)),
          // The copy steps aside while the camera is in on an interface.
          onFocus: (focus) => {
            root.style.setProperty("--focus", focus.toFixed(2));
            root.classList.toggle("is-focused", focus > 0.5);
          },
        });
        // Catch up with wherever the page already is.
        triggers.current.forEach((trigger, i) => {
          if (trigger.isActive) theater.current?.setChapter(i, trigger.progress, i === products.length - 1);
        });
        offReveal = whenRevealed(() => theater.current?.start());
        if (import.meta.env.DEV) (window as unknown as { __theater?: Theater }).__theater = theater.current;
      })
      .catch((error) => {
        console.warn("[theater] 3D unavailable, showing the product photographs.", error);
        setMode("static");
      });
    return () => {
      cancelled = true;
      offReveal();
      theater.current?.destroy();
      theater.current = null;
    };
  }, [mode]);

  useMotion(
    ref,
    (root) => {
      if (mode !== "3d") return;
      const chapters = [...root.querySelectorAll<HTMLElement>(".theater__chapter")];
      const rail = [...root.querySelectorAll<HTMLElement>(".theater__rail button")];
      // One source of truth for the rail: whichever chapter is active.
      let railIndex = -1;
      const setRail = (index: number) => {
        if (index === railIndex) return;
        railIndex = index;
        rail.forEach((button, k) => {
          button.classList.toggle("is-active", k === index);
          if (k < index) button.style.setProperty("--p", "1");
          if (k > index) button.style.setProperty("--p", "0");
        });
      };

      const copies = chapters.map((chapter) => chapter.querySelector<HTMLElement>(".theater__copy-inner"));
      const eyebrow = root.querySelector<HTMLElement>(".theater__eyebrow");

      triggers.current = chapters.map((chapter, i) => {
        const last = i === chapters.length - 1;
        const range = { trigger: chapter, start: "top top", end: last ? "bottom bottom" : "bottom top" };
        const copy = copies[i];
        // The copy fades once the parts list is read, finishing before it
        // could scroll up into the eyebrow (desktop) or across the product
        // above it (phones, where it's docked at the bottom).
        let fadeStart = 1;
        let fadeEnd = 1;
        const measure = () => {
          if (!copy) return;
          const span = chapter.offsetHeight;
          const release = 1 - window.innerHeight / span;
          // Phones dock the copy right under the product, so it has to be
          // gone within a short lift, before it reaches the model.
          const lift = window.matchMedia("(max-width: 900px)").matches ? 70 : 220;
          const room = gsap.utils.clamp(0, lift, copy.offsetTop - (eyebrow ? eyebrow.offsetTop + eyebrow.offsetHeight : 0) - 12);
          fadeEnd = release + room / span;
          fadeStart = Math.max(0.6, fadeEnd - 0.06);
          if (fadeEnd <= fadeStart) fadeEnd = fadeStart + 0.04;
        };
        measure();

        // The parts list writes itself in as the product comes apart (sooner
        // in the longer chapters that go on to an interface).
        const listAt = products[i]?.focus ? 0.31 : 0.42;
        gsap
          .timeline({ scrollTrigger: { ...range, scrub: 0.6 } })
          .fromTo(chapter.querySelectorAll(".theater__parts li"), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.07, stagger: 0.025, ease: "none" }, listAt)
          .to({}, { duration: 0 }, 1);

        return ScrollTrigger.create({
          ...range,
          onRefresh: measure,
          onUpdate: (self) => {
            theater.current?.setChapter(i, self.progress, last);
            rail[i]?.style.setProperty("--p", self.progress.toFixed(3));
            if (self.isActive) setRail(i);
            if (!last && copy) gsap.set(copy, { autoAlpha: 1 - gsap.utils.clamp(0, 1, (self.progress - fadeStart) / (fadeEnd - fadeStart)) });
          },
          onToggle: (self) => {
            if (self.isActive) setRail(i);
          },
        });
      });
      return () => {
        triggers.current = [];
        gsap.set(copies.filter(Boolean), { clearProps: "opacity,visibility" });
      };
    },
    [mode],
  );

  // Rail: jump to a product, landing just after it has built up.
  const jump = (index: number) => {
    const chapter = ref.current?.querySelectorAll<HTMLElement>(".theater__chapter")[index];
    if (!chapter) return;
    const top = chapter.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + chapter.offsetHeight * 0.06);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, id: event.pointerId };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    theater.current?.drag(event.clientX - start.x);
    start.x = event.clientX;
  };
  const endDrag = () => (drag.current = null);

  return (
    <section ref={ref} className={`theater theater--${mode}`} aria-labelledby="theater-title">
      <h2 id="theater-title" className="sr-only">
        Product Suite
      </h2>

      <div
        className="theater__stage"
        data-cursor="Drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <canvas ref={canvasRef} className="theater__canvas" aria-hidden="true" />
        <div className="theater__shade" aria-hidden="true" />
        <div ref={labelsRef} className="theater__labels" aria-hidden="true" />
        <p className="theater__eyebrow" aria-hidden="true">
          Product Suite
        </p>
        <nav className="theater__rail" aria-label="Products">
          {products.map((product, i) => (
            <button key={product.id} type="button" className={i === 0 ? "is-active" : undefined} onClick={() => jump(i)}>
              <em>{product.label}</em>
              <span>{product.index}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>
        <p className="theater__hint" aria-hidden="true">
          <i />
          Scroll to look inside · Drag to turn
        </p>
      </div>

      {products.map((product, i) => (
        <article
          key={product.id}
          id={product.id}
          className={`theater__chapter${product.focus ? " theater__chapter--focus" : ""}`}
          aria-labelledby={`${product.id}-title`}
        >
          <div className="theater__copy">
            <div className="theater__copy-inner">
              <p className="theater__index">
                <b>{product.index}</b> / {total}
              </p>
              <h3 id={`${product.id}-title`} className="theater__title" data-split data-start="top 80%">
                {product.title}
              </h3>
              <p className="theater__desc" data-split="fade" data-delay="0.12" data-start="top 85%">
                {product.detail}
              </p>
              <ol className="theater__parts" aria-label={`Inside the ${product.title}`}>
                {product.anatomy.map((part, k) => (
                  <li key={part.id}>
                    <b>{String(k + 1).padStart(2, "0")}</b>
                    {part.label}
                  </li>
                ))}
              </ol>
              <a className="theater__cta" href={product.cta.href} data-magnetic="0.25">
                {product.cta.label}
                <span aria-hidden="true">→</span>
              </a>
            </div>
            <img className="theater__photo" src={product.image} alt={product.title} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        </article>
      ))}
    </section>
  );
}
