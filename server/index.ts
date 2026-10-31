import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { adminEnabled } from "./assistant/auth.ts";
import { configProblems, readConfig } from "./enquiries/config.ts";
import { connectDb } from "./enquiries/db.ts";
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
const PRODUCTION = process.env.NODE_ENV === "production";

// The enquiries backend needs its database and session secret: in production
// the server refuses to start without them rather than run with forms that fail.
const problems = configProblems();
if (problems.length) {
  if (PRODUCTION) {
    console.error(`Cannot start: ${problems.join(" ")} See .env.example and DEPLOYMENT.md.`);
    process.exit(1);
  }
  console.warn(`Enquiries backend is off until configured: ${problems.join(" ")}`);
}

/** Headers on every page and file the server sends. */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  ...(PRODUCTION ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}),
};
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
    ...SECURITY_HEADERS,
    // The admin dashboard's shell is public HTML (its data is not), but keep it out of search engines.
    ...(url.pathname.startsWith("/admin") ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(path).pipe(res);
}).listen(PORT, HOST, async () => {
  console.log(`ChakraVue AI site on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  const config = readConfig();
  if (config) {
    try {
      await connectDb(config.mongoUri);
      console.log("Enquiries backend: connected to MongoDB.");
    } catch {
      console.error("Enquiries backend: could not reach MongoDB yet; forms will return 503 until it can.");
    }
  }
  if (!adminEnabled()) console.warn("ADMIN_PASSWORD_HASH is not set: the /admin upload page is switched off.");
  const document = await documentInfo();
  if (document) console.log(`Product Assistant: answering from "${document.name}" (updated ${document.updatedAt}).`);
  else console.warn("Product Assistant: no PDF uploaded yet. Upload one at /admin.");
});
