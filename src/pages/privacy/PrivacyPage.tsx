import { useRef } from "react";
import { gsap } from "../../motion/gsap";
import { useMotion, usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { closing, intro, lastUpdated, sections } from "./data";
import "./privacy.css";

export function PrivacyPage() {
  const ref = useRef<HTMLElement>(null);
  usePageMotion();

  // A hairline across the top fills as you read.
  useMotion(ref, (root) => {
    gsap.fromTo(
      root.querySelector(".read-progress span"),
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.3 } },
    );
  });

  return (
    <main ref={ref} className="site-shell privacy-page">
      <div className="read-progress" aria-hidden="true">
        <span />
      </div>
      <Header />

      <section className="privacy-hero section">
        <div className="privacy-container">
          <h1 className="privacy-hero__heading" data-split>
            Privacy Policy
          </h1>
          <p className="privacy-hero__updated" data-split="fade" data-delay="0.2">
            Last Updated: {lastUpdated}
          </p>
          {intro.map((paragraph, i) => (
            <p className="privacy-hero__intro" key={i} data-split="fade" data-delay={String(0.3 + i * 0.1)}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="privacy-body section">
        <div className="privacy-container">
          {sections.map((item) => (
            <article className="privacy-section" data-reveal key={item.heading}>
              <h2>{item.heading}</h2>
              {item.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </article>
          ))}

          <article className="privacy-section" data-reveal>
            <h2>{closing.heading}</h2>
            <p>{closing.intro}</p>
            <address className="privacy-contact-block">
              {closing.company}
              <br />
              Email: <a href={`mailto:${closing.email}`}>{closing.email}</a>
              <br />
              Address: {closing.address}
            </address>
            <p>{closing.outro}</p>
          </article>

          <p className="privacy-footer-updated">Last Updated: {lastUpdated}</p>
        </div>
      </section>
    </main>
  );
}
