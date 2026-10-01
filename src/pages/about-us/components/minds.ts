import { reduceMotion } from "../../../motion/env";
import { onThemeChange } from "../../../theme/theme";

/**
 * The About hero's background: a network of minds. Points drift, link up
 * with their neighbours, and pass signals along the links; the pointer
 * draws the nearest ones together. Colours come from CSS custom properties
 * on the section (--minds-node, --minds-link, --minds-signal), so they
 * follow the palette. With reduced motion it draws one still frame.
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean; glow: number };
type Signal = { a: Node; b: Node; t: number; speed: number };

const LINK = 150;
const POINTER = 200;

export function mountMinds(canvas: HTMLCanvasElement, host: HTMLElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes: Node[] = [];
  const signals: Signal[] = [];
  const pointer = { x: 0, y: 0, active: false };
  let colours = { node: "#fff", link: "#fff", signal: "#fff" };
  let frame = 0;
  let visible = true;
  let born = performance.now();
  let lastSignal = 0;

  const readColours = () => {
    const cs = getComputedStyle(host);
    colours = {
      node: cs.getPropertyValue("--minds-node").trim() || "#ffb46a",
      link: cs.getPropertyValue("--minds-link").trim() || "#ff8b12",
      signal: cs.getPropertyValue("--minds-signal").trim() || "#fbd896",
    };
  };

  const seed = () => {
    const count = Math.round(Math.min(150, Math.max(46, (w * h) / 13000)));
    nodes = Array.from({ length: count }, () => {
      const hub = Math.random() < 0.09;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.12;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: hub ? 2.6 + Math.random() * 1.2 : 0.9 + Math.random() * 1.3,
        hub,
        glow: 0,
      };
    });
    signals.length = 0;
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(box.width));
    const nh = Math.max(1, Math.round(box.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = nw * dpr;
    canvas.height = nh * dpr;
    // Keep the network on a resize; scale it to the new box.
    if (nodes.length && w && h) {
      for (const n of nodes) {
        n.x *= nw / w;
        n.y *= nh / h;
      }
      w = nw;
      h = nh;
    } else {
      w = nw;
      h = nh;
      seed();
    }
    if (reduceMotion) draw(performance.now());
  };

  const step = () => {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;

      // The pointer gathers the nearest minds a little and lights them.
      let target = 0;
      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < POINTER && d > 1) {
          const pull = (1 - d / POINTER) * 0.012;
          n.x += dx * pull * 0.6;
          n.y += dy * pull * 0.6;
          target = 1 - d / POINTER;
        }
      }
      n.glow += (target - n.glow) * 0.08;
    }
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += s.speed;
      if (s.t >= 1) {
        s.b.glow = Math.max(s.b.glow, 0.9);
        signals.splice(i, 1);
      }
    }
  };

  const spawnSignal = (now: number) => {
    if (now - lastSignal < 260 || signals.length > 16) return;
    lastSignal = now;
    const a = nodes[(Math.random() * nodes.length) | 0];
    let best: Node | null = null;
    let bestD = LINK;
    for (const n of nodes) {
      if (n === a) continue;
      const d = Math.hypot(n.x - a.x, n.y - a.y);
      if (d < bestD && Math.random() < 0.6) {
        best = n;
        bestD = d;
      }
    }
    if (best) signals.push({ a, b: best, t: 0, speed: 0.012 + Math.random() * 0.01 });
  };

  const draw = (now: number) => {
    // Everything fades in on arrival, as the links form.
    const intro = reduceMotion ? 1 : Math.min(1, (now - born) / 1800);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    ctx.strokeStyle = colours.link;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        if (dx > LINK || dx < -LINK) continue;
        const dy = a.y - b.y;
        if (dy > LINK || dy < -LINK) continue;
        const d = Math.hypot(dx, dy);
        if (d >= LINK) continue;
        const k = 1 - d / LINK;
        ctx.globalAlpha = intro * k * k * (0.28 + Math.max(a.glow, b.glow) * 0.6);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    if (pointer.active) {
      for (const n of nodes) {
        if (n.glow < 0.05) continue;
        ctx.globalAlpha = intro * n.glow * 0.45;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = colours.node;
    for (const n of nodes) {
      const lit = Math.min(1, n.glow);
      if (n.hub || lit > 0.1) {
        ctx.globalAlpha = intro * (n.hub ? 0.1 : 0) + intro * lit * 0.22;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = intro * (0.55 + lit * 0.45);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + lit * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = colours.signal;
    for (const s of signals) {
      const x = s.a.x + (s.b.x - s.a.x) * s.t;
      const y = s.a.y + (s.b.y - s.a.y) * s.t;
      ctx.globalAlpha = intro * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = intro;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const tick = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    step();
    spawnSignal(now);
    draw(now);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!reduceMotion && !frame) frame = requestAnimationFrame(tick);
  };

  const onMove = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.active = true;
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const onVisibility = () => start();

  readColours();
  resize();
  born = performance.now();
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const watcher = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  watcher.observe(canvas);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  const offTheme = onThemeChange(() => {
    readColours();
    if (reduceMotion) draw(performance.now());
  });
  start();

  return () => {
    cancelAnimationFrame(frame);
    resizer.disconnect();
    watcher.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    offTheme();
  };
}
