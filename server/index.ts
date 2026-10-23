import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { handleChat } from "./chatHandler.ts";

/**
 * Production server: the built site from dist/ plus the assistant's API.
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
  if (url.pathname === "/api/chat") return handleChat(req, res);
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
}).listen(PORT, HOST, () => {
  console.log(`ChakraVue AI site on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.warn("ANTHROPIC_API_KEY is not set: the chat assistant will answer that it isn't configured.");
  }
});
