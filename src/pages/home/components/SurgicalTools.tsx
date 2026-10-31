import { Link } from "../../../shared/components/Link";
import "./surgical.css";

/**
 * The three things the brief asks the surgical tools to answer: who they're
 * for, what the platform does, and what they're built on. Drawn from the
 * Surgical Assistant's description, the real theatre photographs and the
 * AI Impact Summit post; no validation or outcome claims.
 */
const facets = [
  {
    key: "ID",
    title: "Who it's for",
    body: "Ophthalmic surgeons and their teams, at the operating microscope, during the procedure itself.",
  },
  {
    key: "Platform",
    title: "What it does",
    body: "Real-time visual overlays, guidance and procedural information in the surgeon's field of view, while the case is captured as structured data for surgical analysis. It runs from a portable case beside the microscope.",
  },
  {
    key: "Research",
    title: "What it's built on",
    body: "Developed and refined with practising surgeons in real operating theatres, and demonstrated live at the AI Impact Summit 2026 in New Delhi.",
  },
];

/**
 * Surgical tools (Home): who it's for, what it does and what it's built on,
 * beside the Digital Surgical Assistant's interface. A soft analysis beam crosses the screen, the
 * same touch the Product Suite's 3D screens carry. The real theatre photos
 * follow in their own section.
 */
export function SurgicalTools() {
  return (
    <section id="surgical-tools" className="stools section" aria-labelledby="stools-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <p className="section-label" data-scramble>
              Surgical tools
            </p>
            <h2 id="stools-title" className="hsec-title" data-split>
              AI-powered assistance, in the surgeon&apos;s field of view.
            </h2>
          </div>
          <Link href="/product-suite#surgical-assistant" className="hsec-link" data-reveal>
            Explore the Surgical Assistant <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="stools__body">
          <ol className="stools__facets">
            {facets.map((facet, i) => (
              <li key={facet.key} data-reveal>
                <h3>{facet.title}</h3>
                <p>{facet.body}</p>
                {i === facets.length - 1 && (
                  <Link href="/blog#media" className="hsec-link">
                    The summit demonstration <span aria-hidden="true">→</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>

          <figure className="stools__screen" data-reveal>
            <img src="/images/product-suite/surgical-interface.webp" alt="The Digital Surgical Assistant's interface during surgery: the live view of the eye with guidance overlays, and the surgical controls either side." loading="lazy" decoding="async" />
            <span className="stools__beam" aria-hidden="true" />
            <figcaption>Digital Surgical Assistant · the surgeon&apos;s live view</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
