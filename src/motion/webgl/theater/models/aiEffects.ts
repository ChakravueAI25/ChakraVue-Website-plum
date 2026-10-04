import * as THREE from "three";

/**
 * The "AI at work" touches drawn over the product interfaces: an analysis
 * beam sweeping the live view (leaving a measuring grid and detection
 * points in its wake), a reticle that locks onto the detected eye with
 * pulses radiating from it, and readings streaming from the eye into the
 * measurement panels.
 *
 * Cyan, like the interfaces' own overlays, and added light only. Each one
 * keeps the screen's alpha mark, so the palette grade leaves the screen
 * (and the effect) in true colour; see `Kit.interfaceScreen`.
 */

const AI = "vec3(0.32, 0.86, 1.0)";

/** Adds colour, and leaves the alpha beneath untouched. */
const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

const quadVertex = /* glsl */ `
  #include <clipping_planes_pars_vertex>
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <clipping_planes_vertex>
  }`;

function shader(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>, clip: THREE.Plane[] | null) {
  const material = new THREE.ShaderMaterial({ ...additive, uniforms, vertexShader, fragmentShader, clipping: true });
  material.clippingPlanes = clip;
  return material;
}

/** The analysis beam, grid, detection points and viewfinder corners, for a layer `aspect` wide per unit high. */
export function scanMaterial(aspect: number, clip: THREE.Plane[] | null) {
  return shader(
    quadVertex,
    /* glsl */ `
    #include <clipping_planes_pars_fragment>
    varying vec2 vUv;
    uniform float uTime;
    uniform float uStrength;
    uniform float uAspect;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      #include <clipping_planes_fragment>
      // The beam crosses left to right, then rests a moment off the edge.
      float s = fract(uTime * 0.16) * 1.35 - 0.12;
      float d = vUv.x - s;
      float core = exp(-pow(d / max(0.0025, fwidth(vUv.x)), 2.0));
      float halo = exp(-pow(d / 0.035, 2.0)) * 0.28;
      float wake = d < 0.0 ? exp(d / 0.2) : 0.0;
      // A measuring grid and detection points show in its wake.
      vec2 g = vec2(vUv.x * uAspect, vUv.y) * 12.0;
      vec2 cell = abs(fract(g) - 0.5);
      float grid = smoothstep(0.5 - fwidth(g.y) * 1.2, 0.5, max(cell.x, cell.y));
      vec2 dg = vec2(vUv.x * uAspect, vUv.y) * 30.0;
      vec2 id = floor(dg);
      vec2 spot = vec2(hash(id + 3.1), hash(id + 7.7)) * 0.6 + 0.2;
      float points = step(0.9, hash(id)) * (1.0 - smoothstep(0.06, 0.12, length(fract(dg) - spot)));
      // Viewfinder corners.
      vec2 e = min(vUv, 1.0 - vUv);
      float corners = max(step(e.x, fwidth(vUv.x) * 1.6) * step(e.y, 0.09), step(e.y, fwidth(vUv.y) * 1.6) * step(e.x, 0.09 / uAspect));
      float inside = smoothstep(0.0, 0.015, e.x) * smoothstep(0.0, 0.03, e.y);
      float light = (core * 0.95 + halo * 0.8 + wake * (grid * 0.22 + points * 1.1)) * inside + corners * 0.9;
      gl_FragColor = vec4(${AI} * light * uStrength, 1.0);
    }`,
    { uTime: { value: 0 }, uStrength: { value: 0 }, uAspect: { value: aspect } },
    clip,
  );
}

/** A square reticle: corner brackets that close in as `uLock` goes to 1, centre ticks, radiating pulses. */
export function lockMaterial(clip: THREE.Plane[] | null) {
  return shader(
    quadVertex,
    /* glsl */ `
    #include <clipping_planes_pars_fragment>
    varying vec2 vUv;
    uniform float uTime;
    uniform float uStrength;
    uniform float uLock;
    float line(float d, float px) { return 1.0 - smoothstep(px, px * 2.0, d); }
    void main() {
      #include <clipping_planes_fragment>
      vec2 p = vUv - 0.5;
      vec2 a = abs(p);
      float px = fwidth(p.x) * 1.2;
      float h = mix(0.49, 0.4, uLock) + 0.005 * sin(uTime * 2.6);
      float reach = 0.1;
      float brackets = max(
        line(abs(a.x - h), px) * step(h - reach, a.y) * step(a.y, h + px),
        line(abs(a.y - h), px) * step(h - reach, a.x) * step(a.x, h + px)
      );
      float r = length(p);
      float pulses = 0.0;
      for (int i = 0; i < 3; i++) {
        float t = fract(uTime * 0.4 + float(i) / 3.0);
        pulses += (1.0 - t) * line(abs(r - t * 0.42), px);
      }
      pulses *= smoothstep(0.42, 0.3, r);
      float ticks = line(a.x, px) * step(0.02, a.y) * step(a.y, 0.05) + line(a.y, px) * step(0.02, a.x) * step(a.x, 0.05);
      float light = brackets * (0.9 + 0.6 * (1.0 - uLock)) + pulses * 0.35 + ticks * 0.8;
      gl_FragColor = vec4(${AI} * light * uStrength, 1.0);
    }`,
    { uTime: { value: 0 }, uStrength: { value: 0 }, uLock: { value: 0 } },
    clip,
  );
}

/** Soft points for the readings in flight; each vertex carries its own fade. */
export function flowMaterial(clip: THREE.Plane[] | null) {
  return shader(
    /* glsl */ `
    #include <clipping_planes_pars_vertex>
    attribute float aFade;
    uniform float uSize;
    varying float vFade;
    void main() {
      vFade = aFade;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = uSize / -mvPosition.z;
      #include <clipping_planes_vertex>
    }`,
    /* glsl */ `
    #include <clipping_planes_pars_fragment>
    uniform float uStrength;
    varying float vFade;
    void main() {
      #include <clipping_planes_fragment>
      float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
      gl_FragColor = vec4(${AI} * a * a * vFade * uStrength * 1.4, 1.0);
    }`,
    { uStrength: { value: 0 }, uSize: { value: 30 } },
    clip,
  );
}
