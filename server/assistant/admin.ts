import { randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { adminPage } from "./adminPage.ts";
import { checkAdmin, type AuthResult } from "./auth.ts";
import { settings } from "./config.ts";
import { HttpError, readBody, sendJson } from "./http.ts";
import { documentInfo, replaceDocument } from "./knowledge.ts";
import { PdfError } from "./pdf.ts";

/**
 * The protected admin area:
 *   GET  /admin                 the upload page
 *   GET  /api/admin/document    the document in use
 *   POST /api/admin/document    replace it (the raw PDF as the body, its name in X-File-Name)
 */

function refuse(res: ServerResponse, result: AuthResult, json: boolean) {
  if (result === "disabled") {
    const message = "The admin area is switched off: set ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) in the server's .env.";
    return json ? sendJson(res, 404, { error: message }) : res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
  }
  if (result === "locked") {
    const message = "Too many wrong passwords. Try again in 15 minutes.";
    return json ? sendJson(res, 429, { error: message }) : res.writeHead(429, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
  }
  const headers = { "WWW-Authenticate": 'Basic realm="Product Assistant admin", charset="UTF-8"' };
  if (json) return sendJson(res, 401, { error: "Please sign in." }, headers);
  res.writeHead(401, { ...headers, "Content-Type": "text/plain; charset=utf-8" }).end("Sign-in required.");
}

/** Uploads must come from the admin page itself, not from another site the admin has open. */
function sameOrigin(req: IncomingMessage) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export async function handleAdminPage(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405, { Allow: "GET" }).end();
  const auth = checkAdmin(req);
  if (auth !== "ok") return refuse(res, auth, false);
  const nonce = randomBytes(16).toString("base64");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": `default-src 'self'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-ancestors 'none'; form-action 'none'`,
  });
  res.end(req.method === "HEAD" ? undefined : adminPage(nonce, settings().pdfMaxBytes));
}

export async function handleDocument(req: IncomingMessage, res: ServerResponse) {
  const auth = checkAdmin(req);
  if (auth !== "ok") return refuse(res, auth, true);

  if (req.method === "GET") return sendJson(res, 200, { document: await documentInfo() });
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use GET or POST." }, { Allow: "GET, POST" });
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Uploads are only accepted from the admin page." });
  if (!String(req.headers["content-type"] ?? "").startsWith("application/pdf")) {
    return sendJson(res, 415, { error: "Only PDF files can be uploaded." });
  }
  let fileName = "document.pdf";
  try {
    fileName = decodeURIComponent(String(req.headers["x-file-name"] ?? "document.pdf"));
  } catch {
    // Keep the default name.
  }
  if (!/\.pdf$/i.test(fileName)) return sendJson(res, 415, { error: "Only .pdf files can be uploaded." });

  try {
    const { pdfMaxBytes } = settings();
    const data = await readBody(req, pdfMaxBytes, `The file is larger than ${Math.round(pdfMaxBytes / 1048576)} MB.`);
    const document = await replaceDocument(data, fileName);
    console.log(`[assistant] Now answering from "${document.name}" (${document.pages} pages, ${document.passages} passages).`);
    sendJson(res, 200, { document });
  } catch (error) {
    const previous = await documentInfo();
    if (error instanceof HttpError) return sendJson(res, error.status, { error: error.message, document: previous });
    if (error instanceof PdfError) return sendJson(res, 422, { error: error.message, document: previous });
    console.error("[assistant] Upload failed:", error);
    sendJson(res, 500, { error: "The PDF couldn't be processed. The previous document is still in use.", document: previous });
  }
}
