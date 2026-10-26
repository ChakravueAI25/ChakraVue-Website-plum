// Builds the static preview site in dist/ from the round 3 design pages in src/pages.
// Each page is a Design Component (.dc.html): a template with {{holes}}, <sc-for> and <sc-if>,
// plus a small logic class whose renderVals() supplies the data. We run the logic once per state,
// render the template to plain HTML, map asset and page links, and add site.js for interactivity.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseHTML } from 'linkedom';

const ROOT = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DIST = join(ROOT, 'dist');

const PAGES = [
  { src: 'R3Home.dc.html', out: 'index.html', route: '/', title: 'ChakraVue AI — AI in your hands, for every hospital',
    description: 'ChakraVue AI adds AI to the eye and dental equipment hospitals already own: Surgical Assistant, Slit Lamp Module, AI Powered EMR and Integrated Devices. Built in Secunderabad.' },
  { src: 'R3Products.dc.html', out: 'products/index.html', route: '/products/', title: 'Products — ChakraVue AI',
    description: 'Surgical Assistant, Slit Lamp Module, AI Powered EMR, Integrated Devices and the platforms around them.' },
  { src: 'R3About.dc.html', out: 'about/index.html', route: '/about/', title: 'About — ChakraVue AI',
    description: 'Doctors and engineers in Secunderabad, levelling the field for every hospital.' },
  { src: 'R3Insurance.dc.html', out: 'hospitals/insurance/index.html', route: '/hospitals/insurance/', title: 'Insurance forms, auto-filled — ChakraVue AI',
    description: 'Pre-auth, claim and query replies filled straight from the patient record.' },
  { src: 'R3Signup.dc.html', out: 'visit/index.html', route: '/visit/', title: 'Visit or try — ChakraVue AI',
    description: 'Book a visit to the ChakraVue AI Experience Centre in Secunderabad, or start a 90-day free trial.' },
  { src: 'R3Partners.dc.html', out: 'partners/index.html', route: '/partners/', title: 'Partners and OEMs — ChakraVue AI',
    description: 'Put AI inside the devices you make: slit lamps, microscopes and diagnostic equipment.' },
  { src: 'R3Components.dc.html', out: 'design-system/index.html', route: '/design-system/', title: 'UI components — ChakraVue AI',
    description: 'The blueprint button and component system used across the site.' },
];
const ROUTES = Object.fromEntries(PAGES.map((p) => [p.src, p.route]));

// asset id -> published file name
const ASSETS = Object.fromEntries(
  readFileSync(join(ROOT, 'src/assets-map.txt'), 'utf8').trim().split('\n')
    .map((l) => l.trim().split(/\s+/)).map(([id, , name]) => [id, name]));

class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(s) { Object.assign(this.state, typeof s === 'function' ? s(this.state) : s); }
  forceUpdate() {}
}

function parts(src) {
  const html = readFileSync(join(ROOT, 'src/pages', src), 'utf8');
  const helmet = (html.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
  const body = html.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const code = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
  const Component = new Function('DCLogic', `${code}\nreturn Component;`)(DCLogic);
  return { helmet, body, Component };
}

const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
function lookup(scope, path) {
  if (/^(true|false)$/.test(path)) return path === 'true';
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
}
const str = (v) => (v == null || typeof v === 'function' ? '' : String(v));

function renderNode(node, scope, document) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      if (child.textContent.includes('{{')) child.textContent = child.textContent.replace(HOLE, (_, p) => str(lookup(scope, p)));
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (tag === 'sc-for') {
      const list = lookup(scope, child.getAttribute('list').replace(HOLE, '$1').trim()) || [];
      const as = child.getAttribute('as');
      list.forEach((item, i) => {
        const frag = document.createElement('div');
        frag.innerHTML = child.innerHTML;
        renderNode(frag, { ...scope, [as]: item, $index: i }, document);
        for (const n of Array.from(frag.childNodes)) node.insertBefore(n, child);
      });
      child.remove();
      continue;
    }
    if (tag === 'sc-if') {
      const v = lookup(scope, child.getAttribute('value').replace(HOLE, '$1').trim());
      if (v) {
        renderNode(child, scope, document);
        for (const n of Array.from(child.childNodes)) node.insertBefore(n, child);
      }
      child.remove();
      continue;
    }
    for (const attr of Array.from(child.attributes)) {
      if (attr.name === 'ref' || /^on[a-z]/i.test(attr.name)) { child.removeAttribute(attr.name); continue; }
      if (attr.value.includes('{{')) child.setAttribute(attr.name, attr.value.replace(HOLE, (_, p) => str(lookup(scope, p))));
    }
    renderNode(child, scope, document);
  }
}

function render(body, vals) {
  const { document } = parseHTML(`<!doctype html><html><body><main id="root">${body}</main></body></html>`);
  const root = document.getElementById('root');
  renderNode(root, vals, document);
  return { document, root };
}

function mapUrls(html) {
  return html
    .replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => (ASSETS[id] ? `/assets/${ASSETS[id]}` : m))
    .replace(/(R3[A-Za-z]+\.dc\.html)/g, (m) => ROUTES[m] || '/')
    .replace(/\b([A-Za-z]+\.dc\.html)/g, '/');
}

function page(p) {
  const { helmet, body, Component } = parts(p.src);
  const logic = new Component({});
  const { document, root } = render(body, logic.renderVals());

  // Home: pre-render each audience tab so site.js can swap them without the design runtime
  if (p.src === 'R3Home.dc.html') {
    const ids = ['owner', 'doctor', 'surgeon', 'dentist', 'patient'];
    const findTabs = (r) => Array.from(r.querySelectorAll('section')).find((s) => s.querySelector('[role="tablist"][aria-label="Audience"]'));
    const views = {};
    for (const id of ids) {
      const l = new Component({}); l.state = { ...l.state, tab: id };
      const sec = findTabs(render(body, l.renderVals()).root);
      sec.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-tab', ids[i]));
      views[id] = sec.innerHTML;
    }
    const sec = findTabs(root);
    sec.setAttribute('data-tabs', '');
    sec.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-tab', ids[i]));
    const json = document.createElement('script');
    json.setAttribute('type', 'application/json');
    json.setAttribute('id', 'tab-views');
    json.textContent = JSON.stringify(views).replace(/</g, '\\u003c');
    root.appendChild(json);
    for (const b of root.querySelectorAll('button')) {
      if (b.textContent.trim() === 'Replay reveal') b.setAttribute('data-replay', '');
      if ((b.getAttribute('aria-label') || '').includes('background video')) b.setAttribute('data-video-toggle', '');
    }
  }
  if (p.src === 'R3Components.dc.html') {
    for (const b of root.querySelectorAll('button')) {
      if (b.textContent.trim() === 'Start the Journey') b.setAttribute('data-burn-demo', '');
      if (b.textContent.trim() === 'Reset') b.setAttribute('data-burn-reset', '');
    }
  }

  const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.description}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0A1220">
<link rel="icon" href="/assets/chakravue-logo.svg" type="image/svg+xml">
${helmet.trim()}
<link rel="stylesheet" href="/site.css">
</head>
<body>
<div class="preview-flag" role="note">Preview — not the live site</div>
`;
  return mapUrls(head + root.innerHTML + '\n<script src="/site.js" defer></script>\n</body>\n</html>\n');
}

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'site'), DIST, { recursive: true });
for (const p of PAGES) {
  const out = join(DIST, p.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(p));
  console.log('built', p.route);
}
