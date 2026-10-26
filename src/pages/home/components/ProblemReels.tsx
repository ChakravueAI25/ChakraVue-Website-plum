import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import "./reels.css";

const IMG = "/images/campaign/reels";

type Reel = {
  area: string;
  hook: string;
  punch: string;
  before: { src: string; alt: string };
  /** The same scene once ChakraVue AI is in it, where the campaign drew one. */
  after?: { src: string; alt: string };
  href: string;
  product: string;
};

/** From the blueprint redesign's reel wall, kept to the problems a product here answers. */
const reels: Reel[] = [
  {
    area: "Devices",
    hook: "Still running on analogue?",
    punch: "Now give it an engine.",
    before: { src: `${IMG}/devices-before.webp`, alt: "An old, rusting car on a wet road at dusk." },
    after: { src: `${IMG}/devices-after.webp`, alt: "The same old car, now racing with a jet engine strapped to its roof." },
    href: "/product-suite#integrated-devices",
    product: "Integrated Devices",
  },
  {
    area: "Records",
    hook: "Paperwork again?",
    punch: "Same details. Typed five times.",
    before: { src: `${IMG}/records-before.webp`, alt: "A young clerk buried under towers of files, phones ringing." },
    after: { src: `${IMG}/records-after.webp`, alt: "The same clerk leaning back, relaxed, at a clear desk." },
    href: "/product-suite#ai-powered-emr",
    product: "AI Powered EMR",
  },
  {
    area: "Dental",
    hook: "Planning an implant by eye?",
    punch: "One wobble is one too many.",
    before: { src: `${IMG}/dental-before.webp`, alt: "A toddler balancing a wobbly tower of books and tins." },
    href: "/product-suite#plat-title",
    product: "Dental Implant Planning",
  },
];

/**
 * The beginning of the kid's story: the days every hospital knows, from the
 * campaign's reel wall. Where the campaign drew the answer too, the scene
 * turns into it as the card arrives; hovering a card shows the old day again.
 * Each card leads to the product that answers it.
 */
export function ProblemReels() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    root.querySelectorAll<HTMLElement>(".reel--turns").forEach((card) => {
      gsap.fromTo(
        card,
        { "--after": 0 },
        { "--after": 1, duration: 1.4, delay: 0.9, ease: "power1.inOut", scrollTrigger: { trigger: card, start: "top 62%", once: true } },
      );
    });
  });

  return (
    <section ref={ref} className="reels section" aria-labelledby="reels-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <p className="section-label" data-scramble>
              Still on the old blueprint?
            </p>
            <h2 id="reels-title" className="hsec-title" data-split>
              Every hospital knows these days.
            </h2>
          </div>
        </header>

        <ul className="reels__grid">
          {reels.map((reel) => (
            <li key={reel.area} data-reveal>
              <Link href={reel.href} className={`reel${reel.after ? " reel--turns" : ""}`} data-spotlight>
                <span className="reel__art">
                  <img className="reel__img" src={reel.before.src} alt={reel.before.alt} loading="lazy" decoding="async" />
                  {reel.after && <img className="reel__img reel__img--after" src={reel.after.src} alt={reel.after.alt} loading="lazy" decoding="async" />}
                  {reel.after && (
                    <span className="reel__state" aria-hidden="true">
                      <span className="reel__state-before">Before</span>
                      <span className="reel__state-after">
                        <BrandText text="With ChakraVue AI" />
                      </span>
                    </span>
                  )}
                </span>
                <span className="reel__body">
                  <span className="reel__area">{reel.area}</span>
                  <span className="reel__hook">{reel.hook}</span>
                  <span className="reel__punch">{reel.punch}</span>
                  <span className="reel__link">
                    {reel.product}
                    <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
