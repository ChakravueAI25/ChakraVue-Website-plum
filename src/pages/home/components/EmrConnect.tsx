import { Link } from "../../../shared/components/Link";
import "./emr.css";

/**
 * What feeds the record, each line drawn from that product's own
 * description (product-suite/data.ts). Two sit either side of the record.
 */
const sources = [
  {
    name: "Digital Surgical Assistant",
    href: "/product-suite#surgical-assistant",
    body: "Captures structured data from each procedure for surgical analysis.",
  },
  {
    name: "Slit Lamp Module",
    href: "/product-suite#slit-lamp-module",
    body: "Files structured examination records straight into the patient history.",
  },
  {
    name: "Integrated Devices",
    href: "/product-suite#integrated-devices",
    body: "Routes readings from existing equipment into the record in real time.",
  },
  {
    name: "Clinical notes",
    href: "/product-suite#ai-powered-emr",
    body: "Sit beside imaging and device output, so each consultation has what it needs.",
  },
];

/** The patient's way through the clinic, as the dashboard's status tags show it. */
const stages = ["Reception", "Optometry", "Examination", "Check-out"];

/**
 * The ChakraVue System (Home): the clinic's record at the centre of the
 * ecosystem, with the devices and software that feed it either side and the
 * clinic's workflow under it. The dashboard capture is anonymised.
 */
export function EmrConnect() {
  const side = (from: number) =>
    sources.slice(from, from + 2).map((source) => (
      <li key={source.name} className="emrx__source" data-reveal>
        <Link href={source.href} className="emrx__card">
          <span className="emrx__name">{source.name}</span>
          <span className="emrx__body">{source.body}</span>
        </Link>
      </li>
    ));

  return (
    <section id="emr" className="emrx section" aria-labelledby="emrx-title">
      <div className="section__inner">
        <header className="hsec-head hsec-head--center">
          <p className="section-label" data-scramble>
            The ChakraVue System
          </p>
          <h2 id="emrx-title" className="hsec-title" data-split>
            Every patient on one timeline.
          </h2>
          <p className="emrx__lead" data-split="fade" data-delay="0.1">
            The ChakraVue System is where the ecosystem meets. Imaging, device output and clinical notes arrive in one record, built around ophthalmic workflows.
          </p>
        </header>

        <div className="emrx__map">
          <ul className="emrx__side emrx__side--l">{side(0)}</ul>

          <figure className="emrx__screen" data-reveal>
            <span className="emrx__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>ChakraVue System · Patient dashboard</span>
            </span>
            <img src="/images/product-suite/emr-dashboard.webp" alt="The ChakraVue System's patient dashboard: a day's appointments as cards, each with the patient's status in the clinic." loading="lazy" decoding="async" />
          </figure>

          <ul className="emrx__side emrx__side--r">{side(2)}</ul>
        </div>

        <ol className="emrx__stages" aria-label="The clinic's workflow">
          {stages.map((stage, i) => (
            <li key={stage} data-reveal>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {stage}
            </li>
          ))}
        </ol>

        <div className="emrx__actions">
          <Link href="/product-suite#ai-powered-emr" className="hsec-link">
            Explore the ChakraVue System <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
