/**
 * The admin upload page, served by the server itself (not part of the public
 * React bundle). Shows the document in use, uploads a replacement, and has a
 * box for trying a question against it. Ember colours, as the site's
 * stylesheets are written; the page sits outside the palette engine.
 */
export function adminPage(nonce: string, maxBytes: number) {
  const maxMb = Math.round(maxBytes / 1048576);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Product Assistant admin</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" nonce="${nonce}">
<style nonce="${nonce}">
  :root { color-scheme: dark; --ink: #fff3e7; --muted: #c99b78; --amber: #ff8b12; --line: rgba(255, 139, 18, 0.28); }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: #0b0908; color: var(--ink); font: 14px/1.6 "Audiowide", Arial, sans-serif; }
  main { width: min(720px, 100% - 32px); margin: 0 auto; padding: 48px 0 64px; }
  h1 { margin: 0 0 4px; font-size: 24px; font-weight: 400; }
  h2 { margin: 0 0 14px; font-size: 15px; font-weight: 400; color: #ffb46a; }
  .lead { margin: 0 0 32px; color: var(--muted); font-size: 12px; }
  section { margin-bottom: 20px; padding: 20px; border: 1px solid var(--line); border-radius: 16px; background: #141010; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; margin: 0; font-size: 13px; }
  dt { color: var(--muted); }
  dd { margin: 0; overflow-wrap: anywhere; }
  .empty { margin: 0; color: var(--muted); }
  input[type=file] { display: block; width: 100%; margin: 0 0 12px; padding: 12px; border: 1px dashed var(--line); border-radius: 12px; background: #0b0908; color: var(--ink); font: inherit; font-size: 12px; }
  input[type=text] { width: 100%; padding: 11px 12px; border: 1px solid var(--line); border-radius: 12px; background: #0b0908; color: var(--ink); font: inherit; font-size: 14px; }
  button { height: 42px; padding: 0 18px; border: 0; border-radius: 12px; background: var(--amber); color: #1a0d03; font: inherit; font-size: 13px; cursor: pointer; }
  button:disabled { opacity: 0.45; cursor: default; }
  .row { display: flex; gap: 8px; }
  .row input { flex: 1; min-width: 0; }
  .hint { margin: 10px 0 0; color: var(--muted); font-size: 11px; }
  .status { margin: 12px 0 0; padding: 10px 12px; border-radius: 10px; font-size: 13px; }
  .status[hidden] { display: none; }
  .ok { border: 1px solid rgba(110, 200, 120, 0.5); background: rgba(110, 200, 120, 0.1); }
  .bad { border: 1px solid rgba(228, 20, 16, 0.55); background: rgba(228, 20, 16, 0.1); }
  .busy { border: 1px solid var(--line); background: rgba(255, 139, 18, 0.08); }
  .answer { margin-top: 12px; font-size: 13px; }
  .answer p { margin: 0 0 8px; }
  .answer small { color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>Product Assistant</h1>
  <p class="lead">The chat answers only from the PDF below. Upload a new one whenever product information changes.</p>

  <section aria-labelledby="current-title">
    <h2 id="current-title">Document in use</h2>
    <div id="current"><p class="empty">Loading…</p></div>
  </section>

  <section aria-labelledby="upload-title">
    <h2 id="upload-title">Upload or replace the PDF</h2>
    <input id="file" type="file" accept="application/pdf,.pdf" aria-label="PDF file">
    <button id="upload" type="button" disabled>Upload and process</button>
    <p class="hint">Text-based PDFs only (exported from Word, Google Docs and similar), up to ${maxMb} MB. The new file replaces the current one only after it has been processed successfully.</p>
    <p id="upload-status" class="status" role="status" hidden></p>
  </section>

  <section aria-labelledby="try-title">
    <h2 id="try-title">Try a question</h2>
    <form id="try" class="row">
      <input id="question" type="text" maxlength="500" placeholder="For example: What does the product cost?" aria-label="Question">
      <button type="submit">Ask</button>
    </form>
    <div id="answer" class="answer" aria-live="polite"></div>
  </section>
</main>
<script nonce="${nonce}">
  const $ = (id) => document.getElementById(id);
  const MAX = ${maxBytes};
  const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const fmtSize = (bytes) => bytes > 1048576 ? (bytes / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(bytes / 1024)) + " KB";

  function el(tag, text, cls) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }

  function showDocument(doc) {
    const box = $("current");
    box.replaceChildren();
    if (!doc) {
      box.append(el("p", "No document uploaded yet. The chat tells visitors it can't answer until one is.", "empty"));
      return;
    }
    const list = el("dl");
    for (const [label, value] of [
      ["File", doc.name],
      ["Last updated", fmtDate(doc.updatedAt)],
      ["Pages", String(doc.pages)],
      ["Passages indexed", String(doc.passages)],
      ["Size", fmtSize(doc.bytes)],
    ]) list.append(el("dt", label), el("dd", value));
    box.append(list);
  }

  function status(text, kind) {
    const node = $("upload-status");
    node.hidden = false;
    node.className = "status " + kind;
    node.textContent = text;
  }

  async function load() {
    const res = await fetch("/api/admin/document", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    showDocument(data.document ?? null);
  }

  $("file").addEventListener("change", () => {
    const file = $("file").files[0];
    $("upload").disabled = !file;
    $("upload-status").hidden = true;
    if (file && !/\\.pdf$/i.test(file.name)) status("Please choose a .pdf file.", "bad");
    else if (file && file.size > MAX) status("That file is larger than ${maxMb} MB.", "bad");
  });

  $("upload").addEventListener("click", async () => {
    const file = $("file").files[0];
    if (!file) return;
    if (!/\\.pdf$/i.test(file.name)) return status("Please choose a .pdf file.", "bad");
    if (file.size > MAX) return status("That file is larger than ${maxMb} MB.", "bad");
    $("upload").disabled = true;
    status("Processing " + file.name + "…", "busy");
    try {
      const res = await fetch("/api/admin/document", {
        method: "POST",
        headers: { "Content-Type": "application/pdf", "X-File-Name": encodeURIComponent(file.name) },
        body: file,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showDocument(data.document);
        status("Done. The chat now answers from " + data.document.name + " (" + data.document.passages + " passages from " + data.document.pages + " pages).", "ok");
        $("file").value = "";
      } else {
        if ("document" in data) showDocument(data.document);
        status((data.error || "The upload failed.") + " The previous document is still in use.", "bad");
        $("upload").disabled = false;
      }
    } catch {
      status("The upload didn't reach the server. Check the connection and try again. The previous document is still in use.", "bad");
      $("upload").disabled = false;
    }
  });

  $("try").addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = $("question").value.trim();
    const box = $("answer");
    if (!question) return;
    box.replaceChildren(el("p", "Searching…", "empty"));
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
    const data = await res.json().catch(() => ({}));
    box.replaceChildren();
    if (!res.ok) return box.append(el("p", data.error || "No answer."));
    if (data.message) box.append(el("p", data.message));
    for (const quote of data.quotes || []) {
      const p = el("p", quote.text + " ");
      p.append(el("small", "(page " + quote.page + ")"));
      box.append(p);
    }
    if (data.note) box.append(el("p", data.note));
  });

  load();
</script>
</body>
</html>`;
}
