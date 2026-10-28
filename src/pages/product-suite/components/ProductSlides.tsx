import { useEffect, useRef, useState, type PointerEvent } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import type { Theater } from "../../../motion/webgl/theater/engine";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { audiences } from "../../../shared/data/audiences";
import { products, suiteLines } from "../data";
import "./slides.css";

const total = String(products.length).padStart(2, "0");
/** How long a slide stays before the next (ms). */
const SLIDE_MS = 8000;
/** How far the product opens when you point at it (0 to 1). */
const OPEN = 0.9;

/** Whether a mouse (or trackpad) can point at the products; touch screens use the button. */
const canPoint = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Who each product is for, from the audience mapping (shared/data/audiences.ts). */
const builtFor = (id: string) => audiences.filter((a) => a.items.some((item) => item.key === id)).map((a) => a.label);

/** The slide a link asked for (`/product-suite#slit-lamp-module`), if any. */
const fromHash = () => Math.max(0, products.findIndex((p) => `#${p.id}` === window.location.hash));

/**
 * The products as a slideshow on a light studio panel, one product per
 * slide: the name large on the left with its copy, the product in 3D on a
 * plate on the right with its number. Arrows, the squares at the side, the
 * keyboard and links into the page (`#product-id`, or the hero's `request`)
 * change slides; it also moves on by itself, pausing while the pointer or
 * focus is in it, while a product is open, or while it's off screen.
 *
 * One inline theater (motion/webgl/theater) holds all four products and
 * swaps them as the slides change (the leaving product comes apart, the
 * next assembles). Pointing at the product opens it up, drag turns it, and
 * "Look inside" does it on touch. Without WebGL, or with reduced motion,
 * the studio stills stand in.
 */
export function ProductSlides({ request }: { request: { index: number; at: number } | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const theater = useRef<Theater | null>(null);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [mode, setMode] = useState<"3d" | "static">(reduceMotion ? "static" : "3d");
  const [active, setActive] = useState(fromHash);
  const [open, setOpen] = useState(false);
  const elapsed = useRef(0);
  /** What holds the slide: the pointer in the section, focus in it, an open product. */
  const held = useRef({ pointer: false, focus: false, open: false });
  const activeRef = useRef(active);
  activeRef.current = active;

  const go = (index: number) => {
    elapsed.current = 0;
    setOpen(false);
    setActive((index + products.length) % products.length);
  };

  // The hero's "see it in the slideshow".
  useEffect(() => {
    if (request) go(request.index);
  }, [request]);

  // The 3D view is built when the section nears the screen, not before.
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (mode !== "3d" || !section || !canvas) return;
    let cancelled = false;
    let offReveal = () => {};
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("../../../motion/webgl/theater/engine")
          .then(({ createTheater }) => {
            if (cancelled) return;
            // No label layer: the parts open up without being named.
            theater.current = createTheater(canvas, {
              mode: "inline",
              products: products.map((p) => ({ id: p.id, anatomy: [] })),
              floor: 0.74,
              // The plate's colour as the page shows it (after the palette).
              backdrop: getComputedStyle(canvas.parentElement ?? canvas).backgroundColor,
            });
            offReveal = whenRevealed(() => {
              theater.current?.start();
              if (activeRef.current !== 0) void theater.current?.swap(activeRef.current);
            });
          })
          .catch((error) => {
            console.warn("[slides] 3D unavailable, showing the stills.", error);
            setMode("static");
          });
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(section);
    return () => {
      cancelled = true;
      near.disconnect();
      offReveal();
      theater.current?.destroy();
      theater.current = null;
    };
  }, [mode]);

  useEffect(() => {
    void theater.current?.swap(active);
  }, [active]);

  useEffect(() => {
    theater.current?.setPeek(open, OPEN);
  }, [open]);

  // Moves on by itself: a ticker counts the slide's time (and draws it on
  // the progress line), so holding simply stops the count.
  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    let onScreen = false;
    const seen = new IntersectionObserver(([entry]) => (onScreen = entry.intersectionRatio > 0.4), { threshold: [0, 0.4, 1] });
    if (section) seen.observe(section);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      const { pointer, focus, open: isOpen } = held.current;
      if (onScreen && !pointer && !focus && !isOpen && !document.hidden) elapsed.current += dt;
      fillRef.current?.style.setProperty("--p", String(Math.min(elapsed.current / SLIDE_MS, 1)));
      if (elapsed.current >= SLIDE_MS) {
        elapsed.current = 0;
        setActive((i) => (i + 1) % products.length);
      }
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
    };
  }, []);

  held.current.open = open;

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

  // A mouse opens the product by pointing at it; touch and keyboard use the button.
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && mode === "3d") setOpen(true);
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setOpen(false);
    endDrag();
  };

  const product = products[active];

  return (
    <section
      ref={sectionRef}
      id="products"
      className="slides"
      aria-roledescription="carousel"
      aria-labelledby="slides-title"
      onPointerEnter={() => (held.current.pointer = true)}
      onPointerLeave={() => (held.current.pointer = false)}
      onFocus={() => (held.current.focus = true)}
      onBlur={() => (held.current.focus = false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(active + 1);
        if (event.key === "ArrowLeft") go(active - 1);
      }}
    >
      <div className="ps-studio slides__panel">
        <header className="slides__head">
          <div>
            <p className="ps-eyebrow">The products</p>
            <h2 id="slides-title" className="slides__title" data-split>
              {suiteLines.map((line, i) => (
                <span key={i} className="slides__line">
                  {line.map((part, j) => (typeof part === "string" ? part : <em key={j}>{part[0]}</em>))}
                </span>
              ))}
            </h2>
          </div>
          <div className="slides__controls">
            <p className="slides__counter" aria-live="polite">
              <b>{product.index}</b> / {total}
            </p>
            <button type="button" className="slides__arrow" aria-label="Previous product" onClick={() => go(active - 1)}>
              ←
            </button>
            <button type="button" className="slides__arrow" aria-label="Next product" onClick={() => go(active + 1)}>
              →
            </button>
          </div>
        </header>

        <div className="slides__body">
          <div className="slides__copies">
            {products.map((p, i) => {
              const roles = builtFor(p.id);
              const on = i === active;
              return (
                <article
                  key={p.id}
                  id={p.id}
                  className={`slides__copy${on ? " is-on" : ""}`}
                  aria-roledescription="slide"
                  aria-label={`${p.index} of ${total}: ${p.title}`}
                  aria-hidden={!on}
                  inert={!on}
                >
                  <h3 className="slides__name">{p.title}</h3>
                  <p className="slides__tagline">{p.tagline}</p>
                  <div className="slides__text">
                    <p>
                      <BrandText text={p.description} />
                    </p>
                    {roles.length > 0 && (
                      <p className="slides__for">
                        <span>Built for</span> {roles.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="slides__actions">
                    <Link className="ps-btn ps-btn--primary" href={p.cta.href} data-magnetic="0.2">
                      {p.cta.label} <span aria-hidden="true">→</span>
                    </Link>
                    {mode === "3d" && (
                      <button
                        type="button"
                        className="ps-btn ps-btn--ghost"
                        aria-pressed={on && open}
                        onClick={() => setOpen((v) => !v)}
                      >
                        {on && open ? "Close it up" : "Look inside"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="slides__stage">
            <div
              className={`slides__view${open ? " is-open" : ""}`}
              data-cursor={mode === "3d" ? "Drag" : undefined}
              onPointerEnter={onEnter}
              onPointerLeave={onLeave}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span key={product.id} className="slides__number" aria-hidden="true">
                {product.index}
              </span>
              {mode === "3d" ? (
                <canvas ref={canvasRef} className="slides__canvas" role="img" aria-label={`${product.title}, in 3D`} />
              ) : (
                <img
                  key={product.id}
                  className="slides__still"
                  src={`/images/product-suite/studio/${product.id}.webp`}
                  alt={product.title}
                  decoding="async"
                />
              )}
              {mode === "3d" && (
                <p className="slides__hint" aria-hidden="true">
                  {canPoint ? "Point to open · drag to turn" : "Drag to turn"}
                </p>
              )}
            </div>

            <div className="slides__dots" role="tablist" aria-label="Choose a product">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  className={`slides__dot${i === active ? " is-on" : ""}`}
                  aria-selected={i === active}
                  aria-controls={p.id}
                  aria-label={p.title}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <span className="slides__progress" aria-hidden="true">
          <span ref={fillRef} className="slides__fill" />
        </span>
      </div>
    </section>
  );
}
