import { Link } from "../../../shared/components/Link";
import "./devices.css";

/** What the connectivity module does, drawn from the Integrated Devices description (product-suite/data.ts). */
const points = [
  {
    title: "Keeps the equipment you own",
    body: "Intelligence is added to compatible devices already in your clinic. Nothing is replaced.",
  },
  {
    title: "Wired or wireless",
    body: "The module captures each device's data over a wired or wireless link, as the examination happens.",
  },
  {
    title: "Straight into the record",
    body: "Readings reach the patient record in real time, with no manual transcription.",
  },
];

/** Generic device kinds only: which devices are compatible is confirmed per clinic. */
const devices = ["Diagnostic devices", "Imaging systems", "Clinical instruments"];

/**
 * Integrated devices (Home): the equipment a clinic already owns, connected
 * through the module and into the record. The flow reads left to right on
 * wide screens and top to bottom on phones; data pulses along the links.
 */
export function IntegratedDevices() {
  return (
    <section id="integrated-devices" className="idev section" aria-labelledby="idev-title">
      <div className="section__inner">
        <header className="idev__head">
          <div>
            <p className="section-label" data-scramble>
              Integrated devices
            </p>
            <h2 id="idev-title" className="hsec-title" data-split>
              The equipment you already own, connected.
            </h2>
          </div>
          <p className="idev__lead" data-split="fade" data-delay="0.1">
            No new medical hardware. A small connectivity module links compatible devices to your clinical software, so their output becomes part of the patient record.
          </p>
        </header>

        <div className="idev__flow" data-reveal>
          <div className="idev__node idev__node--from">
            <span className="idev__kicker">Your equipment</span>
            <ul className="idev__devices">
              {devices.map((device) => (
                <li key={device}>{device}</li>
              ))}
            </ul>
          </div>

          <span className="idev__wire" aria-hidden="true">
            <i />
          </span>

          <figure className="idev__module">
            <img src="/images/product-suite/integration-module.webp" alt="The Integrated Devices connectivity module in its clear enclosure." loading="lazy" decoding="async" />
            <figcaption>Connectivity module</figcaption>
          </figure>

          <span className="idev__wire" aria-hidden="true">
            <i />
          </span>

          <div className="idev__node idev__node--to">
            <span className="idev__kicker">Your record</span>
            <strong>Patient records</strong>
            <span className="idev__note">In real time</span>
          </div>
        </div>

        <ol className="idev__points">
          {points.map((point, i) => (
            <li key={point.title} data-reveal>
              <span className="idev__index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ol>

        <div className="idev__foot">
          <p>Compatibility depends on the device. We confirm yours before anything is installed.</p>
          <div className="idev__actions">
            <Link href="/product-suite#integrated-devices" className="hsec-link">
              Explore Integrated Devices <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact-us" className="hsec-link">
              Ask about your devices <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
