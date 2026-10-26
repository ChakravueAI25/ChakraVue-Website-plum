import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { adminEnabled } from "./assistant/auth.ts";
import { documentInfo } from "./assistant/knowledge.ts";
import { handleAssistantRoute } from "./routes.ts";

/**
 * Production server: the built site from dist/ plus the Product Assistant
 * (the chat API and the /admin upload page). The assistant answers from the
 * uploaded PDF with local keyword search; it calls no outside service.
 * `npm run build && npm run serve`. In development `npm run dev` mounts the
 * same API inside Vite (vite.config.ts), so this file isn't needed there.
 */

const DIST = resolve(import.meta.dirname, "../dist");
const PORT = Number(process.env.PORT) || 4175;
const HOST = process.env.HOST || "0.0.0.0";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".glb": "model/gltf-binary",
  ".txt": "text/plain; charset=utf-8",
};

async function fileFor(pathname: string) {
  const path = resolve(DIST, "." + normalize(decodeURIComponent(pathname)));
  if (path !== DIST && !path.startsWith(DIST + sep)) return null; // no escaping dist/
  try {
    const info = await stat(path);
    if (info.isFile()) return path;
  } catch {
    // fall through
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (await handleAssistantRoute(req, res)) return;
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let path: string | null = null;
  try {
    path = await fileFor(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  // Client-side routes (/product-suite, /about-us, ...) all load the app shell.
  const asset = path !== null;
  path ??= join(DIST, "index.html");

  res.writeHead(200, {
    "Content-Type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
    // Vite fingerprints everything under /assets, so those can be cached for good.
    "Cache-Control": asset && url.pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(path).pipe(res);
}).listen(PORT, HOST, async () => {
  console.log(`ChakraVue AI site on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  if (!adminEnabled()) console.warn("ADMIN_PASSWORD_HASH is not set: the /admin upload page is switched off.");
  const document = await documentInfo();
  if (document) console.log(`Product Assistant: answering from "${document.name}" (updated ${document.updatedAt}).`);
  else console.warn("Product Assistant: no PDF uploaded yet. Upload one at /admin.");
});
