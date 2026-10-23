import type { IncomingMessage, ServerResponse } from "node:http";
import { AssistantError, answer, type ChatTurn } from "./assistant.ts";
import { createRateLimiter } from "./rateLimit.ts";

const MAX_BODY_BYTES = 32 * 1024;
const MAX_TURNS = 12;
const MAX_USER_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 4000;

const perMinute = createRateLimiter({ limit: Number(process.env.CHAT_RATE_PER_MINUTE) || 8, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: Number(process.env.CHAT_RATE_PER_HOUR) || 60, windowMs: 3_600_000 });

/** Checks the request body and returns the conversation, or a message saying what's wrong. */
export function parseConversation(body: unknown): ChatTurn[] | string {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return "Send at least one message.";

  const turns: ChatTurn[] = [];
  for (const entry of raw.slice(-MAX_TURNS)) {
    const { role, content } = (entry ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return "Messages must have a role and text.";
    const text = content.trim();
    if (!text) continue;
    if (text.length > (role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) {
      return role === "user" ? `Please keep messages under ${MAX_USER_CHARS} characters.` : "The conversation is too long.";
    }
    turns.push({ role, content: text });
  }
  // The conversation has to open with the visitor (the greeting is drawn by the page, not sent).
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return "Please type a question.";
  return turns;
}

function send(res: ServerResponse, status: number, payload: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  res.end(JSON.stringify(payload));
}

function clientKey(req: IncomingMessage) {
  // Only trust X-Forwarded-For when a reverse proxy we control sets it.
  const forwarded = process.env.TRUST_PROXY === "1" ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : "";
  return forwarded || req.socket.remoteAddress || "unknown";
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new AssistantError(413, "That message is too long."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** POST /api/chat: { messages: [{ role, content }] } → { reply, sources }. */
export async function handleChat(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." }, { Allow: "POST" });
  if (!String(req.headers["content-type"] ?? "").includes("application/json")) {
    return send(res, 415, { error: "Send JSON." });
  }

  try {
    let body: unknown;
    try {
      body = JSON.parse(await readBody(req));
    } catch (error) {
      if (error instanceof AssistantError) throw error;
      return send(res, 400, { error: "The request couldn't be read." });
    }

    const conversation = parseConversation(body);
    if (typeof conversation === "string") return send(res, 400, { error: conversation });

    const key = clientKey(req);
    const wait = perMinute(key) || perHour(key);
    if (wait) {
      return send(res, 429, { error: "You're sending messages quickly. Please wait a moment and try again." }, { "Retry-After": String(wait) });
    }

    send(res, 200, await answer(conversation));
  } catch (error) {
    if (error instanceof AssistantError) return send(res, error.status, { error: error.message });
    console.error("[chat] Unexpected error:", error);
    send(res, 500, { error: "Something went wrong on our side. Please try again." });
  }
}
