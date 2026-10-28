import { useLayoutEffect, useRef, type MouseEvent } from "react";
import { Logo } from "../../../brand/Logo";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { finePointer, reduceMotion } from "../../../motion/env";
import { gsap } from "../../../motion/gsap";
import { scrollToY } from "../../../motion/lenis";
import { useMotion } from "../../../motion/useMotion";
import { products } from "../data";

/** What each product's screen shows in the hero, and the status on it. */
const SCREENS: Record<string, { image: string; status: string; alt: string }> = {
  "surgical-assistant": { image: "surgical-assistant", status: "Live view", alt: "The Surgical Assistant's live view of an eye during surgery" },
  "slit-lamp-module": { image: "slit-lamp-module", status: "Analysis", alt: "The Slit Lamp Module's view of an eye under examination" },
  "ai-powered-emr": { image: "ai-powered-emr", status: "Records", alt: "The AI Powered EMR's patient dashboard, with test patients" },
  "integrated-devices": { image: "integrated-devices", status: "Linked", alt: "The Integrated Devices connectivity module" },
};

/** Land on a product's chapter in the theater just after it has built up. */
function openChapter(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const chapter = document.getElementById(id);
  if (!chapter) return;
  event.preventDefault();
  scrollToY(chapter.getBoundingClientRect().top + window.scrollY + chapter.offsetHeight * 0.06);
}

/**
 * The Product Suite hero: ChakraVue AI at the centre, the page's statement
 * inside its ring, and the four products around it, each showing its own
 * screen. Links run from every product into the ring, and data travels
 * along them. Hovering a product lights its link and quiets the others.
 *
 * The links are measured off the laid-out cards (drawLinks below), so the
 * same drawing serves the wide layout (products at the four corners, the
 * statement inside the ring) and the phone one (the statement on top, then
 * two products, the ring and two more, each screen facing the ring).
 */
export function SuiteHero() {
  const ref = useRef<HTMLElement>(null);

  // The links are drawn with or without motion (they simply don't travel
  // when motion is reduced). A layout effect, so they exist before the
  // entrance below animates them.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    return drawLinks(root);
  }, []);

  useMotion(ref, (root) => {
    const field = root.querySelector<HTMLElement>(".ps-hero__field");
    const nodes = gsap.utils.toArray<HTMLElement>(".ps-node", root);
    if (!field) return;

    // The ring opens first, then the products arrive from their corners and
    // their links draw into the ring; then data starts to flow.
    gsap
      .timeline()
      .from(root.querySelectorAll(".ps-hub__ring"), { scale: 0.9, autoAlpha: 0, duration: 0.9, stagger: 0.06, ease: "cv.out" })
      .from(root.querySelectorAll(".ps-hub__logo, .ps-hub__core"), { scale: 0.8, autoAlpha: 0, duration: 0.7, ease: "cv.out" }, 0.1)
      .from(root.querySelector(".ps-hub__actions"), { y: 12, autoAlpha: 0, duration: 0.6, ease: "cv.out" }, 0.4)
      .from(
        nodes,
        {
          x: (i) => (i % 2 ? 40 : -40),
          y: (i) => (i < 2 ? -20 : 20),
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "cv.out",
          clearProps: "transform,opacity,visibility",
        },
        0.15,
      )
      .from(root.querySelectorAll(".ps-link__base"), { strokeDashoffset: (_, el: SVGPathElement) => el.getTotalLength(), duration: 0.6, stagger: 0.06, ease: "power2.inOut" }, 0.45)
      .from(root.querySelectorAll(".ps-link__port"), { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.06, ease: "back.out(2.4)" }, 0.6)
      .add(() => root.classList.add("is-live"), 0.9);

    // Scrolling on, the whole diagram settles back and fades. Wide screens
    // only: on phones the products are read while scrolling, so they stay lit.
    gsap.matchMedia().add("(min-width: 901px)", () => {
      gsap.to(field, {
        yPercent: 8,
        autoAlpha: 0.3,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    });

    if (!finePointer) return;

    // The diagram tilts a little toward the pointer, in one piece, so the
    // links stay attached to the cards.
    const rx = gsap.quickTo(field, "rotationX", { duration: 1.2, ease: "power3" });
    const ry = gsap.quickTo(field, "rotationY", { duration: 1.2, ease: "power3" });
    gsap.set(field, { transformPerspective: 2200 });
    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      ry(((event.clientX - box.left) / box.width - 0.5) * 4);
      rx(-((event.clientY - box.top) / box.height - 0.5) * 3);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <section ref={ref} className="ps-hero" aria-labelledby="ps-hero-title">
      <div className="ps-hero__floor" aria-hidden="true" />
      <div className="ps-hero__field">
        <svg className="ps-hero__links" aria-hidden="true" />

        <div className="ps-hub">
          <svg className="ps-hub__rings" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle className="ps-hub__ring ps-hub__ring--glow" r="96" />
            <circle className="ps-hub__ring ps-hub__ring--ticks" r="91" />
            <circle className="ps-hub__ring ps-hub__ring--orbit" r="99" />
          </svg>
          {/* Phones: the mark sits at the centre of the ring, the statement above. */}
          <Logo className="ps-hub__core" />
        </div>

        <div className="ps-hub__copy">
          <Logo className="ps-hub__logo" />
          <p className="section-label ps-hub__eyebrow" data-scramble>
            Product Suite
          </p>
          <h1 id="ps-hero-title" className="ps-hub__title" data-split>
            We Add <em>Intelligence</em> to Your Devices.
          </h1>
          <p className="ps-hub__lede" data-split="fade" data-delay="0.15">
            Four clinical systems, one <BrandText text="ChakraVue AI" /> intelligence connecting them.
          </p>
          <div className="ps-hub__actions">
            <a className="ps-btn ps-btn--primary" href="#surgical-assistant" onClick={(event) => openChapter(event, "surgical-assistant")} data-magnetic="0.2">
              Explore the suite <span aria-hidden="true">↓</span>
            </a>
            <Link className="ps-btn ps-btn--ghost" href="/contact-us">
              Talk to us
            </Link>
          </div>
        </div>

        <ul className="ps-hero__nodes" role="list">
          {products.map((product) => {
            const screen = SCREENS[product.id];
            return (
              <li key={product.id} className={`ps-node ps-node--${product.index}`}>
                <a className="ps-node__link" href={`#${product.id}`} data-product={product.id} data-cursor="View" onClick={(event) => openChapter(event, product.id)}>
                  <span className="ps-node__screen">
                    <img src={`/images/product-suite/hero/${screen.image}.webp`} alt={screen.alt} width="720" height="450" fetchPriority="high" />
                    <span className="ps-node__scan" aria-hidden="true" />
                    <span className="ps-node__status" aria-hidden="true">
                      {screen.status}
                    </span>
                  </span>
                  <span className="ps-node__meta">
                    <b>{product.index}</b>
                    <strong>{product.label}</strong>
                    <small>{product.tagline}</small>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const SVG = "http://www.w3.org/2000/svg";

/**
 * Draws a link from each product's screen into the ring: it leaves the
 * screen's edge facing the ring and arrives on the ring travelling inward.
 * Positions come from layout offsets (not screen boxes), so the pointer
 * tilt and scroll drift never pull them out of register. Redrawn on resize.
 */
function drawLinks(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>(".ps-hero__links");
  const field = root.querySelector<HTMLElement>(".ps-hero__field");
  const hub = root.querySelector<HTMLElement>(".ps-hub");
  const links = [...root.querySelectorAll<HTMLAnchorElement>(".ps-node__link")];
  if (!svg || !field || !hub) return () => undefined;

  /** Offset of an element within the field, walking up its offset parents. */
  const within = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== field) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { x, y };
  };

  const groups = links.map((link) => {
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("class", "ps-link");
    g.dataset.product = link.dataset.product;
    const base = document.createElementNS(SVG, "path");
    base.setAttribute("class", "ps-link__base");
    const flow = document.createElementNS(SVG, "path");
    flow.setAttribute("class", "ps-link__flow");
    const port = document.createElementNS(SVG, "circle");
    port.setAttribute("class", "ps-link__port");
    port.setAttribute("r", "3.5");
    const dock = document.createElementNS(SVG, "circle");
    dock.setAttribute("class", "ps-link__dock");
    dock.setAttribute("r", "3");
    g.append(base, flow, port, dock);
    svg.append(g);
    return { link, g, base, flow, port, dock };
  });

  const draw = () => {
    const w = field.offsetWidth;
    const h = field.offsetHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    // The rings fill the hub (SVG has no layout offsets of its own).
    const hubAt = within(hub);
    const r = (hub.offsetWidth / 2) * 0.96;
    const cx = hubAt.x + hub.offsetWidth / 2;
    const cy = hubAt.y + hub.offsetHeight / 2;

    groups.forEach(({ link, base, flow, port, dock }, i) => {
      const screen = link.querySelector<HTMLElement>(".ps-node__screen");
      if (!screen) return;
      const at = within(screen);
      const sw = screen.offsetWidth;
      const sh = screen.offsetHeight;
      // Leave from the side of the screen that faces the ring: its inner
      // edge when the screen is beside the ring (wide screens), its bottom
      // or top edge when it sits above or below it (phones).
      const beside = at.x + sw < cx - r || at.x > cx + r;
      let ax: number;
      let ay: number;
      let ox: number;
      let oy: number;
      if (!beside) {
        const above = at.y + sh / 2 < cy;
        ax = at.x + sw / 2;
        ay = above ? at.y + sh : at.y;
        ox = 0;
        oy = above ? 1 : -1;
      } else {
        const left = at.x + sw / 2 < cx;
        ax = left ? at.x + sw : at.x;
        ay = at.y + sh * 0.5;
        ox = left ? 1 : -1;
        oy = 0;
      }
      const dx = ax - cx;
      const dy = ay - cy;
      const d = Math.hypot(dx, dy) || 1;
      const ex = cx + (dx / d) * r;
      const ey = cy + (dy / d) * r;
      const reach = Math.max(40, Math.hypot(ex - ax, ey - ay) * 0.45);
      const path = `M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${(ax + ox * reach).toFixed(1)} ${(ay + oy * reach).toFixed(1)} ${(ex + (dx / d) * reach * 0.7).toFixed(1)} ${(ey + (dy / d) * reach * 0.7).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      base.setAttribute("d", path);
      flow.setAttribute("d", path);
      const length = base.getTotalLength();
      base.style.strokeDasharray = `${length}`;
      flow.style.setProperty("--len", `${length}`);
      flow.style.animationDelay = `${-i * 0.7}s`;
      port.setAttribute("cx", ax.toFixed(1));
      port.setAttribute("cy", ay.toFixed(1));
      dock.setAttribute("cx", ex.toFixed(1));
      dock.setAttribute("cy", ey.toFixed(1));
    });
  };

  // Hovering (or focusing) a product lights its own link.
  const light = (id: string | null) => {
    root.classList.toggle("has-focus", !!id);
    groups.forEach(({ link, g }) => {
      const on = link.dataset.product === id;
      g.classList.toggle("is-hot", on);
      link.parentElement?.classList.toggle("is-hot", on);
    });
  };
  const handlers = groups.map(({ link }) => {
    const on = () => light(link.dataset.product ?? null);
    const off = () => light(null);
    link.addEventListener("pointerenter", on);
    link.addEventListener("pointerleave", off);
    link.addEventListener("focus", on);
    link.addEventListener("blur", off);
    return { link, on, off };
  });

  draw();
  const resizer = new ResizeObserver(draw);
  resizer.observe(field);
  // Images and the web font change the cards' size once they load.
  document.fonts?.ready.then(draw).catch(() => undefined);
  if (reduceMotion) root.classList.add("is-live", "is-still");

  return () => {
    resizer.disconnect();
    handlers.forEach(({ link, on, off }) => {
      link.removeEventListener("pointerenter", on);
      link.removeEventListener("pointerleave", off);
      link.removeEventListener("focus", on);
      link.removeEventListener("blur", off);
    });
    groups.forEach(({ g }) => g.remove());
  };
}
