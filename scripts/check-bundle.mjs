// Honesty guard, run after every `vite build` (package.json "build").
// The JS bundle is public, so it must never carry chip, board or model
// names, and the copy must never claim accreditation or certification.
// The Surgical Assistant's lay copy must also keep its two required phrases.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;

/** Whole words, any case. */
const BANNED = [
  // Compute modules, boards and chip makers.
  "Jetson", "Nvidia", "Orin", "Xavier", "Raspberry Pi", "Arduino", "ESP32", "STM32", "Qualcomm", "Snapdragon", "Rockchip", "Coral TPU",
  // AI model names.
  "YOLO", "YOLOv8", "U-Net", "UNet", "SegFormer", "Mask R-CNN", "SAM2",
  // Claims the site must never make.
  "NABH accredited", "ABDM", "certified",
];

/** Must appear (the Surgical Assistant's honest lay copy). */
const REQUIRED = ["helps the surgeon review and learn", "coming after regulatory approval"];

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(js|css|html)$/.test(entry.name) ? [path] : [];
  });
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const problems = [];
const all = [];

for (const file of files(DIST)) {
  const text = readFileSync(file, "utf8");
  all.push(text);
  for (const word of BANNED) {
    const match = text.match(new RegExp(`(?<![A-Za-z0-9])${escape(word)}(?![A-Za-z0-9])`, "i"));
    if (match) {
      const at = match.index ?? 0;
      problems.push(`${file.replace(DIST, "dist/")}: "${word}" in …${text.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ")}…`);
    }
  }
}

const bundle = all.join("\n");
for (const phrase of REQUIRED) {
  if (!bundle.includes(phrase)) problems.push(`missing required phrase: "${phrase}"`);
}

if (problems.length) {
  console.error("\n✗ Bundle check failed:\n  " + problems.join("\n  ") + "\n");
  process.exit(1);
}
console.log(`✓ Bundle check: no banned names or claims in ${files(DIST).length} files; required phrases present.`);
