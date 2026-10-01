import { useRef, type CSSProperties } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { valueCards } from "../../../shared/data/content";

/**
 * How it works: the four stages as one process. A signal of light runs
 * from Capture to Assist as the section scrolls through, lighting each stage
 * it reaches; once it has arrived, data keeps flowing along the line.
 */
export function ValueCards() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const list = root.querySelector<HTMLElement>(".hsteps__list");
    const steps = [...root.querySelectorAll<HTMLElement>(".hsteps__step")];
    if (!list || !steps.length) return;
    root.classList.add("is-driven");

    const last = steps.length - 1;
    const update = (progress: number) => {
      const reach = progress * last;
      steps.forEach((step, i) => {
        step.style.setProperty("--seg", gsap.utils.clamp(0, 1, reach - i).toFixed(3));
        step.classList.toggle("is-lit", reach >= i - 0.02);
      });
      root.classList.toggle("is-complete", progress > 0.995);
    };
    update(0);

    const signal = { p: 0 };
    gsap.to(signal, {
      p: 1,
      ease: "none",
      onUpdate: () => update(signal.p),
      scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 58%", scrub: 0.6 },
    });

    return () => {
      root.classList.remove("is-driven", "is-complete");
      steps.forEach((step) => {
        step.classList.remove("is-lit");
        step.style.removeProperty("--seg");
      });
    };
  });

  return (
    <section ref={ref} className="hsteps section" aria-labelledby="hsteps-title">
      <div className="section__inner">
        <header className="hsec-head hsec-head--center">
          <h2 className="section-label" data-scramble>
            How it works
          </h2>
          <h3 id="hsteps-title" className="hsec-title" data-split>
            From the instrument to the decision.
          </h3>
        </header>

        <ol className="hsteps__list">
          {valueCards.map((card, i) => (
            <li key={card.step} className="hsteps__step" style={{ "--i": i } as CSSProperties}>
              <span className="hsteps__node">
                <span data-scramble="digits" data-delay="0.25">
                  {card.step}
                </span>
              </span>
              {i < valueCards.length - 1 && (
                <span className="hsteps__link" aria-hidden="true">
                  <i />
                </span>
              )}
              <h4 className="hsteps__title">{card.title}</h4>
              <p className="hsteps__body">{card.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
