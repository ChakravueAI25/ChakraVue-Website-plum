import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GradeShader, gradeUniform } from "../../../theme/grade";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "../../gsap";
import { applyExplode, Kit, type ProductModel, type Quality, type Readout } from "./kit";
import { emrCase, slitLampCase, surgicalBriefcase } from "./models/briefcase";
import { integrationModule } from "./models/module";
import { contactShadow } from "./textures";

/**
 * The product theater: one WebGL scene that holds all four products.
 *
 * "stage" (Product Suite page): a full-screen studio (platform with neon
 * rims, data-point floor, drifting dust, a blueprint glow behind the
 * product, bloom). Each product's scroll chapter drives it: build up
 * through a scan line, turn, dismantle into labelled parts, reassemble,
 * dematerialise.
 *
 * "inline" (home carousel): transparent, sitting on the painted podium.
 * Products swap by dismantling out and assembling in, drag to turn, hover
 * to peek inside.
 */

const BUILDERS: Record<string, (kit: Kit) => ProductModel> = {
  "surgical-assistant": surgicalBriefcase,
  "slit-lamp-module": slitLampCase,
  "ai-powered-emr": emrCase,
  "integrated-devices": integrationModule,
};

export type TheaterProduct = { id: string; anatomy: Array<{ id: string; label: string }> };

export type TheaterOptions = {
  mode: "stage" | "inline";
  products: TheaterProduct[];
  labelLayer?: HTMLElement | null;
  reduced?: boolean;
  /** Called with the current explode amount whenever it changes noticeably. */
  onExplode?: (explode: number) => void;
  /** Called with how far the camera has moved in on a product's interface (0 to 1), in steps of 0.02. */
  onFocus?: (focus: number) => void;
  /** Inline: where the product's base sits, as a fraction of the canvas height. */
  floor?: number;
};

export type Theater = {
  /** Stage mode: which product's chapter is on screen, and how far through it. */
  setChapter(index: number, progress: number, last?: boolean): void;
  /** Inline mode: dismantle the current product and assemble the next. */
  swap(index: number): Promise<void>;
  /** Inline mode: open the product part-way to show what's inside. */
  setPeek(on: boolean): void;
  /** Turn the product by a pointer drag (pixels). */
  drag(dx: number): void;
  start(): void;
  destroy(): void;
  /** Current (smoothed) state, for tests and debugging. */
  state(): { active: number; build: number; explode: number; labels: number; focus: number };
  /** Jump straight to the target pose (tests and debugging). */
  settle(): void;
};

type Framing = { center: THREE.Vector3; explodedCenter: THREE.Vector3; base: number; top: number; radius: number; explodedRadius: number };

const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const COLOR_OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

/** Assembled and exploded bounds, measured once so every product frames itself. */
function measure(model: ProductModel): Framing {
  const pose = (explode: number) => {
    applyExplode(model.parts, explode);
    model.update?.(explode, 0, 0);
    model.group.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(model.group);
  };
  const assembled = pose(0);
  const exploded = pose(1);
  pose(0);
  const a = assembled.getBoundingSphere(new THREE.Sphere());
  const e = exploded.getBoundingSphere(new THREE.Sphere());
  return {
    center: a.center.clone(),
    explodedCenter: e.center.clone(),
    base: assembled.min.y,
    top: assembled.max.y,
    radius: a.radius,
    // Never closer than the assembled framing, even when a product barely opens out.
    explodedRadius: Math.max(e.radius, a.radius * 1.05),
  };
}

/** Screen-space studio backdrop: warm haze, a glow behind the product, a blueprint grid when opened. */
function backdrop() {
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.6, 0.5) },
      uAspect: { value: 1 },
      uExplode: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uCenter;
      uniform float uAspect;
      uniform float uExplode;
      void main() {
        vec2 d = (vUv - uCenter) * vec2(uAspect, 1.0);
        float r = length(d);
        vec3 col = mix(vec3(0.004, 0.003, 0.003), vec3(0.018, 0.009, 0.005), smoothstep(0.95, 0.2, vUv.y));
        float glow = exp(-r * r * 3.2);
        col += vec3(1.0, 0.34, 0.07) * glow * (0.05 + 0.015 * sin(uTime * 0.7) + 0.05 * uExplode);
        float haze = exp(-pow((vUv.y - 0.34) * 6.0, 2.0));
        col += vec3(0.8, 0.26, 0.05) * haze * 0.018;
        vec2 cell = abs(fract(d * 7.0) - 0.5);
        float grid = 1.0 - smoothstep(0.0, 0.018, min(cell.x, cell.y));
        col += vec3(1.0, 0.5, 0.2) * grid * glow * 0.06 * uExplode;
        col *= 1.0 - 0.5 * length((vUv - 0.5) * vec2(1.1, 1.0));
        gl_FragColor = vec4(col, 1.0);
        ${COLOR_OUT}
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, material };
}

/** The platform: echoes the site's podium art (dark disc, yellow and red neon rims). */
function platform() {
  const group = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.86, 0.14, 128),
    new THREE.MeshPhysicalMaterial({ color: "#131417", metalness: 0.85, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.2 }),
  );
  disc.position.y = -0.07;
  const bedMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uExplode: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uExplode;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        float a = atan(p.y, p.x);
        float dRing = abs(fract(r * 7.0 - uTime * 0.04 + 0.5) - 0.5);
        float rings = (1.0 - smoothstep(0.0, 0.05, dRing)) * smoothstep(1.0, 0.2, r);
        float ticks = step(0.9, fract((a / 6.2831 + uTime * 0.006) * 120.0)) * smoothstep(0.86, 0.9, r) * (1.0 - smoothstep(0.96, 0.99, r));
        float glow = exp(-r * 2.4);
        vec3 col = vec3(0.012, 0.011, 0.01) + vec3(1.0, 0.36, 0.08) * (rings * (0.02 + 0.07 * uExplode) + ticks * 0.14 + glow * (0.025 + 0.08 * uExplode));
        gl_FragColor = vec4(col, 1.0);
        ${COLOR_OUT}
      }`,
  });
  const bed = new THREE.Mesh(new THREE.CircleGeometry(1.78, 128), bedMaterial);
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = 0.001;
  const rimTop = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.012, 12, 256),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb020").multiplyScalar(2), toneMapped: false }),
  );
  rimTop.rotation.x = Math.PI / 2;
  rimTop.position.y = -0.004;
  const rimLow = new THREE.Mesh(
    new THREE.TorusGeometry(1.86, 0.022, 12, 256),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3a0a").multiplyScalar(1.6), toneMapped: false }),
  );
  rimLow.rotation.x = Math.PI / 2;
  rimLow.position.y = -0.11;
  group.add(disc, bed, rimTop, rimLow);
  return { group, bedMaterial };
}

/** A floor of faint light points reaching into the dark, like the home hero's landscape. */
function floorPoints(count: number) {
  const positions: number[] = [];
  const rands: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.pow(Math.random(), 0.7) * 12;
    const a = Math.random() * Math.PI * 2;
    positions.push(Math.cos(a) * r, -0.14, Math.sin(a) * r);
    rands.push(Math.random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aRand", new THREE.Float32BufferAttribute(rands, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aRand;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, (10.0 + aRand * 14.0) * uPixelRatio / -mv.z);
        float dist = length(position.xz);
        vAlpha = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aRand) + aRand * 30.0))) * smoothstep(14.0, 4.0, dist) * 0.55;
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(vec3(1.0, 0.5, 0.18) * 1.6, a * a * vAlpha);
        ${COLOR_OUT}
      }`,
  });
  return { points: new THREE.Points(geometry, material), material };
}

function dust(count: number) {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) positions.push((Math.random() - 0.5) * 9, Math.random() * 4, (Math.random() - 0.5) * 7 - 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uTime * 0.05, 4.0);
        p.x += sin(uTime * 0.2 + position.z) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, 9.0 * uPixelRatio / -mv.z);
        vAlpha = smoothstep(0.0, 0.8, p.y) * (1.0 - smoothstep(3.0, 4.0, p.y)) * 0.35;
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(vec3(1.0, 0.8, 0.6), a * vAlpha);
        ${COLOR_OUT}
      }`,
  });
  return { points: new THREE.Points(geometry, material), material };
}

/** The glowing slice that sweeps up the product as it materialises. */
function scanner() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uAlpha: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uAlpha;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float edge = smoothstep(0.84, 0.99, r) * (1.0 - smoothstep(0.99, 1.0, r));
        float fill = (1.0 - r) * 0.04;
        float a = (edge * 0.8 + fill) * uAlpha;
        gl_FragColor = vec4(vec3(1.0, 0.55, 0.18) * 1.5, a);
        ${COLOR_OUT}
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 96), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = false;
  return { mesh, material };
}

export function createTheater(canvas: HTMLCanvasElement, options: TheaterOptions): Theater {
  const stage = options.mode === "stage";
  const small = window.matchMedia("(max-width: 760px)").matches;
  const quality: Quality = small ? "low" : "high";
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !stage, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x040302, stage ? 1 : 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = envMap;
  scene.environmentIntensity = 0.42;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);

  const key = new THREE.DirectionalLight("#fff1e2", 1.9);
  key.position.set(-3, 5, 4);
  const rimLeft = new THREE.PointLight("#ff7a1a", 14, 14, 2);
  rimLeft.position.set(-3.2, 2.6, -2.8);
  const rimRight = new THREE.PointLight("#ffa040", 10, 14, 2);
  rimRight.position.set(3.4, 1.6, -2.4);
  const under = new THREE.PointLight("#ff6a10", 2.5, 4, 2);
  under.position.set(0, 0.6, 1.2);
  scene.add(key, rimLeft, rimRight, under, new THREE.HemisphereLight("#3a2a20", "#050403", 0.5));

  // Everything above the scan line is hidden while a product materialises.
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
  const kit = new Kit(quality, [clip]);
  const models = options.products.map((product): ProductModel => {
    const build = BUILDERS[product.id];
    const model = build ? build(kit) : { group: new THREE.Group(), parts: [], anchors: [] };
    model.group.visible = false;
    scene.add(model.group);
    return model;
  });
  const framings = models.map(measure);

  const extras: { update: (time: number, explode: number) => void; dispose: () => void }[] = [];
  let background: ReturnType<typeof backdrop> | null = null;
  if (stage) {
    background = backdrop();
    const base = platform();
    const floor = floorPoints(small ? 900 : 2200);
    const motes = dust(small ? 80 : 180);
    floor.material.uniforms.uPixelRatio.value = dpr;
    motes.material.uniforms.uPixelRatio.value = dpr;
    scene.add(background.mesh, base.group, floor.points, motes.points);
    extras.push({
      update: (time, explode) => {
        base.bedMaterial.uniforms.uTime.value = time;
        base.bedMaterial.uniforms.uExplode.value = explode;
        floor.material.uniforms.uTime.value = time;
        motes.material.uniforms.uTime.value = time;
      },
      dispose: () => {},
    });
  }

  const shadowMap = contactShadow();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 0.75 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  scene.add(shadow);

  const scan = scanner();
  scene.add(scan.mesh);

  // Bloom makes the chips, rims and screens glow. Desktop stage only.
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  // The site palette grades the finished frame (a no-op on the original).
  const grade = gradeUniform();
  let gradePass: ShaderPass | null = null;
  if (stage) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (quality === "high") {
      bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.45, 1.0);
      composer.addPass(bloom);
    }
    composer.addPass(new OutputPass());
    gradePass = new ShaderPass(GradeShader);
    gradePass.uniforms.uGrade = grade.uniform;
    composer.addPass(gradePass);
  }

  // --- State --------------------------------------------------------------
  let active = -1;
  const goal = { build: 0, explode: 0, labels: 0, yaw: -0.6, focus: 0, readouts: 0 };
  const now = { build: 0, explode: 0, labels: 0, yaw: -0.6, focus: 0, readouts: 0 };
  let userYaw = 0;
  let spin = 0;
  let peek = false;
  let visible = true;
  let started = false;
  /** Whether the stage is taller than wide (products with a portrait arrangement use it). */
  let tall = false;
  let lastReported = -1;
  let lastFocus = 0;
  let width = 0;
  let height = 0;

  // --- Labels -------------------------------------------------------------
  const layer = options.labelLayer ?? null;
  type Label = {
    el: HTMLElement;
    text: HTMLElement;
    anchor: ProductModel["anchors"][number];
    side: ProductModel["anchors"][number]["side"];
    width: number;
    x: number;
    y: number;
    dy: number;
    shown: boolean;
  };
  let labels: Label[] = [];
  const mountLabels = (index: number) => {
    if (!layer) return;
    layer.replaceChildren();
    const anatomy = options.products[index]?.anatomy ?? [];
    labels = models[index].anchors
      .map((anchor) => ({ anchor, order: anatomy.findIndex((a) => a.id === anchor.id) }))
      .filter(({ order }) => order >= 0)
      .sort((a, b) => a.order - b.order)
      .map(({ anchor, order }) => {
        const el = document.createElement("div");
        el.className = `tlabel tlabel--${anchor.side}`;
        el.innerHTML = `<span class="tlabel__dot"></span><span class="tlabel__line"></span><span class="tlabel__text"><b>${String(order + 1).padStart(2, "0")}</b><span>${anatomy[order].label}</span></span>`;
        layer.appendChild(el);
        const text = el.querySelector<HTMLElement>(".tlabel__text")!;
        return { el, text, anchor, side: anchor.side, width: 0, x: 0, y: 0, dy: 0, shown: false };
      });
    mountReadouts(index);
  };

  // --- Readouts: values on an interface, quoted while the camera is in on it ---
  type Card = { el: HTMLElement; card: HTMLElement; value: HTMLElement; readout: Readout; width: number; height: number; played: boolean };
  let cards: Card[] = [];
  const mountReadouts = (index: number) => {
    if (!layer) return;
    cards = (models[index].focus?.readouts ?? []).map((readout) => {
      const el = document.createElement("div");
      el.className = "treadout";
      el.innerHTML = `<span class="treadout__dot"></span><span class="treadout__line"></span><span class="treadout__card"><em></em><b></b></span>`;
      el.querySelector("em")!.textContent = readout.label;
      const value = el.querySelector("b")!;
      value.textContent = readout.value;
      layer.appendChild(el);
      return { el, card: el.querySelector<HTMLElement>(".treadout__card")!, value, readout, width: 0, height: 0, played: false };
    });
  };

  /**
   * Each card hangs off its point by the offset the model gives (smaller on
   * narrow screens), kept on screen and clear of the cards before it, and
   * appears in turn; its value scrambles in each time it shows.
   */
  const placeReadouts = (alpha: number) => {
    const scale = width < 760 ? 0.5 : width < 1200 ? 0.75 : 1;
    const taken: Array<{ left: number; right: number; top: number; bottom: number }> = [];
    cards.forEach((card, i) => {
      const shown = THREE.MathUtils.clamp((alpha - i * 0.1) / (1 - (cards.length - 1) * 0.1), 0, 1);
      if (shown < 0.01) {
        if (card.played) card.el.style.opacity = "0";
        if (alpha < 0.01) card.played = false;
        return;
      }
      point.copy(card.readout.point);
      card.readout.object.localToWorld(point);
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * width;
      const y = (-point.y * 0.5 + 0.5) * height;
      if (!card.width) card.width = card.card.offsetWidth;
      if (!card.height) card.height = card.card.offsetHeight;
      let [dx, dy] = card.readout.card.map((v) => v * scale);
      dx = dx < 0 ? Math.max(dx, 10 + card.width - x) : Math.min(dx, width - 10 - card.width - x);
      dy = THREE.MathUtils.clamp(dy, 90 - y, height - 30 - y);
      // Step below (or, with no room, above) any card it would cover.
      const left = dx < 0 ? x + dx - card.width : x + dx;
      for (const box of taken) {
        const top = y + dy - card.height / 2;
        if (left > box.right + 8 || left + card.width < box.left - 8 || top > box.bottom + 8 || top + card.height < box.top - 8) continue;
        dy = box.bottom + 8 + card.height / 2 - y;
        if (y + dy + card.height / 2 > height - 10) dy = box.top - 8 - card.height / 2 - y;
      }
      taken.push({ left, right: left + card.width, top: y + dy - card.height / 2, bottom: y + dy + card.height / 2 });
      card.el.classList.toggle("treadout--left", dx < 0);
      card.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      card.el.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      card.el.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      card.el.style.setProperty("--len", `${Math.hypot(dx, dy).toFixed(1)}px`);
      card.el.style.setProperty("--ang", `${Math.atan2(dy, dx).toFixed(4)}rad`);
      card.el.style.opacity = shown.toFixed(3);
      if (!card.played && shown > 0.4) {
        card.played = true;
        gsap.to(card.value, { duration: 0.9, scrambleText: { text: card.readout.value, chars: /\d/.test(card.readout.value) ? "0123456789" : "upperAndLowerCase", speed: 0.5 } });
      }
    });
  };

  const show = (index: number) => {
    if (index === active || !models[index]) return;
    if (active >= 0) models[active].group.visible = false;
    active = index;
    models[index].group.visible = true;
    mountLabels(index);
  };

  /**
   * Labels follow their anchors on screen. Each takes the side it was given
   * unless that would run into the copy column (or off the edge), and
   * labels on the same side are spaced so they never overlap; an angled
   * leader line keeps each one tied to its point.
   */
  const REACH = 62;
  const GAP = 30;
  const placeLabels = (alpha: number) => {
    if (alpha < 0.01) {
      for (const label of labels) {
        if (label.shown) label.el.style.opacity = "0";
        label.shown = false;
      }
      return;
    }
    const wide = stage && width > 900;
    const minX = wide ? width * 0.4 : 10;
    const maxX = wide ? width - 110 : width - 10;
    const maxY = stage && !wide ? height * 0.6 : height - 50;
    for (const label of labels) {
      if (!label.width) label.width = label.text.offsetWidth;
      point.copy(label.anchor.point);
      label.anchor.object.localToWorld(point);
      point.project(camera);
      label.x = (point.x * 0.5 + 0.5) * width;
      label.y = (-point.y * 0.5 + 0.5) * height;
      label.shown = point.z < 1;
      let side = label.anchor.side;
      if (side === "top" || side === "bottom") {
        // A caption: it stays with its screen (which may have changed layout).
        if (side !== label.side) label.el.classList.replace(`tlabel--${label.side}`, `tlabel--${side}`);
        label.side = side;
        continue;
      }
      const reach = REACH + 8 + label.width;
      // Keep the given side unless it overflows and the other side overflows less.
      const overflow = { left: Math.max(0, minX - (label.x - reach)), right: Math.max(0, label.x + reach - maxX) };
      const other = side === "left" ? "right" : "left";
      if (overflow[side] > 0 && overflow[other] < overflow[side]) side = other;
      if (side !== label.side) {
        label.el.classList.replace(`tlabel--${label.side}`, `tlabel--${side}`);
        label.side = side;
      }
    }
    // Labels with leaders, top to bottom: each steps down until its pill is
    // clear of every pill already placed, on either side.
    const placed: Array<{ y: number; left: number; right: number }> = [];
    labels
      .filter((label) => (label.side === "left" || label.side === "right") && label.shown)
      .sort((a, b) => a.y - b.y)
      .forEach((label) => {
        const left = label.side === "right" ? label.x + REACH + 8 : label.x - REACH - 8 - label.width;
        let y = label.y;
        for (const pill of placed) if (left < pill.right + 8 && left + label.width > pill.left - 8 && y < pill.y + GAP) y = pill.y + GAP;
        y = THREE.MathUtils.clamp(y, 70, maxY);
        label.dy = y - label.y;
        placed.push({ y, left, right: left + label.width });
      });
    for (const label of labels) {
      const { el, x, y, dy } = label;
      const angle = Math.atan2(dy, REACH) * (label.side === "left" ? -1 : 1);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      el.style.setProperty("--len", `${Math.hypot(REACH, dy).toFixed(1)}px`);
      el.style.setProperty("--ang", `${angle.toFixed(4)}rad`);
      el.style.opacity = label.shown ? alpha.toFixed(3) : "0";
    }
  };

  /**
   * Inline: products differ in shape, so framing by bounding sphere would
   * leave each floating at a different height. Instead, shift the view so
   * the product's base always lands on the painted podium line.
   */
  const PODIUM_LINE = options.floor ?? (small ? 0.97 : 0.935);
  const standOnPodium = (framing: Framing) => {
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    point.set(framing.center.x, framing.base, framing.center.z).project(camera);
    const baseY = (-point.y * 0.5 + 0.5) * height;
    camera.setViewOffset(width, height, 0, baseY - PODIUM_LINE * height, width, height);
    camera.updateProjectionMatrix();
  };

  // --- Frame --------------------------------------------------------------
  const point = new THREE.Vector3();
  const center = new THREE.Vector3();
  const target = new THREE.Vector3();

  /**
   * Stage: the product sits right of centre beside the copy on desktop, and
   * in the upper part of the screen above the copy on phones. While the
   * camera is in on an interface the copy steps aside, so it eases back to
   * the centre.
   */
  let offsetKey = "";
  /** Screen room (px) kept clear around a focused interface: the nav above, the rail beside. */
  const focusRoom = () => (width < 760 ? { side: 10, top: 76, bottom: 24 } : { side: width > 900 ? 120 : 40, top: 104, bottom: 40 });
  const applyOffset = (focus: number) => {
    const room = focusRoom();
    const lower = ((room.top - room.bottom) / 2) * focus;
    const x = width > 900 ? (width < 1200 ? -0.1 : -0.08) * width * (1 - focus) : 0;
    const y = (width > 900 ? 0 : 0.16 * height * (1 - focus)) - lower;
    const key = `${width}x${height}:${x.toFixed(1)},${y.toFixed(1)}`;
    if (key === offsetKey) return;
    offsetKey = key;
    camera.setViewOffset(width, height, x, y, width, height);
    camera.updateProjectionMatrix();
  };

  const frame = (time: number, deltaMs: number) => {
    if (active < 0 || width < 2 || height < 2) return;
    for (const key of ["build", "explode", "labels", "yaw", "focus", "readouts"] as const) {
      if (!Number.isFinite(now[key]) || !Number.isFinite(goal[key])) now[key] = goal[key] = key === "build" ? 1 : 0;
    }
    const model = models[active];
    const framing = framings[active];
    const k = 1 - Math.exp(-(deltaMs / 1000) * 7);
    now.build += (goal.build - now.build) * k;
    now.explode += (goal.explode - now.explode) * k;
    now.labels += (goal.labels - now.labels) * k;
    now.yaw += (goal.yaw - now.yaw) * k;
    now.focus += (goal.focus - now.focus) * k;
    now.readouts += (goal.readouts - now.readouts) * k;
    if (!stage && !options.reduced) spin += (deltaMs / 1000) * (peek ? 0.12 : 0.3);

    model.group.rotation.y = now.yaw + userYaw + spin;
    applyExplode(model.parts, now.explode);
    model.update?.(now.explode, time, now.focus);
    kit.m.edge.opacity = smooth(0.15, 0.6, now.explode) * 0.6;

    // Materialise: the clip plane (and its glowing slice) rises through the product.
    const b = now.build;
    clip.constant = b > 0.998 ? 100 : THREE.MathUtils.lerp(framing.base - 0.02, framing.top + 0.02, b);
    scan.mesh.visible = b > 0.003 && b < 0.997;
    if (scan.mesh.visible) {
      scan.mesh.position.set(framing.center.x, clip.constant, framing.center.z);
      scan.mesh.scale.setScalar(framing.radius * 0.95);
      scan.material.uniforms.uAlpha.value = Math.sin(b * Math.PI);
    }
    shadow.position.set(framing.center.x, 0.004, framing.center.z);
    shadow.scale.setScalar(framing.radius * 2.1);
    (shadow.material as THREE.MeshBasicMaterial).opacity = 0.75 * b * (1 - now.explode * 0.4);

    // Camera: frame the assembled product, pull back to hold the exploded one.
    const e = now.explode;
    center.lerpVectors(framing.center, framing.explodedCenter, e);
    const radius = THREE.MathUtils.lerp(framing.radius * 1.05, framing.explodedRadius, e);
    const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const hFov = Math.atan(Math.tan(vFov) * camera.aspect);
    // Narrow desktops and tablets get more room so the product clears the copy
    // column, and more again when it opens, so the labels fit beside it.
    const margin = stage ? (width > 900 ? (width < 1200 ? 1.2 : 1.08) + (width < 1400 ? 0.24 : 0.06) * e : 1.45) : 0.92;
    let distance = (radius / Math.sin(Math.min(vFov, hFov))) * margin;
    let elevation = model.elevation ?? 0.2;
    // Focus: move in on the product's interface until it fills the stage, square-on.
    const f = model.focus ? now.focus : 0;
    if (stage) applyOffset(f);
    if (model.focus && f > 0.0005) {
      const narrow = width < 760;
      const fit = model.focus.frame(target, narrow);
      // Fit inside the room the nav, the rail and the cards leave.
      const room = focusRoom();
      const fitDistance = Math.max((fit.width / 2 / Math.tan(hFov)) * (width / (width - 2 * room.side)), (fit.height / 2 / Math.tan(vFov)) * (height / (height - room.top - room.bottom)));
      center.lerp(target, f);
      distance = THREE.MathUtils.lerp(distance, fitDistance, f);
      elevation = THREE.MathUtils.lerp(elevation, model.focus.elevation, f);
    }
    camera.position.set(center.x, center.y + Math.sin(elevation) * distance, center.z + Math.cos(elevation) * distance);
    camera.lookAt(center);
    if (!stage) standOnPodium(framing);

    if (background) {
      point.copy(center).project(camera);
      background.material.uniforms.uCenter.value.set(point.x * 0.5 + 0.5, point.y * 0.5 + 0.5);
      background.material.uniforms.uTime.value = time;
      background.material.uniforms.uExplode.value = e;
    }
    extras.forEach((extra) => extra.update(time, e));

    placeLabels(now.labels);
    placeReadouts(now.readouts);

    if (options.onExplode && Math.abs(e - lastReported) > 0.02) {
      lastReported = e;
      options.onExplode(e);
    }
    const focusStep = Math.round(f * 50) / 50;
    if (options.onFocus && focusStep !== lastFocus) {
      lastFocus = focusStep;
      options.onFocus(focusStep);
    }

    if (gradePass) gradePass.enabled = grade.active();
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const tick = (time: number, deltaMs: number) => {
    if (visible) frame(time, Math.min(deltaMs, 50));
  };

  const resize = () => {
    // A hidden canvas (the home viewer before 3D is ready) measures 0 x 0;
    // keep the last real size rather than a zero view that turns into NaN.
    if (!canvas.clientWidth || !canvas.clientHeight) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
    composer?.setPixelRatio(dpr);
    bloom?.resolution.set(width, height);
    camera.aspect = width / height;
    // Products with a portrait arrangement switch to it on tall stages, and are framed again.
    const isTall = width < height;
    if (isTall !== tall) {
      tall = isTall;
      models.forEach((model, i) => {
        if (!model.layout) return;
        model.layout(tall);
        framings[i] = measure(model);
      });
    }
    offsetKey = "";
    if (stage) applyOffset(models[active]?.focus ? now.focus : 0);
    camera.updateProjectionMatrix();
    if (background) background.material.uniforms.uAspect.value = width / height;
    if (options.reduced || !started) frame(0, 16);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  visibility.observe(canvas);

  show(0);
  resize();

  return {
    setChapter(index, progress, last = false) {
      // ScrollTrigger can report NaN while a layout is still settling (phones);
      // one NaN here would poison the camera and every clip uniform.
      if (!Number.isFinite(progress)) return;
      show(index);
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      if (models[index].focus) {
        // A longer chapter: open up and name the parts, then move in on the
        // interface and quote its readings, then step back and close.
        goal.build = smooth(0, 0.09, p) * (last ? 1 : 1 - smooth(0.92, 0.99, p));
        goal.explode = smooth(0.18, 0.38, p) * (1 - smooth(0.8, 0.9, p));
        goal.labels = smooth(0.33, 0.39, p) * (1 - smooth(0.47, 0.51, p));
        goal.focus = smooth(0.5, 0.6, p) * (1 - smooth(0.74, 0.8, p));
        goal.readouts = smooth(0.59, 0.63, p) * (1 - smooth(0.72, 0.75, p));
      } else {
        goal.build = smooth(0, 0.12, p) * (last ? 1 : 1 - smooth(0.9, 0.99, p));
        goal.explode = smooth(0.26, 0.54, p) * (1 - smooth(0.7, 0.86, p));
        goal.labels = smooth(0.46, 0.56, p) * (1 - smooth(0.68, 0.74, p));
        goal.focus = 0;
        goal.readouts = 0;
      }
      goal.yaw = -0.9 + p * 2.0;
      if (options.reduced) {
        Object.assign(now, goal);
        frame(0, 16);
      }
    },

    swap(index) {
      if (index === active) return Promise.resolve();
      return new Promise((resolve) => {
        gsap.killTweensOf(goal);
        gsap
          .timeline({ onComplete: () => resolve() })
          .to(goal, { explode: 1, labels: 0, duration: 0.5, ease: "power2.in" })
          .to(goal, { build: 0, duration: 0.45, ease: "power2.in" }, 0.22)
          .add(() => {
            show(index);
            Object.assign(now, { build: 0, explode: 1, labels: 0 });
            Object.assign(goal, { build: 0, explode: 1, labels: 0 });
          })
          .to(goal, { build: 1, duration: 0.7, ease: "power2.out" })
          .to(goal, { explode: peek ? 0.55 : 0, labels: peek ? 1 : 0, duration: 1, ease: "cv.out" }, "-=0.4");
      });
    },

    setPeek(on) {
      peek = on;
      gsap.to(goal, { explode: on ? 0.55 : 0, labels: on ? 1 : 0, duration: 0.9, ease: "cv.out", overwrite: "auto" });
    },

    drag(dx) {
      userYaw += dx * 0.008;
    },

    start() {
      if (started) return;
      started = true;
      if (options.reduced) {
        Object.assign(now, { build: 1, explode: 0, labels: 0 });
        Object.assign(goal, now);
        frame(0, 16);
        return;
      }
      if (!stage) {
        // Assembles in on arrival: parts gather while the scan builds it up.
        Object.assign(now, { build: 0, explode: 0.7 });
        Object.assign(goal, { build: 0, explode: 0.7 });
        gsap.to(goal, { build: 1, duration: 1.3, ease: "power2.out" });
        gsap.to(goal, { explode: 0, duration: 1.6, delay: 0.5, ease: "cv.out" });
      }
      gsap.ticker.add(tick);
    },

    settle() {
      Object.assign(now, goal);
      frame(performance.now() / 1000, 16);
    },

    state() {
      return { active, build: now.build, explode: now.explode, labels: now.labels, focus: now.focus };
    },

    destroy() {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(goal);
      resizeObserver.disconnect();
      visibility.disconnect();
      layer?.replaceChildren();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose?.();
      });
      kit.dispose();
      shadowMap.dispose();
      envMap.dispose();
      pmrem.dispose();
      composer?.dispose();
      grade.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
