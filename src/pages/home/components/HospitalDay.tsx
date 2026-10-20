import { useRef, type CSSProperties } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { hospitalDay } from "../../../shared/data/content";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";

/**
 * A day in the hospital: six steps through a visit, kiosk to follow-up, as
 * one line. A signal of light runs along it as the section scrolls through,
 * lighting each step it reaches; once it has arrived, data keeps flowing.
 * Links to the Hospital System page.
 */
export function HospitalDay() {
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
        <header className="hsec-head">
          <div>
            <h2 className="section-label" data-scramble>
              A day in the hospital
            </h2>
            <h3 id="hsteps-title" className="hsec-title" data-split>
              Running in a hospital today.
            </h3>
          </div>
          <Link href="/hospital-system" className="hsec-link">
            See the hospital system <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ol className="hsteps__list" style={{ "--count": hospitalDay.length } as CSSProperties}>
          {hospitalDay.map((card, i) => (
            <li key={card.step} className="hsteps__step" style={{ "--i": i } as CSSProperties}>
              <span className="hsteps__node">
                <span data-scramble="digits" data-delay="0.25">
                  {card.step}
                </span>
              </span>
              {i < hospitalDay.length - 1 && (
                <span className="hsteps__link" aria-hidden="true">
                  <i />
                </span>
              )}
              <h4 className="hsteps__title">{card.title}</h4>
              <p className="hsteps__body">
                <BrandText text={card.body} />
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
