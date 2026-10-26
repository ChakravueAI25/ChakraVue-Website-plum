import type { IncomingMessage, ServerResponse } from "node:http";

/** Small HTTP helpers for the assistant's routes (the server uses plain node:http). */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res: ServerResponse, status: number, payload: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

/** Reads a request body, refusing anything over `limit` bytes. */
export function readBody(req: IncomingMessage, limit: number, tooLarge: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const declared = Number(req.headers["content-length"]);
    if (declared > limit) {
      reject(new HttpError(413, tooLarge));
      req.resume();
      return;
    }
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, tooLarge));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** The visitor's address, for rate limits. X-Forwarded-For only behind a proxy we control. */
export function clientKey(req: IncomingMessage) {
  const forwarded = process.env.TRUST_PROXY === "1" ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : "";
  return forwarded || req.socket.remoteAddress || "unknown";
}
