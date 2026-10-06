import { useRef, type CSSProperties } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import type { Leader } from "../data";
import { BrandText } from "../../../shared/components/BrandText";
import { LinkedInLink } from "./LinkedInLink";

type LeaderStatementProps = Leader & {
  /** Alternates which side the heading vs. the quote card sit on. */
  reverse?: boolean;
};

export function LeaderStatement({
  eyebrow,
  title,
  name,
  role,
  quote,
  photo,
  photoPosition = "50% 50%",
  photoZoom = 1,
  linkedin,
  reverse = false,
}: LeaderStatementProps) {
  const ref = useRef<HTMLElement>(null);

  // The card swings in from its own side, the portrait wipes up inside it
  // while settling from a slight zoom, the divider draws and the quote mark
  // pops, and the words follow line by line (data-split).
  useMotion(ref, (root) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } })
      .from(root.querySelector(".founder__card"), {
        x: reverse ? -110 : 110,
        rotationY: reverse ? 12 : -12,
        autoAlpha: 0,
        transformPerspective: 1600,
        duration: 1.5,
        clearProps: "transform,opacity,visibility",
      })
      .fromTo(
        root.querySelector(".founder__photo"),
        { clipPath: "inset(100% 0% 0% 0% round 18px)" },
        { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.3, ease: "cv.inOut", clearProps: "clipPath" },
        0.2,
      )
      .fromTo(root.querySelector(".founder__photo img"), { "--reveal-scale": 1.4 }, { "--reveal-scale": 1, duration: 1.9 }, 0.2)
      .from(root.querySelector(".founder__divider"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.1 }, 0.7)
      .from(root.querySelector(".in-link"), { y: 10, autoAlpha: 0, duration: 0.8, clearProps: "transform,opacity,visibility" }, 0.65)
      .from(root.querySelector(".founder__mark"), { scale: 0, rotation: -40, autoAlpha: 0, duration: 0.9, ease: "back.out(2.2)" }, 0.85);
  });

  return (
    <section ref={ref} className={`founder section${reverse ? " founder--reverse" : ""}`}>
      <div className="section__inner founder__inner">
        <div className="founder__heading">
          <h2 className="section-label" data-scramble>
            {eyebrow}
          </h2>
          <p className="founder__title" data-split data-delay="0.1">
            {title}
          </p>
        </div>
        <blockquote className="founder__card" data-spotlight>
          <div className="founder__photo">
            <img
              src={photo}
              alt={name}
              loading="lazy"
              style={
                {
                  objectPosition: photoPosition,
                  transformOrigin: photoPosition,
                  "--zoom": photoZoom,
                } as CSSProperties
              }
            />
          </div>
          <div className="founder__body">
            <p className="founder__name" data-split data-delay="0.35">
              {name}
            </p>
            <p className="founder__role" data-split="fade" data-delay="0.5">
              <BrandText text={role} />
            </p>
            {linkedin && <LinkedInLink href={linkedin} name={name} label className="founder__linkedin" />}
            <span className="founder__divider" aria-hidden="true" />
            <span className="founder__mark" aria-hidden="true">
              &ldquo;
            </span>
            <p className="founder__quote" data-split="fade" data-delay="0.7">
              {quote}
            </p>
          </div>
        </blockquote>
      </div>
    </section>
  );
}
