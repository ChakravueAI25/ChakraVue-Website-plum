import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { catalogueV1, catalogueV2, conflicting } from "./fixtures.ts";
import { makeTextlessPdf } from "./makePdf.ts";

/**
 * End-to-end tests of the Product Assistant: real PDFs (written by
 * makePdf.ts) go through the protected upload endpoint, and questions go
 * through POST /api/chat, exactly as the site and admin page use them.
 * `npm run test:assistant`
 */

const PASSWORD = "test-password-123";
const NOT_FOUND = "Sorry, I couldn't find a relevant answer in the current product document.";

let server: Server;
let base = "";
let dataDir = "";

type Reply = { status: string; quotes: { text: string; page: number }[]; message?: string; note?: string; document: { name: string } | null };

before(async () => {
  dataDir = await mkdtemp(join(tmpdir(), "cv-assistant-"));
  process.env.DATA_DIR = dataDir;
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = PASSWORD;
  delete process.env.ADMIN_PASSWORD_HASH;
  process.env.CHAT_RATE_PER_MINUTE = "1000";
  const { handleAssistantRoute } = await import("../routes.ts");
  server = createServer(async (req, res) => {
    if (!(await handleAssistantRoute(req, res))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  server.close();
  await rm(dataDir, { recursive: true, force: true });
});

const auth = (password = PASSWORD) => ({ Authorization: "Basic " + Buffer.from(`admin:${password}`).toString("base64") });

async function upload(data: Buffer, name = "catalogue.pdf", headers: Record<string, string> = {}) {
  const res = await fetch(`${base}/api/admin/document`, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/pdf", "X-File-Name": encodeURIComponent(name), ...headers },
    body: new Uint8Array(data),
  });
  return { status: res.status, body: (await res.json()) as { error?: string; document?: { name: string; pages: number } | null } };
}

async function ask(question: string) {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  assert.equal(res.status, 200, `asking "${question}"`);
  return (await res.json()) as Reply;
}

const texts = (reply: Reply) => reply.quotes.map((q) => q.text);

describe("before any upload", () => {
  test("the chat says no document is loaded", async () => {
    const reply = await ask("What does the Alpha Monitor cost?");
    assert.equal(reply.status, "no_document");
    assert.equal(reply.quotes.length, 0);
  });

  test("the admin area needs the password", async () => {
    assert.equal((await fetch(`${base}/admin`)).status, 401);
    assert.equal((await fetch(`${base}/admin`, { headers: auth("wrong") })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/document`)).status, 401);
    const page = await fetch(`${base}/admin`, { headers: auth() });
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Upload or replace the PDF/);
  });

  test("an upload without the password is refused", async () => {
    const res = await fetch(`${base}/api/admin/document`, { method: "POST", headers: { "Content-Type": "application/pdf" }, body: new Uint8Array(catalogueV1()) });
    assert.equal(res.status, 401);
    assert.equal((await ask("price of the Beta Scanner")).status, "no_document");
  });
});

describe("with catalogue version 1", () => {
  before(async () => {
    const { status, body } = await upload(catalogueV1(), "catalogue-v1.pdf");
    assert.equal(status, 200, body.error);
    assert.equal(body.document?.pages, 3);
  });

  test("1. an answer that appears directly in the PDF, as the relevant sentence only", async () => {
    const reply = await ask("How long does the Alpha Monitor's battery last?");
    assert.equal(reply.status, "answer");
    assert.deepEqual(texts(reply), [
      "The Alpha Monitor supports Bluetooth 5.3 connectivity and provides up to 20 hours of battery life.",
    ]);
  });

  test("2. a question phrased differently from the document", async () => {
    const reply = await ask("Is the Gamma Hub battery powered?");
    assert.ok(texts(reply).includes("It is powered from the mains and has no battery."), JSON.stringify(reply));
    const returns = await ask("Can I send something back if I don't like it? What's the return policy?");
    assert.deepEqual(texts(returns), ["Returns are accepted within 30 days of delivery, in the original packaging."]);
  });

  test("3. prices", async () => {
    assert.deepEqual(texts(await ask("What is the price of the Beta Scanner?")), ["Price: $849"]);
    assert.deepEqual(texts(await ask("How much does the Gamma Hub cost?")), ["Price: $399"]);
  });

  test("4. specifications", async () => {
    assert.deepEqual(texts(await ask("What is the display resolution of the Alpha Monitor?")), ["Display: 15.6 inch, 1920 x 1080"]);
    assert.deepEqual(texts(await ask("How heavy is the Beta Scanner?")), ["Weight: 650 g"]);
  });

  test("5. model numbers, with or without the hyphen", async () => {
    assert.deepEqual(texts(await ask("How much is the BS-310?")), ["Price: $849"]);
    assert.deepEqual(texts(await ask("bs310 price")), ["Price: $849"]);
    assert.deepEqual(texts(await ask("GH-5 warranty")), ["Warranty: 3 years"]);
  });

  test("6. a question answered by several passages", async () => {
    const both = await ask("What is the weight and warranty of the Alpha Monitor?");
    assert.deepEqual(texts(both), ["The Alpha Monitor weighs 1.2 kg and folds flat for transport.", "Warranty: 2 years"]);
    const compare = await ask("Compare the battery life of the Alpha Monitor and the Beta Scanner");
    assert.deepEqual(
      compare.quotes.map((q) => q.page),
      [1, 2],
    );
    const usb = await ask("Which products have USB-C?");
    assert.deepEqual(texts(usb), ["It supports USB-C charging.", "Ports: 4 Ethernet, 2 USB-C"]);
    const twoQuestions = await ask("Does the Alpha Monitor support USB-C? What is its price?");
    assert.deepEqual(texts(twoQuestions), ["It supports USB-C charging.", "Price: $1,299"]);
  });

  test("7. nothing relevant in the document", async () => {
    for (const question of ["What is the capital of France?", "Tell me about the Zeta Projector", "Do you sell pizza?"]) {
      const reply = await ask(question);
      assert.equal(reply.status, "not_found", question);
      assert.ok(reply.message?.startsWith(NOT_FOUND));
      assert.equal(reply.quotes.length, 0);
    }
  });

  test("8. an ambiguous question shows each match and asks which", async () => {
    const reply = await ask("What's the warranty?");
    assert.equal(reply.status, "ambiguous");
    assert.deepEqual(texts(reply), ["Warranty: 2 years", "Warranty: 1 year", "Warranty: 3 years"]);
    assert.match(reply.note ?? "", /Which one did you mean/);
  });

  test("12. page numbers are the pages the sentences are on", async () => {
    assert.equal((await ask("Alpha Monitor price")).quotes[0].page, 1);
    assert.equal((await ask("Beta Scanner frames per second")).quotes[0].page, 2);
    assert.equal((await ask("When do orders ship?")).quotes[0].page, 3);
  });

  test("empty and oversized questions are refused", async () => {
    for (const body of [{ question: "" }, { question: "   " }, {}, { question: "x".repeat(501) }, { question: "?!" }]) {
      const res = await fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      assert.equal(res.status, 400, JSON.stringify(body).slice(0, 40));
    }
  });
});

describe("updating the PDF", () => {
  test("10–11. an invalid upload is refused and the previous document stays in use", async () => {
    const before = await ask("Alpha Monitor price");
    for (const [data, name, expected] of [
      [Buffer.from("just some text, not a PDF"), "notes.pdf", /isn't a PDF/],
      [Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(200, 7)]), "broken.pdf", /damaged|couldn't be processed/],
      [makeTextlessPdf(), "scan.pdf", /No selectable text/],
    ] as const) {
      const { status, body } = await upload(data, name);
      assert.ok(status >= 400, `${name} should be refused`);
      assert.match(body.error ?? "", expected);
      assert.equal(body.document?.name, "catalogue-v1.pdf");
    }
    // Wrong type, wrong extension, too large, from another site.
    assert.equal((await upload(catalogueV2(), "catalogue.txt")).status, 415);
    assert.equal((await upload(catalogueV2(), "catalogue.pdf", { "Content-Type": "text/plain" })).status, 415);
    assert.equal((await upload(catalogueV2(), "catalogue.pdf", { Origin: "https://evil.example" })).status, 403);
    process.env.PDF_MAX_MB = "1";
    assert.equal((await upload(Buffer.concat([catalogueV2(), Buffer.alloc(1_100_000)]))).status, 413);
    delete process.env.PDF_MAX_MB;

    assert.deepEqual(await ask("Alpha Monitor price"), before);
    assert.deepEqual(
      (await readdir(dataDir)).sort(),
      ["document.pdf", "knowledge.json"],
      "no temporary files are left behind",
    );
  });

  test("9 & 13. a new PDF replaces the old one completely", async () => {
    assert.deepEqual(texts(await ask("Alpha Monitor price")), ["Price: $1,299"]);
    const { status, body } = await upload(catalogueV2(), "catalogue-v2.pdf");
    assert.equal(status, 200, body.error);
    assert.equal(body.document?.name, "catalogue-v2.pdf");

    const price = await ask("Alpha Monitor price");
    assert.deepEqual(texts(price), ["Price: $1,399"]);
    assert.equal(price.document?.name, "catalogue-v2.pdf");
    const battery = await ask("How long does the Alpha Monitor's battery last?");
    assert.match(texts(battery).join(" "), /24 hours/);
    for (const old of ["$1,299", "20 hours"]) {
      for (const question of ["Alpha Monitor price", "Alpha Monitor battery life", "price", "battery"]) {
        assert.ok(!JSON.stringify(await ask(question)).includes(old), `"${old}" came back for "${question}"`);
      }
    }
    const info = await fetch(`${base}/api/admin/document`, { headers: auth() }).then((r) => r.json());
    assert.equal(info.document.name, "catalogue-v2.pdf");
    assert.ok(Date.now() - Date.parse(info.document.updatedAt) < 60_000);
  });

  test("conflicting figures are both shown with their pages", async () => {
    assert.equal((await upload(conflicting(), "conflict.pdf")).status, 200);
    const reply = await ask("How much does the Delta Probe cost?");
    assert.deepEqual(
      reply.quotes.map((q) => [q.text, q.page]),
      [
        ["Price: $250", 1],
        ["Updated pricing: the Delta Probe now costs $275 including the carry case.", 2],
      ],
    );
    assert.match(reply.note ?? "", /different figures on pages 1 and 2/);
  });
});

describe("admin sign-in", () => {
  test("repeated wrong passwords lock the address out", async () => {
    for (let i = 0; i < 10; i += 1) await fetch(`${base}/admin`, { headers: auth("nope") });
    assert.equal((await fetch(`${base}/admin`, { headers: auth() })).status, 429);
  });
});
