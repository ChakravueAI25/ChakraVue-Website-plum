import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as tex from "./textures";

/**
 * The modelling kit shared by the four product models: one set of
 * materials (so a look change is one line), primitive helpers, and the
 * "part" system that drives the exploded view.
 */

export type Quality = "high" | "low";
export type V3 = [number, number, number];

export type Part = {
  object: THREE.Object3D;
  home: THREE.Vector3;
  homeRotation: THREE.Euler;
  /** Where the part travels to in the fully exploded view (relative to home). */
  offset: THREE.Vector3;
  /** Extra rotation it picks up on the way. */
  spin: THREE.Euler;
  /** 0 leaves first, 1 leaves last. */
  delay: number;
};

/** A labelled point on a part, numbered in the order given in the product data. */
export type Anchor = {
  id: string;
  object: THREE.Object3D;
  point: THREE.Vector3;
  side: "left" | "right";
};

/** Framing (height, focus, radius) is measured by the engine, not hand-tuned per model. */
export type ProductModel = {
  group: THREE.Group;
  parts: Part[];
  anchors: Anchor[];
  /** Per-frame hook for motion beyond the explode (cables, data packets, layer fades). */
  update?: (explode: number, time: number) => void;
};

export class Kit {
  readonly m;
  private disposables: Array<{ dispose(): void }> = [];

  constructor(
    readonly quality: Quality,
    clip: THREE.Plane[],
  ) {
    const clipped = <T extends THREE.Material>(material: T) => {
      material.clippingPlanes = clip;
      this.disposables.push(material);
      return material;
    };
    const physical = (params: THREE.MeshPhysicalMaterialParameters) => clipped(new THREE.MeshPhysicalMaterial(params));
    const glow = (hex: string, strength: number) => {
      const color = new THREE.Color(hex).multiplyScalar(strength);
      return clipped(new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    };
    const screen = (map: THREE.Texture, strength = 1.25) => {
      this.disposables.push(map);
      return clipped(new THREE.MeshBasicMaterial({ map, color: new THREE.Color(strength, strength, strength), toneMapped: false }));
    };
    const circuitMap = tex.circuit();
    this.disposables.push(circuitMap);
    const high = quality === "high";

    this.m = {
      /** Dark lacquered housing. */
      shell: physical({ color: "#1d2025", metalness: 0.65, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.22 }),
      /** Brushed surgical alloy, like the product renders. */
      alloy: physical({ color: "#a7abb3", metalness: 0.9, roughness: 0.34, clearcoat: 0.25 }),
      graphite: physical({ color: "#2b2e34", metalness: 0.55, roughness: 0.42 }),
      rubber: physical({ color: "#0b0c0e", metalness: 0.05, roughness: 0.78 }),
      chrome: physical({ color: "#f0f0f0", metalness: 1, roughness: 0.08 }),
      /** Coated optics: clear glass with the violet-green sheen of anti-reflection coating. */
      lens: high
        ? physical({
            color: "#fff4e8",
            metalness: 0,
            roughness: 0.03,
            transmission: 1,
            thickness: 0.12,
            ior: 1.52,
            iridescence: 1,
            iridescenceIOR: 1.35,
            iridescenceThicknessRange: [180, 420],
          })
        : physical({ color: "#e8dcff", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.45, iridescence: 1 }),
      glass: high
        ? physical({ color: "#ffe8d0", metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.3, ior: 1.5 })
        : physical({ color: "#ffe8d0", metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.35 }),
      circuit: clipped(
        new THREE.MeshStandardMaterial({
          map: circuitMap,
          emissive: new THREE.Color("#ff8b12"),
          emissiveMap: circuitMap,
          emissiveIntensity: 1.6,
          metalness: 0.35,
          roughness: 0.55,
        }),
      ),
      /** Chips, LEDs, the ChakraVue ring: bright enough to bloom. */
      glow: glow("#ff8b12", 2.6),
      glowWarm: glow("#ffc27a", 2.1),
      glowSoft: glow("#ff8b12", 1.2),
      surgicalScreen: screen(tex.surgicalScreen()),
      slitScreen: screen(tex.slitScreen(), 1.6),
      deviceScreen: screen(tex.deviceScreen()),
      emrScreen: screen(tex.emrDashboard(), 1.15),
      /** Amber construction lines that trace the housings in the exploded view. */
      edge: clipped(new THREE.LineBasicMaterial({ color: "#ffb46a", transparent: true, opacity: 0, depthWrite: false })),
    };
  }

  /** Per-model materials the kit should still clean up. */
  own<T extends { dispose(): void }>(thing: T) {
    this.disposables.push(thing);
    return thing;
  }

  box(w: number, h: number, d: number, r: number, material: THREE.Material, segments = 4) {
    const radius = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
    return this.mesh(new RoundedBoxGeometry(w, h, d, segments, Math.max(radius, 0.001)), material);
  }

  cyl(rTop: number, rBottom: number, h: number, material: THREE.Material, segments = 48) {
    return this.mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material);
  }

  /** A cylinder lying along Z (eyepieces, objectives, lenses facing the viewer). */
  tube(r: number, length: number, material: THREE.Material, segments = 40) {
    const mesh = this.cyl(r, r, length, material, segments);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  torus(radius: number, tube: number, material: THREE.Material, arc = Math.PI * 2, segments = 96) {
    return this.mesh(new THREE.TorusGeometry(radius, tube, 16, segments, arc), material);
  }

  sphere(r: number, material: THREE.Material, phiLength = Math.PI * 2, thetaLength = Math.PI) {
    return this.mesh(new THREE.SphereGeometry(r, 40, 24, 0, phiLength, 0, thetaLength), material);
  }

  plane(w: number, h: number, material: THREE.Material) {
    return this.mesh(new THREE.PlaneGeometry(w, h), material);
  }

  /** Circuit board with a glowing processor on it. */
  board(w: number, d: number, chip = 0.3) {
    const group = new THREE.Group();
    group.add(this.box(w, 0.014, d, 0.004, this.m.circuit, 1));
    const core = this.box(w * chip, 0.02, d * chip, 0.004, this.m.graphite, 1);
    core.position.y = 0.016;
    const die = this.box(w * chip * 0.55, 0.006, d * chip * 0.55, 0.002, this.m.glow, 1);
    die.position.y = 0.028;
    group.add(core, die);
    return group;
  }

  /** Heatsink fins. */
  fins(w: number, h: number, d: number, count: number) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const fin = this.box(w, h, 0.006, 0.002, this.m.alloy, 1);
      fin.position.z = -d / 2 + (d / (count - 1)) * i;
      group.add(fin);
    }
    return group;
  }

  /**
   * Construction lines around a housing, shown only while exploded. Rounded
   * boxes have no hard edges to trace, so they get their bounding box
   * instead: a draughtsman's box floating just off the surface.
   */
  outline<T extends THREE.Mesh>(mesh: T) {
    let source = mesh.geometry;
    if (source instanceof RoundedBoxGeometry) {
      source.computeBoundingBox();
      const size = source.boundingBox!.getSize(new THREE.Vector3()).multiplyScalar(1.03);
      source = this.own(new THREE.BoxGeometry(size.x, size.y, size.z));
    }
    const lines = new THREE.LineSegments(this.own(new THREE.EdgesGeometry(source, 35)), this.m.edge);
    lines.raycast = () => {};
    mesh.add(lines);
    return mesh;
  }

  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material) {
    this.disposables.push(geometry);
    return new THREE.Mesh(geometry, material);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}

/** Collects a model's parts and label anchors while it's being built. */
export class Build {
  readonly group = new THREE.Group();
  readonly parts: Part[] = [];
  readonly anchors: Anchor[] = [];

  constructor(readonly kit: Kit) {}

  /** Adds `object` to `parent` at `position` (and `rotation`), and returns it. */
  put<T extends THREE.Object3D>(object: T, position: V3, parent: THREE.Object3D = this.group, rotation?: V3): T {
    object.position.set(...position);
    if (rotation) object.rotation.set(...rotation);
    parent.add(object);
    return object;
  }

  node(position: V3, parent: THREE.Object3D = this.group, rotation?: V3) {
    return this.put(new THREE.Group(), position, parent, rotation);
  }

  /** Marks an already-placed object as a part of the exploded view. */
  part<T extends THREE.Object3D>(object: T, offset: V3, { spin = [0, 0, 0] as V3, delay = 0.5 } = {}): T {
    this.parts.push({
      object,
      home: object.position.clone(),
      homeRotation: object.rotation.clone(),
      offset: new THREE.Vector3(...offset),
      spin: new THREE.Euler(...spin),
      delay,
    });
    return object;
  }

  anchor(id: string, object: THREE.Object3D, point: V3, side: Anchor["side"]) {
    this.anchors.push({ id, object, point: new THREE.Vector3(...point), side });
  }

  finish(update?: ProductModel["update"]): ProductModel {
    return { group: this.group, parts: this.parts, anchors: this.anchors, update };
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Moves every part between its assembled and exploded pose; parts leave in sequence. */
export function applyExplode(parts: Part[], explode: number) {
  for (const part of parts) {
    const t = THREE.MathUtils.clamp((explode - part.delay * 0.35) / 0.65, 0, 1);
    const k = easeInOut(t);
    part.object.position.copy(part.home).addScaledVector(part.offset, k);
    part.object.rotation.set(
      part.homeRotation.x + part.spin.x * k,
      part.homeRotation.y + part.spin.y * k,
      part.homeRotation.z + part.spin.z * k,
    );
  }
}
