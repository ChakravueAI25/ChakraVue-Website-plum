import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import { platforms } from "../../product-suite/platforms";
import "./dental.css";

const planner = platforms.find((p) => p.id === "implant-planning")!;

/** Where the planner runs, from its knowledge-transfer document (2026-10-31). */
const stages = [
  {
    key: "Desktop",
    line: "Where it began: imaging, 3D reconstruction, nerve tracing and implant planning in one workstation application.",
  },
  {
    key: "Web",
    line: "The planner in the browser, alongside the ChakraVue System's patient records.",
  },
  {
    key: "XR",
    line: "The jaw, the implant and the nerve path as separate objects in a headset, to look around the plan in 3D.",
  },
];

/**
 * Dental tools (Home): Dental Implant Planning, from the software suite's
 * own data (product-suite/platforms.ts), so the two never disagree: screens
 * from the planner, its features, then the planning steps, which follow each other in; pointing
 * at a feature lifts it.
 */
export function DentalPlanner() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root.querySelector(".dent__body"), start: "top 75%", once: true } })
      .from(root.querySelectorAll(".dent__flow li"), { autoAlpha: 0, y: 10, duration: 0.45, stagger: 0.08, ease: "cv.out" }, 0.2);
  });

  return (
    <section ref={ref} id="dental" className="dent section" aria-labelledby="dent-title">
      <div className="section__inner">
        <header className="hsec-head hsec-head--corner">
          <div>
            <p className="section-label">Dental tools</p>
            <h2 id="dent-title" className="hsec-title">
              {planner.title}
            </h2>
            <p className="dent__lead">{planner.summary}</p>
          </div>
          <Link href="/product-suite#implant-planning" className="hsec-link hsec-corner-link">
            Explore the software suite <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="dent__body">
          {planner.shots && (
            <div className="dent__shots">
              {planner.shots.map((shot) => (
                <figure key={shot.src} className="dent__shot" data-reveal>
                  <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          )}

          <div className="dent__info">
            <ul className="dent__features">
              {planner.features.map((feature) => (
                <li key={feature} data-reveal>
                  {feature}
                </li>
              ))}
            </ul>
            {planner.flow && (
              <ol className="dent__flow" aria-label="Planning steps">
                {planner.flow.map((step, i) => (
                  <li key={step}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
            {planner.note && <p className="dent__note">{planner.note}</p>}
          </div>
        </div>

        <div className="dent__stages">
          <ol>
            {stages.map((stage, i) => (
              <li key={stage.key} data-reveal>
                <span className="dent__stage-key">
                  <b>{String(i + 1).padStart(2, "0")}</b> {stage.key}
                </span>
                <p>{stage.line}</p>
              </li>
            ))}
          </ol>
          <Link href="/blog#salem" className="hsec-link">
            See it at the Salem session <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
