import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { finePointer } from "../../../motion/env";
import { gsap, ScrollTrigger } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import { products } from "../../product-suite/data";
import "./showcase.css";

/** How long each product stays open while the showcase plays by itself. */
const INTERVAL = 6.5;
/** Width of a closed panel's slit, as a fraction of the product shot. */
const SLIT_MIN = 0.028;

type Controller = { go: (index: number) => void; stop: () => void };

/**
 * The product showcase: four dark panels, each crossed by a slit of light
 * the way a slit lamp lights the eye, showing a sliver of its product.
 * Opening a panel widens it and splits the slit into two beams that sweep
 * apart until the whole product is lit; the panel that was open collapses
 * back into a slit. Panels open on hover, click, tap or keyboard. Until the
 * visitor picks one, the showcase moves through them on its own.
 */
export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const start = useRef(active);
  const count = products.length;

  useLayoutEffect(() => {
    start.current = active;
    ctrl.current?.go(active);
  }, [active]);

  const choose = (index: number) => {
    ctrl.current?.stop();
    setActive(index);
  };

  useMotion(ref, (root) => {
    const stage = root.querySelector<HTMLElement>(".showcase__stage");
    if (!stage) return;
    const parts = [...stage.querySelectorAll<HTMLElement>(".slit")].map((panel) => ({
      panel,
      body: [...panel.querySelectorAll<HTMLElement>(".slit__body > *")],
      title: panel.querySelector<HTMLElement>(".slit__title"),
      bar: panel.querySelector<HTMLElement>(".slit__progress"),
      shot: panel.querySelector<HTMLElement>(".slit__shot"),
    }));
    const panels = parts.map((part) => part.panel);
    stage.classList.add("is-driven");

    let current = start.current;
    let entered = false;
    let auto = true;
    let inView = false;
    let hovering = false;
    let timer: gsap.core.Tween | null = null;
    let intent = 0;

    // Dark until the section arrives: every panel closed, every light off.
    gsap.set(panels, { "--o": 0, "--slit": SLIT_MIN, "--power": 0, autoAlpha: 0, y: 48 });
    parts.forEach(({ body, bar }) => {
      gsap.set(body, { autoAlpha: 0 });
      gsap.set(bar, { scaleX: 0 });
    });

    // A title can be mid-decode when its panel closes: stop that one tween
    // (only that one, so the fade-out still runs) and put the real text back.
    const decoding = new Map<HTMLElement, gsap.core.Tween>();
    const restoreTitle = (title: HTMLElement | null) => {
      if (!title) return;
      decoding.get(title)?.kill();
      decoding.delete(title);
      title.textContent = title.dataset.text ?? "";
    };

    const show = (index: number) => {
      parts.forEach(({ panel, body, title, shot }, i) => {
        restoreTitle(title);
        if (i === index) {
          gsap.to(panel, { "--o": 1, duration: 1.1, ease: "cv.inOut", overwrite: "auto" });
          gsap.to(panel, { "--slit": 1, duration: 1.3, delay: 0.1, ease: "cv.inOut", overwrite: "auto" });
          gsap.fromTo(body, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, delay: 0.5, ease: "cv.out", overwrite: "auto" });
          if (title) {
            decoding.set(
              title,
              gsap.to(title, {
                duration: 1,
                delay: 0.5,
                ease: "none",
                scrambleText: { text: title.dataset.text ?? "", chars: "upperCase", speed: 0.7, revealDelay: 0.2 },
              }),
            );
          }
        } else {
          gsap.to(panel, { "--o": 0, duration: 1.1, ease: "cv.inOut", overwrite: "auto" });
          gsap.to(panel, { "--slit": SLIT_MIN, duration: 0.85, ease: "cv.inOut", overwrite: "auto" });
          gsap.to(body, { autoAlpha: 0, y: -8, duration: 0.25, ease: "power2.in", overwrite: "auto" });
          gsap.to(shot, { x: 0, y: 0, duration: 0.6, overwrite: "auto" });
        }
      });
    };

    // --- Playing by itself -------------------------------------------------
    const sync = () => {
      if (!timer) return;
      if (inView && !hovering && !document.hidden) timer.resume();
      else timer.pause();
    };
    const clearBars = () => parts.forEach(({ bar }) => gsap.set(bar, { scaleX: 0 }));
    const schedule = () => {
      timer?.kill();
      timer = null;
      clearBars();
      if (!auto || !entered) return;
      timer = gsap.fromTo(
        parts[current].bar,
        { scaleX: 0 },
        { scaleX: 1, duration: INTERVAL, delay: 1.2, ease: "none", onComplete: () => setActive((current + 1) % count) },
      );
      sync();
    };
    const stop = () => {
      auto = false;
      timer?.kill();
      timer = null;
      clearBars();
    };

    ctrl.current = {
      go: (index) => {
        if (index === current) return;
        current = index;
        if (!entered) return;
        show(index);
        schedule();
      },
      stop,
    };

    // --- Entrance: the lamps switch on one by one, then the first opens ----
    ScrollTrigger.create({
      trigger: stage,
      start: "top 82%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to(panels, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "cv.out" }, 0);
        panels.forEach((panel, i) => {
          tl.to(
            panel,
            {
              keyframes: [
                { "--power": 0.75, duration: 0.05 },
                { "--power": 0.1, duration: 0.07 },
                { "--power": 0.9, duration: 0.05 },
                { "--power": 0.35, duration: 0.06 },
                { "--power": 1, duration: 0.5, ease: "power2.out" },
              ],
            },
            0.25 + i * 0.16,
          );
        });
        tl.call(
          () => {
            entered = true;
            show(current);
            schedule();
          },
          [],
          1.05,
        );
      },
    });

    ScrollTrigger.create({
      trigger: stage,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        inView = self.isActive;
        sync();
      },
    });

    // --- Pointer: hovering pauses, lingering on a panel opens it ------------
    const onStageEnter = () => {
      hovering = true;
      sync();
    };
    const onStageLeave = () => {
      hovering = false;
      window.clearTimeout(intent);
      gsap.to(parts[current].shot, { x: 0, y: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
      sync();
    };
    // The open product drifts a little against the pointer.
    const onStageMove = (event: PointerEvent) => {
      const { panel, shot } = parts[current];
      const box = panel.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      gsap.to(shot, { x: nx * -18, y: ny * -10, duration: 0.9, ease: "power3.out", overwrite: "auto" });
    };
    const panelEnters = panels.map((_, i) => () => {
      window.clearTimeout(intent);
      if (i !== current && entered) intent = window.setTimeout(() => choose(i), 150);
    });
    const onPanelLeave = () => window.clearTimeout(intent);

    if (finePointer) {
      stage.addEventListener("pointerenter", onStageEnter);
      stage.addEventListener("pointerleave", onStageLeave);
      stage.addEventListener("pointermove", onStageMove);
      panels.forEach((panel, i) => {
        panel.addEventListener("pointerenter", panelEnters[i]);
        panel.addEventListener("pointerleave", onPanelLeave);
      });
    }
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.clearTimeout(intent);
      timer?.kill();
      ctrl.current = null;
      stage.removeEventListener("pointerenter", onStageEnter);
      stage.removeEventListener("pointerleave", onStageLeave);
      stage.removeEventListener("pointermove", onStageMove);
      panels.forEach((panel, i) => {
        panel.removeEventListener("pointerenter", panelEnters[i]);
        panel.removeEventListener("pointerleave", onPanelLeave);
      });
      document.removeEventListener("visibilitychange", sync);
      parts.forEach(({ panel, body, title, bar, shot }) => {
        restoreTitle(title);
        gsap.killTweensOf([panel, ...body, bar, shot]);
      });
      stage.classList.remove("is-driven");
    };
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!dir || !(event.target as HTMLElement).classList.contains("slit__tab")) return;
    event.preventDefault();
    const next = (active + dir + count) % count;
    choose(next);
    ref.current?.querySelectorAll<HTMLElement>(".slit__tab")[next]?.focus();
  };

  return (
    <section ref={ref} className="showcase section" aria-labelledby="showcase-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <h2 className="section-label" data-scramble>
              Product Suite
            </h2>
            <h3 id="showcase-title" className="hsec-title" data-split>
              Four products, one connected line of sight.
            </h3>
          </div>
          <Link href="/product-suite" className="hsec-link" data-reveal>
            View all products <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="showcase__stage" onKeyDown={onKeyDown}>
          {products.map((product, i) => {
            const open = i === active;
            const bodyId = `slit-${product.id}`;
            return (
              <article key={product.id} className={`slit${open ? " is-open" : ""}`}>
                <div className="slit__media" aria-hidden="true">
                  <div className="slit__shot">
                    <img className="slit__img slit__img--dim" src={`/images/home/products/${product.id}.webp`} alt="" draggable={false} />
                    <img className="slit__img slit__img--lit" src={`/images/home/products/${product.id}.webp`} alt="" draggable={false} />
                    <span className="slit__wash" />
                    <span className="slit__haze" />
                    <span className="slit__beam" />
                    <span className="slit__beam slit__beam--r" />
                  </div>
                </div>

                <button
                  type="button"
                  className="slit__tab"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => choose(i)}
                  onFocus={() => choose(i)}
                >
                  <span className="slit__index">{product.index}</span>
                  <span className="slit__name">{product.title}</span>
                </button>

                <div id={bodyId} className="slit__body" inert={!open}>
                  <h4 className="slit__title" data-text={product.title}>
                    {product.title}
                  </h4>
                  <p className="slit__tagline">{product.tagline}</p>
                  <p className="slit__desc">{product.description}</p>
                  <Link href={`/product-suite#${product.id}`} className="slit__cta">
                    Explore {product.title}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <span className="slit__progress" aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
