import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Text extraction with PDF.js (pdfjs-dist), run entirely on this server.
 * Returns each page as lines, with the font size and vertical gap the
 * passage splitter uses to find headings and paragraphs. No OCR: a scanned
 * PDF has no text to extract and is refused by the caller.
 */

export type PdfLine = { text: string; size: number; gap: number };
export type PdfPage = { page: number; lines: PdfLine[] };

/** A problem with the file itself, worth showing to the administrator as it is. */
export class PdfError extends Error {}

type TextItem = { str: string; transform: number[]; width: number; height: number; hasEOL?: boolean };

const TIMEOUT_MS = 60_000;

export async function extractPdf(data: Uint8Array): Promise<PdfPage[]> {
  const task = getDocument({
    data,
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: 0,
  });
  const timer = setTimeout(() => void task.destroy(), TIMEOUT_MS);
  try {
    const pdf = await task.promise;
    const pages: PdfPage[] = [];
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      pages.push({ page: number, lines: toLines(content.items as TextItem[]) });
      page.cleanup();
    }
    return pages;
  } catch (error) {
    const name = (error as Error)?.name;
    if (name === "PasswordException") throw new PdfError("This PDF is password-protected. Upload a copy without a password.");
    if (name === "InvalidPDFException" || name === "FormatError") throw new PdfError("This file is damaged or isn't a valid PDF.");
    if (task.destroyed) throw new PdfError("The PDF took too long to read. Try a smaller or simpler file.");
    throw error;
  } finally {
    clearTimeout(timer);
    await task.destroy().catch(() => {});
  }
}

/** Groups PDF.js text runs into reading-order lines (top to bottom, left to right). */
function toLines(items: TextItem[]): PdfLine[] {
  const runs = items
    .filter((item) => typeof item.str === "string" && item.str.length > 0)
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      size: Math.abs(item.transform[3]) || Math.abs(item.transform[0]) || item.height || 10,
      width: item.width,
    }));

  // Rows: runs whose baselines are within half a font size of each other.
  runs.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: (typeof runs)[] = [];
  for (const run of runs) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row[0].y - run.y) <= Math.max(row[0].size, run.size) * 0.5) row.push(run);
    else rows.push([run]);
  }

  const lines: PdfLine[] = [];
  let lastY: number | null = null;
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let text = "";
    let end = -Infinity;
    for (const run of row) {
      // A visible gap between runs is a space the PDF didn't spell out.
      if (text && !/\s$/.test(text) && !/^\s/.test(run.text) && run.x - end > run.size * 0.15) text += " ";
      text += run.text;
      end = run.x + run.width;
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const y = row[0].y;
    const size = Math.max(...row.map((run) => run.size));
    lines.push({ text, size, gap: lastY === null ? 0 : lastY - y });
    lastY = y;
  }
  return lines;
}
