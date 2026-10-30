import { Link } from "../../../shared/components/Link";
import { mediaAppearance } from "../../blog/data";
import "./journey.css";

const THEATRES = "/images/campaign/theatres";

/**
 * Real photographs only: the summit photos from the blog's media post, then
 * the products at work (the same retouched set as RealTheatres).
 */
const moments = [
  { ...mediaAppearance.photos[2], caption: "The team · AI Impact Summit 2026" },
  { ...mediaAppearance.photos[0], caption: "On air · New Delhi" },
  { src: `${THEATRES}/surgeon.webp`, alt: "A surgeon operating at the microscope, the Surgical Assistant recording the view.", caption: "In theatre" },
  { ...mediaAppearance.photos[1], caption: "Live demonstration" },
  { src: `${THEATRES}/slit-lamp.webp`, alt: "A clinician beside the slit lamp, its analysis on the screen in front of him.", caption: "In the clinic" },
  { src: `${THEATRES}/summit.webp`, alt: "A ChakraVue AI founder interviewed at the company's stand at the AI Impact Summit.", caption: "At our stand" },
  { src: `${THEATRES}/training.webp`, alt: "Clinicians at a hands-on training session, one wearing a headset.", caption: "Hands-on sessions" },
];

/**
 * "Our journey" (Home, under the Featured-in strip): a small strip of real
 * photographs that keeps looping. The list is rendered twice and the track
 * moves by one copy (CSS only); it pauses under the pointer and stands still,
 * scrollable, under reduced motion.
 */
export function JourneyStrip() {
  const loop = [...moments, ...moments];

  return (
    <section className="journey-strip" aria-labelledby="journey-strip-title">
      <div className="journey-strip__head">
        <h2 id="journey-strip-title" className="journey-strip__title">
          Our journey
        </h2>
        <Link href="/blog#media" className="journey-strip__link">
          Read the story <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="journey-strip__viewport">
        <ul className="journey-strip__track">
          {loop.map((moment, i) => {
            const copy = i >= moments.length;
            return (
              <li key={i} aria-hidden={copy || undefined}>
                <figure className="journey-strip__card">
                  <img src={moment.src} alt={copy ? "" : moment.alt} loading="lazy" decoding="async" />
                  <figcaption>{moment.caption}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
