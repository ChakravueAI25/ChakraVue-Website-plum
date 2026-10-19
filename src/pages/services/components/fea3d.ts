import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "../../../motion/gsap";

/**
 * The FEA study models in 3D, rendered plain like a solver's geometry view:
 * a tapered, threaded dental implant, and a mandible with a fracture fixed
 * by a four-screw box plate. Both are built from their shape, not primitives:
 * the implant is one parametric surface of revolution (helical thread,
 * collar grooves, taper, rounded apex); the mandible is a bone section swept
 * along the jaw's centre line with rotation-minimising frames. A second,
 * coarser copy of each gives the element-mesh view.
 */

export type Study = "implant" | "mandible";
export type LoadCase = "axial" | "oblique";

type Model = { group: THREE.Group; scale: number; wire: THREE.LineSegments; load: THREE.Group; loadAngle: (c: LoadCase) => number };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* --- Parametric surface helper ---------------------------------------------------- */

function gridGeometry(cols: number, rows: number, point: (u: number, v: number, out: THREE.Vector3) => void) {
  const positions = new Float32Array((cols + 1) * (rows + 1) * 3);
  const p = new THREE.Vector3();
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      point(i / cols, j / rows, p);
      positions.set([p.x, p.y, p.z], (j * (cols + 1) + i) * 3);
    }
  }
  const index: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/* --- The implant ---------------------------------------------------------------------- */

const IMPLANT_H = 10;
const PITCH = 0.82;

/** Radius of the implant at height y and angle theta. */
function implantRadius(theta: number, y: number) {
  // Collar with four machined grooves at the top.
  if (y > 8.0) {
    const g = (y - 8.0) / 2.0;
    const groove = Math.max(0, Math.sin(g * Math.PI * 9 - 0.6)) ** 6;
    return 2.02 - 0.12 * groove - 0.04 * smoothstep(0.96, 1, g);
  }
  // Tapered core with a single-start helical thread.
  const core = 1.36 + (y / 8.0) * 0.42;
  const depth = 0.36 * smoothstep(0.35, 1.8, y) * (1 - smoothstep(7.2, 8.0, y) * 0.6);
  const phase = ((y - (theta / (Math.PI * 2)) * PITCH) / PITCH) % 1;
  const ph = phase < 0 ? phase + 1 : phase;
  // Buttress-like tooth: a quick rise, a flat crest, a longer fall.
  const tooth = ph < 0.18 ? ph / 0.18 : ph < 0.3 ? 1 : ph < 0.72 ? 1 - (ph - 0.3) / 0.42 : 0;
  let r = core + depth * tooth;
  // Blend into the collar.
  r = r + (2.02 - r) * smoothstep(7.75, 8.0, y);
  // Rounded apex.
  if (y < 0.9) r *= Math.sqrt(Math.max(0, 1 - ((0.9 - y) / 0.9) ** 2)) * 0.92 + 0.08 * (y / 0.9);
  return r;
}

function implantGeometry(cols: number, rows: number) {
  return gridGeometry(cols, rows, (u, v, out) => {
    const theta = u * Math.PI * 2;
    const y = v * IMPLANT_H;
    const r = implantRadius(theta, y);
    out.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
  });
}

function buildImplant(metal: THREE.Material, dark: THREE.Material, wireMat: THREE.LineBasicMaterial): Model {
  const group = new THREE.Group();
  const body = new THREE.Mesh(implantGeometry(192, 420), metal);
  // Top face with the internal connection.
  const cap = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.98, 96), metal);
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = IMPLANT_H;
  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.02, 6), dark);
  socket.position.y = IMPLANT_H - 0.005;
  group.add(body, cap, socket);

  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(implantGeometry(48, 70)), wireMat);
  wire.scale.setScalar(1.004);
  group.add(wire);

  const load = arrow();
  load.position.set(0, IMPLANT_H + 0.05, 0);
  group.add(load);
  group.position.y = -IMPLANT_H / 2;
  return { group, scale: 1, wire, load, loadAngle: (c) => (c === "axial" ? 0 : 0.52) };
}

/* --- The mandible ----------------------------------------------------------------------- */

/** Jaw centre line: left condyle, down the ramus, round the chin, up to the right. */
const JAW = new THREE.CatmullRomCurve3(
  [
    [-3.35, 3.4, -2.55],
    [-3.3, 2.2, -2.3],
    [-3.15, 0.7, -2.05],
    [-2.95, -0.35, -1.45],
    [-2.55, -0.6, -0.2],
    [-1.8, -0.72, 1.15],
    [-0.8, -0.8, 2.05],
    [0, -0.82, 2.3],
    [0.8, -0.8, 2.05],
    [1.8, -0.72, 1.15],
    [2.55, -0.6, -0.2],
    [2.95, -0.35, -1.45],
    [3.15, 0.7, -2.05],
    [3.3, 2.2, -2.3],
    [3.35, 3.4, -2.55],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "centripetal",
);

/** Parallel-transport frames along a curve: no flips where it turns vertical. */
function frames(curve: THREE.Curve<THREE.Vector3>, steps: number, firstNormal: THREE.Vector3) {
  const T: THREE.Vector3[] = [];
  const N: THREE.Vector3[] = [];
  const B: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) T.push(curve.getTangentAt(i / steps).normalize());
  N.push(firstNormal.clone().sub(T[0].clone().multiplyScalar(firstNormal.dot(T[0]))).normalize());
  B.push(new THREE.Vector3().crossVectors(T[0], N[0]));
  for (let i = 1; i <= steps; i++) {
    const axis = new THREE.Vector3().crossVectors(T[i - 1], T[i]);
    const n = N[i - 1].clone();
    if (axis.length() > 1e-6) {
      axis.normalize();
      const angle = Math.acos(THREE.MathUtils.clamp(T[i - 1].dot(T[i]), -1, 1));
      n.applyAxisAngle(axis, angle);
    }
    N.push(n);
    B.push(new THREE.Vector3().crossVectors(T[i], n));
  }
  return { T, N, B };
}

/** Section size along the jaw (t 0..1): slender rami, a deep body, a tall chin. */
function section(t: number) {
  const m = Math.abs(t - 0.5) * 2; // 0 at the chin, 1 at the condyles
  const ramus = smoothstep(0.55, 0.75, m);
  const height = THREE.MathUtils.lerp(0.95, 1.25, ramus) * (1 + 0.18 * (1 - smoothstep(0, 0.35, m)));
  const thick = THREE.MathUtils.lerp(0.44, 0.24, ramus);
  // Condyles round off at the very ends.
  const end = Math.sqrt(Math.max(0, 1 - smoothstep(0.93, 1.0, m) ** 2));
  return { height: height * Math.max(end, 0.05), thick: thick * Math.max(end, 0.05) };
}

const FRACTURE_T = 0.31;

function mandibleGeometry(steps: number, around: number) {
  const f = frames(JAW, steps, new THREE.Vector3(0, 1, 0));
  const noise = (a: number, b: number) => Math.sin(a * 12.9 + b * 4.1) * 0.5 + Math.sin(a * 5.3 - b * 9.7) * 0.5;
  return gridGeometry(around, steps, (u, v, out) => {
    const i = Math.round(v * steps);
    const t = v;
    const c = JAW.getPointAt(t);
    const { height, thick } = section(t);
    const a = u * Math.PI * 2;
    // Rounded-rectangle bone section (superellipse).
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const e = 0.7;
    let h = Math.sign(sa) * Math.abs(sa) ** e * height;
    let w = Math.sign(ca) * Math.abs(ca) ** e * thick;
    const m = Math.abs(t - 0.5) * 2;
    // Alveolar crest: tooth bumps along the top of the body.
    if (sa > 0.55 && m < 0.62) {
      const teeth = Math.abs(Math.sin(t * Math.PI * 30)) ** 0.6;
      h += (0.1 + 0.16 * teeth) * smoothstep(0.55, 1, sa) * (1 - smoothstep(0.5, 0.62, m));
    }
    // The fracture: a narrow groove through the body.
    const zig = Math.sin(sa * 6) * 0.004;
    const df = Math.abs(t - (FRACTURE_T + zig));
    const groove = Math.max(0, 1 - df / 0.006) ** 1.5;
    h *= 1 - 0.08 * groove;
    w *= 1 - 0.6 * groove;
    // A little organic irregularity.
    const k = 1 + 0.025 * noise(t * 9, a);
    out.copy(c).addScaledVector(f.N[i], h * k).addScaledVector(f.B[i], w * k);
  });
}

/* Bone and enamel tones, so the solid model reads against the light viewport. */
const BONE = new THREE.Color("#c4ab82");
const ENAMEL = new THREE.Color("#f3eee2");
const CAVITY = new THREE.Color("#5c4a35");

/**
 * Vertex colours for the jaw: enamel along the crest with darker gaps
 * between the teeth, a dark line down the fracture, and bone that darkens
 * underneath and on the inner (tongue) side, like ambient occlusion.
 */
function shadeMandible(geometry: THREE.BufferGeometry, steps: number, around: number) {
  const normal = geometry.getAttribute("normal");
  const position = geometry.getAttribute("position");
  const colours = new Float32Array(position.count * 3);
  const c = new THREE.Color();
  for (let j = 0; j <= steps; j++) {
    const t = j / steps;
    const m = Math.abs(t - 0.5) * 2;
    for (let i = 0; i <= around; i++) {
      const k = j * (around + 1) + i;
      const sa = Math.sin((i / around) * Math.PI * 2);
      // Teeth: enamel crowns on the crest, with the gaps between them dark.
      const crest = smoothstep(0.55, 0.95, sa) * (1 - smoothstep(0.5, 0.62, m));
      const gap = 1 - Math.abs(Math.sin(t * Math.PI * 30)) ** 0.6;
      c.copy(BONE).lerp(ENAMEL, crest * (1 - gap) * 0.9);
      c.lerp(CAVITY, crest * smoothstep(0.55, 1, gap) * 0.55);
      // Occlusion: darker facing down and facing into the arch.
      const ny = normal.getY(k);
      const px = position.getX(k);
      const pz = position.getZ(k) + 0.4;
      const len = Math.hypot(px, pz) || 1;
      const inward = Math.max(0, -(normal.getX(k) * px + normal.getZ(k) * pz) / len);
      c.multiplyScalar((0.62 + 0.38 * smoothstep(-0.8, 0.5, ny)) * (1 - 0.22 * inward));
      // The fracture line.
      const groove = Math.max(0, 1 - Math.abs(t - FRACTURE_T) / 0.008);
      c.lerp(CAVITY, groove * 0.85);
      colours.set([c.r, c.g, c.b], k * 3);
    }
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
}

/** One flat tone for the parts without a section grid (the coronoid blades). */
function paint(geometry: THREE.BufferGeometry, colour: THREE.Color) {
  const count = geometry.getAttribute("position").count;
  const colours = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) colours.set([colour.r, colour.g, colour.b], k * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
}

function buildMandible(bone: THREE.Material, metal: THREE.Material, dark: THREE.Material, wireMat: THREE.LineBasicMaterial): Model {
  const group = new THREE.Group();
  const bodyGeometry = mandibleGeometry(520, 96);
  shadeMandible(bodyGeometry, 520, 96);
  const body = new THREE.Mesh(bodyGeometry, bone);
  group.add(body);

  // Coronoid processes: a tapered blade rising in front of each condyle.
  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 3.15, 1.2, -1.95),
      new THREE.Vector3(side * 3.2, 2.2, -1.75),
      new THREE.Vector3(side * 3.25, 3.15, -1.55),
    ]);
    const geo = gridGeometry(48, 40, (u, v, out) => {
      const a = u * Math.PI * 2;
      const taper = (1 - v) ** 0.8 * 0.95 + 0.05;
      const p = curve.getPointAt(v);
      out.set(p.x + Math.cos(a) * 0.16 * taper, p.y, p.z + Math.sin(a) * 0.5 * taper);
    });
    paint(geo, BONE.clone().multiplyScalar(0.9));
    const blade = new THREE.Mesh(geo, bone);
    group.add(blade);
  }

  // Box plate across the fracture: four screws, joined by bars.
  const f = frames(JAW, 520, new THREE.Vector3(0, 1, 0));
  const at = (t: number, up: number) => {
    const i = Math.round(t * 520);
    const { height, thick } = section(t);
    // The outer (cheek) side: the section axis pointing away from the jaw's middle.
    const centre = JAW.getPointAt(t);
    const outward = f.B[i].clone();
    if (outward.dot(new THREE.Vector3(centre.x, 0, centre.z + 0.4)) < 0) outward.negate();
    const out = centre.clone().addScaledVector(f.N[i], up * height).addScaledVector(outward, thick * 1.02);
    return { p: out, n: outward, t: f.T[i] };
  };
  const corners = [at(FRACTURE_T - 0.036, 0.3), at(FRACTURE_T + 0.036, 0.3), at(FRACTURE_T - 0.036, -0.42), at(FRACTURE_T + 0.036, -0.42)];
  const plate = new THREE.Group();
  const bar = (a: THREE.Vector3, b: THREE.Vector3) => {
    const len = a.distanceTo(b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 12), metal);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    plate.add(mesh);
  };
  bar(corners[0].p, corners[1].p);
  bar(corners[2].p, corners[3].p);
  bar(corners[0].p, corners[2].p);
  bar(corners[1].p, corners[3].p);
  for (const { p, n } of corners) {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.07, 24), metal);
    head.position.copy(p).addScaledVector(n, 0.02);
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.02, 0.03), dark);
    slot.position.set(0, 0.032, 0);
    const slot2 = slot.clone();
    slot2.rotation.y = Math.PI / 2;
    head.add(slot, slot2);
    plate.add(head);
  }
  group.add(plate);

  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(mandibleGeometry(150, 24)), wireMat);
  group.add(wire);

  // The bite load presses on the molars of the fixed side, just behind the
  // fracture, its tip resting on the crest (not out on the cheek face).
  const load = arrow();
  const molarT = FRACTURE_T - 0.06;
  const mi = Math.round(molarT * 520);
  load.position.copy(JAW.getPointAt(molarT)).addScaledVector(f.N[mi], section(molarT).height + 0.3);
  load.scale.setScalar(0.45);
  group.add(load);

  group.rotation.x = 0.32;
  group.position.set(0, -0.3, 0);
  return { group, scale: 1.28, wire, load, loadAngle: (c) => (c === "axial" ? 0 : 0.5) };
}

/** A downward load arrow (shaft and head), pivoting at its tip. */
function arrow() {
  const material = new THREE.MeshStandardMaterial({ color: "#1c2126", roughness: 0.5, metalness: 0.2 });
  const group = new THREE.Group();
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.8, 32), material);
  head.rotation.x = Math.PI;
  head.position.y = 0.4;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 20), material);
  shaft.position.y = 2.0;
  group.add(head, shaft);
  return group;
}

/* --- The viewport ----------------------------------------------------------------------- */

export function createFeaViewport(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 1.6, 22);
  camera.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight("#ffffff", 2.1);
  key.position.set(-7, 9, 6);
  const rim = new THREE.DirectionalLight("#dfe7ee", 0.8);
  rim.position.set(8, 4, -6);
  scene.add(key, rim, new THREE.HemisphereLight("#ffffff", "#7d858b", 0.5));

  const metal = new THREE.MeshPhysicalMaterial({ color: "#c9ced2", metalness: 0.85, roughness: 0.32, clearcoat: 0.2 });
  const dark = new THREE.MeshStandardMaterial({ color: "#3d4348", roughness: 0.6, metalness: 0.4 });
  // Tone comes from the vertex colours (shadeMandible). No sheen: it lit the
  // silhouette white, so the jaw melted into the light viewport.
  const bone = new THREE.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.72, metalness: 0, envMapIntensity: 0.3, clearcoat: 0.08, clearcoatRoughness: 0.6 });
  const wireMat = new THREE.LineBasicMaterial({ color: "#202a30", transparent: true, opacity: 0, depthWrite: false });

  // A soft contact shadow under the model.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const g = shadowCanvas.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(30,36,40,0.45)");
  grad.addColorStop(1, "rgba(30,36,40,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  const models: Record<Study, Model> = {
    implant: buildImplant(metal, dark, wireMat),
    mandible: buildMandible(bone, metal, dark, wireMat),
  };
  const turntable = new THREE.Group();
  scene.add(turntable);
  Object.values(models).forEach((m) => {
    m.group.visible = false;
    turntable.add(m.group);
  });

  let study: Study = "implant";
  let yaw = -0.5;
  let spin = 0.12;
  let dragging = false;
  let visible = true;
  const view = { mesh: 0 };

  const place = (s: Study) => {
    shadow.position.y = s === "implant" ? -IMPLANT_H / 2 - 0.05 : -1.9;
    shadow.scale.set(s === "implant" ? 7 : 11, s === "implant" ? 7 : 8, 1);
    camera.position.set(0, s === "implant" ? 2.2 : 5.8, s === "implant" ? 27 : 26);
    camera.lookAt(0, s === "implant" ? 0.9 : 0.6, 0);
  };

  const show = (next: Study) => {
    const previous = models[study];
    const incoming = models[next];
    study = next;
    gsap.killTweensOf([previous.group.scale, incoming.group.scale]);
    if (previous !== incoming) {
      gsap.to(previous.group.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          previous.group.visible = false;
        },
      });
    }
    const s = incoming.scale;
    incoming.group.visible = true;
    place(next);
    gsap.fromTo(incoming.group.scale, { x: s * 0.6, y: s * 0.6, z: s * 0.6 }, { x: s, y: s, z: s, duration: 0.9, delay: previous !== incoming ? 0.3 : 0, ease: "cv.out" });
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  let last = performance.now();
  const tick = () => {
    if (!visible) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) yaw += spin * dt;
    turntable.rotation.y = yaw;
    wireMat.opacity = view.mesh * 0.55;
    renderer.render(scene, camera);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  // Drag to turn.
  let lastX = 0;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    yaw += (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
  };
  const onUp = () => (dragging = false);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  resize();
  show("implant");
  gsap.ticker.add(tick);

  return {
    setStudy: show,
    setLoad(c: LoadCase) {
      Object.values(models).forEach((m) => gsap.to(m.load.rotation, { z: m.loadAngle(c), duration: 0.8, ease: "cv.out" }));
    },
    setMesh(on: boolean) {
      gsap.to(view, { mesh: on ? 1 : 0, duration: 0.5, ease: "power2.out" });
      metal.transparent = bone.transparent = on;
      gsap.to([metal, bone], { opacity: on ? 0.55 : 1, duration: 0.5 });
    },
    setSpin(on: boolean) {
      spin = on ? 0.12 : 0;
    },
    destroy() {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      shadowTex.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
