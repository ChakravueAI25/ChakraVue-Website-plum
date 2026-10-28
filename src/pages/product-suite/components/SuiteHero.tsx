import { useEffect, useRef, useState } from "react";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { reduceMotion } from "../../../motion/env";
import { scrollToY } from "../../../motion/lenis";
import { useMotion } from "../../../motion/useMotion";
import { gsap } from "../../../motion/gsap";
import { products } from "../data";

/** How long each product leads the stage before the next takes its place (ms). */
const LEAD_MS = 4200;
const total = String(products.length).padStart(2, "0");

/**
 * Studio cut-outs of each product on the light stage: rendered from the 3D
 * models (the same ones the slideshow shows), on a transparent background.
 */
const still = (id: string) => `/images/product-suite/studio/${id}.webp`;

/**
 * The Product Suite hero: a light studio panel with every product on one
 * stage. One product leads at the front, the others stand around it, and
 * every few seconds the next one comes forward, round and round. The rail
 * underneath names them and shows how long until the next; picking one
 * brings it forward, and picking the leader opens it in the slideshow.
 *
 * The stage is laid out by slot (CSS, `data-slot`), so the products move
 * between slots by transition alone. The loop pauses while the pointer is
 * on the stage or the rail, when the hero is off screen or the tab hidden,
 * and doesn't run at all with reduced motion.
 */
export function SuiteHero({ onOpen }: { onOpen: (index: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const fill = useRef<Array<HTMLSpanElement | null>>([]);
  const [lead, setLead] = useState(0);
  const elapsed = useRef(0);
  const held = useRef(false);
  const leadRef = useRef(lead);
  leadRef.current = lead;

  // The loop: a ticker that counts the leader's time on stage (and draws it
  // on the rail), so pausing simply stops the count.
  useEffect(() => {
    if (reduceMotion) return;
    const root = ref.current;
    let onScreen = true;
    const seen = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    if (root) seen.observe(root);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      if (onScreen && !held.current && !document.hidden) elapsed.current += dt;
      const progress = Math.min(elapsed.current / LEAD_MS, 1);
      fill.current.forEach((el, i) => el?.style.setProperty("--p", String(i === leadRef.current ? progress : 0)));
      if (elapsed.current >= LEAD_MS) {
        elapsed.current = 0;
        setLead((i) => (i + 1) % products.length);
      }
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
    };
  }, []);

  const bringForward = (index: number) => {
    elapsed.current = 0;
    setLead(index);
  };

  useMotion(ref, (root) => {
    gsap
      .timeline({ delay: 0.1 })
      .from(root.querySelector(".ps-studio"), { autoAlpha: 0, y: 24, duration: 1 })
      // The pictures, not their slots: GSAP's transform would override the
      // slots' CSS translate and scale.
      .from(root.querySelectorAll(".ps-stage__item img"), { autoAlpha: 0, y: 40, duration: 1.2, stagger: 0.08 }, 0.25)
      .from(root.querySelectorAll(".ps-stage__plate, .ps-stage__focus, .ps-stage__readout"), { autoAlpha: 0, duration: 1 }, 0.5)
      .from(root.querySelectorAll(".ps-rail__tab"), { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.06 }, 0.6);
  });

  const leader = products[lead];
  const hold = (on: boolean) => () => (held.current = on);

  return (
    <section ref={ref} className="ps-hero" aria-labelledby="ps-hero-title">
      <div className="ps-studio ps-studio--hero">
        <div className="ps-hero__head">
          <div className="ps-hero__titles">
            <p className="ps-eyebrow">
              <BrandText text="ChakraVue AI" />
            </p>
            <h1 id="ps-hero-title" className="ps-hero__title" data-split>
              Product Suite
            </h1>
          </div>
          <div className="ps-hero__aside">
            <span className="ps-hero__dash" aria-hidden="true" />
            <p className="ps-hero__statement">We Add Intelligence to Your Devices.</p>
            <p className="ps-hero__lede">
              <BrandText text="Four clinical systems, one ChakraVue AI intelligence connecting them." />
            </p>
            <div className="ps-hero__actions">
              <a
                className="ps-btn ps-btn--primary"
                href="#products"
                data-magnetic="0.2"
                onClick={(event) => {
                  event.preventDefault();
                  const target = document.getElementById("products");
                  if (target) scrollToY(target.getBoundingClientRect().top + window.scrollY - 24);
                }}
              >
                Explore the suite <span aria-hidden="true">↓</span>
              </a>
              <Link className="ps-btn ps-btn--ghost" href="/contact-us">
                Talk to us
              </Link>
            </div>
          </div>
        </div>

        <div className="ps-stage" onPointerEnter={hold(true)} onPointerLeave={hold(false)}>
          <div className="ps-stage__plate" aria-hidden="true">
            {products.map((product, i) => (
              <span key={product.id} className={`ps-stage__number${i === lead ? " is-on" : ""}`}>
                {product.index}
              </span>
            ))}
          </div>

          <span className="ps-stage__focus" aria-hidden="true" />

          {products.map((product, i) => {
            const slot = (i - lead + products.length) % products.length;
            return (
              <button
                key={product.id}
                type="button"
                className="ps-stage__item"
                data-slot={slot}
                aria-label={slot === 0 ? `${product.title}: see it in the slideshow` : `Bring ${product.title} forward`}
                onClick={() => (slot === 0 ? onOpen(i) : bringForward(i))}
                data-cursor={slot === 0 ? "View" : undefined}
              >
                <img src={still(product.id)} alt="" decoding="async" fetchPriority={i === 0 ? "high" : "auto"} />
              </button>
            );
          })}

          <div className="ps-stage__readout" aria-live="polite">
            <p className="ps-stage__count">
              Product {leader.index} / {total}
            </p>
            <p key={leader.id} className="ps-stage__name">
              {leader.title}
            </p>
            <p className="ps-stage__tagline">{leader.tagline}</p>
            <span className="ps-stage__pointer" aria-hidden="true" />
          </div>
        </div>

        <nav className="ps-rail" aria-label="Products" onPointerEnter={hold(true)} onPointerLeave={hold(false)}>
          {products.map((product, i) => (
            <button
              key={product.id}
              type="button"
              className={`ps-rail__tab${i === lead ? " is-on" : ""}`}
              aria-current={i === lead ? "true" : undefined}
              onClick={() => (i === lead ? onOpen(i) : bringForward(i))}
            >
              <span className="ps-rail__bar" aria-hidden="true">
                <span ref={(el) => void (fill.current[i] = el)} className="ps-rail__fill" />
              </span>
              <span className="ps-rail__index">{product.index}</span>
              <span className="ps-rail__label">{product.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
