import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { leaders, teamMembers } from "../src/pages/about-us/data.ts";
import { address, contactDetails } from "../src/pages/contact/data.ts";
import { products } from "../src/pages/product-suite/data.ts";
import { platforms } from "../src/pages/product-suite/platforms.ts";
import { principles, services } from "../src/pages/services/data.ts";
import { clinicalCopy, valueCards } from "../src/shared/data/content.ts";

/**
 * Writes a product guide PDF from the website's own data files, for the
 * Product Assistant to answer from (upload it at /admin). Only what the site
 * already publishes goes in. `npm run assistant:site-pdf [output.pdf]`
 * (default docs/ChakraVue-AI-Product-Guide.pdf).
 */

type Block = { kind: "title" | "heading" | "subheading" | "text" | "bullet"; text: string };

const blocks: Block[] = [];
const title = (text: string) => blocks.push({ kind: "title", text });
const heading = (text: string) => blocks.push({ kind: "heading", text });
const subheading = (text: string) => blocks.push({ kind: "subheading", text });
const text = (value: string) => blocks.push({ kind: "text", text: value });
const bullets = (items: string[]) => items.forEach((item) => blocks.push({ kind: "bullet", text: item }));
const sentence = (value: string) => (/[.!?]$/.test(value) ? value : value + ".");

const email = contactDetails.find((d) => d.label === "Email Us")?.value ?? "";
const phone = contactDetails.find((d) => d.label === "Call us")?.value ?? "";

title("ChakraVue AI Product Guide");
text(clinicalCopy);
text(
  "This guide describes the ChakraVue AI product suite (four products), its software platforms (three platforms) and its services, as published on the ChakraVue AI website.",
);
heading("Products, Platforms and Services");
text(`The ChakraVue AI products are the ${products.map((p) => p.title).join(", ").replace(/, ([^,]*)$/, " and $1")}.`);
text(`The ChakraVue AI software platforms are ${platforms.map((p) => p.title).join(", ").replace(/, ([^,]*)$/, " and $1")}.`);
text(`The ChakraVue AI services are ${services.map((s) => s.title).join(" and ")}.`);
heading("How ChakraVue AI Works");
for (const card of valueCards) text(`${card.title}: ${card.body}`);

for (const product of products) {
  heading(product.title === product.label ? product.title : `${product.title} (${product.label})`);
  text(`${product.title} is ChakraVue AI product ${product.index}: ${product.tagline.toLowerCase()}.`);
  text(product.description);
  text(`The main parts of the ${product.title} are:`);
  bullets(product.anatomy.map((part) => part.label));
}

for (const platform of platforms) {
  heading(platform.title);
  text(`${platform.title} is ChakraVue AI software platform ${platform.index}, in the ${platform.category.replace(" · ", ", ")} category.`);
  text(platform.summary);
  if (platform.features.length) {
    text(`${platform.title} features:`);
    bullets(platform.features);
  }
  if (platform.flow) text(`The ${platform.title} workflow: ${platform.flow.join(", then ")}.`);
  if (platform.note) text(`Note: ${platform.title} is ${platform.note[0].toLowerCase()}${platform.note.slice(1)}`);
  for (const app of platform.apps ?? []) {
    subheading(app.title);
    text(app.summary);
    text(`${app.title} features: ${app.features.join(", ")}.`);
  }
}

for (const service of services) {
  // The site calls the simulation service "FEA" too, so the guide spells out both.
  heading(service.id === "biomedical-fea" ? `${service.title} (FEA)` : service.title);
  text(`${service.title} is a ChakraVue AI service (${service.tag.toLowerCase()}).`);
  text(service.lead);
  for (const group of service.groups) {
    text(`${service.title}, ${group.heading.toLowerCase()}:`);
    bullets(group.items);
  }
  for (const study of service.cases ?? []) {
    text(`Case study: ${study.title}. ${study.title} (${study.subtitle.toLowerCase()}) covers: ${study.points.join("; ")}.`);
    text(`Outcome: ${study.outcome}`);
    text(`Audience for the ${study.title} study: ${study.audience}.`);
  }
  if (service.flow) text(`The ${service.title} runs in stages: ${service.flow.join(", ")}.`);
}
heading("Our Working Principles");
for (const principle of principles) text(`${principle.title}: ${sentence(principle.body)}`);

heading("Pricing, Demos and Availability");
text(
  `ChakraVue AI does not publish prices on its website. For pricing, a demo or availability of any product, platform or service, contact ChakraVue AI by email at ${email} or by phone on ${phone}.`,
);

heading("Leadership and Team");
for (const leader of leaders) text(`${leader.name}: ${leader.role}.`);
for (const member of teamMembers) text(`${member.name}: ${member.role}, ChakraVue AI.`);

heading("Contact ChakraVue AI");
text(`Email: ${email}`);
text(`Phone: ${phone}`);
text(`Office address: ${address}.`);
text("LinkedIn: ChakraVue AI (linkedin.com/company/chakravue-ai-pvt-ltd).");

// --- A small PDF writer: Helvetica, A4, wrapped text, automatic page breaks.

const WIDTH = 595;
const HEIGHT = 842;
const MARGIN = 64;
const STYLE: Record<Block["kind"], { font: "F1" | "F2"; size: number; before: number; after: number; indent: number }> = {
  title: { font: "F2", size: 22, before: 0, after: 14, indent: 0 },
  heading: { font: "F2", size: 15, before: 18, after: 8, indent: 0 },
  subheading: { font: "F2", size: 13, before: 10, after: 6, indent: 0 },
  text: { font: "F1", size: 10.5, before: 0, after: 7, indent: 0 },
  bullet: { font: "F1", size: 10.5, before: 0, after: 3, indent: 14 },
};

/** WinAnsi bytes for the punctuation the site's copy uses. */
const WIN_ANSI: Record<string, number> = { "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97 };

function encode(value: string) {
  let out = "";
  for (const char of value) {
    const code = WIN_ANSI[char] ?? char.charCodeAt(0);
    const byte = code < 256 ? code : 0x3f;
    out += byte === 0x28 || byte === 0x29 || byte === 0x5c ? "\\" + String.fromCharCode(byte) : String.fromCharCode(byte);
  }
  return out;
}

function wrap(value: string, size: number, width: number) {
  const max = Math.floor(width / (size * 0.5));
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

const pages: string[][] = [[]];
let y = HEIGHT - MARGIN;
const newPage = () => {
  pages.push([]);
  y = HEIGHT - MARGIN;
};
for (const block of blocks) {
  const style = STYLE[block.kind];
  const lines = wrap(block.kind === "bullet" ? block.text : block.text, style.size, WIDTH - 2 * MARGIN - style.indent - (block.kind === "bullet" ? 10 : 0));
  const lineHeight = style.size * 1.4;
  // Keep a heading with at least two lines of what follows.
  const needed = style.before + lines.length * lineHeight + (block.kind.includes("heading") ? lineHeight * 3 : 0);
  if (y - needed < MARGIN + 20 && pages[pages.length - 1].length) newPage();
  else y -= style.before;
  lines.forEach((line, i) => {
    const x = MARGIN + style.indent;
    if (block.kind === "bullet" && i === 0) pages[pages.length - 1].push(`BT /F1 ${style.size} Tf ${x} ${y.toFixed(1)} Td (${encode("•")}) Tj ET`);
    const lx = x + (block.kind === "bullet" ? 10 : 0);
    pages[pages.length - 1].push(`BT /${style.font} ${style.size} Tf ${lx} ${y.toFixed(1)} Td (${encode(line)}) Tj ET`);
    y -= lineHeight;
  });
  y -= style.after;
}

const objects: string[] = [];
objects.push("<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
const kids: number[] = [];
pages.forEach((ops, i) => {
  const footer = `BT /F1 8.5 Tf ${MARGIN} 36 Td (${encode(`ChakraVue AI Product Guide  -  Page ${i + 1} of ${pages.length}`)}) Tj ET`;
  const stream = [...ops, footer].join("\n");
  objects.push(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${objects.length} 0 R >>`,
  );
  kids.push(objects.length);
});
objects[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
objects.push(`<< /Title (${encode("ChakraVue AI Product Guide")}) /Producer (ChakraVue AI website) >>`);

let pdf = "%PDF-1.4\n";
const offsets = objects.map((body, i) => {
  const offset = Buffer.byteLength(pdf, "latin1");
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  return offset;
});
const xref = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

const output = resolve(process.argv[2] ?? "docs/ChakraVue-AI-Product-Guide.pdf");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, Buffer.from(pdf, "latin1"));
console.log(`Wrote ${output} (${pages.length} pages).`);
