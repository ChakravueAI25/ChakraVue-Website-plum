import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import "./campaign.css";

const paths = [
  {
    label: "Book a demo",
    title: "See a product working.",
    body: "Product trials and demonstrations for your team.",
    href: "/try-demo",
  },
  {
    label: "Collaborate",
    title: "Build it with us.",
    body: "Partnerships and integrations with hospitals, institutions and device manufacturers.",
    href: `/contact-us?interest=${encodeURIComponent("Partnership / Collaboration")}`,
  },
];

/**
 * The aspiration, closing the homepage: the kid's dream come true. The
 * toddler from the clip stands at the height chart, and beside him the
 * doctor he grows into rises to full height as the section arrives (the
 * growth rail hands over to this scene). Then the next steps: book a demo,
 * or collaborate.
 */
export function CampaignClose() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root, start: "top 65%", once: true } })
      .from(root.querySelector(".aspire__kid"), { autoAlpha: 0, y: 24, duration: 0.9, ease: "cv.out" })
      // He grows from the toddler's height to his own; the tape lights with him.
      .from(root.querySelector(".aspire__doctor img"), { scaleY: 0.54, scaleX: 0.72, autoAlpha: 0, transformOrigin: "50% 100%", duration: 1.8, ease: "cv.inOut" }, 0.35)
      .from(root.querySelector(".aspire__reach"), { scaleY: 0.5, autoAlpha: 0, duration: 1.8, ease: "cv.inOut" }, 0.35)
      .from(root.querySelectorAll(".aspire__flare, .aspire__doctor .aspire__mark"), { autoAlpha: 0, duration: 1, ease: "power2.out" }, 1.6);
  });

  return (
    <section ref={ref} className="campaign-close section" aria-labelledby="campaign-close-title">
      <div className="section__inner campaign-close__inner">
        <div className="aspire" aria-hidden="true">
          <span className="aspire__tape" />
          <span className="aspire__reach" />
          <span className="aspire__flare" />
          <span className="aspire__figure aspire__kid">
            <img src="/images/campaign/grow/toddler-still.webp" alt="" loading="lazy" decoding="async" />
            <span className="aspire__mark">0.95 m</span>
          </span>
          <span className="aspire__figure aspire__doctor">
            <img src="/images/campaign/grow/doctor-tall.webp" alt="" loading="lazy" decoding="async" />
            <span className="aspire__mark">1.74 m</span>
          </span>
        </div>

        <div className="campaign-close__copy">
          <p className="section-label" data-scramble>
            The dream, within reach
          </p>
          <h2 id="campaign-close-title" className="campaign-close__title" data-split>
            A clinician with <em>new powers</em>.
          </h2>
          <p className="campaign-close__lead" data-split="fade" data-delay="0.15">
            Every case captured. Every examination remembered. Every patient on one timeline. Every instrument connected. Join the revolution.
          </p>
          {/* The page's last step, either way in: try a product, or work with us. */}
          <ul className="campaign-close__paths">
            {paths.map((path) => (
              <li key={path.label} data-reveal>
                <Link href={path.href} className="close-path">
                  <span className="close-path__label">{path.label}</span>
                  <strong className="close-path__title">{path.title}</strong>
                  <span className="close-path__body">{path.body}</span>
                  <span className="close-path__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact-us" className="hsec-link campaign-close__contact" data-reveal>
            Or simply contact us <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
