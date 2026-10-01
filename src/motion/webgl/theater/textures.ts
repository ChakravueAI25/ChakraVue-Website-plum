import * as THREE from "three";

/**
 * Screens, circuit boards and interface layers, drawn in code so the models
 * need no image assets. Everything is abstract UI (shapes, bars, retina
 * imagery): no invented clinical data or copy.
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

/** Overlay rings and crosshair, the "guidance" drawn over the live view. */
function overlay(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.strokeStyle = WARM;
  g.lineWidth = 3;
  g.setLineDash([10, 12]);
  g.beginPath();
  g.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  g.stroke();
  g.setLineDash([]);
  g.strokeStyle = AMBER;
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, r * 0.9, -0.4, 0.9);
  g.stroke();
  g.beginPath();
  g.moveTo(cx - r * 0.12, cy);
  g.lineTo(cx + r * 0.12, cy);
  g.moveTo(cx, cy - r * 0.12);
  g.lineTo(cx, cy + r * 0.12);
  g.stroke();
}

function background(g: CanvasRenderingContext2D, w: number, h: number) {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#15100c");
  bg.addColorStop(1, "#070504");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
}

export const surgicalScreen = () =>
  texture(1024, 640, (g, w, h) => {
    background(g, w, h);
    retina(g, 330, 330, 250, 7);
    overlay(g, 330, 330, 250);
    panel(g, 640, 60, 330, 250);
    bars(g, 670, 100, 270, 8, seeded(3));
    panel(g, 640, 340, 330, 240);
    g.strokeStyle = AMBER;
    g.lineWidth = 3;
    g.beginPath();
    const rnd = seeded(11);
    for (let x = 0; x <= 280; x += 14) g.lineTo(665 + x, 470 - Math.sin(x / 26) * 40 - rnd() * 30);
    g.stroke();
  });

export const slitScreen = () =>
  texture(512, 512, (g, w, h) => {
    const glow = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    glow.addColorStop(0, "#fff0c8");
    glow.addColorStop(0.3, "#ffa53c");
    glow.addColorStop(0.75, "#b33a0a");
    glow.addColorStop(1, "#200600");
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(40, 8, 0, 0.8)";
    g.lineWidth = 16;
    g.beginPath();
    g.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 5;
    g.beginPath();
    g.arc(w / 2, h / 2, w * 0.16, 0, Math.PI * 2);
    g.stroke();
  });

export const deviceScreen = () =>
  texture(512, 320, (g, w, h) => {
    background(g, w, h);
    retina(g, 120, 160, 110, 21);
    panel(g, 260, 30, 220, 260, 12);
    bars(g, 285, 60, 170, 9, seeded(5), 24);
  });

export const emrDashboard = () =>
  texture(1600, 900, (g, w, h) => {
    background(g, w, h);
    const rnd = seeded(17);
    panel(g, 40, 40, 300, 820, 18);
    bars(g, 70, 90, 230, 24, rnd, 30);
    panel(g, 370, 40, 760, 470, 18);
    retina(g, 560, 275, 190, 2);
    retina(g, 940, 275, 190, 4);
    overlay(g, 940, 275, 190);
    panel(g, 370, 540, 760, 320, 18);
    g.strokeStyle = AMBER;
    g.lineWidth = 4;
    g.beginPath();
    for (let x = 0; x <= 700; x += 20) g.lineTo(400 + x, 720 - Math.sin(x / 60) * 70 - rnd() * 40);
    g.stroke();
    panel(g, 1160, 40, 400, 820, 18);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i === 2 ? AMBER : "rgba(255, 190, 130, 0.35)";
      g.beginPath();
      g.arc(1200, 110 + i * 130, 10, 0, Math.PI * 2);
      g.fill();
      bars(g, 1230, 100 + i * 130, 290, 2, rnd, 24);
    }
  });

export type LayerKind = "imaging" | "devices" | "notes" | "timeline" | "insight";

/** One translucent sheet of the EMR, pulled forward in the exploded view. */
export const emrLayer = (kind: LayerKind) =>
  texture(1024, 600, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    panel(g, 6, 6, w - 12, h - 12, 26, "rgba(28, 16, 8, 0.72)");
    const rnd = seeded(kind.length * 13);
    g.fillStyle = WARM;
    g.font = "30px Audiowide, Arial, sans-serif";
    g.fillText(kind === "devices" ? "DEVICE OUTPUT" : kind.toUpperCase(), 48, 70);
    if (kind === "imaging") {
      [0, 1, 2, 3].forEach((i) => retina(g, 170 + i * 230, 330, 95, 30 + i));
    } else if (kind === "devices") {
      for (let row = 0; row < 3; row++) {
        g.strokeStyle = row === 1 ? AMBER : "rgba(255, 190, 130, 0.6)";
        g.lineWidth = 4;
        g.beginPath();
        for (let x = 0; x <= 880; x += 16) g.lineTo(60 + x, 170 + row * 140 - Math.sin(x / (30 + row * 12)) * 38 - rnd() * 16);
        g.stroke();
      }
    } else if (kind === "notes") {
      for (let col = 0; col < 2; col++) bars(g, 60 + col * 470, 130, 400, 14, rnd, 30);
    } else if (kind === "timeline") {
      g.strokeStyle = "rgba(255, 190, 130, 0.6)";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(60, 320);
      g.lineTo(964, 320);
      g.stroke();
      for (let i = 0; i < 8; i++) {
        const x = 90 + i * 120;
        g.fillStyle = i === 5 ? AMBER : WARM;
        g.beginPath();
        g.arc(x, 320, i === 5 ? 18 : 11, 0, Math.PI * 2);
        g.fill();
        panel(g, x - 45, i % 2 ? 360 : 190, 90, 90, 10);
      }
    } else {
      retina(g, 260, 330, 180, 9);
      overlay(g, 260, 330, 180);
      panel(g, 520, 140, 440, 380, 18);
      bars(g, 550, 180, 380, 10, rnd, 32);
    }
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
