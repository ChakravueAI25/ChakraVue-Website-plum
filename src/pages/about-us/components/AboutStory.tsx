import { Logo } from "../../../brand/Logo";

/**
 * Why the company exists: small hospitals do the work of the big ones with
 * a fraction of the tools, and ChakraVue AI is the step that levels the
 * field. Beside it, the footer's mark (glyphs only, never rotated); it
 * replaced the campaign's height-chart pictures (owner, 2026-10-31).
 */
export function AboutStory() {
  return (
    <section className="about-story section" aria-labelledby="about-story-title">
      <div className="section__inner about-story__inner">
        <div className="about-story__copy">
          <h2 className="section-label" data-scramble>
            Why we exist
          </h2>
          <p id="about-story-title" className="about-story__title" data-split>
            Built inside a working eye hospital. <em>For every hospital.</em>
          </p>
          <p className="about-story__lead" data-split="fade" data-delay="0.15">
            We are clinicians and engineers in Secunderabad. We watched small hospitals do the same work as the big ones with a fraction of the tools,
            and decided to level the field.
          </p>
        </div>

        <div className="about-story__mark" aria-hidden="true" data-reveal>
          <Logo disc={false} />
        </div>
      </div>
    </section>
  );
}
