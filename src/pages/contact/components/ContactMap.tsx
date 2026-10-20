import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { mapEmbedSrc, mapLabel } from "../data";
import { BrandText } from "../../../shared/components/BrandText";

type ContactMapProps = {
  /** Defaults to the office. */
  label?: string;
  src?: string;
};

export function ContactMap({ label = mapLabel, src = mapEmbedSrc }: ContactMapProps = {}) {
  const ref = useRef<HTMLDivElement>(null);

  // The map unrolls from the top edge down as it scrolls into view.
  useMotion(ref, (root) => {
    gsap.fromTo(
      root,
      { clipPath: "inset(0% 0% 100% 0% round 28px)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 28px)",
        duration: 1.6,
        ease: "cv.inOut",
        clearProps: "clipPath",
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      },
    );
  });

  return (
    <div ref={ref} className="contact-map">
      <div className="contact-map__header">
        <span className="contact-map__pin" aria-hidden="true" />
        <p className="contact-map__label">
          <BrandText text={label} />
        </p>
      </div>
      <iframe
        className="contact-map__frame"
        src={src}
        title={`${label} — location`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
