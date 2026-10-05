import * as THREE from "three";

/**
 * Screens and circuit boards, drawn in code so the models need no image
 * assets (the rugged cases' displays load captures of the real interfaces
 * instead; see `models/interfaces.ts`).
 * Everything is abstract UI (shapes, bars, retina imagery): no invented
 * clinical data or copy.
 */

const AMBER = "#ff8b12";
const WARM = "#ffc27a";
const LINE = "rgba(255, 170, 100, 0.28)";

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

function texture(w: number, h: number, draw: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Deterministic noise, so the artwork is identical on every load. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function panel(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 14, fill = "rgba(255,255,255,0.035)") {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
  g.strokeStyle = LINE;
  g.lineWidth = 2;
  g.stroke();
}

function bars(g: CanvasRenderingContext2D, x: number, y: number, w: number, rows: number, rnd: () => number, gap = 22) {
  for (let i = 0; i < rows; i++) {
    const len = w * (0.35 + rnd() * 0.6);
    g.fillStyle = i % 3 === 0 ? "rgba(255, 190, 130, 0.55)" : "rgba(255, 236, 225, 0.22)";
    g.beginPath();
    g.roundRect(x, y + i * gap, len, 8, 4);
    g.fill();
  }
}

/** A retina, as seen through the instruments: warm disc, optic nerve head, vessels. */
function retina(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  const rnd = seeded(seed);
  const disc = { x: cx - r * 0.32, y: cy - r * 0.06 };
  const base = g.createRadialGradient(disc.x, disc.y, r * 0.04, cx, cy, r);
  base.addColorStop(0, "#ffe2a8");
  base.addColorStop(0.12, "#f5a04e");
  base.addColorStop(0.5, "#c24a1c");
  base.addColorStop(0.85, "#5a1407");
  base.addColorStop(1, "#1a0502");
  g.save();
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = base;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.lineCap = "round";
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rnd() * 0.4;
    const len = r * (0.9 + rnd() * 0.6);
    g.strokeStyle = `rgba(110, 16, 6, ${0.55 + rnd() * 0.3})`;
    g.lineWidth = r * (0.012 + rnd() * 0.018);
    g.beginPath();
    g.moveTo(disc.x, disc.y);
    g.bezierCurveTo(
      disc.x + Math.cos(a) * len * 0.3 + (rnd() - 0.5) * r * 0.3,
      disc.y + Math.sin(a) * len * 0.3 + (rnd() - 0.5) * r * 0.3,
      disc.x + Math.cos(a + 0.4) * len * 0.6,
      disc.y + Math.sin(a + 0.4) * len * 0.6,
      disc.x + Math.cos(a + 0.7) * len,
      disc.y + Math.sin(a + 0.7) * len,
    );
    g.stroke();
  }
  const nerve = g.createRadialGradient(disc.x, disc.y, 0, disc.x, disc.y, r * 0.13);
  nerve.addColorStop(0, "rgba(255, 246, 220, 0.95)");
  nerve.addColorStop(1, "rgba(255, 220, 160, 0)");
  g.fillStyle = nerve;
  g.fillRect(disc.x - r * 0.2, disc.y - r * 0.2, r * 0.4, r * 0.4);
  g.restore();
}

function background(g: CanvasRenderingContext2D, w: number, h: number) {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#15100c");
  bg.addColorStop(1, "#070504");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
}

export const deviceScreen = () =>
  texture(512, 320, (g, w, h) => {
    background(g, w, h);
    retina(g, 120, 160, 110, 21);
    panel(g, 260, 30, 220, 260, 12);
    bars(g, 285, 60, 170, 9, seeded(5), 24);
  });

/** Dark board with amber traces. Used as both colour and glow, so the traces light up. */
export const circuit = () =>
  texture(512, 512, (g, w, h) => {
    g.fillStyle = "#0b0907";
    g.fillRect(0, 0, w, h);
    const rnd = seeded(99);
    g.lineCap = "round";
    for (let i = 0; i < 70; i++) {
      let x = Math.round(rnd() * 16) * 32;
      let y = Math.round(rnd() * 16) * 32;
      g.strokeStyle = rnd() > 0.75 ? "#ffb04a" : "rgba(255, 139, 18, 0.55)";
      g.lineWidth = rnd() > 0.8 ? 4 : 2;
      g.beginPath();
      g.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        if (rnd() > 0.5) x += (rnd() > 0.5 ? 1 : -1) * 32 * (1 + Math.floor(rnd() * 3));
        else y += (rnd() > 0.5 ? 1 : -1) * 32 * (1 + Math.floor(rnd() * 3));
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = "#ffc27a";
      g.beginPath();
      g.arc(x, y, 4, 0, Math.PI * 2);
      g.fill();
    }
  });

/** Soft round shadow under a product. */
export const contactShadow = () =>
  texture(256, 256, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.85)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.35)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });

/** A blue PCB with gold traces and pads, like the integration module's board. */
export const pcbBlue = () =>
  texture(512, 512, (g, w, h) => {
    g.fillStyle = "#123e7a";
    g.fillRect(0, 0, w, h);
    const rnd = seeded(41);
    g.lineCap = "round";
    for (let i = 0; i < 90; i++) {
      let x = Math.round(rnd() * 16) * 32;
      let y = Math.round(rnd() * 16) * 32;
      g.strokeStyle = rnd() > 0.7 ? "rgba(214, 178, 96, 0.9)" : "rgba(120, 170, 230, 0.35)";
      g.lineWidth = rnd() > 0.8 ? 3 : 1.5;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 3; k++) {
        if (rnd() > 0.5) x += (rnd() > 0.5 ? 1 : -1) * 64;
        else y += (rnd() > 0.5 ? 1 : -1) * 64;
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = "#d6b260";
      g.beginPath();
      g.arc(x, y, 4, 0, Math.PI * 2);
      g.fill();
    }
    // Silkscreen ticks along the edges.
    g.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let x = 24; x < w; x += 40) g.fillRect(x, 10, 18, 3);
  });

/** The LiPo cell's printed wrap. */
export const batteryLabel = () =>
  texture(512, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#d9dcdf");
    grad.addColorStop(1, "#9ea3a8");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3a3d41";
    g.font = "64px Audiowide, Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("BATTERY", w / 2, h / 2 - 14);
    g.font = "26px Audiowide, Arial, sans-serif";
    g.fillText("RECHARGEABLE", w / 2, h / 2 + 50);
  });

/** A rectangle on a panel, in panel units: [left, bottom, right, top] (origin at the centre, +v up). */
export type PanelModule = [number, number, number, number];

/**
 * Black anodised faceplate, divided into screwed-down modules like a
 * rugged field case: faint brushed grain, a dark seam round each module
 * with a hairline highlight inside it.
 */
export const faceplate = (w: number, h: number, modules: PanelModule[]) =>
  texture(Math.round(w * 900), Math.round(h * 900), (g, cw, ch) => {
    const k = cw / w;
    g.fillStyle = "#1b1c1f";
    g.fillRect(0, 0, cw, ch);
    const rnd = seeded(5);
    for (let i = 0; i < 1600; i++) {
      g.fillStyle = `rgba(255, 255, 255, ${(0.008 + rnd() * 0.018).toFixed(3)})`;
      g.fillRect(rnd() * cw, rnd() * ch, 24 + rnd() * 140, 1);
    }
    for (const [u0, v0, u1, v1] of modules) {
      const x = (u0 + w / 2) * k;
      const y = (h / 2 - v1) * k;
      const mw = (u1 - u0) * k;
      const mh = (v1 - v0) * k;
      g.strokeStyle = "#040405";
      g.lineWidth = 6;
      g.strokeRect(x, y, mw, mh);
      g.strokeStyle = "rgba(255, 255, 255, 0.075)";
      g.lineWidth = 1.5;
      g.strokeRect(x + 4, y + 4, mw - 8, mh - 8);
    }
  });

/** Monochrome LCD of a panel meter: abstract bars and a trace, no readings. */
export const lcdMeter = () =>
  texture(320, 200, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#c2cda4");
    bg.addColorStop(1, "#97a67c");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const rnd = seeded(23);
    g.fillStyle = "rgba(24, 34, 14, 0.78)";
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.roundRect(22, 24 + i * 26, 60 + rnd() * 150, 12, 3);
      g.fill();
    }
    g.strokeStyle = "rgba(24, 34, 14, 0.8)";
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= 270; x += 10) g.lineTo(24 + x, 168 - Math.abs(Math.sin(x / 34)) * 30 - rnd() * 8);
    g.stroke();
  });

/** Seven-segment window in standby: ghost digits with the dashes lit. */
export const segmentWindow = (lit: string) =>
  texture(256, 100, (g, w, h) => {
    g.fillStyle = "#0b0605";
    g.fillRect(0, 0, w, h);
    const seg = (x: number, y: number, sw: number, sh: number, on: boolean) => {
      g.fillStyle = on ? lit : "rgba(255, 255, 255, 0.05)";
      g.beginPath();
      g.roundRect(x, y, sw, sh, 3);
      g.fill();
    };
    for (let d = 0; d < 3; d++) {
      const x = 34 + d * 66;
      const y = 16;
      const s = 40;
      seg(x + 5, y, s - 10, 6, false);
      seg(x + 5, y + s - 3, s - 10, 6, true);
      seg(x + 5, y + 2 * s - 6, s - 10, 6, false);
      for (const [dx, dy] of [[0, 4], [s - 6, 4], [0, s + 1], [s - 6, s + 1]]) seg(x + dx, y + dy, 6, s - 8, false);
      if (d < 2) seg(x + s + 6, y + 2 * s - 6, 6, 6, false);
    }
  });

/** Small status screen: a warm title bar and a few rows of abstract readout. */
export const statusPanel = () =>
  texture(256, 160, (g, w, h) => {
    background(g, w, h);
    g.fillStyle = "rgba(255, 190, 130, 0.65)";
    g.fillRect(16, 16, 90, 10);
    bars(g, 16, 46, 220, 5, seeded(31), 20);
  });

/**
 * The compute module's carrier board: near-black solder mask, faint copper
 * pours and traces, white silkscreen outlines and plated mounting holes.
 * Mapped onto the board's top face, so the canvas top is the back edge.
 */
export const carrierBoard = () =>
  texture(640, 512, (g, w, h) => {
    g.fillStyle = "#16181b";
    g.fillRect(0, 0, w, h);
    const rnd = seeded(77);
    g.lineCap = "round";
    for (let i = 0; i < 120; i++) {
      let x = Math.round(rnd() * 40) * 16;
      let y = Math.round(rnd() * 32) * 16;
      g.strokeStyle = `rgba(255, 255, 255, ${(0.03 + rnd() * 0.04).toFixed(3)})`;
      g.lineWidth = rnd() > 0.85 ? 3 : 1.4;
      g.beginPath();
      g.moveTo(x, y);
      for (let s = 0; s < 3; s++) {
        if (rnd() > 0.5) x += (rnd() > 0.5 ? 1 : -1) * 16 * (1 + Math.floor(rnd() * 4));
        else y += (rnd() > 0.5 ? 1 : -1) * 16 * (1 + Math.floor(rnd() * 4));
        g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 220; i++) {
      g.fillStyle = rnd() > 0.5 ? "rgba(190, 190, 195, 0.28)" : "rgba(214, 178, 96, 0.3)";
      g.fillRect(rnd() * w, rnd() * h, 3, 3);
    }
    g.strokeStyle = "rgba(236, 236, 236, 0.5)";
    g.lineWidth = 2;
    const outline: Array<[number, number, number, number]> = [
      [96, 48, 420, 300],
      [24, 120, 28, 180],
      [24, 330, 28, 70],
      [588, 60, 30, 330],
      [470, 40, 70, 34],
    ];
    for (const [x, y, rw, rh] of outline) g.strokeRect(x, y, rw, rh);
    for (const [x, y] of [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]]) {
      g.fillStyle = "#b9b4a6";
      g.beginPath();
      g.arc(x, y, 11, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#060607";
      g.beginPath();
      g.arc(x, y, 6, 0, Math.PI * 2);
      g.fill();
    }
  });
