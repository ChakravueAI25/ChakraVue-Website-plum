import { Fragment, useRef, type ReactNode } from "react";
import { isWide } from "../../motion/env";
import { gsap, SplitText } from "../../motion/gsap";
import { useMotion } from "../../motion/useMotion";

type InsightStatementProps = {
  /** Each line is split into plain text and highlighted words: `["Institute creates ", ["data"], "."]`. */
  lines: Array<Array<string | [string]>>;
  className?: string;
  /** Hold the band still while its words light (desktop). Off for the compact bands (home, Product Suite lead). */
  pin?: boolean;
  /** A closing line under the statement; its highlighted words light last. */
  coda?: ReactNode;
};

/**
 * The statement is read by scrolling: on desktop the band holds still while
 * each word lights up in turn and the highlighted words warm to amber; on
 * phones the same sequence plays as the band passes through.
 */
export function InsightStatement({ lines, className = "", pin: allowPin = true, coda }: InsightStatementProps) {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const text = root.querySelector<HTMLElement>(".insight-statement__text");
    if (!text) return;
    const split = SplitText.create(text, { type: "words", wordsClass: "insight-word" });
    const highlights = text.querySelectorAll("em");
    const pin = allowPin && isWide();
    // While pinned, the band is the whole screen with the words centred in it.
    if (pin) root.classList.add("is-stage");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: pin ? "top top" : "top 78%",
        end: pin ? "+=120%" : "bottom 42%",
        scrub: 0.8,
        pin,
        anticipatePin: 1,
      },
    });
    tl.fromTo(text, { scale: 0.94 }, { scale: 1, duration: 1, ease: "none" }, 0)
      .fromTo(
        split.words,
        { opacity: 0.1, filter: "blur(6px)", y: 10 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.45, stagger: 0.07, ease: "none" },
        0,
      )
      // The highlight colours live in CSS (so they follow the palette); this only turns them up.
      .fromTo(highlights, { "--lit": 0 }, { "--lit": 1, duration: 0.3, stagger: 0.14, ease: "none" }, 0.2);

    const closing = root.querySelector(".insight-statement__coda");
    if (closing) {
      tl.fromTo(closing, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "none" }, ">-0.15").fromTo(
        closing.querySelectorAll("em"),
        { "--lit": 0 },
        { "--lit": 1, duration: 0.25, stagger: 0.12, ease: "none" },
        ">-0.2",
      );
    }

    return () => root.classList.remove("is-stage");
  });

  return (
    <section ref={ref} className={`insight-statement ${className}`}>
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
