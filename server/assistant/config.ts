import { resolve } from "node:path";

/**
 * The assistant's tunable settings, read from the environment (.env) each
 * time so the dev server picks up changes. Defaults suit a product document
 * of a few to a few hundred pages.
 */

function number(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && process.env[name] !== "" ? Math.min(max, Math.max(min, value)) : fallback;
}

export function settings() {
  return {
    /** A passage ends at the first paragraph break after this many words... */
    passageWords: number("CHAT_PASSAGE_WORDS", 80, 20, 400),
    /** ...and at a sentence boundary before it would pass this many. */
    passageMaxWords: number("CHAT_PASSAGE_MAX_WORDS", 160, 40, 800),
    /** Lowest relevance score (0–1) a passage needs to be used at all. */
    minScore: number("CHAT_MIN_SCORE", 0.3, 0, 1),
    /** Lowest score (0–1) for a sentence inside a matching passage. */
    minSentenceScore: number("CHAT_MIN_SENTENCE_SCORE", 0.25, 0, 1),
    /** How many passages may contribute to one answer. */
    maxPassages: number("CHAT_MAX_PASSAGES", 4, 1, 10),
    /** How many sentences one answer may quote. */
    maxSentences: number("CHAT_MAX_SENTENCES", 4, 1, 12),
    /** Largest accepted upload, in megabytes. */
    pdfMaxBytes: number("PDF_MAX_MB", 10, 1, 100) * 1024 * 1024,
    /** Where the processed document lives. Never inside dist/ or public/. */
    dataDir: resolve(process.env.DATA_DIR || "data"),
  };
}
