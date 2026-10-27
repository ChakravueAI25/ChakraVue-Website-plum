import { InsightStatement } from "../../../shared/components/InsightStatement";

/**
 * What the company is built on, read word by word as it scrolls past, and
 * what it is for: the closing line under it.
 */
const lines: Array<Array<string | [string]>> = [
  ["Built from ", ["Experience"], "."],
  ["Guided by ", ["Science"], "."],
  ["Elevated by ", ["Intelligence"], "."],
];

export function InsightBand() {
  return (
    <InsightStatement
      lines={lines}
      pin={false}
      coda={
        <>
          Shaping What Healthcare Can <em>See</em>, <em>Understand</em>, and <em>Do</em>.
        </>
      }
    />
  );
}
