import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, beforeEach, describe, test } from "node:test";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

/**
 * The enquiries backend end to end: a real MongoDB (mongodb-memory-server),
 * the real route handler on a real HTTP server, requests with fetch.
 */

let mongo: MongoMemoryServer;
let server: Server;
let base = "";
let api: typeof import("../enquiries/api.ts");
let models: typeof import("../enquiries/models.ts");
let db: typeof import("../enquiries/db.ts");
let client: typeof import("../../src/shared/api/enquiries.ts");

const ADMIN = { name: "Test Admin", email: "admin@example.com", password: "a-long-test-password" };
const CSRF = { "X-Requested-With": "chakravue-admin" };

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
}

async function login(email = ADMIN.email, password = ADMIN.password) {
  const response = await post("/api/admin/login", { email, password }, CSRF);
  const cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";
  return { response, cookie };
}

const contact = (overrides: Record<string, unknown> = {}) => ({
  name: "Asha Rao",
  email: "Asha.Rao@Example.com ",
  phone: "+91 98765 43210",
  visitorType: "Working Professionals",
  enquiryType: "product",
  productInterest: ["AI Surgical Assistant"],
  referralSource: "LinkedIn",
  sourceForm: "contact-page",
  sourcePage: "/contact-us",
  ...overrides,
});

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("chakravue_test");
  process.env.SESSION_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.ALLOWED_ORIGINS = "https://www.example-allowed.com";
  process.env.ENQUIRY_RATE_LIMIT = "1000";
  api = await import("../enquiries/api.ts");
  models = await import("../enquiries/models.ts");
  db = await import("../enquiries/db.ts");
  client = await import("../../src/shared/api/enquiries.ts");
  await db.connectDb(process.env.MONGODB_URI);
  await db.ensureCollections();
  server = createServer(async (req, res) => {
    if (!(await api.handleEnquiryRoute(req, res))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.disconnectDb();
  await mongo.stop();
});

beforeEach(async () => {
  await models.Enquiry.deleteMany({});
  await models.Admin.deleteMany({});
  api.resetLimitsForTests();
  await models.Admin.create({ name: ADMIN.name, email: ADMIN.email, passwordHash: await bcrypt.hash(ADMIN.password, 4) });
});

describe("database", () => {
  test("uses exactly the two collections, with the indexes", async () => {
    const names = (await mongoose.connection.db!.listCollections().toArray()).map((c) => c.name).sort();
    assert.deepEqual(names, ["admins", "enquiries"]);
    const enquiryIndexes = (await models.Enquiry.collection.indexes()).map((i) => JSON.stringify(i.key));
    assert.ok(enquiryIndexes.includes('{"createdAt":-1}'));
    assert.ok(enquiryIndexes.includes('{"email":1}'));
    assert.ok(enquiryIndexes.includes('{"status":1,"createdAt":-1}'));
    const adminEmail = (await models.Admin.collection.indexes()).find((i) => JSON.stringify(i.key) === '{"email":1}');
    assert.equal(adminEmail?.unique, true);
  });
});

describe("POST /api/enquiries", () => {
  test("stores a valid enquiry, normalised", async () => {
    const response = await post("/api/enquiries", contact());
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.ok, true);
    const saved = await models.Enquiry.findById(body.data.id).lean<Record<string, unknown>>();
    assert.equal(saved?.email, "asha.rao@example.com");
    assert.equal(saved?.status, "new");
    assert.deepEqual(saved?.productInterest, ["AI Surgical Assistant"]);
    assert.ok(saved?.createdAt instanceof Date);
  });

  test("rejects invalid submissions with field errors", async () => {
    for (const bad of [
      contact({ email: "not-an-email" }),
      contact({ name: "" }),
      contact({ enquiryType: "spam" }),
      contact({ sourceForm: "unknown-form" }),
      contact({ phone: "abc" }),
      contact({ sourcePage: "https://elsewhere.example" }),
    ]) {
      const response = await post("/api/enquiries", bad);
      assert.equal(response.status, 422, JSON.stringify(bad));
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.ok(Object.keys(body.error.fields).length);
    }
    assert.equal(await models.Enquiry.countDocuments(), 0);
  });

  test("accepts a submission with only the required fields", async () => {
    const response = await post("/api/enquiries", { name: "Ravi", email: "ravi@example.com", enquiryType: "general", sourceForm: "contact-page" });
    assert.equal(response.status, 201);
    const saved = await models.Enquiry.findOne({ email: "ravi@example.com" }).lean<Record<string, unknown>>();
    assert.equal(saved?.phone, undefined);
    assert.equal(saved?.productInterest, undefined);
  });

  test("refuses operator objects (NoSQL injection) and non-JSON bodies", async () => {
    assert.equal((await post("/api/enquiries", contact({ email: { $gt: "" } }))).status, 422);
    assert.equal((await post("/api/enquiries", contact({ name: ["a", "b"] }))).status, 422);
    const text = await fetch(base + "/api/enquiries", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "hi" });
    assert.equal(text.status, 415);
    const broken = await fetch(base + "/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{oops" });
    assert.equal(broken.status, 400);
    const huge = await post("/api/enquiries", contact({ message: "x".repeat(20_000) }));
    assert.equal(huge.status, 413);
    assert.equal(await models.Enquiry.countDocuments(), 0);
  });

  test("drops the hidden anti-spam field's submissions", async () => {
    const response = await post("/api/enquiries", contact({ website: "http://spam.example" }));
    assert.equal(response.status, 422);
    assert.equal(await models.Enquiry.countDocuments(), 0);
  });

  test("a repeated submission returns the first record instead of a copy", async () => {
    const first = await (await post("/api/enquiries", contact())).json();
    const again = await post("/api/enquiries", contact());
    assert.equal(again.status, 200);
    const body = await again.json();
    assert.equal(body.data.id, first.data.id);
    assert.equal(body.data.duplicate, true);
    assert.equal(await models.Enquiry.countDocuments(), 1);
    // A different message is a new enquiry.
    assert.equal((await post("/api/enquiries", contact({ message: "Another question" }))).status, 201);
  });

  test("there is no public way to read enquiries", async () => {
    await post("/api/enquiries", contact());
    const list = await fetch(base + "/api/enquiries");
    assert.equal(list.status, 405);
    assert.doesNotMatch(await list.text(), /asha/i);
  });

  test("only the site's own and configured origins may submit", async () => {
    assert.equal((await post("/api/enquiries", contact(), { Origin: "https://evil.example" })).status, 403);
    const allowed = await post("/api/enquiries", contact(), { Origin: "https://www.example-allowed.com" });
    assert.equal(allowed.status, 201);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "https://www.example-allowed.com");
    const preflight = await fetch(base + "/api/enquiries", { method: "OPTIONS", headers: { Origin: "https://www.example-allowed.com" } });
    assert.equal(preflight.status, 204);
  });
});

describe("each website form maps onto the enquiries schema", () => {
  test("Contact page, Know how it works pop-up, Try Demo request and early-bird offer", async () => {
    const forms = [
      contact(),
      contact({ email: "popup@example.com", sourceForm: "contact-popup", sourcePage: "/", enquiryType: client.enquiryTypeForInterest("Partnership / Collaboration"), productInterest: undefined }),
      {
        name: "Dr Meera", email: "meera@example.com", phone: "+91 90000 00000", visitorType: "Working Professionals", referralSource: "Instagram",
        organization: "Eye Hospital", message: "Please show the overlays", productInterest: ["Digital Surgical Assistant"],
        audience: "Clinicians & Surgeons", demoOfferInterest: "10,000 demo points", enquiryType: "demo", sourceForm: "try-demo-request", sourcePage: "/try-demo",
      },
      {
        name: "Karan", email: "karan@example.com", phone: "+91 6300147979", country: "India", organization: "Smile Clinic",
        designation: "Dentist / Dental Surgeon", visitorType: "Dentist / Dental Surgeon", department: "Implants",
        productInterest: ["Dental Implant Planning", "ChakraVue System"], message: "Implant planning for our clinic",
        contactMethod: "Email", timeline: "Within 3 months", referralSource: "Google search",
        demoOfferInterest: "10,000-point early-bird offer", consent: true, enquiryType: "early-access", sourceForm: "early-bird-offer", sourcePage: "/",
      },
    ];
    for (const form of forms) assert.equal((await post("/api/enquiries", form)).status, 201, String(form.sourceForm));
    const bySource = Object.fromEntries((await models.Enquiry.find().lean<Record<string, unknown>[]>()).map((d) => [d.sourceForm, d]));
    assert.deepEqual(Object.keys(bySource).sort(), ["contact-page", "contact-popup", "early-bird-offer", "try-demo-request"]);
    assert.equal(bySource["contact-popup"].enquiryType, "collaboration");
    assert.equal(bySource["try-demo-request"].audience, "Clinicians & Surgeons");
    assert.deepEqual(bySource["early-bird-offer"].productInterest, ["Dental Implant Planning", "ChakraVue System"]);
    assert.equal(bySource["early-bird-offer"].consent, true);
    assert.equal(bySource["early-bird-offer"].timeline, "Within 3 months");
  });

  test("the early-bird offer needs consent", async () => {
    const response = await post("/api/enquiries", { name: "K", email: "k@example.com", enquiryType: "early-access", sourceForm: "early-bird-offer" });
    assert.equal(response.status, 422);
  });

  test("Contact interests map to enquiry types", () => {
    assert.equal(client.enquiryTypeForInterest("Distribution"), "distribution");
    assert.equal(client.enquiryTypeForInterest("OEM Partnership"), "oem");
    assert.equal(client.enquiryTypeForInterest("Investment"), "investment");
    assert.equal(client.enquiryTypeForInterest("ChakraVue System"), "product");
    assert.equal(client.enquiryTypeForInterest("Our Future Vision"), "general");
  });
});

describe("admin authentication", () => {
  test("unauthenticated requests get nothing", async () => {
    await post("/api/enquiries", contact());
    for (const path of ["/api/admin/me", "/api/admin/dashboard", "/api/admin/enquiries"]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 401, path);
      assert.doesNotMatch(await response.text(), /asha/i);
    }
  });

  test("wrong credentials are rejected, with the same message for an unknown email", async () => {
    const wrong = await login(ADMIN.email, "wrong-password");
    assert.equal(wrong.response.status, 401);
    const unknown = await login("nobody@example.com", "whatever-password");
    assert.equal(unknown.response.status, 401);
    assert.equal((await wrong.response.json()).error.message, (await unknown.response.json()).error.message);
    assert.equal(wrong.cookie, "");
  });

  test("repeated failures lock the account for a while", async () => {
    for (let i = 0; i < 5; i++) await login(ADMIN.email, "wrong-password");
    const locked = await login();
    assert.equal(locked.response.status, 429);
  });

  test("login sets an HTTP-only SameSite cookie and never returns the hash", async () => {
    const { response, cookie } = await login();
    assert.equal(response.status, 200);
    const header = response.headers.get("set-cookie") ?? "";
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Strict/);
    assert.doesNotMatch(await response.text(), /passwordHash|\$2[aby]\$/);
    const me = await fetch(base + "/api/admin/me", { headers: { Cookie: cookie } });
    assert.equal((await me.json()).data.admin.email, ADMIN.email);
  });

  test("changing requests need the CSRF header", async () => {
    const response = await fetch(base + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ADMIN) });
    assert.equal(response.status, 403);
  });

  test("a tampered or foreign cookie is refused", async () => {
    const { cookie } = await login();
    const [name, value] = cookie.split("=");
    const tampered = `${name}=${value.slice(0, -2)}xx`;
    assert.equal((await fetch(base + "/api/admin/me", { headers: { Cookie: tampered } })).status, 401);
  });

  test("an inactive admin can't sign in, and an open session stops working", async () => {
    const { cookie } = await login();
    await models.Admin.updateOne({ email: ADMIN.email }, { $set: { isActive: false } });
    assert.equal((await fetch(base + "/api/admin/me", { headers: { Cookie: cookie } })).status, 401);
    assert.equal((await login()).response.status, 401);
  });

  test("a password change ends existing sessions", async () => {
    const { cookie } = await login();
    await models.Admin.updateOne({ email: ADMIN.email }, { $set: { passwordHash: await bcrypt.hash("a-new-long-password", 4) } });
    assert.equal((await fetch(base + "/api/admin/me", { headers: { Cookie: cookie } })).status, 401);
  });

  test("logout clears the cookie", async () => {
    const response = await post("/api/admin/logout", {}, CSRF);
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });
});

describe("admin enquiries", () => {
  async function seed() {
    const rows = [
      contact({ name: "Asha", email: "asha@example.com" }),
      contact({ name: "Bilal", email: "bilal@example.com", organization: "Lotus Hospital", enquiryType: "collaboration", productInterest: undefined }),
      contact({ name: "Chen", email: "chen@example.com", productInterest: ["Dental Implant Planning"] }),
      contact({ name: "Divya", email: "divya@example.com", phone: "+91 91234 56789", enquiryType: "demo", sourceForm: "try-demo-request" }),
    ];
    for (const row of rows) await post("/api/enquiries", row);
    await models.Enquiry.updateOne({ email: "chen@example.com" }, { $set: { status: "closed" } });
  }

  test("an admin sees the list, the dashboard and one enquiry", async () => {
    await seed();
    const { cookie } = await login();
    const list = await (await fetch(base + "/api/admin/enquiries", { headers: { Cookie: cookie } })).json();
    assert.equal(list.data.total, 4);
    assert.equal(list.data.items[0].name, "Divya"); // newest first
    assert.equal(list.data.items[0].message, undefined); // the list carries summary fields only
    const dash = await (await fetch(base + "/api/admin/dashboard", { headers: { Cookie: cookie } })).json();
    assert.deepEqual([dash.data.total, dash.data.new, dash.data.contacted, dash.data.closed], [4, 3, 0, 1]);
    assert.ok(dash.data.products.includes("Dental Implant Planning"));
    const one = await (await fetch(base + `/api/admin/enquiries/${list.data.items[0].id}`, { headers: { Cookie: cookie } })).json();
    assert.equal(one.data.enquiry.sourcePage, "/contact-us");
  });

  test("search, filters, sorting and pagination", async () => {
    await seed();
    const { cookie } = await login();
    const get = async (q: string) => (await (await fetch(base + `/api/admin/enquiries?${q}`, { headers: { Cookie: cookie } })).json()).data;
    assert.equal((await get("q=lotus")).total, 1);
    assert.equal((await get("q=91234")).items[0].name, "Divya");
    assert.equal((await get("q=.*")).total, 0); // treated as text, not a pattern
    assert.equal((await get("status=closed")).items[0].name, "Chen");
    assert.equal((await get("enquiryType=collaboration")).items[0].name, "Bilal");
    assert.equal((await get("product=Dental%20Implant%20Planning")).total, 1);
    assert.equal((await get("sort=oldest")).items[0].name, "Asha");
    const page2 = await get("limit=3&page=2");
    assert.deepEqual([page2.items.length, page2.pages, page2.total], [1, 2, 4]);
  });

  test("malformed queries and ids are refused safely", async () => {
    const { cookie } = await login();
    for (const q of ["page=0", "limit=500", "status=deleted", "sort=random", "enquiryType=x", "foo=bar", "status=new&status=closed"]) {
      assert.equal((await fetch(base + `/api/admin/enquiries?${q}`, { headers: { Cookie: cookie } })).status, 400, q);
    }
    assert.equal((await fetch(base + "/api/admin/enquiries/not-an-id", { headers: { Cookie: cookie } })).status, 400);
    assert.equal((await fetch(base + "/api/admin/enquiries/aaaaaaaaaaaaaaaaaaaaaaaa", { headers: { Cookie: cookie } })).status, 404);
  });

  test("only valid status updates are accepted, and only status changes", async () => {
    await seed();
    const { cookie } = await login();
    const target = await models.Enquiry.findOne({ email: "asha@example.com" }).lean<{ _id: unknown }>();
    const patch = (body: unknown, headers: Record<string, string> = CSRF) =>
      fetch(base + `/api/admin/enquiries/${target!._id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: cookie, ...headers }, body: JSON.stringify(body) });
    assert.equal((await patch({ status: "archived" })).status, 422);
    assert.equal((await patch({ status: "closed", email: "x@y.z" })).status, 422);
    assert.equal((await patch({ status: { $ne: "x" } })).status, 422);
    assert.equal((await patch({ status: "contacted" }, {})).status, 403); // no CSRF header
    const ok = await patch({ status: "contacted" });
    assert.equal(ok.status, 200);
    const saved = await models.Enquiry.findById(target!._id).lean<Record<string, unknown>>();
    assert.equal(saved?.status, "contacted");
    assert.equal(saved?.email, "asha@example.com");
  });

  test("the admin API refuses cross-site origins even with a session", async () => {
    const { cookie } = await login();
    const response = await fetch(base + "/api/admin/enquiries", { headers: { Cookie: cookie, Origin: "https://www.example-allowed.com" } });
    assert.equal(response.status, 403);
  });
});

describe("failures", () => {
  test("a missing configuration answers 503 without detail", async () => {
    const saved = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    try {
      const response = await post("/api/enquiries", contact());
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /mongodb|MONGODB_URI|stack/i);
    } finally {
      process.env.MONGODB_URI = saved;
    }
  });

  test("a database outage answers 503, not a stack trace", async () => {
    await db.disconnectDb();
    const realUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = "mongodb://127.0.0.1:1/unreachable";
    try {
      const response = await post("/api/enquiries", contact());
      assert.equal(response.status, 503);
      const text = await response.text();
      assert.doesNotMatch(text, /127\.0\.0\.1|ECONNREFUSED|at \w+ \(/);
    } finally {
      await db.disconnectDb().catch(() => {});
      process.env.MONGODB_URI = realUri;
      await db.connectDb(realUri!);
    }
  });
});
