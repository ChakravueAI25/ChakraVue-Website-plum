import { useRef, type CSSProperties } from "react";
import { finePointer } from "../../../motion/env";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { products } from "../data";

const ART_W = 1440;
const ART_H = 814;

/**
 * Points on the artwork, as fractions of the frame (measured off hero.jpeg):
 * `focus` centres the spotlight on a device and its label, `port` is where
 * that device's leader line leaves it, and `ring` is where the line meets
 * the central ChakraVue ring.
 */
const GEOMETRY: Record<string, { focus: [number, number]; port: [number, number]; ring: [number, number] }> = {
  "surgical-assistant": { focus: [0.22, 0.26], port: [0.3375, 0.3], ring: [0.419, 0.4005] },
  "slit-lamp-module": { focus: [0.76, 0.27], port: [0.636, 0.285], ring: [0.569, 0.394] },
  "ai-powered-emr": { focus: [0.2, 0.67], port: [0.385, 0.76], ring: [0.4515, 0.634] },
  "integrated-devices": { focus: [0.79, 0.68], port: [0.598, 0.749], ring: [0.536, 0.634] },
};
/** The same frame in the SVG overlay's units (the artwork's own aspect ratio). */
const VB = { w: 2000, h: 1116 };
const RING = { x: 990, y: 530, r: 228 };

export function SuiteHero() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const stage = root.querySelector<HTMLElement>(".ps-hero__stage");
    const layer = root.querySelector<HTMLElement>(".ps-hero__layer");
    const focus = root.querySelector<HTMLElement>(".ps-hero__focus");
    if (!stage || !layer) return;

    // Opens outward from the ChakraVue ring at the centre of the artwork:
    // the intelligence at the middle, then the devices it reaches.
    gsap
      .timeline({ delay: 0.1 })
      .fromTo(
        stage,
        { clipPath: "circle(0% at 49.5% 47.5%)" },
        { clipPath: "circle(120% at 49.5% 47.5%)", duration: 2.2, ease: "cv.inOut", clearProps: "clipPath" },
      )
      .from(root.querySelector(".ps-hero__art"), { scale: 1.3, duration: 2.8 }, 0)
      .from(root.querySelectorAll(".ps-hero__pulse"), { autoAlpha: 0, scale: 0, duration: 0.8, stagger: 0.12, ease: "back.out(2)" }, 1.5)
      .add(() => stage.classList.add("is-live"), 1.6);

    // Drifts away as you scroll into the page.
    gsap.to(layer, {
      yPercent: 12,
      autoAlpha: 0.35,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
    });

    if (!finePointer) return;

    // Mouse: the artwork leans with the pointer, and hovering a product
    // spotlights it by dimming everything else.
    const xTo = gsap.quickTo(layer, "x", { duration: 1.2, ease: "power3" });
    const yTo = gsap.quickTo(layer, "y", { duration: 1.2, ease: "power3" });
    const onMove = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      xTo(-((event.clientX - box.left) / box.width - 0.5) * 22);
      yTo(-((event.clientY - box.top) / box.height - 0.5) * 14);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    const hotspots = [...root.querySelectorAll<HTMLElement>(".ps-hotspot")];
    const onEnter = (event: Event) => {
      const geometry = GEOMETRY[(event.currentTarget as HTMLElement).dataset.product ?? ""];
      if (!geometry || !focus) return;
      const [x, y] = geometry.focus;
      gsap.to(focus, { "--fx": `${x * 100}%`, "--fy": `${y * 100}%`, autoAlpha: 1, duration: 0.7, ease: "power3.out", overwrite: true });
    };
    const onExit = () => focus && gsap.to(focus, { autoAlpha: 0, duration: 0.6, overwrite: true });

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    hotspots.forEach((spot) => {
      spot.addEventListener("pointerenter", onEnter);
      spot.addEventListener("pointerleave", onExit);
    });
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      hotspots.forEach((spot) => {
        spot.removeEventListener("pointerenter", onEnter);
        spot.removeEventListener("pointerleave", onExit);
      });
    };
  });

  return (
    <section ref={ref} className="ps-hero" aria-label="ChakraVue AI product suite overview">
      <div className="ps-hero__stage">
        <div className="ps-hero__layer">
          {/* The artwork already carries the product labels, leader lines and
              centre ring. The overlay only adds light moving along them: data
              travelling from each device into ChakraVue, and a slow orbit
              around the ring. */}
          <img
            className="ps-hero__art"
            src="/images/product-suite/hero.jpeg"
            alt="ChakraVue AI at the centre of a surgical microscope, slit lamp, EMR workstation and diagnostic devices"
            fetchPriority="high"
          />

          <svg className="ps-hero__flow" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <circle className="ps-hero__orbit" cx={RING.x} cy={RING.y} r={RING.r} />
            <circle className="ps-hero__packet ps-hero__packet--orbit" r="4">
              <animateMotion
                dur="7s"
                repeatCount="indefinite"
                path={`M ${RING.x - RING.r},${RING.y} a ${RING.r},${RING.r} 0 1,1 ${RING.r * 2},0 a ${RING.r},${RING.r} 0 1,1 ${-RING.r * 2},0`}
              />
            </circle>
            {products.map((product, i) => {
              const { port, ring } = GEOMETRY[product.id];
              const path = `M ${port[0] * VB.w},${port[1] * VB.h} L ${ring[0] * VB.w},${ring[1] * VB.h}`;
              return (
                <circle key={product.id} className="ps-hero__packet" r="5">
                  <animateMotion dur="2.4s" begin={`${-i * 0.6}s`} repeatCount="indefinite" path={path} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="2.4s" begin={`${-i * 0.6}s`} repeatCount="indefinite" />
                </circle>
              );
            })}
          </svg>

          {products.map((product) => {
            const [x, y] = GEOMETRY[product.id].port;
            return <span key={product.id} className="ps-hero__pulse" style={{ left: `${x * 100}%`, top: `${y * 100}%` }} aria-hidden="true" />;
          })}

          <div className="ps-hero__focus" style={{ "--fx": "50%", "--fy": "50%" } as CSSProperties} aria-hidden="true" />

          {products.map((product) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className="ps-hotspot"
              data-product={product.id}
              data-cursor="View"
              style={{
                left: `${(product.callout.x / ART_W) * 100}%`,
                top: `${(product.callout.y / ART_H) * 100}%`,
              }}
            >
              <span className="sr-only">
                {product.label}: {product.tagline}
              </span>
            </a>
          ))}
        </div>
      </div>

      <ul className="ps-hero__list">
        {products.map((product) => (
          <li key={product.id} data-reveal>
            <a href={`#${product.id}`}>
              <span>-{product.index}</span>
              <strong>{product.label}</strong>
              <small>{product.tagline}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
