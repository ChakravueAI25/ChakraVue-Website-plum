import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import type { IncomingMessage, ServerResponse } from "node:http";
import { clientKey, HttpError, readBody } from "../assistant/http.ts";
import { createRateLimiter } from "../rateLimit.ts";
import { configProblems, readConfig, type EnquiryConfig } from "./config.ts";
import { connectDb, dbReady } from "./db.ts";
import { Admin, Enquiry, STATUSES } from "./models.ts";
import {
  clearCookie,
  cookieName,
  corsHeaders,
  csrfOk,
  fail,
  issueSession,
  ok,
  originAllowed,
  passwordFingerprint,
  readCookie,
  readSession,
  sessionCookie,
} from "./security.ts";
import { escapeRegex, isObjectId, isStatus, parseListQuery, validateEnquiry } from "./validate.ts";

/**
 * The enquiries API (one MongoDB `enquiries` collection for every form, and
 * `admins` for who may read it):
 *
 *   POST  /api/enquiries                     public: save a form submission
 *   POST  /api/admin/login                   email + password -> session cookie
 *   POST  /api/admin/logout
 *   GET   /api/admin/me
 *   GET   /api/admin/dashboard               counts and the latest enquiries
 *   GET   /api/admin/enquiries               paginated, searchable, filterable list
 *   GET   /api/admin/enquiries/:id
 *   PATCH /api/admin/enquiries/:id/status    { status: "new" | "contacted" | "closed" }
 *
 * Every admin route checks the session and the admin's record on each request.
 */

const MAX_BODY = 16_000;
const DUPLICATE_WINDOW_MS = 2 * 60_000;

const submitLimit = createRateLimiter({ limit: Number(process.env.ENQUIRY_RATE_LIMIT) || 8, windowMs: 15 * 60_000 });
const loginLimit = createRateLimiter({ limit: 20, windowMs: 15 * 60_000 });
const LOGIN_LOCK_AFTER = 5;
const LOGIN_LOCK_MS = 15 * 60_000;
const loginFailures = new Map<string, number[]>();

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("chakravue-dummy-password", 12);

function recentFailures(email: string) {
  const now = Date.now();
  const recent = (loginFailures.get(email) ?? []).filter((t) => t > now - LOGIN_LOCK_MS);
  if (recent.length) loginFailures.set(email, recent);
  else loginFailures.delete(email);
  return recent;
}

/** For tests: forget rate-limit and lockout state between cases. */
export function resetLimitsForTests() {
  loginFailures.clear();
}

async function readJson(req: IncomingMessage) {
  const type = String(req.headers["content-type"] ?? "");
  if (!type.toLowerCase().startsWith("application/json")) throw new HttpError(415, "Send the form as JSON.");
  const raw = await readBody(req, MAX_BODY, "The submission is too large.");
  try {
    return JSON.parse(raw.toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "The submission was not valid JSON.");
  }
}

function safeError(res: ServerResponse, error: unknown, headers: Record<string, string> = {}) {
  if (error instanceof HttpError) return fail(res, error.status, "bad_request", error.message, {}, headers);
  const name = (error as { name?: string })?.name ?? "";
  // Database unreachable or timed out: say so without detail.
  if (/Mongo|Mongoose|ServerSelection/i.test(name) || !dbReady()) {
    console.error(`[enquiries] database error: ${name}`);
    return fail(res, 503, "unavailable", "The service is temporarily unavailable. Please try again shortly.", {}, headers);
  }
  console.error(`[enquiries] unexpected error: ${name || "unknown"}`);
  return fail(res, 500, "server_error", "Something went wrong. Please try again later.", {}, headers);
}

// --- Public -----------------------------------------------------------------------

async function submitEnquiry(req: IncomingMessage, res: ServerResponse, config: EnquiryConfig, cors: string | undefined) {
  const headers = corsHeaders(cors);
  const wait = submitLimit(clientKey(req));
  if (wait) return fail(res, 429, "rate_limited", "Too many submissions. Please wait a few minutes and try again.", {}, { ...headers, "Retry-After": String(wait) });

  try {
    const body = await readJson(req);
    const { value, errors } = validateEnquiry(body);
    if (!value) return fail(res, 422, "invalid", "Please check the highlighted fields.", { fields: errors }, headers);

    await connectDb(config.mongoUri);
    // The same person sending the same thing again within a couple of minutes
    // (a double click, a retry) gets the first record back rather than a copy.
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const existing = await Enquiry.findOne({
      email: value.email,
      sourceForm: value.sourceForm,
      enquiryType: value.enquiryType,
      // Our own operator (filters are sanitised globally; this one is trusted).
      createdAt: mongoose.trusted({ $gte: since }),
    })
      .select({ _id: 1, message: 1, productInterest: 1 })
      .lean<{ _id: unknown; message?: string; productInterest?: string[] }>();
    if (existing && (existing.message ?? "") === (value.message ?? "") && (existing.productInterest ?? []).join("|") === (value.productInterest ?? []).join("|")) {
      return ok(res, 200, { id: String(existing._id), duplicate: true }, headers);
    }

    const saved = await Enquiry.create(value);
    return ok(res, 201, { id: String(saved._id) }, headers);
  } catch (error) {
    return safeError(res, error, headers);
  }
}

// --- Admin ------------------------------------------------------------------------

type AdminDoc = { _id: unknown; name: string; email: string; role: string; isActive: boolean; passwordHash: string };

async function currentAdmin(req: IncomingMessage, config: EnquiryConfig) {
  const claims = readSession(readCookie(req, cookieName(config)), config);
  if (!claims || !isObjectId(claims.sub)) return null;
  await connectDb(config.mongoUri);
  const admin = await Admin.findById(claims.sub).select("+passwordHash").lean<AdminDoc>();
  if (!admin || !admin.isActive || admin.role !== "admin") return null;
  if (passwordFingerprint(admin.passwordHash, config.sessionSecret) !== claims.pw) return null;
  return admin;
}

const publicAdmin = (admin: AdminDoc) => ({ id: String(admin._id), name: admin.name, email: admin.email, role: admin.role });

const ENQUIRY_FIELDS = {
  name: 1, email: 1, phone: 1, organization: 1, designation: 1, visitorType: 1, productInterest: 1, enquiryType: 1, message: 1,
  referralSource: 1, demoOfferInterest: 1, sourceForm: 1, sourcePage: 1, country: 1, department: 1, audience: 1,
  contactMethod: 1, timeline: 1, consent: 1, status: 1, createdAt: 1, updatedAt: 1,
};
const LIST_FIELDS = { name: 1, email: 1, phone: 1, organization: 1, visitorType: 1, productInterest: 1, enquiryType: 1, sourceForm: 1, status: 1, createdAt: 1 };

function shape(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

async function login(req: IncomingMessage, res: ServerResponse, config: EnquiryConfig) {
  const wait = loginLimit(clientKey(req));
  if (wait) return fail(res, 429, "rate_limited", "Too many sign-in attempts. Please wait and try again.", {}, { "Retry-After": String(wait) });
  try {
    const body = (await readJson(req)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
    if (!email || !password) return fail(res, 422, "invalid", "Enter your email and password.");
    if (recentFailures(email).length >= LOGIN_LOCK_AFTER) {
      return fail(res, 429, "locked", "Too many failed sign-ins for this account. Try again in 15 minutes.");
    }

    await connectDb(config.mongoUri);
    const admin = await Admin.findOne({ email }).select("+passwordHash").lean<AdminDoc>();
    const matches = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
    if (!admin || !matches || !admin.isActive) {
      loginFailures.set(email, [...recentFailures(email), Date.now()]);
      return fail(res, 401, "invalid_credentials", "The email or password is incorrect.");
    }
    loginFailures.delete(email);
    const { token, exp } = issueSession(String(admin._id), admin.passwordHash, config);
    return ok(res, 200, { admin: publicAdmin(admin) }, { "Set-Cookie": sessionCookie(token, exp, config) });
  } catch (error) {
    return safeError(res, error);
  }
}

async function listEnquiries(res: ServerResponse, params: URLSearchParams) {
  const { value: query, error } = parseListQuery(params);
  if (!query) return fail(res, 400, "bad_query", error ?? "The query was not valid.");
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.enquiryType) filter.enquiryType = query.enquiryType;
  if (query.product) filter.productInterest = query.product;
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ name: pattern }, { email: pattern }, { organization: pattern }, { phone: pattern }];
  }
  const [items, total] = await Promise.all([
    Enquiry.find(mongoose.trusted(filter))
      .select(LIST_FIELDS)
      .sort({ createdAt: query.sort === "oldest" ? 1 : -1, _id: query.sort === "oldest" ? 1 : -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Enquiry.countDocuments(mongoose.trusted(filter)),
  ]);
  return ok(res, 200, {
    items: items.map((doc) => shape(doc as Record<string, unknown>)),
    page: query.page,
    limit: query.limit,
    total,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  });
}

async function dashboard(res: ServerResponse) {
  const [total, byStatus, recent, products] = await Promise.all([
    Enquiry.estimatedDocumentCount(),
    Enquiry.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Enquiry.find().select(LIST_FIELDS).sort({ createdAt: -1 }).limit(5).lean(),
    Enquiry.distinct("productInterest"),
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, byStatus.find((row) => row._id === s)?.count ?? 0]));
  return ok(res, 200, {
    total,
    new: counts.new,
    contacted: counts.contacted,
    closed: counts.closed,
    recent: recent.map((doc) => shape(doc as Record<string, unknown>)),
    products: (products as string[]).filter(Boolean).sort(),
  });
}

async function handleAdmin(req: IncomingMessage, res: ServerResponse, config: EnquiryConfig, pathname: string, params: URLSearchParams) {
  const method = req.method ?? "GET";
  const changes = method !== "GET" && method !== "HEAD";
  // Changing requests must come from our own pages: right origin and the custom header.
  if (changes && !csrfOk(req)) return fail(res, 403, "forbidden", "This request is not allowed.");

  if (pathname === "/api/admin/login") {
    if (method !== "POST") return fail(res, 405, "method", "Use POST.", {}, { Allow: "POST" });
    return login(req, res, config);
  }
  if (pathname === "/api/admin/logout") {
    if (method !== "POST") return fail(res, 405, "method", "Use POST.", {}, { Allow: "POST" });
    return ok(res, 200, { signedOut: true }, { "Set-Cookie": clearCookie(config) });
  }

  try {
    const admin = await currentAdmin(req, config);
    if (!admin) return fail(res, 401, "unauthenticated", "Please sign in.", {}, { "Set-Cookie": clearCookie(config) });

    if (pathname === "/api/admin/me" && method === "GET") return ok(res, 200, { admin: publicAdmin(admin) });
    if (pathname === "/api/admin/dashboard" && method === "GET") return dashboard(res);
    if (pathname === "/api/admin/enquiries" && method === "GET") return listEnquiries(res, params);

    const match = /^\/api\/admin\/enquiries\/([^/]+)(\/status)?$/.exec(pathname);
    if (match) {
      const id = decodeURIComponent(match[1]);
      if (!isObjectId(id)) return fail(res, 400, "bad_id", "That enquiry id is not valid.");
      if (!match[2] && method === "GET") {
        const doc = await Enquiry.findById(id).select(ENQUIRY_FIELDS).lean();
        return doc ? ok(res, 200, { enquiry: shape(doc as Record<string, unknown>) }) : fail(res, 404, "not_found", "Enquiry not found.");
      }
      if (match[2] && method === "PATCH") {
        const body = (await readJson(req)) as Record<string, unknown> | null;
        const keys = body && typeof body === "object" && !Array.isArray(body) ? Object.keys(body) : [];
        if (keys.length !== 1 || keys[0] !== "status" || !isStatus(body!.status)) {
          return fail(res, 422, "invalid", "status must be one of: new, contacted, closed.");
        }
        const doc = await Enquiry.findByIdAndUpdate(id, { $set: { status: body!.status } }, { new: true, runValidators: true }).select(ENQUIRY_FIELDS).lean();
        return doc ? ok(res, 200, { enquiry: shape(doc as Record<string, unknown>) }) : fail(res, 404, "not_found", "Enquiry not found.");
      }
    }
    return fail(res, 404, "not_found", "Not found.");
  } catch (error) {
    return safeError(res, error);
  }
}

// --- Router -----------------------------------------------------------------------

let warned = false;

/** Handles the enquiries API; returns false for any other path. */
export async function handleEnquiryRoute(req: IncomingMessage, res: ServerResponse, env: NodeJS.ProcessEnv = process.env): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const { pathname } = url;
  const isPublic = pathname === "/api/enquiries";
  const isAdmin = pathname.startsWith("/api/admin/") && pathname !== "/api/admin/document";
  if (!isPublic && !isAdmin) return false;

  const config = readConfig(env);
  if (!config) {
    if (!warned) {
      warned = true;
      console.warn(`[enquiries] the enquiries API is off: ${configProblems(env).join(" ")}`);
    }
    fail(res, 503, "unavailable", "The service is temporarily unavailable. Please try again shortly.");
    return true;
  }

  const origin = originAllowed(req, config);
  if (!origin.allowed) {
    fail(res, 403, "forbidden_origin", "Requests from this site are not allowed.");
    return true;
  }

  if (isPublic) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { ...corsHeaders(origin.cors), "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" }).end();
      return true;
    }
    if (req.method !== "POST") {
      fail(res, 405, "method", "Use POST.", {}, { Allow: "POST" });
      return true;
    }
    await submitEnquiry(req, res, config, origin.cors);
    return true;
  }

  // The admin API is same-origin only: no cross-site cookies, ever.
  if (origin.cors) {
    fail(res, 403, "forbidden_origin", "Requests from this site are not allowed.");
    return true;
  }
  await handleAdmin(req, res, config, pathname, url.searchParams);
  return true;
}
