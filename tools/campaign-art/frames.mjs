// Dumps frames of a video as PNGs: node frames.mjs <url> <outDir> <start> <end> <step>
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const [url, out, start, end, step] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage();
await page.goto(url);
await page.evaluate(() => document.querySelector("video").pause());
await page.waitForFunction(() => document.querySelector("video").readyState >= 2);
for (let t = +start; t <= +end + 1e-6; t += +step) {
  const data = await page.evaluate(async (time) => {
    const v = document.querySelector("video");
    v.currentTime = time;
    await new Promise((r) => v.addEventListener("seeked", r, { once: true }));
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    return c.toDataURL("image/png");
  }, t);
  writeFileSync(`${out}/f${t.toFixed(2).padStart(5, "0")}.png`, Buffer.from(data.split(",")[1], "base64"));
}
await browser.close();
