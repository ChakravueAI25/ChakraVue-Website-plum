/**
 * Text preprocessing shared by indexing and querying: normalisation,
 * tokenising, stop words, a light suffix stemmer and sentence splitting.
 * Plain rules only; nothing here is learned or generated.
 */

/** Words too common to say anything about a question or a passage. */
const STOP_WORDS = new Set(
  (
    "a about above after again against all am an and any are as at be because been before being below between both but by can " +
    "could did do does doing down during each few for from further had has have having he her here hers him his how i if in into " +
    "is it its itself just me more most my no nor not of off on once only or other our ours out over own same she should so some " +
    "such than that the their theirs them then there these they this those through to too under until up very was we were what " +
    "when where which while who whom why will with would you your yours also may might must shall us let lets " +
    // Conversational filler that carries no product information.
    "tell know want please information info details detail explain describe give show find need looking hi hello thanks thank " +
    "anything something everything kindly regarding compare comparison difference versus vs offer offered provide provided work works working use used using"
  ).split(" "),
);

/**
 * Everyday question wording mapped onto the words a product document uses.
 * Applied to the question only, with a lower weight than the visitor's own
 * words. Keys and values are matched after stemming.
 */
const QUERY_SYNONYMS: Record<string, string[]> = {
  cost: ["price"],
  price: ["cost"],
  mrp: ["price"],
  expensive: ["price"],
  cheap: ["price"],
  afford: ["price"],
  weigh: ["weight"],
  weight: ["weigh"],
  heavy: ["weight"],
  light: ["weight"],
  size: ["dimension"],
  big: ["dimension", "size"],
  dimension: ["size"],
  guarantee: ["warranty"],
  warranty: ["guarantee"],
  duration: ["hour", "minute", "day", "month", "year", "life"],
  last: ["life", "hour", "duration"],
  life: ["last", "hour"],
  runtime: ["battery", "hour"],
  connect: ["connectivity", "connection"],
  connectivity: ["connect"],
  wireless: ["bluetooth", "wi-fi", "wifi"],
  buy: ["purchase", "order", "available"],
  purchase: ["buy", "order"],
  available: ["availability", "stock"],
  availability: ["available", "stock"],
  compatible: ["compatibility", "support"],
  feature: ["function", "capability"],
  spec: ["specification"],
  // The site says "clinician" and "ChakraVue System"; product documents may still say "doctor" and "EMR".
  clinician: ["doctor"],
  doctor: ["clinician"],
  emr: ["system", "record"],
  specification: ["spec"],
};

let stemmedSynonyms: Map<string, string[]> | undefined;
/** QUERY_SYNONYMS with keys and values in their indexed (stemmed) form. */
function synonyms() {
  stemmedSynonyms ??= new Map(
    Object.entries(QUERY_SYNONYMS).map(([key, values]) => [
      tokenize(key)[0].term,
      values.flatMap((value) => tokenize(value).map((t) => t.term)),
    ]),
  );
  return stemmedSynonyms;
}

/** Question phrases rewritten before tokenising ("how long" says nothing on its own). */
const QUERY_PHRASES: [RegExp, string][] = [
  [/\bhow much\b/g, " price "],
  [/\bhow long\b/g, " duration "],
  [/\bhow heavy\b/g, " weight "],
  [/\bhow (?:big|large|small)\b/g, " size "],
  [/\bspecs\b/g, " specifications "],
  [/\bwi[\s-]?fi\b/g, " wi-fi "],
];

/** A token that holds a digit: a model number, a quantity, a version. Never stemmed or dropped. */
export function isCode(token: string) {
  return /\d/.test(token);
}

/** Light suffix stripping so "batteries"/"battery" and "charging"/"charge" meet. */
export function stem(word: string) {
  if (word.length <= 3 || isCode(word) || /[^a-z]/.test(word)) return word;
  let w = word;
  if (w.endsWith("ies") && w.length > 4) w = w.slice(0, -3) + "y";
  else if (w.endsWith("sses")) w = w.slice(0, -2);
  else if (/(ches|shes|xes|zes)$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  // "chargi" → "charg", "plann" → "plan", "stopp" → "stop"
  if (/([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|zz)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith("e") && w.length > 4) w = w.slice(0, -1);
  return w;
}

/** Unicode, dash, quote and whitespace normalisation used before any matching. */
export function normalize(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Text that mentions an amount of money: indexed as the term "price" too. */
const MONEY = /[$€£₹¥]\s?\d|\b(?:rs\.?|inr|usd|eur|gbp)\s?\d|\d\s?(?:usd|inr|eur|gbp|rupees?|dollars?|euros?)\b|\/-/i;

const PRICE = stem("price");

/** `part` marks the extra terms indexed for a compound token ("usb" and "c" of "usb-c"). */
export type Term = { term: string; position: number; part?: boolean };

/**
 * Splits text into matching terms, in order. Lower-cases, drops stop words
 * and punctuation, keeps numbers and codes whole ("x-200", "5.3", "usb-c",
 * "1299") and also indexes their parts, so "x200" and "x-200" both meet.
 */
export function tokenize(text: string): Term[] {
  const clean = normalize(text)
    .toLowerCase()
    .replace(/(\d),(?=\d{2,3}\b)/g, "$1") // 1,299 → 1299; 1,00,000 → 100000
    .replace(/(\d)\.0+\b/g, "$1") // 1299.00 → 1299
    .replace(/'s\b/g, "");
  const terms: Term[] = [];
  let position = 0;
  for (const match of clean.matchAll(/[a-z0-9À-ɏ]+(?:[.\-/+][a-z0-9À-ɏ]+)*\+?/g)) {
    const raw = match[0];
    position += 1;
    if (STOP_WORDS.has(raw)) continue;
    if (raw.length === 1 && !isCode(raw)) continue;
    const whole = isCode(raw) || /[.\-/+]/.test(raw) ? raw : stem(raw);
    terms.push({ term: whole, position });
    // Parts of compound tokens: "usb-c" → "usb", "c"; "20mah" → "20", "mah"; "x-200" → "x200".
    const parts = raw.split(/[.\-/+]|(?<=\d)(?=[a-z])|(?<=[a-z])(?=\d)/).filter(Boolean);
    // A decimal ("1.2", "5.3") stays whole: its parts would match unrelated numbers.
    if (parts.length > 1 && !/^\d+(?:\.\d+)+$/.test(raw)) {
      const joined = parts.join("");
      if (joined !== whole) terms.push({ term: joined, position, part: true });
      for (const part of parts) {
        if (part === whole || STOP_WORDS.has(part) || (part.length === 1 && !isCode(part))) continue;
        terms.push({ term: isCode(part) ? part : stem(part), position, part: true });
      }
    }
  }
  if (MONEY.test(text)) terms.push({ term: PRICE, position: -1 });
  return terms;
}

/** Terms of a visitor's question, each with a weight: 1 for their own words, less for synonyms. */
export function queryTerms(question: string) {
  let text = normalize(question).toLowerCase();
  for (const [pattern, replacement] of QUERY_PHRASES) text = text.replace(pattern, replacement);
  const own = tokenize(text);
  const synonymsOf = (term: string) => synonyms().get(term) ?? [];
  const weights = new Map<string, number>();
  for (const { term } of own) weights.set(term, 1);
  for (const { term } of own) for (const synonym of synonymsOf(term)) if (!weights.has(synonym)) weights.set(synonym, 0.6);
  return { weights, own, synonymsOf };
}

const ABBREVIATIONS = new Set(
  "mr mrs ms dr prof sr jr st no nos rs approx incl excl e.g i.e etc vs fig figs ref refs dept est inc ltd co corp max min avg qty pcs jan feb mar apr jun jul aug sep sept oct nov dec mfg ver vol".split(
    " ",
  ),
);

/**
 * Splits running text into sentences without breaking decimals ("5.3"),
 * abbreviations ("Rs. 499", "e.g. ...") or initials.
 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  const boundary = /[.!?]+["')\]]*\s+(?=["'(\[]?[A-Z0-9₹$€£•])/g;
  for (const match of text.matchAll(boundary)) {
    const end = match.index + match[0].length;
    const before = text.slice(start, match.index + 1);
    const lastWord = before.match(/([A-Za-z.]+)\.$/)?.[1]?.toLowerCase() ?? "";
    if (ABBREVIATIONS.has(lastWord) || ABBREVIATIONS.has(lastWord.replace(/\.$/, "")) || /^[a-z]$/.test(lastWord)) continue;
    sentences.push(text.slice(start, end).trim());
    start = end;
  }
  sentences.push(text.slice(start).trim());
  return sentences.filter((s) => /[A-Za-z0-9]/.test(s));
}
