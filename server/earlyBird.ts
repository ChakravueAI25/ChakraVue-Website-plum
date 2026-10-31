import { mkdir, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createRateLimiter } from "./rateLimit.ts";

const DATA_FILE = resolve(import.meta.dirname, "../data/early-bird-leads.jsonl");
const hit = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });
const MAX_BODY = 24_000;

function reply(res: ServerResponse, status: number, body: object) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("too-large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new Error("invalid-json")); }
    });
    req.on("error", reject);
  });
}

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function handleEarlyBird(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, { Allow: "POST", "Cache-Control": "no-store" }).end();
    return;
  }
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try { if (new URL(origin).host !== host) return reply(res, 403, { error: "Request origin is not allowed." }); }
    catch { return reply(res, 403, { error: "Request origin is not allowed." }); }
  }
  const retry = hit(req.socket.remoteAddress ?? "unknown");
  if (retry) {
    res.setHeader("Retry-After", String(retry));
    return reply(res, 429, { error: "Please wait before submitting another inquiry." });
  }

  let body: any;
  try { body = await readBody(req); }
  catch (error) { return reply(res, (error as Error).message === "too-large" ? 413 : 400, { error: "The form submission was invalid." }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply(res, 400, { error: "The form submission was invalid." });

  const email = text(body.email, 254);
  const phone = text(body.phone, 32);
  const selected = Array.isArray(body.products) ? body.products.slice(0, 20).map((item: unknown) => text(item, 100)) : [];
  const required: Record<string, string> = {
    name: text(body.name, 140), email, phone,
    country: text(body.country, 100), organization: text(body.organization, 200), role: text(body.role, 120),
    heardAbout: text(body.heardAbout, 60),
  };
  if (Object.values(required).some((value) => !value) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+[1-9][0-9]{0,3}[ -]?[0-9 ()-]{6,18}$/.test(phone) || selected.length === 0 || body.consent !== "on") {
    return reply(res, 422, { error: "Complete the required fields with valid information and consent." });
  }

  const record = {
    ...required,
    department: text(body.department, 120),
    products: selected,
    useCase: text(body.useCase, 3000),
    contactMethod: text(body.contactMethod, 40),
    timeline: text(body.timeline, 60),
    consent: true,
    receivedAt: new Date().toISOString(),
  };
  try {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    const file = await open(DATA_FILE, "a", 0o600);
    try {
      await file.chmod(0o600);
      await file.writeFile(`${JSON.stringify(record)}\n`, "utf8");
    }
    finally { await file.close(); }
    return reply(res, 201, { saved: true });
  } catch {
    return reply(res, 500, { error: "We couldn't save your inquiry. Please try again later." });
  }
}
