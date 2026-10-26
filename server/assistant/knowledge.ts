import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { settings } from "./config.ts";
import { buildPassages, type Passage } from "./passages.ts";
import { extractPdf, PdfError, type PdfPage } from "./pdf.ts";
import { buildIndex, type SearchIndex } from "./search.ts";

/**
 * The PDF manager: processes an upload and keeps the one active document.
 * A new PDF is extracted, split and indexed completely, and checked, before
 * anything on disk or in memory is replaced, so a failed upload leaves the
 * previous document in use and two versions are never mixed.
 *
 * On disk (DATA_DIR, default ./data, git-ignored and never served):
 *   knowledge.json  document details, page text, passages and search index
 *   document.pdf    a copy of the PDF in use
 */

export type DocumentInfo = {
  /** Changes with every successful upload. */
  version: string;
  name: string;
  bytes: number;
  sha256: string;
  pages: number;
  passages: number;
  updatedAt: string;
};

type Knowledge = {
  format: 1;
  document: DocumentInfo;
  /** The extracted text of each page, as read from the PDF. */
  pageText: string[];
  passages: Passage[];
  index: SearchIndex;
};

const FORMAT = 1;
let active: Knowledge | null = null;
let loadedStamp = "";
let processing: Promise<unknown> = Promise.resolve();

const files = () => {
  const dir = settings().dataDir;
  return { dir, json: join(dir, "knowledge.json"), pdf: join(dir, "document.pdf") };
};

/**
 * The document questions are answered from. Reloads it when knowledge.json
 * has changed on disk (another server process, or a restored backup).
 */
export async function current(): Promise<Knowledge | null> {
  const { json } = files();
  let stamp = "";
  try {
    const info = await stat(json);
    stamp = `${info.mtimeMs}:${info.size}`;
  } catch {
    // No document uploaded yet (or it was removed by hand).
    if (!active) return null;
    return active;
  }
  if (stamp === loadedStamp && active) return active;
  try {
    const saved = JSON.parse(await readFile(json, "utf8")) as Knowledge;
    if (saved.format !== FORMAT || !Array.isArray(saved.passages) || !saved.index?.entries) throw new Error("unknown format");
    active = saved;
    loadedStamp = stamp;
  } catch (error) {
    // Keep serving what was loaded before; a bad file never replaces a good document.
    console.error(`[assistant] Could not read ${json}:`, (error as Error).message);
    loadedStamp = stamp;
  }
  return active;
}

export async function documentInfo() {
  return (await current())?.document ?? null;
}

/** Strips anything path-like or odd from an uploaded file name. */
function cleanName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[^\w .()\-]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);
  return /\.pdf$/i.test(clean) ? clean : `${clean || "document"}.pdf`;
}

/** Checks and processes a PDF, then makes it the active document. One upload at a time. */
export function replaceDocument(data: Buffer, fileName: string): Promise<DocumentInfo> {
  const run = processing.then(() => processUpload(data, fileName));
  processing = run.catch(() => {});
  return run;
}

async function processUpload(data: Buffer, fileName: string): Promise<DocumentInfo> {
  const { pdfMaxBytes } = settings();
  if (!data.length) throw new PdfError("The file is empty.");
  if (data.length > pdfMaxBytes) throw new PdfError(`The file is larger than ${Math.round(pdfMaxBytes / 1048576)} MB.`);
  if (data.subarray(0, 1024).indexOf("%PDF-") === -1) throw new PdfError("This file isn't a PDF.");

  // 1–3: extract, split and index, all in memory.
  const pages: PdfPage[] = await extractPdf(new Uint8Array(data));
  const pageText = pages.map((page) => page.lines.map((line) => line.text).join("\n"));
  const characters = pageText.join("").replace(/\s/g, "").length;
  if (characters < 40) {
    throw new PdfError("No selectable text was found in this PDF. It may be a scanned image; upload a PDF exported from a document instead.");
  }
  const passages = buildPassages(pages);
  const index = buildIndex(passages);

  // 4: verify before switching over.
  if (!passages.length || index.entries.length !== passages.length) throw new PdfError("The PDF's text couldn't be split into passages.");

  const document: DocumentInfo = {
    version: randomUUID(),
    name: cleanName(fileName),
    bytes: data.length,
    sha256: createHash("sha256").update(data).digest("hex"),
    pages: pages.length,
    passages: passages.length,
    updatedAt: new Date().toISOString(),
  };
  const knowledge: Knowledge = { format: FORMAT, document, pageText, passages, index };

  // 5: replace the files (write beside, then rename over) and the in-memory copy.
  const { dir, json, pdf } = files();
  await mkdir(dir, { recursive: true });
  const tag = document.version.slice(0, 8);
  try {
    await writeFile(`${pdf}.${tag}.tmp`, data);
    await writeFile(`${json}.${tag}.tmp`, JSON.stringify(knowledge));
    await rename(`${pdf}.${tag}.tmp`, pdf);
    await rename(`${json}.${tag}.tmp`, json); // the switch-over: knowledge.json is what's served
  } catch (error) {
    await rm(`${pdf}.${tag}.tmp`, { force: true });
    await rm(`${json}.${tag}.tmp`, { force: true });
    throw error;
  }
  const info = await stat(json);
  active = knowledge;
  loadedStamp = `${info.mtimeMs}:${info.size}`;
  return document;
}
