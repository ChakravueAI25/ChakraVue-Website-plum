import { Fragment, useRef, type ReactNode } from "react";
import { gsap, SplitText } from "../../motion/gsap";
import { useMotion } from "../../motion/useMotion";

type InsightStatementProps = {
  /** Each line is split into plain text and highlighted words: `["Institute creates ", ["data"], "."]`. */
  lines: Array<Array<string | [string]>>;
  className?: string;
  /** A closing line under the statement; its highlighted words light last. */
  coda?: ReactNode;
};

/**
 * A statement band: as it comes into view its words fade up in quick
 * succession and the highlighted words warm to amber. It plays once and is
 * never tied to scroll distance.
 */
export function InsightStatement({ lines, className = "", coda }: InsightStatementProps) {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const text = root.querySelector<HTMLElement>(".insight-statement__text");
    if (!text) return;
    const split = SplitText.create(text, { type: "words", wordsClass: "insight-word" });
    const highlights = text.querySelectorAll("em");
    const closing = root.querySelector(".insight-statement__coda");

    // The site's text entrance (motion/reveal.ts), word by word, once, as
    // the band comes into view; then the highlighted words warm up.
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 90%", once: true } });
    tl.from(split.words, { autoAlpha: 0, y: 16, duration: 0.55, ease: "power2.out", stagger: { amount: 0.35 } }, 0)
      // The highlight colours live in CSS (so they follow the palette); this only turns them up.
      .fromTo(highlights, { "--lit": 0 }, { "--lit": 1, duration: 0.4, stagger: 0.07, ease: "power2.out" }, 0.3);
    if (closing) {
      tl.from(closing, { autoAlpha: 0, y: 16, duration: 0.55, ease: "power2.out" }, 0.35).fromTo(
        closing.querySelectorAll("em"),
        { "--lit": 0 },
        { "--lit": 1, duration: 0.4, stagger: 0.07, ease: "power2.out" },
        0.6,
      );
    }
  });

  return (
    <section ref={ref} className={`insight-statement ${className}`} data-motion="own">
      <span className="insight-statement__beam" aria-hidden="true" />
      <h2 className="insight-statement__text">
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line.map((part, partIndex) =>
              typeof part === "string" ? (
                <Fragment key={partIndex}>{part}</Fragment>
              ) : (
                <em key={partIndex}>{part[0]}</em>
              ),
            )}
          </Fragment>
        ))}
      </h2>
      {coda && <p className="insight-statement__coda">{coda}</p>}
    </section>
  );
}
