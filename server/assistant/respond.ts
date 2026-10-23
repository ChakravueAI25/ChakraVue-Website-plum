import { settings } from "./config.ts";
import { askedTerms, bigramsOf, coverage, namesHeading, parseQuery, search, type Concept, type Hit, type Query, type SearchIndex } from "./search.ts";
import type { Passage } from "./passages.ts";
import { tokenize } from "./text.ts";

/**
 * Builds answers from the document's own sentences. It never writes facts:
 * every sentence in an answer is quoted from the PDF with its page number,
 * and the only other text is a fixed message (not found, please clarify,
 * the pages disagree).
 */

export const NOT_FOUND =
  "Sorry, I couldn't find a relevant answer in the current product document. Please try rephrasing your question or contact our support team.";
export const NO_DOCUMENT =
  "The product document hasn't been uploaded yet, so I can't answer questions right now. Please contact our support team.";

export type Quote = { text: string; page: number; heading: string | null };

export type Answer = {
  status: "answer" | "ambiguous" | "not_found" | "no_document";
  /** Sentences quoted from the PDF, in document order. */
  quotes: Quote[];
  /** A fixed message shown before the quotes (or instead of them). */
  message?: string;
  /** A fixed note shown after them (for example, that two pages disagree). */
  note?: string;
};

type Candidate = Quote & {
  rank: number;
  order: number;
  score: number;
  /** How fully the sentence itself answers what was asked, and names what it was asked about. */
  asked: number;
  named: number;
  terms: Set<string>;
  numbers: string[];
};

const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function similar(a: Set<string>, b: Set<string>) {
  let shared = 0;
  for (const term of a) if (b.has(term)) shared += 1;
  return shared / Math.max(1, Math.min(a.size, b.size));
}

/**
 * Scores every sentence of the matching passages against the question.
 * The parts of the question that aren't the passage's heading ("price",
 * "battery" under "Alpha Monitor") must appear in the sentence itself; the
 * name may come from the heading. A question that only names a section
 * ("What is the Slit Lamp Module?") is answered by the section's opening
 * sentences.
 */
function candidates(query: Query, hits: Hit[], passages: Passage[], index: SearchIndex, describe = false): Candidate[] {
  const { minSentenceScore } = settings();
  const best = hits[0].score;
  const list: Candidate[] = [];
  const askedWords = askedTerms(query);
  hits.forEach((hit, rank) => {
    const heading = new Set(index.entries[hit.passage.id].heading);
    // A heading that lists several things ("Products, Platforms and Services") is only named in full.
    const listHeading = /,|\band\b|&/i.test(hit.passage.heading ?? "");
    const sectionNamed = namesHeading(index.entries[hit.passage.id].heading, askedWords, index, listHeading);
    const attributes = describe ? [] : query.concepts.filter((c) => !heading.has(c.term));
    const opensSection = sectionNamed && passages[hit.passage.id - 1]?.heading !== hit.passage.heading;
    hit.passage.sentences.forEach((text, i) => {
      const tokens = tokenize(text);
      const terms = new Set(tokens.map((t) => t.term));
      const mentions = (c: Concept) => terms.has(c.term) || c.synonyms.some((s) => terms.has(s));
      const lead = !attributes.length && opensSection && i < 2;
      if (attributes.length && !attributes.some(mentions)) return;
      if (!lead && !query.concepts.some(mentions)) return;
      // What was asked about, from the sentence itself (or the section's opening, when only its name was asked)...
      const asked = attributes.length
        ? coverage({ ...query, concepts: attributes }, (term) => terms.has(term), index)
        : lead
          ? 1 - i * 0.1
          : sectionNamed
            ? 0.2
            : coverage(query, (term) => terms.has(term), index);
      // ...and which product or section, which its heading may supply ("It supports USB-C" under "Alpha Monitor").
      const names = query.concepts.filter((c) => !attributes.includes(c));
      const named = names.length ? names.filter((c) => mentions(c) || heading.has(c.term)).length / names.length : 1;
      const pairs = bigramsOf(tokens);
      const phrase = query.bigrams.length ? query.bigrams.filter((pair) => pairs.includes(pair)).length / query.bigrams.length : 0;
      const score = 0.6 * asked + 0.2 * named + 0.1 * phrase + 0.1 * (hit.score / best);
      if (score < minSentenceScore) return;
      list.push({
        text,
        page: hit.passage.page,
        heading: hit.passage.heading,
        rank,
        order: hit.passage.id * 1000 + i,
        score,
        asked,
        named,
        terms: new Set([...terms, ...heading]),
        numbers: text.match(/\d[\d,.]*/g)?.map((n) => n.replace(/,/g, "").replace(/\.$/, "")) ?? [],
      });
    });
  });
  return list.sort((a, b) => b.score - a.score);
}

/**
 * Picks the sentences that together answer the question: the best one, then
 * any that cover a part of the question not yet answered, or are about as
 * relevant as the best (so several products or pages can be shown).
 */
function select(query: Query, list: Candidate[], index: SearchIndex) {
  const { maxSentences } = settings();
  const chosen: Candidate[] = [];
  const answered = new Set<string>();
  const covered = () => coverage(query, (term) => answered.has(term), index);
  for (const candidate of list) {
    if (chosen.length >= maxSentences) break;
    if (chosen.some((c) => key(c.text) === key(candidate.text) || similar(c.terms, candidate.terms) > 0.9)) continue;
    const before = covered();
    const gain = coverage(query, (term) => answered.has(term) || candidate.terms.has(term), index) - before;
    const best = chosen[0];
    // Keep it if it adds something, ranks close to the best, or answers the same thing as fully
    // (two pages giving a price must both be shown, never one picked).
    const answersToo = best && candidate.asked >= 0.5 && candidate.asked >= best.asked * 0.85 && candidate.named >= best.named;
    if (best && gain < 0.1 && candidate.score < best.score * 0.85 && !answersToo) continue;
    chosen.push(candidate);
    for (const term of candidate.terms) answered.add(term);
  }
  return chosen;
}

/** Two quotes on different pages that answer the same thing with different figures. */
function conflict(query: Query, chosen: Candidate[]) {
  const asked = query.concepts.map((c) => c.term);
  for (let i = 0; i < chosen.length; i += 1) {
    for (let j = i + 1; j < chosen.length; j += 1) {
      const [a, b] = [chosen[i], chosen[j]];
      if (a.page === b.page || !a.numbers.length || !b.numbers.length) continue;
      if (a.heading !== b.heading && a.heading && b.heading) continue;
      const sameSubject = asked.filter((t) => a.terms.has(t) && b.terms.has(t)).length >= Math.max(1, Math.ceil(asked.length * 0.6));
      const differ = a.numbers.join(" ") !== b.numbers.join(" ");
      if (sameSubject && differ) return [a.page, b.page].sort((x, y) => x - y);
    }
  }
  return null;
}

/**
 * Answers a question. Several questions in one message ("Does it have
 * USB-C? What does it cost?") are answered one by one and combined.
 */
export function answer(question: string, passages: Passage[] | null, index: SearchIndex | null): Answer {
  if (!passages || !index) return { status: "no_document", quotes: [], message: NO_DOCUMENT };
  const parts = question
    .split(/[?;\n]+/)
    .map((part) => part.trim())
    .filter((part) => parseQuery(part).concepts.length > 0);
  if (parts.length < 2) return answerOne(question, passages, index);

  const replies = parts
    .map((part, i) => {
      const reply = answerOne(part, passages, index);
      if (i === 0 || reply.status === "answer") return reply;
      // "What is its price?" after "Does the Alpha Monitor have USB-C?": read it with the question before.
      const withContext = answerOne(`${parts[i - 1]} ${part}`, passages, index);
      return withContext.status === "answer" ? withContext : reply;
    })
    .filter((reply) => reply.quotes.length);
  if (!replies.length) return { status: "not_found", quotes: [], message: NOT_FOUND };
  if (replies.length === 1) return replies[0];
  const seen = new Set<string>();
  const quotes = replies.flatMap((reply) => reply.quotes).filter((quote) => !seen.has(key(quote.text)) && !!seen.add(key(quote.text)));
  const notes = [...new Set(replies.map((reply) => reply.note).filter(Boolean))];
  return { status: "answer", quotes, note: notes.join(" ") || undefined };
}

function answerOne(question: string, passages: Passage[], index: SearchIndex): Answer {
  const { minScore, maxPassages } = settings();
  const query = parseQuery(question);
  const ranked = search(query, passages, index);
  const top = ranked[0];
  if (!top || top.score < minScore) return { status: "not_found", quotes: [], message: NOT_FOUND };

  // Only passages close to the best one; the rest are likely unrelated.
  let hits = ranked.filter((hit) => hit.score >= minScore && hit.score >= top.score * 0.6);
  // A question that names a product or section is answered from that section only.
  const asked = askedTerms(query);
  const named = ranked.filter((hit) => hit.score >= minScore && namesHeading(index.entries[hit.passage.id].heading, asked, index));
  if (named.length) hits = named;
  hits = hits.slice(0, maxPassages);

  let list = candidates(query, hits, passages, index);
  // A named section with nothing on the rest of the question ("What is the Slit Lamp Module for?"): its opening describes it.
  if (!list.length && named.length) list = candidates(query, hits, passages, index, true);
  if (!list.length) return { status: "not_found", quotes: [], message: NOT_FOUND };

  // Ambiguous: a short question that matches several sections about equally,
  // without naming any of them. Show the best sentence from each and ask.
  const close = hits.filter((hit) => hit.score >= hits[0].score * 0.85 && hit.passage.heading);
  const sections = [...new Set(close.map((hit) => hit.passage.heading as string))];
  // "Which products...", "compare...", "all..." want every section, not a choice.
  const wantsAll = /\b(which|list|all|every|each|both|compare|comparison|versus|vs|difference|any|products|services|platforms|apps|solutions)\b/i.test(question);
  if (sections.length > 1 && !named.length && query.concepts.length <= 3) {
    const quotes = sections
      .slice(0, 3)
      .map((section) => list.find((c) => c.heading === section))
      .filter((c): c is Candidate => !!c);
    if (quotes.length > 1 && wantsAll) return { status: "answer", quotes: tidy(quotes) };
    if (quotes.length > 1) {
      return {
        status: "ambiguous",
        quotes: tidy(quotes),
        message: "That could apply to more than one section of the document. Here is what each says:",
        note: `Which one did you mean? You can ask again with its name, for example "${sections[0]}".`,
      };
    }
  }

  const chosen = select(query, list, index);
  const pages = conflict(query, chosen);
  return {
    status: "answer",
    quotes: tidy(chosen),
    note: pages
      ? `The document gives different figures on pages ${pages.join(" and ")}. Both are shown above; please check with our support team which applies.`
      : undefined,
  };
}

function tidy(list: Candidate[]): Quote[] {
  return [...list].sort((a, b) => a.order - b.order).map(({ text, page, heading }) => ({ text, page, heading }));
}
