import * as THREE from "three";
import { gradeUniform } from "../../theme/grade";
import { gsap } from "../gsap";

/**
 * Home hero: a landscape of light points that meets the painted sunset
 * horizon exactly, rolls in from it, breathes with slow noise, ripples
 * under the cursor and carries a scan line of light toward the viewer.
 *
 * It sits on a transparent canvas over the existing CSS gradient, so the
 * designed hero is still there underneath (and is all anyone sees without
 * WebGL, or before this chunk loads).
 */

export type DataHorizon = {
  start(): void;
  destroy(): void;
};

const FOV = 45;
/** The CSS horizon streak (.hero__glow) sits at 74.6% of the hero's height. */
const HORIZON = 0.746;
/** Pitching the camera up by this puts the ground plane's vanishing line at that same height. */
const PITCH = Math.atan((HORIZON - 0.5) * 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
const CAMERA = { y: 1.15, z: 6 };
const FAR_DEPTH = 46;

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

const GROUND_VERT = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform vec2 uMouse;
uniform float uMouseAmp;
uniform float uSize;
uniform float uScale;
uniform float uPixelRatio;
attribute float aRand;
varying float vAlpha;
varying float vGlow;
varying float vDepth;
${NOISE}
void main() {
  vec3 p = position;
  float t = uTime * 0.2;
  float n = snoise(vec2(p.x * 0.085, p.z * 0.085 + t)) * 0.68
          + snoise(vec2(p.x * 0.21 + 3.7, p.z * 0.21 + t * 1.6)) * 0.32;
  float d = distance(p.xz, uMouse);
  float ripple = sin(d * 2.3 - uTime * 3.2) * exp(-d * 0.38);
  float lift = exp(-d * d * 0.16);
  float intro = smoothstep(0.0, 1.0, uIntro);
  p.y += (n * 0.5 + (ripple * 0.24 + lift * 0.7) * uMouseAmp) * intro;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, uSize * uScale * uPixelRatio * (0.7 + aRand * 0.6) / depth);

  // The landscape rolls in from the horizon toward the viewer.
  float front = mix(${FAR_DEPTH + 2}.0, -4.0, intro);
  float introMask = smoothstep(front - 5.0, front + 3.0, depth);
  float fog = 1.0 - smoothstep(24.0, 44.0, depth);
  float nearFade = smoothstep(2.0, 6.5, depth);

  // A slow line of light travelling toward the viewer, like an imaging scan.
  float scanPos = 46.0 - mod(uTime * 6.5, 62.0);
  float scan = exp(-pow(depth - scanPos, 2.0) * 0.06);

  vGlow = clamp(n * 0.7 + 0.3 + lift * uMouseAmp * 1.2 + scan * 0.9, 0.0, 1.6);
  vAlpha = fog * nearFade * introMask;
  vDepth = depth;
}`;

const GROUND_FRAG = /* glsl */ `
uniform vec3 uNear;
uniform vec3 uFar;
uniform vec3 uHot;
uniform mat4 uGrade;
varying float vAlpha;
varying float vGlow;
varying float vDepth;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float sprite = smoothstep(0.5, 0.0, r);
  sprite *= sprite;
  float a = sprite * vAlpha * (0.15 + 0.85 * min(vGlow, 1.0));
  if (a < 0.003) discard;
  vec3 col = mix(uNear, uFar, smoothstep(5.0, 32.0, vDepth));
  col = mix(col, uHot, clamp(vGlow - 0.6, 0.0, 1.0));
  // Additive light: only the palette's colour part, not its offset.
  gl_FragColor = vec4(clamp(mat3(uGrade) * col, 0.0, 1.0), a);
}`;

const EMBER_VERT = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uScale;
uniform float uPixelRatio;
attribute float aRand;
attribute float aSpeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * aSpeed, 9.0) + 0.3;
  p.x += sin(uTime * 0.3 + aRand * 6.2831) * 0.45;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, (12.0 + aRand * 20.0) * uScale * uPixelRatio / depth);
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.1 + aRand * 2.2) + aRand * 20.0);
  float life = smoothstep(0.3, 1.6, p.y) * (1.0 - smoothstep(6.2, 9.3, p.y));
  vAlpha = twinkle * life * uIntro * (1.0 - smoothstep(20.0, 48.0, depth)) * 0.5;
}`;

const EMBER_FRAG = /* glsl */ `
uniform mat4 uGrade;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r);
  a *= a * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(clamp(mat3(uGrade) * vec3(1.0, 0.82, 0.58), 0.0, 1.0), a);
}`;

/** Half-width the ground needs so its far edge stays off-screen at this aspect ratio. */
const widthFor = (aspect: number) =>
  Math.min(38, Math.max(14, FAR_DEPTH * aspect * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) + 6));

function buildGround(halfWidth: number, spacingX: number) {
  const spacingZ = 0.5;
  const positions: number[] = [];
  const rands: number[] = [];
  for (let z = 3.6; z >= CAMERA.z - FAR_DEPTH; z -= spacingZ) {
    for (let x = -halfWidth; x <= halfWidth; x += spacingX) {
      positions.push(x + (Math.random() - 0.5) * spacingX * 0.6, 0, z + (Math.random() - 0.5) * spacingZ * 0.5);
      rands.push(Math.random());
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aRand", new THREE.Float32BufferAttribute(rands, 1));
  return geometry;
}

function buildEmbers(count: number) {
  const positions: number[] = [];
  const rands: number[] = [];
  const speeds: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 56, Math.random() * 9, -6 - Math.random() * 40);
    rands.push(Math.random());
    speeds.push(0.08 + Math.random() * 0.22);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aRand", new THREE.Float32BufferAttribute(rands, 1));
  geometry.setAttribute("aSpeed", new THREE.Float32BufferAttribute(speeds, 1));
  return geometry;
}

export function createDataHorizon(canvas: HTMLCanvasElement, { reduced = false } = {}): DataHorizon {
  const small = window.matchMedia("(max-width: 760px)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  camera.rotation.order = "YXZ";
  camera.rotation.x = PITCH;
  camera.position.set(0, CAMERA.y, CAMERA.z);

  // The site palette, applied in the shaders (identity on the original).
  const grade = gradeUniform();
  const shared = {
    uGrade: grade.uniform,
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uScale: { value: 1 },
    uPixelRatio: { value: dpr },
  };

  const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: GROUND_VERT,
    fragmentShader: GROUND_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      ...shared,
      uMouse: { value: new THREE.Vector2(0, -10) },
      uMouseAmp: { value: 0 },
      uSize: { value: small ? 34 : 44 },
      // Raw sRGB triples: this material writes colour straight to the canvas.
      uNear: { value: new THREE.Vector3(1.0, 0.5, 0.16) },
      uFar: { value: new THREE.Vector3(1.0, 0.84, 0.6) },
      uHot: { value: new THREE.Vector3(1.0, 0.94, 0.8) },
    },
  });
  const emberMaterial = new THREE.ShaderMaterial({
    vertexShader: EMBER_VERT,
    fragmentShader: EMBER_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: shared,
  });

  const spacingX = small ? 0.17 : 0.14;
  let builtWidth = 0;
  const ground = new THREE.Points(new THREE.BufferGeometry(), groundMaterial);
  const embers = new THREE.Points(buildEmbers(small ? 120 : 260), emberMaterial);
  ground.frustumCulled = false;
  embers.frustumCulled = false;
  scene.add(ground, embers);

  /** Rebuild the grid only when the viewport gets wide enough to see its edge. */
  const ensureWidth = (aspect: number) => {
    const needed = widthFor(aspect);
    if (needed <= builtWidth) return;
    ground.geometry.dispose();
    ground.geometry = buildGround(needed, spacingX);
    builtWidth = needed;
  };

  const pointer = { x: 0, y: 0, inside: false };
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const target = new THREE.Vector2(0, -10);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let camX = 0;
  let amp = 0;
  let visible = true;

  const render = () => renderer.render(scene, camera);

  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.inside = event.clientY >= rect.top && event.clientY <= rect.bottom;
  };

  const tick = (time: number) => {
    if (!visible) return;
    shared.uTime.value = time;

    // Slow drift plus a gentle lean toward the pointer. Yaw only (never
    // pitch) so the horizon stays locked to the painted one.
    camX += ((pointer.inside ? pointer.x : 0) * 0.9 - camX) * 0.04;
    camera.position.x = camX + Math.sin(time * 0.12) * 0.25;
    camera.rotation.y = -camX * 0.035;
    camera.updateMatrixWorld();

    ndc.set(pointer.x, pointer.y);
    raycaster.setFromCamera(ndc, camera);
    const onGround =
      pointer.inside && raycaster.ray.intersectPlane(plane, hit) !== null && hit.distanceTo(camera.position) < 40;
    if (onGround) target.set(hit.x, hit.z);
    amp += ((onGround ? 1 : 0) - amp) * 0.05;
    groundMaterial.uniforms.uMouse.value.lerp(target, 0.12);
    groundMaterial.uniforms.uMouseAmp.value = amp;
    render();
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    shared.uScale.value = height / 900;
    ensureWidth(camera.aspect);
    if (reduced) render();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibility.observe(canvas);

  let started = false;

  return {
    start() {
      if (started) return;
      started = true;
      if (reduced) {
        shared.uIntro.value = 1;
        render();
        return;
      }
      window.addEventListener("pointermove", onPointer, { passive: true });
      gsap.ticker.add(tick);
      gsap.to(shared.uIntro, { value: 1, duration: 2.8, ease: "power2.out" });
    },
    destroy() {
      grade.dispose();
      gsap.ticker.remove(tick);
      gsap.killTweensOf(shared.uIntro);
      window.removeEventListener("pointermove", onPointer);
      resizeObserver.disconnect();
      visibility.disconnect();
      ground.geometry.dispose();
      embers.geometry.dispose();
      groundMaterial.dispose();
      emberMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
