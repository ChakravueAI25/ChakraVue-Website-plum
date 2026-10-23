import { catalog, type CatalogItem } from "./catalog.ts";

/**
 * Keyword retrieval over the catalogue: each item is scored by how many of
 * the question's terms appear in its name (weighted most), its category,
 * and its summary and details. The catalogue is small, so this is exact and
 * instant; if it grows into the hundreds, swap `retrieve` for an embedding
 * search with the same signature.
 */

const STOP = new Set(
  "a an and are about any can could do does for from have how i in is it its me my of on or our please show tell than that the their them there these this those to us we what which with you your want need looking between difference compare vs versus more product products".split(
    " ",
  ),
);

/** Everyday words mapped onto the vocabulary the catalogue uses. */
const SYNONYMS: Record<string, string[]> = {
  eye: ["ophthalmic", "slit", "lamp", "visual"],
  eyes: ["ophthalmic", "slit", "lamp", "visual"],
  ophthalmology: ["ophthalmic"],
  record: ["emr", "ehr"],
  records: ["emr", "ehr"],
  ehr: ["emr"],
  surgery: ["surgical", "operating"],
  surgeon: ["surgical"],
  tooth: ["dental", "implant"],
  teeth: ["dental", "implant"],
  dentist: ["dental", "implant"],
  jaw: ["dental", "mandible", "mandibular"],
  doctor: ["doctor", "clinical"],
  patient: ["patient"],
  phone: ["app"],
  mobile: ["app"],
  smoking: ["tobacco", "cessation"],
  quit: ["tobacco", "cessation"],
  fitness: ["wellness"],
  health: ["wellness"],
  simulation: ["fea", "finite", "element"],
  device: ["devices", "equipment"],
  legacy: ["existing", "equipment"],
};

function stem(word: string) {
  return word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word;
}

export function terms(text: string) {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const out = new Set<string>();
  for (const word of words) {
    if (word.length < 2 || STOP.has(word)) continue;
    out.add(stem(word));
    for (const synonym of SYNONYMS[word] ?? []) out.add(stem(synonym));
  }
  return [...out];
}

type Field = { weight: number; words: Set<string> };

const indexed = catalog.map((item) => ({
  item,
  fields: [
    { weight: 4, words: new Set(terms(`${item.name} ${item.id}`)) },
    { weight: 2, words: new Set(terms(`${item.category} ${item.kind}`)) },
    { weight: 1, words: new Set(terms(`${item.summary} ${item.details.join(" ")}`)) },
  ] satisfies Field[],
}));

/**
 * The items most relevant to the conversation. The latest question counts
 * fully; earlier user turns count at a third, so follow-ups such as
 * "compare them" still find what was being discussed.
 */
export function retrieve(latest: string, earlier: string[] = [], limit = 4): CatalogItem[] {
  const weighted = [
    ...terms(latest).map((term) => [term, 3] as const),
    ...terms(earlier.join(" ")).map((term) => [term, 1] as const),
  ];
  return indexed
    .map(({ item, fields }) => ({
      item,
      score: weighted.reduce(
        (sum, [term, weight]) => sum + weight * fields.reduce((best, field) => Math.max(best, field.words.has(term) ? field.weight : 0), 0),
        0,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
