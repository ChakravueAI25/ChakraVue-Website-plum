/**
 * Sends a website form to the enquiries backend (POST /api/enquiries, saved
 * to MongoDB on the server). Every public form uses this; none talks to the
 * database or holds any secret. A success is reported only once the server
 * confirms the record was saved.
 */

export type EnquiryType = "general" | "product" | "demo" | "early-access" | "collaboration" | "distribution" | "oem" | "investment";
export type SourceForm = "contact-page" | "contact-popup" | "try-demo-request" | "early-bird-offer";

export type EnquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  designation?: string;
  visitorType?: string;
  productInterest?: string[];
  enquiryType: EnquiryType;
  message?: string;
  referralSource?: string;
  demoOfferInterest?: string;
  sourceForm: SourceForm;
  sourcePage?: string;
  country?: string;
  department?: string;
  audience?: string;
  contactMethod?: string;
  timeline?: string;
  consent?: boolean;
  /** The hidden anti-spam field; people leave it empty. */
  website?: string;
};

export class EnquiryError extends Error {
  fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.fields = fields;
  }
}

/** Empty strings become absent fields, so optional fields stay optional. */
function compact(payload: EnquiryPayload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined && !(Array.isArray(value) && !value.length)));
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ id: string }> {
  let response: Response;
  try {
    response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compact({ sourcePage: window.location.pathname, ...payload })),
    });
  } catch {
    throw new EnquiryError("We couldn't reach our server. Check your connection and try again.");
  }
  const body = (await response.json().catch(() => null)) as
    | { ok: true; data: { id: string } }
    | { ok: false; error: { message: string; fields?: Record<string, string> } }
    | null;
  if (response.ok && body?.ok) return body.data;
  if (body && !body.ok) throw new EnquiryError(body.error.message, body.error.fields ?? {});
  throw new EnquiryError("We couldn't send your enquiry. Please try again in a moment.");
}

/** What a Contact form's "What interests you?" choice means for the enquiry type. */
export function enquiryTypeForInterest(interest: string): EnquiryType {
  if (interest === "Partnership / Collaboration") return "collaboration";
  if (interest === "Distribution") return "distribution";
  if (interest === "OEM Partnership") return "oem";
  if (interest === "Investment") return "investment";
  if (interest === "Our Future Vision" || interest === "Others" || !interest) return "general";
  return "product";
}
