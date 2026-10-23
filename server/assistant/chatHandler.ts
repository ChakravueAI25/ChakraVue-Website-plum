import type { IncomingMessage, ServerResponse } from "node:http";
import { createRateLimiter } from "../rateLimit.ts";
import { clientKey, HttpError, readBody, sendJson } from "./http.ts";
import { current } from "./knowledge.ts";
import { answer } from "./respond.ts";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_QUESTION_CHARS = 500;

const perMinute = createRateLimiter({ limit: Number(process.env.CHAT_RATE_PER_MINUTE) || 20, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: Number(process.env.CHAT_RATE_PER_HOUR) || 300, windowMs: 3_600_000 });

/**
 * POST /api/chat: { question } → { status, quotes: [{ text, page, heading }], message?, note?, document }.
 * Everything is answered here, on this server, from the active document.
 */
export async function handleChat(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST." }, { Allow: "POST" });
  if (!String(req.headers["content-type"] ?? "").includes("application/json")) return sendJson(res, 415, { error: "Send JSON." });

  try {
    let question: unknown;
    try {
      question = (JSON.parse((await readBody(req, MAX_BODY_BYTES, "That question is too long.")).toString("utf8")) as { question?: unknown })
        ?.question;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      return sendJson(res, 400, { error: "The request couldn't be read." });
    }
    if (typeof question !== "string" || !question.trim()) return sendJson(res, 400, { error: "Please type a question." });
    const text = question.trim();
    if (text.length > MAX_QUESTION_CHARS) return sendJson(res, 400, { error: `Please keep questions under ${MAX_QUESTION_CHARS} characters.` });
    if (!/[\p{L}\p{N}]/u.test(text)) return sendJson(res, 400, { error: "Please type a question in words." });

    const key = clientKey(req);
    const wait = perMinute(key) || perHour(key);
    if (wait) {
      return sendJson(res, 429, { error: "You're sending questions quickly. Please wait a moment and try again." }, { "Retry-After": String(wait) });
    }

    const knowledge = await current();
    const reply = answer(text, knowledge?.passages ?? null, knowledge?.index ?? null);
    sendJson(res, 200, { ...reply, document: knowledge ? { name: knowledge.document.name, version: knowledge.document.version } : null });
  } catch (error) {
    if (error instanceof HttpError) return sendJson(res, error.status, { error: error.message });
    console.error("[assistant] Unexpected error:", error);
    sendJson(res, 500, { error: "Something went wrong on our side. Please try again." });
  }
}
