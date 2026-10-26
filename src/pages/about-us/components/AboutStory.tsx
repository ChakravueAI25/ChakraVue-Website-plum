import { BrandText } from "../../../shared/components/BrandText";

/** The two frames of the campaign's height chart: too short, then a step up. */
const frames = [
  {
    src: "/images/campaign/level-before.jpg",
    alt: "The boy from the campaign on tiptoe against a height chart, well short of an older boy.",
    caption: "The same work, a fraction of the tools",
  },
  {
    src: "/images/campaign/level-after.jpg",
    alt: "The same boy on a wooden stool, now taller than the older boy, who looks on surprised.",
    caption: "The same hospital, with ChakraVue AI",
  },
];

/**
 * Why the company exists, told with the campaign's character: small
 * hospitals do the work of the big ones with a fraction of the tools, and
 * ChakraVue AI is the step that levels the field.
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
            We are doctors and engineers in Secunderabad. We watched small hospitals do the same work as the big ones with a fraction of the tools,
            and decided to level the field.
          </p>
        </div>

        <div className="about-story__frames">
          {frames.map((frame) => (
            <figure key={frame.src} className="about-story__frame" data-reveal>
              <img src={frame.src} alt={frame.alt} loading="lazy" decoding="async" />
              <figcaption>
                <BrandText text={frame.caption} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
