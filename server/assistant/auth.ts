import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { clientKey } from "./http.ts";

/**
 * Administrator sign-in: HTTP Basic authentication checked against
 * ADMIN_USERNAME and ADMIN_PASSWORD_HASH (a salted scrypt hash, made with
 * `npm run admin:password`), or ADMIN_PASSWORD in plain text for local
 * development. Without either, the admin area is switched off. Repeated
 * wrong passwords lock that address out for 15 minutes.
 */

const LOCK_AFTER = 10;
const LOCK_MS = 15 * 60_000;
const failures = new Map<string, number[]>();

function recentFailures(key: string) {
  const now = Date.now();
  const recent = (failures.get(key) ?? []).filter((time) => time > now - LOCK_MS);
  if (recent.length) failures.set(key, recent);
  else failures.delete(key);
  return recent;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

function equal(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

function passwordMatches(given: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (stored) {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    return equal(scryptSync(given, Buffer.from(salt, "base64"), 32), Buffer.from(hash, "base64"));
  }
  const plain = process.env.ADMIN_PASSWORD ?? "";
  // Hash both sides so the comparison takes the same time whatever the lengths.
  return !!plain && equal(scryptSync(given, "cv", 32), scryptSync(plain, "cv", 32));
}

export function adminEnabled() {
  return !!(process.env.ADMIN_PASSWORD_HASH?.trim() || process.env.ADMIN_PASSWORD);
}

export type AuthResult = "ok" | "disabled" | "missing" | "wrong" | "locked";

export function checkAdmin(req: IncomingMessage): AuthResult {
  if (!adminEnabled()) return "disabled";
  const header = String(req.headers.authorization ?? "");
  if (!header.startsWith("Basic ")) return "missing";
  const key = clientKey(req);
  if (recentFailures(key).length >= LOCK_AFTER) return "locked";
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const split = decoded.indexOf(":");
  const user = decoded.slice(0, split);
  const password = decoded.slice(split + 1);
  const userOk = equal(Buffer.from(user), Buffer.from(process.env.ADMIN_USERNAME || "admin"));
  if (split > 0 && passwordMatches(password) && userOk) return "ok";
  failures.set(key, [...recentFailures(key), Date.now()]);
  return "wrong";
}
