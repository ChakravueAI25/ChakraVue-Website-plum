import { useId } from "react";
import { EarlyBirdOffer } from "./EarlyBirdOffer";
import "./bridge.css";

/** The comet's layers, longest and softest first; every head meets at the same point. */
const comet = ["haze", "tail", "trail", "streak", "head"] as const;

/**
 * Between the statement band and "Who we are" (Home): a wide banner whose
 * outline carries a light that travels round it, then the early-bird offer.
 *
 * The light is an SVG stroke dash, CSS only: each layer is a rounded rect
 * with pathLength 100, so a dash of a given length moves at one even speed
 * round the whole perimeter, corners included, and the loop has no seam.
 * The banner's own border and shadow are the ambient glow, so it holds up
 * between passes, and it is all that is left under reduced motion.
 */
export function IntroBridge() {
  const blur = useId();

  return (
    <section className="bridge section" aria-label="What we connect">
      <div className="section__inner">
        <div className="glow-banner">
          <svg className="glow-banner__light" aria-hidden="true">
            <defs>
              <filter id={`${blur}-soft`} x="-10%" y="-80%" width="120%" height="260%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id={`${blur}-fine`} x="-10%" y="-60%" width="120%" height="220%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>
            {comet.map((layer) => (
              <rect
                key={layer}
                className={`glow-banner__comet glow-banner__comet--${layer}`}
                width="100%"
                height="100%"
                pathLength={100}
                filter={layer === "haze" ? `url(#${blur}-soft)` : layer === "trail" ? `url(#${blur}-fine)` : undefined}
              />
            ))}
          </svg>

          {/* The company's line from "What we do", set as the banner's only words. */}
          <p className="glow-banner__line">
            <span>Clinicians</span>
            <i aria-hidden="true" />
            <span>Data</span>
            <i aria-hidden="true" />
            <span>Devices</span>
          </p>
        </div>

        <EarlyBirdOffer />
      </div>
    </section>
  );
}
