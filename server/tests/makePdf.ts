/**
 * Writes small text PDFs for the tests: one Helvetica font, headings in a
 * larger size, paragraphs wrapped to the page. Enough PDF to exercise the
 * real extractor without shipping binary fixtures.
 */

export type Block = { heading: string } | { text: string } | { bullets: string[] };

const WIDTH = 612;
const HEIGHT = 792;
const MARGIN = 72;

function escape(text: string) {
  return text.replace(/[\\()]/g, (c) => "\\" + c).replace(/[^\x20-\x7e]/g, "?");
}

function wrap(text: string, size: number) {
  const max = Math.floor((WIDTH - 2 * MARGIN) / (size * 0.5));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

function pageStream(blocks: Block[], footer: string | null) {
  const ops: string[] = [];
  let y = HEIGHT - MARGIN;
  const put = (text: string, size: number, x = MARGIN) => {
    ops.push(`BT /F1 ${size} Tf ${x} ${y.toFixed(1)} Td (${escape(text)}) Tj ET`);
  };
  for (const block of blocks) {
    if ("heading" in block) {
      y -= 14;
      put(block.heading, 16);
      y -= 26;
    } else if ("text" in block) {
      for (const line of wrap(block.text, 11)) {
        put(line, 11);
        y -= 15;
      }
      y -= 12;
    } else {
      for (const bullet of block.bullets) {
        put("- " + bullet, 11, MARGIN + 10);
        y -= 15;
      }
      y -= 12;
    }
  }
  y = 40;
  if (footer) put(footer, 9);
  return ops.join("\n");
}

/** A PDF with one page per entry in `pages`. */
export function makePdf(pages: Block[][], title = "Product Catalogue"): Buffer {
  const objects: string[] = [];
  const add = (body: string) => objects.push(body);
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add(""); // pages, filled in below
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const kids: number[] = [];
  pages.forEach((blocks, i) => {
    const stream = pageStream(blocks, title ? `${title} - Page ${i + 1}` : null);
    add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    const contents = objects.length;
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contents} 0 R >>`);
    kids.push(objects.length);
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

/** A PDF whose pages have no text at all, like a scan. */
export function makeTextlessPdf(): Buffer {
  return makePdf([[], []], "");
}
