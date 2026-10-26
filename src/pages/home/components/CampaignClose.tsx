import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import "./campaign.css";

/**
 * The aspiration, closing the homepage: the kid's dream come true. The
 * toddler from the clip stands at the height chart, and beside him the
 * doctor he grows into rises to full height as the section arrives (the
 * growth rail hands over to this scene). Then the next steps.
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
            Every doctor started small
          </p>
          <h2 id="campaign-close-title" className="campaign-close__title" data-split>
            Levelling the field for <em>every hospital</em>.
          </h2>
          <p className="campaign-close__lead" data-split="fade" data-delay="0.15">
            Join the revolution.
          </p>
          <div className="campaign-close__actions">
            <Link href="/product-suite" className="hero__btn hero__btn--primary" data-magnetic="0.2" data-reveal>
              Explore products
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact-us" className="hero__btn hero__btn--ghost" data-reveal>
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
