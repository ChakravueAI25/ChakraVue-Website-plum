import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { EnquiryConfig } from "./config.ts";

/**
 * Cookies, sessions, origin checks and headers for the enquiries API.
 *
 * Admin sessions are a signed, HTTP-only cookie (HMAC-SHA256 over the admin's
 * id, an expiry, and a fingerprint of the password hash), so no session
 * collection is needed and changing a password ends every session. The
 * admin record is re-read on every request, so deactivating an admin locks
 * them out at once.
 */

export const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export function send(res: ServerResponse, status: number, payload: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { ...API_HEADERS, ...headers });
  res.end(JSON.stringify(payload));
}

export const ok = (res: ServerResponse, status: number, data: unknown, headers?: Record<string, string>) => send(res, status, { ok: true, data }, headers);

export function fail(res: ServerResponse, status: number, code: string, message: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>) {
  send(res, status, { ok: false, error: { code, message, ...extra } }, headers);
}

/** The request's own origin (scheme + host), as the browser would send it. */
function selfOrigins(req: IncomingMessage) {
  const host = req.headers.host;
  return host ? [`http://${host}`, `https://${host}`] : [];
}

/**
 * Same-origin requests are always allowed; cross-origin ones only from
 * ALLOWED_ORIGINS. Requests without an Origin header (curl, server-to-server)
 * pass this check but still meet every other rule.
 */
export function originAllowed(req: IncomingMessage, config: EnquiryConfig) {
  const origin = req.headers.origin;
  if (!origin) return { allowed: true as const, cors: undefined };
  const clean = origin.replace(/\/+$/, "");
  if (selfOrigins(req).includes(clean)) return { allowed: true as const, cors: undefined };
  if (config.allowedOrigins.includes(clean)) return { allowed: true as const, cors: clean };
  return { allowed: false as const, cors: undefined };
}

export function corsHeaders(origin: string | undefined, credentials = false): Record<string, string> {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    ...(credentials ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };
}

/** Admin requests that change something must carry this header (a cross-site form can't set it). */
export const CSRF_HEADER = "x-requested-with";
export const CSRF_VALUE = "chakravue-admin";

export function csrfOk(req: IncomingMessage) {
  return req.headers[CSRF_HEADER] === CSRF_VALUE;
}

// --- Session cookie --------------------------------------------------------------

export function cookieName(config: EnquiryConfig) {
  // __Host- needs Secure and no Domain: the browser then never sends it to another subdomain.
  return config.production ? "__Host-cv_admin" : "cv_admin";
}

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function passwordFingerprint(passwordHash: string, secret: string) {
  return sign(`pw:${passwordHash}`, secret).slice(0, 16);
}

export function issueSession(adminId: string, passwordHash: string, config: EnquiryConfig, now = Date.now()) {
  const exp = now + config.sessionHours * 3_600_000;
  const payload = Buffer.from(JSON.stringify({ sub: adminId, exp, pw: passwordFingerprint(passwordHash, config.sessionSecret) })).toString("base64url");
  return { token: `${payload}.${sign(payload, config.sessionSecret)}`, exp };
}

export type SessionClaims = { sub: string; exp: number; pw: string };

export function readSession(token: string | undefined, config: EnquiryConfig, now = Date.now()): SessionClaims | null {
  if (!token || token.length > 1024) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, config.sessionSecret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionClaims;
    if (typeof claims.sub !== "string" || typeof claims.exp !== "number" || typeof claims.pw !== "string") return null;
    if (claims.exp <= now) return null;
    return claims;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, exp: number, config: EnquiryConfig) {
  const maxAge = Math.max(0, Math.floor((exp - Date.now()) / 1000));
  return [`${cookieName(config)}=${token}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAge}`, ...(config.production ? ["Secure"] : [])].join("; ");
}

export function clearCookie(config: EnquiryConfig) {
  return [`${cookieName(config)}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0", ...(config.production ? ["Secure"] : [])].join("; ");
}

export function readCookie(req: IncomingMessage, name: string) {
  const header = String(req.headers.cookie ?? "");
  for (const part of header.split(";")) {
    const at = part.indexOf("=");
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return undefined;
}
