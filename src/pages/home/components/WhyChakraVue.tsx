import type { ReactNode } from "react";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import "./why.css";

/**
 * The six differentiators from the owner's notes. Kept general on purpose:
 * no security mechanisms, certifications or storage details are claimed
 * until the product team confirms them (README "Copy to confirm").
 */
const reasons: Array<{ title: string; body: string; icon: ReactNode }> = [
  {
    title: "Data security",
    body: "Built for clinical information from the start, with privacy-conscious workflows. We take every team through how its data is handled before deployment.",
    icon: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Zm-3 9 2.2 2.2L15.5 10" />,
  },
  {
    title: "Ease of integration",
    body: "Connects with the clinical workflows and compatible devices you already have, so adoption doesn't mean starting over.",
    icon: <path d="M9 7V3m6 4V3M7 7h10v4a5 5 0 0 1-10 0V7Zm5 9v5" />,
  },
  {
    title: "Easy onboarding",
    body: "Clear workflows and hands-on onboarding, with support for your team while the platform is adopted.",
    icon: <path d="M4 18h4v-4h4v-4h4V6h4M4 18v2m16-14V4" />,
  },
  {
    title: "No new medical hardware",
    body: "Where a product supports it, intelligence is added to compatible equipment you already own rather than replacing it.",
    icon: <path d="M4 7h16v10H4V7Zm4 13h8M12 17v3M8 11l2.5 2.5L16 9" />,
  },
  {
    title: "Local data management",
    body: "Products run on a compute unit on site. We set out, product by product, what is stored locally and how it is deployed.",
    icon: <path d="M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Zm0 0v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />,
  },
  {
    title: "Research & development",
    body: "A medical technology and engineering company: hardware, software and AI developed together and refined with clinicians in real theatres.",
    icon: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 15h9" />,
  },
];

/** Why ChakraVue AI (Home): the six differentiators as a grid of cards. */
export function WhyChakraVue() {
  return (
    <section id="why" className="why section" aria-labelledby="why-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            {/* No data-scramble: decoding would set the name in capitals. */}
            <p className="section-label" data-reveal>
              Why <BrandText text="ChakraVue AI" />
            </p>
            <h2 id="why-title" className="hsec-title" data-split>
              Practical to adopt. Built on research.
            </h2>
          </div>
          <Link href="/about-us" className="hsec-link" data-reveal>
            Meet the team behind it <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ul className="why__grid">
          {reasons.map((reason, i) => (
            <li key={reason.title} className="why__card" data-reveal data-spotlight>
              <span className="why__top">
                <svg className="why__icon" viewBox="0 0 24 24" aria-hidden="true">
                  {reason.icon}
                </svg>
                <span className="why__index">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3>{reason.title}</h3>
              <p>{reason.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
