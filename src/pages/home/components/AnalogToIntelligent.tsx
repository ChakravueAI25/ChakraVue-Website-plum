import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import "./analog.css";

type Stage = {
  key: "analog" | "digital" | "intelligent";
  label: string;
  title: string;
  body: string;
  marks: string[];
  image: { src: string; alt: string };
};

/**
 * The practical evolution of a clinic's workflow, in three steps. Each stage
 * shows existing art: the campaign's paperwork scene, the ChakraVue System's
 * patient dashboard (anonymised) and the Slit Lamp Module's analysis.
 */
const stages: Stage[] = [
  {
    key: "analog",
    label: "Analog",
    title: "Paper and memory",
    body: "Every visit leaves a paper trail, and the same details are written down again at each desk.",
    marks: ["Paper records", "Handwritten notes", "Physical forms", "Manual admin"],
    image: { src: "/images/campaign/reels/records-before.webp", alt: "A young clerk buried under towers of paper files, phones ringing." },
  },
  {
    key: "digital",
    label: "Digital",
    title: "Records in one place",
    body: "Records and notes move into one system, organised and easy to find when they're needed.",
    marks: ["Digitised records", "Organised documentation", "Connected workflows", "Easier access"],
    image: { src: "/images/product-suite/emr-dashboard.webp", alt: "The ChakraVue System's patient dashboard: the day's appointments as cards, each with the patient's status." },
  },
  {
    key: "intelligent",
    label: "Intelligent",
    title: "Systems that work together",
    body: "Devices and software connect, so findings reach the record and the clinician sees what needs attention. The clinician decides.",
    marks: ["Connected systems", "Integrated devices", "Actionable insights", "Workflow support"],
    image: { src: "/images/product-suite/slit-lamp-interface.webp", alt: "The Slit Lamp Module analysing an eye, its measurements beside the image." },
  },
];

/**
 * From analog to intelligent (Home, after the products): replaced "Still on
 * the old blueprint" (owner, 2026-10-29). Analog → Digital → Intelligent as
 * three stages on one line; as the section arrives the line fills and the
 * stages light in turn, once. Not pinned. Under reduced motion it's drawn
 * complete.
 */
export function AnalogToIntelligent() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const track = root.querySelector(".a2i__track");
    if (!track) return;
    gsap
      .timeline({ scrollTrigger: { trigger: track, start: "top 75%", once: true } })
      .from(root.querySelector(".a2i__fill"), { scaleX: 0, duration: 2.1, ease: "power2.inOut" }, 0)
      .from(root.querySelectorAll(".a2i__node"), { "--lit": 0, duration: 0.5, stagger: 0.85, ease: "power2.out" }, 0);
  });

  return (
    <section ref={ref} id="analog-to-intelligent" className="a2i section" aria-labelledby="a2i-title">
      <div className="section__inner">
        <header className="a2i__head hsec-head--corner">
          <p className="section-label" data-scramble>
            How practice is changing
          </p>
          <h2 id="a2i-title" className="hsec-title" data-split>
            From analog to intelligent.
          </h2>
          <p className="a2i__lead" data-split="fade" data-delay="0.1">
            Move beyond fragmented, paper-based workflows to connected clinical systems that bring your practice together.
          </p>
          <Link href="#how-it-works" className="hsec-link hsec-corner-link">
            Know how it works <span aria-hidden="true">→</span>
          </Link>
        </header>

        {/* The line the three stages sit on (wide screens). */}
        <div className="a2i__track" aria-hidden="true">
          <span className="a2i__line">
            <span className="a2i__fill" />
          </span>
          {stages.map((stage, i) => (
            <span key={stage.key} className={`a2i__node a2i__node--${stage.key}`}>
              <i />
              {String(i + 1).padStart(2, "0")} {stage.label}
            </span>
          ))}
        </div>

        <ol className="a2i__stages">
          {stages.map((stage, i) => (
            <li key={stage.key} className={`a2i__stage a2i__stage--${stage.key}`} data-reveal>
              <figure className="a2i__art">
                <img src={stage.image.src} alt={stage.image.alt} loading="lazy" decoding="async" />
                {stage.key === "intelligent" && <span className="a2i__beam" aria-hidden="true" />}
                <figcaption className="a2i__tag">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {stage.label}
                </figcaption>
              </figure>
              <div className="a2i__body">
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
                <ul className="a2i__marks" aria-label={`${stage.label}: what it looks like`}>
                  {stage.marks.map((mark) => (
                    <li key={mark}>{mark}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
