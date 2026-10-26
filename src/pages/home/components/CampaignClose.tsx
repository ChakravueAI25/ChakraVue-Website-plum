import { Link } from "../../../shared/components/Link";
import "./campaign.css";

/**
 * The campaign's last frame closes the homepage: the blueprint burnt open,
 * the boy delighted at the intelligence underneath, and the two next steps.
 */
export function CampaignClose() {
  return (
    <section className="campaign-close section" aria-labelledby="campaign-close-title">
      <div className="campaign-close__art">
        <img
          src="/images/campaign/circuit-reveal.jpg"
          alt="The boy from the film, delighted, beside the burnt-open blueprint and the glowing AI circuitry beneath it."
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="section__inner campaign-close__copy">
        <p className="section-label" data-scramble>
          Analogue to AI
        </p>
        <h2 id="campaign-close-title" className="campaign-close__title" data-split>
          Levelling the field for <em>every hospital</em>.
        </h2>
        <p className="campaign-close__lead" data-split="fade" data-delay="0.15">
          Not to burn the past.
          <br />
          To see what was underneath it all along.
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
    </section>
  );
}
