import { ENQUIRY_TYPES, SOURCE_FORMS, STATUSES, type Status } from "./models.ts";

/**
 * Server-side checks for everything the public forms send. Only known fields
 * are read, each must be a plain string (or a list of strings, or a boolean
 * for consent), so nothing like `{ "$gt": "" }` can reach a query. Text is
 * trimmed, control characters dropped, and lengths capped.
 */

export type FieldErrors = Record<string, string>;

// Strip control characters other than tab and newlines.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

function text(value: unknown, max: number, errors: FieldErrors, field: string, multiline = false) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    errors[field] = "Must be text.";
    return undefined;
  }
  let clean = value.replace(CONTROL, "");
  if (!multiline) clean = clean.replace(/\s+/g, " ");
  clean = clean.trim();
  if (clean.length > max) {
    errors[field] = `Must be ${max} characters or fewer.`;
    return undefined;
  }
  return clean || undefined;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], errors: FieldErrors, field: string, required: boolean) {
  if (value === undefined || value === null || value === "") {
    if (required) errors[field] = "This field is required.";
    return undefined;
  }
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors[field] = "Not an accepted value.";
    return undefined;
  }
  return value as T;
}

export type EnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  designation?: string;
  visitorType?: string;
  productInterest?: string[];
  enquiryType: (typeof ENQUIRY_TYPES)[number];
  message?: string;
  referralSource?: string;
  demoOfferInterest?: string;
  sourceForm: (typeof SOURCE_FORMS)[number];
  sourcePage?: string;
  country?: string;
  department?: string;
  audience?: string;
  contactMethod?: string;
  timeline?: string;
  consent?: boolean;
};

export function validateEnquiry(body: unknown): { value?: EnquiryInput; errors: FieldErrors; spam?: boolean } {
  const errors: FieldErrors = {};
  if (!body || typeof body !== "object" || Array.isArray(body)) return { errors: { form: "The submission was not valid." } };
  const b = body as Record<string, unknown>;

  // A field people never see; anything in it means an automated submission.
  if (typeof b.website === "string" && b.website.trim()) return { errors: { form: "The submission was not valid." }, spam: true };

  const name = text(b.name, 140, errors, "name");
  if (!name && !errors.name) errors.name = "Please enter your name.";
  const email = text(b.email, 254, errors, "email")?.toLowerCase();
  if (!email && !errors.email) errors.email = "Please enter your email address.";
  else if (email && !EMAIL.test(email)) errors.email = "Please enter a valid email address.";
  const phone = text(b.phone, 32, errors, "phone");
  if (phone && !PHONE.test(phone)) errors.phone = "Please enter a valid phone number.";

  let productInterest: string[] | undefined;
  if (b.productInterest !== undefined && b.productInterest !== null) {
    if (!Array.isArray(b.productInterest) || b.productInterest.length > 20) errors.productInterest = "Not an accepted value.";
    else {
      const items = b.productInterest.map((item, i) => text(item, 120, errors, `productInterest.${i}`)).filter((item): item is string => !!item);
      productInterest = items.length ? [...new Set(items)] : undefined;
    }
  }

  const sourcePage = text(b.sourcePage, 200, errors, "sourcePage");
  if (sourcePage && !sourcePage.startsWith("/")) errors.sourcePage = "Not an accepted value.";

  let consent: boolean | undefined;
  if (b.consent !== undefined && b.consent !== null) {
    if (typeof b.consent !== "boolean") errors.consent = "Not an accepted value.";
    else consent = b.consent;
  }

  const value: EnquiryInput = {
    name: name ?? "",
    email: email ?? "",
    phone,
    organization: text(b.organization, 200, errors, "organization"),
    designation: text(b.designation, 120, errors, "designation"),
    visitorType: text(b.visitorType, 120, errors, "visitorType"),
    productInterest,
    enquiryType: oneOf(b.enquiryType, ENQUIRY_TYPES, errors, "enquiryType", true)!,
    message: text(b.message, 3000, errors, "message", true),
    referralSource: text(b.referralSource, 60, errors, "referralSource"),
    demoOfferInterest: text(b.demoOfferInterest, 120, errors, "demoOfferInterest"),
    sourceForm: oneOf(b.sourceForm, SOURCE_FORMS, errors, "sourceForm", true)!,
    sourcePage,
    country: text(b.country, 100, errors, "country"),
    department: text(b.department, 120, errors, "department"),
    audience: text(b.audience, 120, errors, "audience"),
    contactMethod: text(b.contactMethod, 40, errors, "contactMethod"),
    timeline: text(b.timeline, 60, errors, "timeline"),
    consent,
  };

  // The early-bird form asks for consent; refuse it without.
  if (value.sourceForm === "early-bird-offer" && consent !== true) errors.consent = "Please agree to be contacted about this inquiry.";

  return Object.keys(errors).length ? { errors } : { value, errors };
}

/** A MongoDB ObjectId as 24 hex characters. */
export const isObjectId = (id: string) => /^[a-f0-9]{24}$/i.test(id);

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export type ListQuery = {
  page: number;
  limit: number;
  q?: string;
  status?: Status;
  enquiryType?: string;
  product?: string;
  sort: "newest" | "oldest";
};

/** The admin list's query string; anything malformed is refused, not guessed. */
export function parseListQuery(params: URLSearchParams): { value?: ListQuery; error?: string } {
  for (const key of params.keys()) {
    if (!["page", "limit", "q", "status", "enquiryType", "product", "sort"].includes(key)) return { error: `Unknown parameter: ${key}` };
    if (params.getAll(key).length > 1) return { error: `Repeated parameter: ${key}` };
  }
  const page = params.has("page") ? Number(params.get("page")) : 1;
  const limit = params.has("limit") ? Number(params.get("limit")) : 20;
  if (!Number.isInteger(page) || page < 1 || page > 10_000) return { error: "page must be a whole number from 1." };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { error: "limit must be from 1 to 100." };
  const q = params.get("q")?.trim().slice(0, 100) || undefined;
  const status = params.get("status") || undefined;
  if (status && !isStatus(status)) return { error: "status is not valid." };
  const enquiryType = params.get("enquiryType") || undefined;
  if (enquiryType && !(ENQUIRY_TYPES as readonly string[]).includes(enquiryType)) return { error: "enquiryType is not valid." };
  const product = params.get("product")?.trim().slice(0, 120) || undefined;
  const sort = params.get("sort") || "newest";
  if (sort !== "newest" && sort !== "oldest") return { error: "sort must be newest or oldest." };
  return { value: { page, limit, q, status: status as Status | undefined, enquiryType, product, sort } };
}

/** For using visitor text inside a regular expression literally. */
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
