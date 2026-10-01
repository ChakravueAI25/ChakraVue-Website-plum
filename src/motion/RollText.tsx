import type { CSSProperties } from "react";

/**
 * Hover "roll": the label is stacked twice and each letter slides up to the
 * copy beneath, one after another. Decorative. The link itself carries the
 * accessible name (aria-label).
 */
export function RollText({ text }: { text: string }) {
  const chars = [...text];
  const row = (key: string) => (
    <span className="roll__row" key={key}>
      {chars.map((char, i) => (
        <span key={i} className="roll__char" style={{ "--i": i } as CSSProperties}>
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );

  return (
    <span className="roll" aria-hidden="true">
      {row("a")}
      {row("b")}
    </span>
  );
}
