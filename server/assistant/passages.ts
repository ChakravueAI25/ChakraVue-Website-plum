import { settings } from "./config.ts";
import type { PdfLine, PdfPage } from "./pdf.ts";
import { normalize, splitSentences } from "./text.ts";

/**
 * Turns extracted pages into searchable passages. Headings start a new
 * passage; paragraphs and sentences are the other places a passage may end,
 * once it has reached the configured length. A passage never spans two
 * pages, so every sentence keeps its exact page number. Sentences keep the
 * document's own wording (only whitespace and line-break hyphens are tidied).
 */

export type Passage = {
  id: number;
  page: number;
  /** The heading this passage sits under, if the document has one. */
  heading: string | null;
  sentences: string[];
};

/** A unit is a run of text; `bullet` marks a list item. */
type Unit = { text: string; bullet: boolean };
type Block = { kind: "heading"; text: string } | { kind: "paragraph"; units: Unit[] };

const BULLET = /^(?:[•▪◦●○■□➢►\-–*]|\(?\d{1,2}[.)]|\(?[a-z][.)])\s+/;
/** "Battery life: 20 hours" style rows in spec lists. */
const LABEL_ROW = /^[A-Z][^:.]{0,48}:\s+\S/;
const PAGE_NUMBER = /^(?:page\s*)?\d{1,4}(?:\s*(?:of|\/)\s*\d{1,4})?$/i;

/** A line with its numbers masked, so "Catalogue - Page 3" and "Catalogue - Page 4" compare equal. */
const shape = (text: string) => text.toLowerCase().replace(/\d+/g, "#");

/** Lines repeated at the top or bottom of most pages (running headers and footers) carry no content. */
function repeatedLines(pages: PdfPage[]) {
  const seen = new Map<string, number>();
  for (const page of pages) {
    const edges = [...page.lines.slice(0, 1), ...page.lines.slice(-1)];
    for (const text of new Set(edges.map((line) => shape(line.text)))) seen.set(text, (seen.get(text) ?? 0) + 1);
  }
  const repeated = new Set<string>();
  const often = Math.max(3, Math.ceil(pages.length * 0.6));
  for (const [text, count] of seen) if (count >= often) repeated.add(text);
  return repeated;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function isHeadingLine(line: PdfLine, bodySize: number, alone: boolean) {
  const words = line.text.split(" ").length;
  if (words > 14 || /[,;]$/.test(line.text)) return false;
  if (line.size >= bodySize * 1.15) return true;
  // Same size as the body: a short line on its own with no closing punctuation, in Title Case or capitals.
  return (
    alone &&
    words <= 8 &&
    !/[.!?:]$/.test(line.text) &&
    !BULLET.test(line.text) &&
    !LABEL_ROW.test(line.text) &&
    /^[A-Z0-9]/.test(line.text) &&
    line.text.split(" ").filter((w) => /^[a-z]/.test(w)).length <= Math.floor(words / 3)
  );
}

/** Joins a paragraph's lines, undoing line-break hyphenation; bullets and label rows stay separate units. */
function joinLines(lines: string[]): Unit[] {
  const units: string[] = [];
  let current = "";
  for (const text of lines) {
    if (current && (BULLET.test(text) || LABEL_ROW.test(text))) {
      units.push(current);
      current = "";
    }
    if (!current) current = text;
    else if (/[A-Za-z]-$/.test(current) && /^[a-z]/.test(text)) current = current.slice(0, -1) + text; // connec- tivity
    else if (/-$/.test(current)) current += text; // USB- C
    else current += " " + text;
  }
  if (current) units.push(current);
  return units.map((unit) => ({ text: normalize(unit.replace(BULLET, "")), bullet: BULLET.test(unit) }));
}

function blocksOf(page: PdfPage, repeated: Set<string>, bodySize: number): Block[] {
  const edge = (i: number) => i === 0 || i === page.lines.length - 1;
  const lines = page.lines.filter((line, i) => !PAGE_NUMBER.test(line.text) && !(edge(i) && repeated.has(shape(line.text))));
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", units: joinLines(paragraph) });
    paragraph = [];
  };
  lines.forEach((line, i) => {
    const next = lines[i + 1];
    const breakBefore = i === 0 || line.gap > Math.max(line.size, bodySize) * 1.6;
    const breakAfter = !next || next.gap > Math.max(next.size, bodySize) * 1.6;
    if (isHeadingLine(line, bodySize, breakBefore && breakAfter)) {
      flush();
      const last = blocks[blocks.length - 1];
      // A heading set over two lines stays one heading.
      if (last?.kind === "heading" && !breakBefore) last.text += " " + line.text;
      else blocks.push({ kind: "heading", text: normalize(line.text) });
      return;
    }
    if (breakBefore) flush();
    paragraph.push(line.text);
  });
  flush();
  return blocks;
}

export function buildPassages(pages: PdfPage[]): Passage[] {
  const { passageWords, passageMaxWords } = settings();
  const repeated = repeatedLines(pages);
  const bodySize = median(pages.flatMap((page) => page.lines.map((line) => line.size))) || 10;
  const passages: Passage[] = [];
  let heading: string | null = null;

  for (const page of pages) {
    let sentences: string[] = [];
    let words = 0;
    let listOpen = false;
    const flush = () => {
      if (sentences.length) passages.push({ id: passages.length, page: page.page, heading, sentences });
      sentences = [];
      words = 0;
      listOpen = false;
    };
    for (const block of blocksOf(page, repeated, bodySize)) {
      if (block.kind === "heading") {
        flush();
        heading = block.text;
        continue;
      }
      for (const unit of block.units) {
        // A list stays with the line that introduces it: "The main parts are: Case; Display; Ports".
        const intro = sentences[sentences.length - 1];
        if (unit.bullet && intro && (/:$/.test(intro) || listOpen)) {
          sentences[sentences.length - 1] = `${intro}${/:$/.test(intro) ? " " : "; "}${unit.text.replace(/[.;]$/, "")}`;
          words += unit.text.split(" ").length;
          listOpen = true;
          continue;
        }
        listOpen = false;
        for (const sentence of splitSentences(unit.text)) {
          const length = sentence.split(" ").length;
          if (words && words + length > passageMaxWords) flush();
          sentences.push(sentence);
          words += length;
        }
      }
      // A paragraph is a natural place to end a passage once it is long enough (but not before its list).
      if (words >= passageWords && !/:$/.test(sentences[sentences.length - 1] ?? "")) flush();
    }
    flush();
  }
  return passages;
}
