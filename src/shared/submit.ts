import { gmailComposeUrl } from "../pages/contact/data";

/** Base URL of the sign-up and booking backend; unset until it exists. */
const API = (import.meta.env.VITE_EXPERIENCE_API ?? "").replace(/\/+$/, "");

export type SubmitResult =
  /** The backend took it. */
  | { outcome: "sent" }
  /** No backend (or it failed): the details went to a pre-filled Gmail draft. */
  | { outcome: "composed"; composeUrl: string };

/**
 * POSTs `payload` to `VITE_EXPERIENCE_API + path`. Until that backend
 * exists, or if it fails, it hands off to Gmail the way ContactForm.tsx
 * does, so the visitor is never shown a "done" that didn't happen. The
 * Gmail link is also returned, in case the browser blocked the new tab.
 */
export async function submitOrCompose(path: string, payload: Record<string, unknown>, mail: { subject: string; body: string }): Promise<SubmitResult> {
  const composeUrl = gmailComposeUrl(mail);
  if (!API) {
    // Synchronous, so the new tab still counts as the click's own action.
    window.open(composeUrl, "_blank", "noopener");
    return { outcome: "composed", composeUrl };
  }
  try {
    const response = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { outcome: "sent" };
  } catch {
    // Falls through to the email hand-off.
  }
  window.open(composeUrl, "_blank", "noopener");
  return { outcome: "composed", composeUrl };
}

/** `?ref=` from the address bar (QR codes on VR viewers and event material). */
export function referralFromUrl() {
  return new URLSearchParams(window.location.search).get("ref")?.trim().slice(0, 64) ?? "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{8,18}$/;

/** One field that accepts either: returns an error message, or "" when it's fine. */
export function contactError(value: string) {
  const v = value.trim();
  if (!v) return "Please enter an email address or a phone number.";
  if (EMAIL.test(v)) return "";
  if (PHONE.test(v) && v.replace(/\D/g, "").length >= 8) return "";
  return "That doesn't look like an email address or a phone number.";
}
