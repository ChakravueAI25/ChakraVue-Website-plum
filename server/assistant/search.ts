import type { Passage } from "./passages.ts";
import { isCode, queryTerms, tokenize, type Term } from "./text.ts";

/**
 * A local search engine over the passages: TF-IDF vectors compared by cosine
 * similarity, combined with keyword coverage, exact phrase matches, model
 * numbers and section headings into one relevance score between 0 and 1.
 * Conventional information retrieval; no models, no network.
 */

export type IndexEntry = {
  /** Term counts for the passage (its heading included). */
  tf: Record<string, number>;
  /** Length of the passage's TF-IDF vector, for cosine similarity. */
  norm: number;
  /** Pairs of terms that sit next to each other in the text ("battery life"). */
  bigrams: string[];
  /** Terms of the passage's heading. */
  heading: string[];
};

export type SearchIndex = { passageCount: number; df: Record<string, number>; entries: IndexEntry[] };

/** One idea in the question: the visitor's word plus any everyday synonyms for it. */
export type Concept = { term: string; synonyms: string[]; code: boolean };

export type Query = {
  concepts: Concept[];
  /** Weights for the query vector: 1 for the visitor's words, 0.6 for synonyms. */
  weights: Map<string, number>;
  bigrams: string[];
};

export type Hit = { passage: Passage; score: number; cosine: number; coverage: number };

/** Adjacent term pairs (stop words in between are allowed: "price of alpha" → "price alpha"). */
export function bigramsOf(terms: Term[]) {
  const pairs = new Set<string>();
  const body = terms.filter((t) => t.position > 0);
  for (let i = 0; i < body.length; i += 1) {
    for (let j = i + 1; j < body.length && body[j].position - body[i].position <= 2; j += 1) {
      if (body[j].position !== body[i].position) pairs.add(`${body[i].term} ${body[j].term}`);
    }
  }
  return [...pairs];
}

/** A heading's own words and model numbers ("bs-310", "bs310"), without the split-off parts. */
export function headingKeys(terms: Term[]) {
  return [...new Set(terms.filter((t) => !t.part || (isCode(t.term) && /[a-z]/.test(t.term))).map((t) => t.term))];
}

const weightOf = (tf: number, idf: number) => (1 + Math.log(tf)) * idf;

export function buildIndex(passages: Passage[]): SearchIndex {
  const df: Record<string, number> = {};
  const counted = passages.map((passage) => {
    const headingTerms = passage.heading ? tokenize(passage.heading) : [];
    const bodyTerms = tokenize(passage.sentences.join(" "));
    const tf: Record<string, number> = {};
    for (const { term } of [...headingTerms, ...bodyTerms]) tf[term] = (tf[term] ?? 0) + 1;
    for (const term of Object.keys(tf)) df[term] = (df[term] ?? 0) + 1;
    return { tf, bigrams: bigramsOf(bodyTerms), heading: headingKeys(headingTerms) };
  });
  const passageCount = passages.length;
  const entries = counted.map((entry) => {
    let sum = 0;
    for (const [term, count] of Object.entries(entry.tf)) sum += weightOf(count, idf(df[term], passageCount)) ** 2;
    return { ...entry, norm: Math.sqrt(sum) };
  });
  return { passageCount, df, entries };
}

/** Inverse document frequency; a term the document never uses counts as the rarest. */
export function idf(df: number | undefined, passageCount: number) {
  return Math.log(1 + passageCount / (df || 1));
}

/** Words that say what kind of thing is asked about, not which: they count for less. */
const BROAD = new Set(["product", "item", "device", "solution", "offering"]);

export function parseQuery(question: string): Query {
  const { weights, own, synonymsOf } = queryTerms(question);
  for (const term of weights.keys()) if (BROAD.has(term)) weights.set(term, 0.3);
  const whole = own.filter((t) => !t.part);
  const concepts = [...new Set(whole.map((t) => t.term))].map((term) => {
    // A model number typed with or without its hyphen ("bs-310", "bs310") is one concept.
    const joined = own.filter((t) => t.part && t.position === whole.find((w) => w.term === term)?.position && isCode(t.term)).map((t) => t.term);
    return { term, synonyms: [...synonymsOf(term), ...joined], code: isCode(term) };
  });
  return { concepts, weights, bigrams: bigramsOf(whole) };
}

/** The question's words, plus its model numbers written either way, for matching names. */
export function askedTerms(query: Query) {
  return new Set(query.concepts.flatMap((c) => [c.term, ...c.synonyms.filter(isCode)]));
}

/** Heading words that don't identify anything on their own. */
const GENERIC = new Set(["model", "series", "version", "edition", "product", "new"]);

const headingCounts = new WeakMap<SearchIndex, Map<string, number>>();

/** How many different headings use each heading word. */
function headingDf(index: SearchIndex) {
  let counts = headingCounts.get(index);
  if (!counts) {
    counts = new Map();
    const seen = new Set<string>();
    for (const entry of index.entries) {
      const key = entry.heading.join(" ");
      if (seen.has(key)) continue;
      seen.add(key);
      for (const term of entry.heading) counts.set(term, (counts.get(term) ?? 0) + 1);
    }
    headingCounts.set(index, counts);
  }
  return counts;
}

/**
 * Whether the question names a section: its model number, every
 * distinctive word of its heading ("Beta Scanner" of "Beta Scanner (Model
 * BS-310)"), or a word no other heading uses ("Alpha").
 */
export function namesHeading(heading: string[], asked: Set<string>, index: SearchIndex, strict = false) {
  if (heading.some((term) => isCode(term) && /[a-z]/.test(term) && asked.has(term))) return true;
  const counts = headingDf(index);
  // Words used by three or more headings (a company or brand name) don't tell sections apart.
  const words = heading.filter((term) => !isCode(term) && !GENERIC.has(term) && !/[.\-/+]/.test(term) && (counts.get(term) ?? 0) < 3);
  if (words.length > 0 && words.every((term) => asked.has(term))) return true;
  if (strict) return false;
  return words.some((term) => asked.has(term) && counts.get(term) === 1);
}

/**
 * How much of the question a set of terms answers: each concept counts by
 * its rarity, fully for the visitor's word and 0.8 for a synonym.
 */
export function coverage(query: Query, has: (term: string) => boolean, index: SearchIndex) {
  let total = 0;
  let matched = 0;
  for (const concept of query.concepts) {
    const weight = idf(index.df[concept.term], index.passageCount) * (BROAD.has(concept.term) ? 0.3 : 1);
    total += weight;
    if (has(concept.term)) matched += weight;
    else if (concept.synonyms.some(has)) matched += weight * 0.8;
  }
  return total ? matched / total : 0;
}

export function search(query: Query, passages: Passage[], index: SearchIndex): Hit[] {
  if (!query.concepts.length) return [];
  const N = index.passageCount;
  let queryNorm = 0;
  const queryVector = new Map<string, number>();
  for (const [term, weight] of query.weights) {
    if (!index.df[term]) continue;
    const value = weight * idf(index.df[term], N);
    queryVector.set(term, value);
    queryNorm += value * value;
  }
  queryNorm = Math.sqrt(queryNorm);
  const codes = query.concepts.filter((c) => c.code);
  const asked = askedTerms(query);

  const hits: Hit[] = [];
  index.entries.forEach((entry, i) => {
    // Cosine similarity of the TF-IDF vectors.
    let dot = 0;
    for (const [term, value] of queryVector) {
      const count = entry.tf[term];
      if (count) dot += value * weightOf(count, idf(index.df[term], N));
    }
    const cosine = queryNorm && entry.norm ? dot / (queryNorm * entry.norm) : 0;
    if (!cosine) return;

    const has = (term: string) => !!entry.tf[term];
    const cover = coverage(query, has, index);
    const phrase = query.bigrams.length ? query.bigrams.filter((pair) => entry.bigrams.includes(pair)).length / query.bigrams.length : cover;
    const codeScore = codes.length ? codes.filter((c) => has(c.term)).length / codes.length : cover;
    // An exact product or section name in the question.
    // ...or a heading that holds every word of the question ("products" → "Products, Platforms and Services").
    const named = namesHeading(entry.heading, asked, index) || query.concepts.every((c) => entry.heading.includes(c.term));

    let score = 0.4 * cosine + 0.35 * cover + 0.1 * phrase + 0.15 * codeScore + (named ? 0.1 : 0);
    // A model number the passage doesn't mention usually means a different product.
    if (codes.length && codeScore === 0) score *= 0.6;
    hits.push({ passage: passages[i], score: Math.min(1, score), cosine, coverage: cover });
  });
  return hits.sort((a, b) => b.score - a.score);
}
