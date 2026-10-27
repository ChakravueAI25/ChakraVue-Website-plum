import { useEffect, useRef, useState, type PointerEvent } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import type { Theater } from "../../../motion/webgl/theater/engine";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { audiences } from "../../../shared/data/audiences";
import { products, type Product } from "../data";
import "./theater.css";

const total = String(products.length).padStart(2, "0");
/** How far the product opens when you point at it (0 to 1). */
const OPEN = 0.9;

/** Whether a mouse (or trackpad) can point at the products; touch screens use the button. */
const canPoint = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Who each product is for, from the audience mapping (shared/data/audiences.ts). */
const builtFor = (id: string) => audiences.filter((a) => a.items.some((item) => item.key === id)).map((a) => a.label);

/**
 * The product suite as a spec sheet: one product after another, the copy on
 * the left and the product, in 3D, on the right. Pointing at a product (or
 * pressing "Look inside") opens it up to show what's inside; drag to turn
 * it. Nothing here is driven by scrolling.
 *
 * Each product has its own small inline theater (motion/webgl/theater),
 * created as it nears the screen. Without WebGL, or with reduced motion, the
 * product photographs stand in.
 */
export function ProductTheater() {
  return (
    <section className="specs section" aria-labelledby="specs-title">
      <div className="section__inner">
        <h2 id="specs-title" className="sr-only">
          Product Suite
        </h2>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductRow({ product }: { product: Product }) {
  const rowRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theater = useRef<Theater | null>(null);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [mode, setMode] = useState<"3d" | "static">(reduceMotion ? "static" : "3d");
  const [open, setOpen] = useState(false);
  const roles = builtFor(product.id);

  // The 3D view is built when the row nears the screen, not before.
  useEffect(() => {
    const row = rowRef.current;
    const canvas = canvasRef.current;
    if (mode !== "3d" || !row || !canvas) return;
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
              products: [{ id: product.id, anatomy: [] }],
              floor: 0.8,
              // The panel's colour as the page shows it (after the palette).
              backdrop: getComputedStyle(canvas.parentElement ?? canvas).backgroundColor,
            });
            offReveal = whenRevealed(() => theater.current?.start());
          })
          .catch((error) => {
            console.warn(`[specs] 3D unavailable for ${product.id}, showing the photograph.`, error);
            setMode("static");
          });
      },
      { rootMargin: "300px 0px" },
    );
    near.observe(row);
    return () => {
      cancelled = true;
      near.disconnect();
      offReveal();
      theater.current?.destroy();
      theater.current = null;
    };
  }, [mode, product.id]);

  useEffect(() => {
    theater.current?.setPeek(open, OPEN);
  }, [open]);

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

  // A mouse opens it by pointing; touch and keyboard use the button.
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setOpen(true);
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setOpen(false);
    endDrag();
  };

  return (
    <article
      ref={rowRef}
      id={product.id}
      className={`spec spec--${mode}${open ? " is-open" : ""}`}
      aria-labelledby={`${product.id}-title`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className="spec__info">
        <p className="spec__count">
          Product <b>{product.index}</b> / {total}
        </p>
        <h3 id={`${product.id}-title`} className="spec__title" data-split>
          {product.title}
        </h3>
        <p className="spec__tagline">{product.tagline}</p>

        <dl className="spec__grid">
          <div className="spec__cell spec__cell--wide">
            <dt>Overview</dt>
            <dd>
              <BrandText text={product.description} />
            </dd>
          </div>
          {roles.length > 0 && (
            <div className="spec__cell">
              <dt>Built for</dt>
              <dd>{roles.join(" · ")}</dd>
            </div>
          )}
          <div className="spec__cell">
            <dt>Inside</dt>
            <dd>{mode === "static"
                ? "Shown as photographed."
                : canPoint
                  ? "Point at the product to open it up; drag to turn it."
                  : "Tap “Look inside” to open it up; drag to turn it."}</dd>
          </div>
        </dl>

        <Link className="spec__cta" href={product.cta.href} data-magnetic="0.25">
          {product.cta.label}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        className="spec__view"
        data-cursor={mode === "3d" ? "Drag" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="spec__number" aria-hidden="true">
          {product.index}
        </span>
        <span className="spec__floor" aria-hidden="true" />
        {mode === "3d" ? (
          <canvas ref={canvasRef} className="spec__canvas" role="img" aria-label={`${product.title}, in 3D`} />
        ) : (
          <img className="spec__photo" src={product.image} alt={product.title} loading="lazy" decoding="async" />
        )}
        {mode === "3d" && (
          <button type="button" className="spec__toggle" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
            {open ? "Close it up" : "Look inside"}
          </button>
        )}
      </div>
    </article>
  );
}
