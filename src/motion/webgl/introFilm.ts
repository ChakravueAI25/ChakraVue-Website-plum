import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LOGO_DISC, LOGO_GLYPHS } from "../../brand/logoData";
import { getGrade } from "../../theme/theme";
import { finePointer } from "../env";
import { fontsReady } from "../fonts";
import { gsap } from "../gsap";
import { playKid } from "../introKid";

/*
 * The intro as one continuous shot, rendered live.
 *
 *  1. Lamp light on an 1887 engineering sheet. The camera starts close on the
 *     gears and drifts back as the title "Transformation from Analog to AI"
 *     tracks in, with dust turning in the light.
 *  2. Warm light leaks through a crack that runs down the sheet, spitting
 *     paper fibres. The right side peels back in a real curl (its reverse
 *     shows, lit from behind) and is pulled away past the camera.
 *  3. Behind the paper, in depth, "VUE AI" powers on letter by letter. The
 *     full name and logo are there too, but the tear only uncovers "VUE AI".
 *  4. The rest of the sheet peels away, the name closes up and centres, and
 *     the logo's glyphs light in a sweep. The camera then dives into the
 *     black of the disc, which becomes the dark the page opens out of.
 */

const SHEET_WIDE = "/images/intro/archive-sheet-wide.webp";
const SHEET_TALL = "/images/intro/archive-sheet.webp";
const FOV = 30;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const REST_Z = 10;
const TEXT_Z = -0.9;
const GLOW_Z = -1.6;
const TEAR_SAMPLES = 1024;
const FONT_PX = 220;
const EMBER = [1, 0.5, 0.16];

// The title keeps its ink colours whatever the palette (inline, so the
// palette rewrite leaves them alone).
const TITLE_TOKENS = "--ink:#22150a;--rust:#a8470c;--scrim:rgba(245,235,213,.86)";

type Pt = [number, number];

const played = (tl: gsap.core.Animation) => new Promise<void>((resolve) => tl.eventCallback("onComplete", () => resolve()));

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The palette's grade applied to an sRGB colour, returned as a (linear) THREE.Color. */
function graded(rgb: number[]) {
  const m = getGrade();
  const [r, g, b] = m
    ? [0, 1, 2].map((i) => Math.min(1, Math.max(0, m[i * 4] * rgb[0] + m[i * 4 + 1] * rgb[1] + m[i * 4 + 2] * rgb[2] + m[i * 4 + 3])))
    : rgb;
  return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
}

/**
 * The tear, as x (world units) at TEAR_SAMPLES heights from bottom to top: a
 * slow sway with ragged bites and fibre jitter, held straight through `band`
 * (the rows of the name behind it) so it passes cleanly between two letters.
 */
function tearLine(cx: number, reach: number, ph: number, band: [number, number]) {
  const rand = seeded(1887);
  const sway = reach / 1.45;
  const knots = Array.from({ length: 16 }, () => rand() - 0.5);
  const xs = new Float32Array(TEAR_SAMPLES);
  for (let i = 0; i < TEAR_SAMPLES; i++) {
    const t = i / (TEAR_SAMPLES - 1);
    const y = (t - 0.5) * ph;
    const k = t * (knots.length - 1);
    const j = Math.min(knots.length - 2, Math.floor(k));
    const f = k - j;
    const bite = knots[j] + (knots[j + 1] - knots[j]) * (f * f * (3 - 2 * f));
    const off = Math.max(band[0] - y, y - band[1], 0);
    const free = Math.min(1, off / (ph * 0.08));
    const hold = free * free * (3 - 2 * free);
    const jitter = (rand() - 0.5) * reach * 0.12;
    xs[i] = cx + (sway * Math.sin(t * Math.PI * 2.1 + 0.6) + bite * sway * 0.9) * hold + jitter * (0.3 + 0.7 * hold);
  }
  return xs;
}

const PAPER_VERT = /* glsl */ `
  attribute float aShade;
  varying vec2 vUv;
  varying vec3 vN;
  varying float vShade;
  void main() {
    vUv = uv;
    vShade = aShade;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }`;

const PAPER_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uTear;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform float uSide;
  uniform float uFront;
  uniform float uGlow;
  uniform float uLamp;
  uniform float uPW;
  uniform float uPH;
  uniform vec3 uEmber;
  uniform vec3 uBack;
  uniform vec3 uFibre;
  uniform vec3 uDesk;
  varying vec2 vUv;
  varying vec3 vN;
  varying float vShade;

  float hash(float x) { return fract(sin(x * 127.1) * 43758.5453); }
  float noise(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }
  float tearX(float v) {
    float n = ${TEAR_SAMPLES.toFixed(1)};
    float f = clamp(v, 0.0, 1.0) * (n - 1.0);
    float i = floor(f);
    float a = texture2D(uTear, vec2((i + 0.5) / n, 0.5)).r;
    float b = texture2D(uTear, vec2((min(i + 1.0, n - 1.0) + 0.5) / n, 0.5)).r;
    return mix(a, b, f - i);
  }

  void main() {
    float x = (vUv.x - 0.5) * uPW;
    float fray = (noise(vUv.y * 1400.0) - 0.5) * 0.012 + (noise(vUv.y * 380.0 + 7.0) - 0.5) * 0.016;
    float inside = uSide * (x - tearX(vUv.y) - fray);
    float aa = max(fwidth(inside), 1e-5);
    float alpha = clamp(inside / aa + 0.5, 0.0, 1.0);
    if (alpha <= 0.0) discard;

    // Torn from the top down: only rows the front has passed show an edge.
    float edgeRow = 1.0 - uFront;
    float torn = smoothstep(edgeRow - 0.004, edgeRow + 0.004, vUv.y);

    vec3 N = normalize(vN);
    if (!gl_FrontFacing) N = -N;
    vec3 L = normalize(vec3(-0.35, 0.45, 1.0));
    float lit = (0.3 + 0.7 * max(dot(N, L), 0.0) / 0.866) * uLamp;

    vec3 col;
    if (gl_FrontFacing) {
      vec4 t = texture2D(uMap, vUv * uUvScale + uUvOffset);
      col = mix(uDesk, t.rgb, t.a);
    } else {
      // The reverse: plain stock with the drawing faintly showing through,
      // warmed by the light behind the sheet.
      vec4 t = texture2D(uMap, vec2(1.0 - vUv.x, vUv.y) * uUvScale + uUvOffset);
      col = mix(uBack, t.rgb * uBack, 0.16 * t.a) + uEmber * uGlow * 0.18;
    }
    col *= lit * (1.0 - vShade);

    // The white core of the paper along the tear, frayed.
    float fibreW = 0.028 * (0.45 + noise(vUv.y * 160.0 + uSide * 3.0));
    float fibre = torn * (1.0 - smoothstep(fibreW * 0.55, fibreW, inside));
    col = mix(col, uFibre * max(lit, 0.85), fibre);
    // Light from behind glows through the torn edge.
    col += uEmber * uGlow * 0.9 * torn * (1.0 - smoothstep(0.0, fibreW * 2.2, inside));
    // A hot bead of light where the paper is tearing right now.
    float bead = exp(-pow((vUv.y - edgeRow) * uPH / 0.22, 2.0)) * step(0.002, uFront) * step(uFront, 0.998);
    col += uEmber * 4.0 * bead * (1.0 - smoothstep(0.0, 0.07, inside));

    gl_FragColor = vec4(col, alpha);
  }`;

const TEXT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

// "CHAKRA" and "VUE AI": uEdges split the word into letters, each with its own power.
const TEXT_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHot;
  uniform float uLetters[6];
  uniform float uEdges[7];
  uniform float uPerLetter;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(uMap, vUv);
    float k = uHot;
    if (uPerLetter > 0.5) {
      float p = 1.0;
      for (int i = 0; i < 6; i++) {
        if (vUv.x >= uEdges[i] && vUv.x < uEdges[i + 1]) p = uLetters[i];
      }
      k *= p;
    }
    gl_FragColor = vec4(t.rgb * k, t.a);
  }`;

// The logo: glyphs light in a clockwise sweep from the top, with a bright front.
const LOGO_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uSweep;
  uniform float uHot;
  uniform vec3 uEmber;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(uMap, vUv);
    vec2 p = vUv - 0.5;
    float a = fract(atan(p.x, p.y) / 6.2831853 + 1.0);
    float on = smoothstep(a - 0.004, a + 0.004, uSweep);
    float front = exp(-pow((uSweep - a) * 18.0, 2.0)) * on;
    vec3 col = t.rgb * mix(0.14, uHot, on) + uEmber * t.r * front * 3.0;
    gl_FragColor = vec4(col, t.a);
  }`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uEmber;
  uniform float uGlow;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - r), 3.2);
    gl_FragColor = vec4(uEmber * uGlow * a * 0.32, 1.0);
  }`;

const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPR;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPR * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGain;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * uGain, a);
  }`;

// Finishing: lamp vignette, grain, a touch of chromatic fringing on the rip, fade.
const FILM_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 0 },
    uAberr: { value: 0 },
    uVignette: { value: 1 },
    uRes: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: TEXT_VERT,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFade;
    uniform float uAberr;
    uniform float uVignette;
    uniform vec2 uRes;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + c * uAberr).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - c * uAberr).b;
      float v = smoothstep(0.95, 0.3, length(c * vec2(1.0, 0.85)) * 1.2);
      col *= mix(1.0, mix(0.5, 1.0, v), uVignette);
      float g = fract(sin(dot(floor(vUv * uRes) + fract(uTime * 7.13) * 91.0, vec2(12.9898, 78.233))) * 43758.5453);
      col += (g - 0.5) * 0.045;
      gl_FragColor = vec4(col * uFade, 1.0);
    }`,
};

function textCanvas(text: string) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = `${FONT_PX}px "Audiowide"`;
  ctx.font = font;
  const m = ctx.measureText(text);
  const pad = Math.round(FONT_PX * 0.3);
  c.width = Math.ceil(m.width + pad * 2);
  c.height = Math.round(FONT_PX * 1.5);
  const asc = m.actualBoundingBoxAscent;
  const desc = m.actualBoundingBoxDescent;
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, pad, c.height / 2 + (asc - desc) / 2);
  // Letter boundaries (uv), for per-letter power.
  const edges = [0];
  for (let i = 1; i <= text.length; i++) edges.push((pad + ctx.measureText(text.slice(0, i)).width) / c.width);
  edges[0] = 0;
  edges[text.length] = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, width: c.width, height: c.height, pad, textW: m.width, ink: (asc + desc) / 2, edges };
}

function logoCanvas() {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.scale(size / 1000, size / 1000);
  ctx.translate(0, 16);
  ctx.fillStyle = "#000";
  ctx.fill(new Path2D(LOGO_DISC));
  ctx.fillStyle = "#fff";
  for (const g of LOGO_GLYPHS) ctx.fill(new Path2D(g.d), "evenodd");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Plays the film until the screen is black, ready for the page to open. Throws if WebGL can't run. */
export async function playFilm(root: HTMLElement, ready: Promise<unknown>): Promise<(opening: Promise<void>) => void> {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  const portrait = h > w;

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  const pr = Math.min(window.devicePixelRatio || 1, portrait ? 1.5 : 1.75);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x050302, 1);

  // The name is drawn into a canvas, so the typeface must really be in first.
  const typeface = fontsReady.then(async () => {
    for (let i = 0; i < 20 && !document.fonts.check(`${FONT_PX}px "Audiowide"`); i++) {
      await document.fonts.load(`${FONT_PX}px "Audiowide"`).catch(() => undefined);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  const [map] = await Promise.all([new THREE.TextureLoader().loadAsync(portrait ? SHEET_TALL : SHEET_WIDE), typeface]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.01, 60);

  // The sheet fills the view at rest, with room for the camera to drift.
  const viewH = 2 * REST_Z * TAN;
  const viewW = viewH * aspect;
  const PW = viewW * 1.1;
  const PH = viewH * 1.1;
  const img = map.image as { width: number; height: number };
  const ia = img.width / img.height;
  const pa = PW / PH;
  const uvScale = ia > pa ? new THREE.Vector2(pa / ia, 1) : new THREE.Vector2(1, ia / pa);
  const uvOffset = new THREE.Vector2((1 - uvScale.x) / 2, (1 - uvScale.y) / 2);

  // Where the camera holds for the glimpse, and the screen <-> world mapping there.
  const G = { x: viewW * (portrait ? 0.02 : 0.035), z: 9.35 };
  const worldX = (s: number, z: number, cx = G.x, cz = G.z) => cx + (s - 0.5) * 2 * (cz - z) * TAN * aspect;
  const tearScreen = portrait ? 0.52 : 0.56;
  const tearX = worldX(tearScreen, 0);

  // The name behind the paper. Font size as a fraction of the screen height.
  const fontFrac = portrait ? (0.074 * w) / h : 0.1;
  const fontWorld = fontFrac * 2 * (G.z - TEXT_Z) * TAN;
  const k = fontWorld / FONT_PX;
  const gapFrac = (0.6 * fontFrac * h) / w;
  const chakra = textCanvas("Chakra");
  const vue = textCanvas("Vue AI");

  const vueLeft = worldX(tearScreen + gapFrac / 2, TEXT_Z);
  const chakraRight = worldX(tearScreen - gapFrac / 2, TEXT_Z);
  const gapWorld = vueLeft - chakraRight;
  const vuePlaneX = vueLeft - vue.pad * k + (vue.width * k) / 2;
  const chakraLeft = chakraRight - chakra.textW * k;
  const chakraPlaneX = chakraLeft - chakra.pad * k + (chakra.width * k) / 2;
  const logoSize = fontWorld * 1.34;
  const logoX = chakraLeft - fontWorld * 0.2 - logoSize / 2;

  // The tear runs straight through the gap across the rows of the name.
  const inkHalf = Math.max(chakra.ink, vue.ink) * k + fontWorld * 0.12;
  const toPaper = G.z / (G.z - TEXT_Z);
  const band: [number, number] = [-inkHalf * toPaper, inkHalf * toPaper];
  const tearXs = tearLine(tearX, portrait ? viewW * 0.05 : Math.min(viewW * 0.035, 0.3), PH, band);
  const tearTex = new THREE.DataTexture(tearXs, TEAR_SAMPLES, 1, THREE.RedFormat, THREE.FloatType);
  tearTex.needsUpdate = true;
  const tearAt = (y: number) => tearXs[Math.round(THREE.MathUtils.clamp((y / PH + 0.5) * (TEAR_SAMPLES - 1), 0, TEAR_SAMPLES - 1))];

  const ember = graded(EMBER);
  const shared = {
    uMap: { value: map },
    uTear: { value: tearTex },
    uUvScale: { value: uvScale },
    uUvOffset: { value: uvOffset },
    uFront: { value: 0 },
    uGlow: { value: 0 },
    uLamp: { value: 1 },
    uPW: { value: PW },
    uPH: { value: PH },
    uEmber: { value: ember },
    uBack: { value: new THREE.Color("#d8c8a8") },
    uFibre: { value: new THREE.Color("#f6eedd") },
    uDesk: { value: new THREE.Color("#0d0906") },
  };

  const seg = portrait ? [80, 150] : [150, 90];
  const makePiece = (side: number) => {
    const geo = new THREE.PlaneGeometry(PW, PH, seg[0], seg[1]);
    geo.setAttribute("aShade", new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count), 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uSide: { value: side } },
      vertexShader: PAPER_VERT,
      fragmentShader: PAPER_FRAG,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = side > 0 ? 3 : 2;
    scene.add(mesh);
    return { mesh, geo, base: Float32Array.from(geo.attributes.position.array as Float32Array) };
  };
  const left = makePiece(-1);
  const right = makePiece(1);

  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uEmber: shared.uEmber, uGlow: { value: 0 } },
    vertexShader: TEXT_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(viewW * 0.95, viewW * 0.95), glowMat);
  glow.position.set(vuePlaneX, 0, GLOW_Z);
  glow.renderOrder = -1;
  scene.add(glow);

  const textPlane = (t: ReturnType<typeof textCanvas>, perLetter: boolean) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: t.tex },
        uHot: { value: 1 },
        uLetters: { value: [0, 0, 0, 0, 0, 0] },
        uEdges: { value: t.edges.length === 7 ? t.edges : [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] },
        uPerLetter: { value: perLetter ? 1 : 0 },
      },
      vertexShader: TEXT_VERT,
      fragmentShader: TEXT_FRAG,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(t.width * k, t.height * k), mat);
    mesh.position.z = TEXT_Z;
    scene.add(mesh);
    return mesh;
  };
  const lockup = new THREE.Group();
  scene.add(lockup);
  const chakraMesh = textPlane(chakra, false);
  const vueMesh = textPlane(vue, true);
  chakraMesh.position.x = chakraPlaneX;
  vueMesh.position.x = vuePlaneX;
  const logoMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: logoCanvas() }, uSweep: { value: 0 }, uHot: { value: 1.1 }, uEmber: shared.uEmber },
    vertexShader: TEXT_VERT,
    fragmentShader: LOGO_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(logoSize, logoSize), logoMat);
  logo.position.set(logoX, 0, TEXT_Z);
  lockup.add(chakraMesh, vueMesh, logo);

  // Dust turning in the lamp light.
  const DUST = portrait ? 140 : 240;
  const dustRand = seeded(7);
  const dustPos = new Float32Array(DUST * 3);
  const dustVel = new Float32Array(DUST * 3);
  const dustSize = new Float32Array(DUST);
  const dustAlpha = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (dustRand() - 0.5) * viewW * 1.3;
    dustPos[i * 3 + 1] = (dustRand() - 0.5) * viewH * 1.3;
    dustPos[i * 3 + 2] = 0.3 + dustRand() * 6.5;
    dustVel[i * 3] = (dustRand() - 0.5) * 0.05;
    dustVel[i * 3 + 1] = (dustRand() - 0.3) * 0.04;
    dustVel[i * 3 + 2] = (dustRand() - 0.5) * 0.03;
    dustSize[i] = 1.5 + dustRand() * 4;
    dustAlpha[i] = 0.15 + dustRand() * 0.45;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dustSize, 1));
  dustGeo.setAttribute("aAlpha", new THREE.BufferAttribute(dustAlpha, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: pr }, uColor: { value: new THREE.Color("#fff1d6") }, uGain: { value: 0.5 } },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.renderOrder = 5;
  scene.add(dust);

  // Paper fibres thrown off the tear.
  const FIB = portrait ? 380 : 700;
  const fibPos = new Float32Array(FIB * 3);
  const fibVel = new Float32Array(FIB * 3);
  const fibLife = new Float32Array(FIB);
  const fibSize = new Float32Array(FIB);
  const fibAlpha = new Float32Array(FIB);
  fibPos.fill(-999);
  const fibGeo = new THREE.BufferGeometry();
  fibGeo.setAttribute("position", new THREE.BufferAttribute(fibPos, 3));
  fibGeo.setAttribute("aSize", new THREE.BufferAttribute(fibSize, 1));
  fibGeo.setAttribute("aAlpha", new THREE.BufferAttribute(fibAlpha, 1));
  const fibMat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: pr }, uColor: { value: new THREE.Color("#f3e7cf") }, uGain: { value: 1.05 } },
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const fibres = new THREE.Points(fibGeo, fibMat);
  fibres.renderOrder = 6;
  fibres.frustumCulled = false;
  scene.add(fibres);
  let fibNext = 0;
  const fibRand = seeded(33);
  const spawn = (y: number, n: number, burst = false) => {
    for (let i = 0; i < n; i++) {
      const j = fibNext++ % FIB;
      const yy = burst ? (fibRand() - 0.5) * PH * 0.9 : y + (fibRand() - 0.5) * 0.08;
      fibPos[j * 3] = tearAt(yy) + (fibRand() - 0.5) * 0.04;
      fibPos[j * 3 + 1] = yy;
      fibPos[j * 3 + 2] = 0.02 + fibRand() * 0.05;
      fibVel[j * 3] = (fibRand() - 0.35) * (burst ? 1.6 : 0.9);
      fibVel[j * 3 + 1] = (fibRand() - 0.2) * 0.7;
      fibVel[j * 3 + 2] = 0.4 + fibRand() * (burst ? 2.4 : 1.4);
      fibLife[j] = 0.9 + fibRand() * 0.9;
      fibSize[j] = 1.2 + fibRand() * 3.4;
    }
  };

  // Post: bloom on the lit name and the light through the tear, then the film finish.
  const target = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(pr);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.5, 0.3, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const film = new ShaderPass(FILM_SHADER);
  film.uniforms.uRes.value.set(w * pr, h * pr);
  composer.addPass(film);

  const canvas = renderer.domElement;
  canvas.className = "film";
  canvas.setAttribute("aria-hidden", "true");

  const title = document.createElement("div");
  title.className = "film__title";
  title.setAttribute("style", TITLE_TOKENS);
  title.innerHTML = `
    <p class="film__t1">${[..."TRANSFORMATION"].map((c) => `<span>${c}</span>`).join("")}</p>
    <p class="film__t2">from Analog to <em>AI</em></p>`;
  const hint = document.createElement("p");
  hint.className = "film__skip";
  hint.textContent = `${finePointer ? "Click" : "Tap"} to skip`;
  root.append(canvas, title, hint);

  // Everything the shot animates.
  const S = {
    camX: viewW * 0.07,
    camY: -viewH * 0.05,
    camZ: 7.3,
    roll: 0.025,
    shake: 0,
    front: 0,
    crack: 0,
    peel: 0,
    pull: 0,
    peelL: 0,
    pullL: 0,
    glow: 0,
    shift: 0,
    close: 0,
    sweep: 0,
    // The name's brightness, just over the bloom threshold (1) so it
    // keeps a faint glow without glaring.
    hot: 1.02,
    vue: [0, 0, 0, 0, 0, 0],
    fade: 0,
    aberr: 0,
    bloom: 0.5,
  };

  // The curl: vertices past the (moving, tilted) axis wrap round a cylinder
  // of radius r and fold back over; the flat paper just before it is shaded.
  const deform = (piece: typeof left, amount: number, nx: number, ny: number, crack: number, front: number) => {
    const pos = piece.geo.attributes.position.array as Float32Array;
    const shade = piece.geo.attributes.aShade.array as Float32Array;
    const top = PH / 2;
    const x0 = tearAt(top);
    const span = nx < 0 ? 0.8 * (PW / 2 - x0) + 0.6 * PH : 0.8 * (x0 + PW / 2) + 0.6 * PH;
    const ax = x0 + nx * 0.02 - nx * amount * span;
    const ay = top + ny * 0.02 - ny * amount * span;
    const r = 0.22 + 0.9 * amount;
    const frontY = top - front * PH;
    const dir = nx < 0 ? 1 : -1;
    for (let i = 0; i < pos.length / 3; i++) {
      let x = piece.base[i * 3];
      let y = piece.base[i * 3 + 1];
      let z = 0;
      const t = THREE.MathUtils.smoothstep(y, frontY - 0.35, frontY + 0.05);
      x += dir * crack * t;
      z += crack * 0.6 * t;
      const s = (x - ax) * nx + (y - ay) * ny;
      if (s > 0 && amount > 0) {
        const px = x - nx * s;
        const py = y - ny * s;
        if (s < Math.PI * r) {
          const th = s / r;
          x = px + nx * r * Math.sin(th);
          y = py + ny * r * Math.sin(th);
          z += r * (1 - Math.cos(th));
        } else {
          x = px - nx * (s - Math.PI * r);
          y = py - ny * (s - Math.PI * r);
          z += 2 * r;
        }
        shade[i] = 0;
      } else {
        shade[i] = amount > 0 && s > -1.5 * r ? (1 + s / (1.5 * r)) * 0.45 * Math.min(1, amount * 10) : 0;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    piece.geo.attributes.position.needsUpdate = true;
    piece.geo.attributes.aShade.needsUpdate = true;
    piece.geo.computeVertexNormals();
  };
  const RN = new THREE.Vector2(-0.8, 0.6);
  const LN = new THREE.Vector2(0.8, 0.6);
  let lastR = "";
  let lastL = "";
  let lastFront = 0;

  let clock = performance.now();
  const render = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - clock) / 1000);
    clock = now;
    const t = now / 1000;

    // A hand-held drift, plus a shiver as the paper gives.
    const hx = Math.sin(t * 0.63) * 0.018 + Math.sin(t * 1.37) * 0.008 + (Math.random() - 0.5) * S.shake * 0.05;
    const hy = Math.sin(t * 0.51 + 1.3) * 0.014 + Math.sin(t * 1.11) * 0.006 + (Math.random() - 0.5) * S.shake * 0.05;
    camera.position.set(S.camX + hx, S.camY + hy, S.camZ);
    camera.lookAt(S.camX + hx * 0.4, S.camY + hy * 0.4, S.camZ - 10);
    camera.rotateZ(S.roll + Math.sin(t * 0.4) * 0.002);

    // The paper.
    const front = Math.min(1, S.front);
    const keyR = `${S.peel.toFixed(4)}|${S.crack.toFixed(4)}|${front.toFixed(4)}`;
    if (keyR !== lastR) {
      deform(right, S.peel, RN.x, RN.y, S.crack, front);
      lastR = keyR;
    }
    const keyL = `${S.peelL.toFixed(4)}|${front.toFixed(4)}`;
    if (keyL !== lastL) {
      deform(left, S.peelL, LN.x, LN.y, S.crack * 0.25, front);
      lastL = keyL;
    }
    right.mesh.position.set(S.pull * PW * 0.7, -S.pull * PH * 0.2, S.pull * 3.4);
    right.mesh.rotation.set(0, S.pull * 0.5, -S.pull * 0.28);
    left.mesh.position.set(-S.pullL * PW * 0.7, -S.pullL * PH * 0.16, S.pullL * 3);
    left.mesh.rotation.set(0, -S.pullL * 0.5, S.pullL * 0.24);
    right.mesh.visible = S.pull < 0.999;
    left.mesh.visible = S.pullL < 0.999;
    shared.uFront.value = front;
    shared.uGlow.value = S.glow;
    shared.uLamp.value = 1 + Math.sin(t * 9.1) * 0.006 + Math.sin(t * 23.7) * 0.004;
    glowMat.uniforms.uGlow.value = S.glow;

    // Fibres spit from the front as it runs, then fall away.
    if (front > lastFront) {
      spawn(PH / 2 - front * PH, Math.ceil((front - lastFront) * (portrait ? 260 : 420)));
      lastFront = front;
    }
    for (let i = 0; i < FIB; i++) {
      if (fibLife[i] <= 0) {
        fibAlpha[i] = 0;
        continue;
      }
      fibLife[i] -= dt;
      fibVel[i * 3 + 1] -= dt * 1.1;
      fibPos[i * 3] += fibVel[i * 3] * dt;
      fibPos[i * 3 + 1] += fibVel[i * 3 + 1] * dt;
      fibPos[i * 3 + 2] += fibVel[i * 3 + 2] * dt;
      fibAlpha[i] = Math.min(1, fibLife[i] * 1.6) * 0.9;
    }
    fibGeo.attributes.position.needsUpdate = true;
    fibGeo.attributes.aAlpha.needsUpdate = true;
    fibGeo.attributes.aSize.needsUpdate = true;
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] += dustVel[i * 3] * dt + Math.sin(t * 0.3 + i) * 0.0004;
      dustPos[i * 3 + 1] += dustVel[i * 3 + 1] * dt;
      dustPos[i * 3 + 2] += dustVel[i * 3 + 2] * dt;
      if (dustPos[i * 3 + 1] > viewH * 0.7) dustPos[i * 3 + 1] = -viewH * 0.7;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dustMat.uniforms.uGain.value = 0.45 + S.glow * 0.5;

    // The name.
    lockup.position.x = S.shift;
    vueMesh.position.x = vuePlaneX - gapWorld * S.close;
    (vueMesh.material as THREE.ShaderMaterial).uniforms.uLetters.value = S.vue;
    (vueMesh.material as THREE.ShaderMaterial).uniforms.uHot.value = S.hot;
    (chakraMesh.material as THREE.ShaderMaterial).uniforms.uHot.value = S.hot;
    logoMat.uniforms.uSweep.value = S.sweep;
    glow.position.x = vuePlaneX + (logoX - vuePlaneX) * S.close * 0.5 + S.shift;

    bloom.strength = S.bloom;
    film.uniforms.uTime.value = t;
    film.uniforms.uFade.value = S.fade;
    film.uniforms.uAberr.value = S.aberr;
    composer.render(dt);
  };
  gsap.ticker.add(render);

  const onResize = () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
    composer.setSize(nw, nh);
    film.uniforms.uRes.value.set(nw * pr, nh * pr);
  };
  window.addEventListener("resize", onResize);

  // Skipping hurries the shot; the page still has to be ready.
  let skipped = false;
  let current: gsap.core.Timeline | null = null;
  const onSkip = (e: Event) => {
    if (e instanceof KeyboardEvent && !["Escape", "Enter", " "].includes(e.key)) return;
    skipped = true;
    current?.timeScale(3);
  };
  root.addEventListener("pointerdown", onSkip);
  window.addEventListener("keydown", onSkip);

  const chars = title.querySelectorAll(".film__t1 span");
  const t2 = title.querySelector(".film__t2")!;

  // 0. The lamp comes up on the bare sheet (no title yet), and the
  //    campaign's kid flies in, says hi and flies off (introKid.ts).
  gsap.set([chars, t2, hint], { autoAlpha: 0 });
  current = gsap.timeline().to(S, { fade: 1, duration: 1.1, ease: "power2.out" });
  await played(current);
  await playKid(root, () => skipped);

  // 1. The camera drifts back as the title tracks in.
  current = gsap
    .timeline()
    .to(S, { fade: 1, duration: 1.3, ease: "power2.out" }, 0)
    .to(S, { camX: 0, camY: 0, camZ: REST_Z, roll: 0, duration: 3.6, ease: "power2.inOut" }, 0)
    .fromTo(title, { letterSpacing: portrait ? "0.24em" : "0.62em" }, { letterSpacing: portrait ? "0.08em" : "0.34em", duration: 3.2, ease: "power2.out" }, 0.6)
    .fromTo(
      chars,
      { autoAlpha: 0, filter: "blur(12px)", yPercent: 30 },
      { autoAlpha: 1, filter: "blur(0px)", yPercent: 0, duration: 1.1, stagger: { each: 0.045, from: "center" }, ease: "power3.out" },
      0.7,
    )
    .fromTo(t2, { autoAlpha: 0, y: 14, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }, 1.5)
    .fromTo(title, { "--scrim-a": 0 }, { "--scrim-a": 1, duration: 1 }, 0.5)
    .fromTo(hint, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.8)
    .to(chars, { autoAlpha: 0, filter: "blur(10px)", duration: 0.6, stagger: { each: 0.02, from: "edges" }, ease: "power2.in" }, 3.0)
    .to(t2, { autoAlpha: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" }, 3.0)
    .to(title, { "--scrim-a": 0, duration: 0.7 }, 3.05);
  if (skipped) current.timeScale(3);
  await played(current);
  await ready;
  hint.remove();

  // 2-4. The tear, the glimpse, the name, the dive.
  // Centre the closed-up name: from the logo's left edge to the end of "VUE AI".
  const vueTextRight = vuePlaneX - gapWorld - (vue.width * k) / 2 + (vue.pad + vue.textW) * k;
  const shiftTo = -(logoX - logoSize / 2 + vueTextRight) / 2;
  const finalLogoX = logoX + shiftTo;
  const flicker = [0, 1.15, 0.3, 1.08, 0.6, 1.02];
  current = gsap
    .timeline()
    // The paper gives: a shiver, light behind the crack, then the rip runs down.
    .to(S, { shake: 1, duration: 0.15, yoyo: true, repeat: 3, ease: "none" }, 0)
    .to(S, { glow: 0.55, duration: 0.5, ease: "power2.out" }, 0)
    .to(S, { front: 1, duration: 1.05, ease: "power2.in" }, 0.15)
    .to(S, { crack: 0.07, duration: 1.1, ease: "power2.out" }, 0.2)
    .to(S, { aberr: 0.006, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 0.9)
    .to(S, { shake: 0.6, duration: 0.1, yoyo: true, repeat: 1 }, 1.05)
    // The right side curls back and is pulled away past the camera.
    .to(S, { peel: 0.5, duration: 1.5, ease: "power2.inOut" }, 0.55)
    .to(S, { pull: 1, duration: 1.35, ease: "power2.in" }, 1.35)
    .call(() => spawn(0, portrait ? 160 : 260, true), [], 1.5)
    .to(S, { camX: G.x, camZ: G.z, duration: 2.8, ease: "cv.inOut" }, 0.3)
    .to(S, { glow: 1.1, duration: 1.4, ease: "power2.out" }, 1.0)
    // Softer bloom once the name is lit, so its glow stays gentle.
    .to(S, { bloom: 0.24, duration: 0.8, ease: "power2.out" }, 1.4);
  // "VUE AI" powers on, letter by letter, with a flicker.
  S.vue.forEach((_, i) => {
    const steps = flicker.map((v) => ({ [i]: v, duration: 0.07 }) as gsap.TweenVars).concat([{ [i]: 1, duration: 0.3 } as gsap.TweenVars]);
    current!.to(S.vue, { keyframes: steps }, 1.45 + i * 0.09);
  });
  current
    // After the glimpse: the rest of the sheet goes and the name comes together.
    .to(S, { peelL: 0.5, duration: 1.2, ease: "power2.inOut" }, 3.25)
    .to(S, { pullL: 1, duration: 1.1, ease: "power2.in" }, 3.8)
    .to(S, { close: 1, shift: shiftTo, duration: 1.4, ease: "cv.inOut" }, 3.4)
    .to(S, { camX: 0, camZ: 9.0, duration: 1.6, ease: "cv.inOut" }, 3.3)
    .to(S, { sweep: 1, duration: 1.0, ease: "power1.inOut" }, 4.0)
    // The dive: into the black of the disc, while the glyphs rush past.
    .to(S, { camX: finalLogoX, camZ: TEXT_Z + 0.05, duration: 1.35, ease: "power3.in" }, 5.3)
    .to(S, { glow: 0, duration: 1.1, ease: "power2.in" }, 5.4)
    .to(S, { bloom: 0.05, hot: 0.55, duration: 1.1, ease: "power2.in" }, 5.5)
    .to(S, { aberr: 0.008, duration: 1.2, ease: "power3.in" }, 5.4);
  if (skipped) current.timeScale(2.4);
  await played(current);

  root.removeEventListener("pointerdown", onSkip);
  window.removeEventListener("keydown", onSkip);

  return () => {
    gsap.ticker.remove(render);
    window.removeEventListener("resize", onResize);
    canvas.remove();
    title.remove();
    composer.dispose();
    target.dispose();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mat) => mat.dispose());
    });
    map.dispose();
    tearTex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
