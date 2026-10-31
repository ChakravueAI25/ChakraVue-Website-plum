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
 * own data (product-suite/platforms.ts), so the two never disagree. A line
 * drawing of an implant in the jaw traces itself in, then the features and
 * the planning steps follow; pointing at a feature lifts it.
 */
export function DentalPlanner() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root.querySelector(".dent__body"), start: "top 75%", once: true } })
      .fromTo(root.querySelectorAll(".dent__line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06, ease: "power2.inOut" }, 0)
      .from(root.querySelectorAll(".dent__flow li"), { autoAlpha: 0, y: 10, duration: 0.45, stagger: 0.08, ease: "cv.out" }, 0.4);
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
          <figure className="dent__art" data-reveal>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <path pathLength={1} className="dent__line" d="M38 30 C 34 16 44 10 52 14 C 56 10 64 10 68 14 C 76 10 86 16 82 30 C 78 38 42 38 38 30 Z" />
              <path pathLength={1} className="dent__line" d="M54 38 h12 v8 h-12 Z" />
              <path pathLength={1} className="dent__line" d="M52 46 h16 l-2 44 l-6 8 l-6 -8 Z" />
              <path pathLength={1} className="dent__line" d="M50 56 h20 M50 66 h20 M51 76 h18 M53 86 h14" />
              <path pathLength={1} className="dent__line dent__line--hot" d="M8 104 C 30 96 44 110 60 106 S 96 96 112 104" />
              <circle pathLength={1} className="dent__line dent__line--hot" cx="60" cy="98" r="12" />
            </svg>
            <figcaption>{planner.category}</figcaption>
          </figure>

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
