import { gsap } from "./gsap";

/**
 * The intro's first beat: on the bare engineering sheet, the campaign's kid
 * (the superhero toddler from the owner's clip) flies in, lands, waves and
 * says hi, then takes off again, and the intro carries on with the title
 * and the tear. Shared by the WebGL film and its paper fallback.
 *
 * The sprites are the growth rail's (public/images/campaign/grow/): the
 * flight, 13 cells of 380×280 whose last cell is the standing strip's first,
 * and the standing strip, 35 cells of 245×280 (cells 6–11 are the wave).
 */

const FLY = "/images/campaign/grow/toddler-fly.webp";
const STAND = "/images/campaign/grow/toddler-seq.webp";
const FLY_CELLS = 13;
const STAND_CELLS = 35;
const WAVE = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];

const load = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

/** Starts loading the sprites (call early); resolves once both are in, or after `maxMs`. */
export function preloadKid(maxMs = 2500) {
  return Promise.race([Promise.all([load(FLY), load(STAND)]), new Promise((r) => setTimeout(r, maxMs))]);
}

/**
 * Plays the beat inside `root` (above the sheet) and resolves when it's
 * done. `hurry()` is polled so the intro's own skip (click, tap, Esc) also
 * speeds the kid along.
 */
export async function playKid(root: HTMLElement, hurry: () => boolean): Promise<void> {
  await preloadKid();

  const layer = document.createElement("div");
  layer.className = "intro-kid";
  layer.innerHTML = `
    <div class="intro-kid__spot">
      <span class="intro-kid__shadow"></span>
      <span class="intro-kid__fly"></span>
      <span class="intro-kid__stand"></span>
      <span class="intro-kid__hi">Hi!</span>
    </div>`;
  root.appendChild(layer);
  const spot = layer.querySelector<HTMLElement>(".intro-kid__spot")!;
  const fly = layer.querySelector<HTMLElement>(".intro-kid__fly")!;
  const stand = layer.querySelector<HTMLElement>(".intro-kid__stand")!;
  const hi = layer.querySelector<HTMLElement>(".intro-kid__hi")!;
  const shadow = layer.querySelector<HTMLElement>(".intro-kid__shadow")!;

  const cell = (el: HTMLElement, i: number, cells: number) =>
    el.style.setProperty("background-position", `0 ${((Math.round(i) / (cells - 1)) * 100).toFixed(3)}%`);
  const f = { fly: 0, wave: 0 };

  // He flies in from the right edge (his flight in the clip heads left),
  // lands, waves twice with "Hi!", then takes off and leaves to the left.
  const tl = gsap
    .timeline()
    .set(stand, { autoAlpha: 0 })
    .set(hi, { autoAlpha: 0, scale: 0.6, y: 10 })
    .fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0)
    .fromTo(spot, { x: () => window.innerWidth * 0.62 }, { x: 0, duration: 1.6, ease: "power2.out" }, 0)
    .fromTo(f, { fly: 0 }, { fly: FLY_CELLS - 1, duration: 1.6, ease: "none", onUpdate: () => cell(fly, f.fly, FLY_CELLS) }, 0)
    .fromTo(shadow, { autoAlpha: 0, scaleX: 0.4 }, { autoAlpha: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, 0.4)
    // Landed: the standing frames take over, and he waves.
    .set(fly, { autoAlpha: 0 }, 1.6)
    .set(stand, { autoAlpha: 1 }, 1.6)
    .to(hi, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2.2)" }, 1.7)
    .fromTo(f, { wave: 0 }, { wave: WAVE.length - 1, duration: 2.1, ease: "none", onUpdate: () => cell(stand, WAVE[Math.round(f.wave)], STAND_CELLS) }, 1.65)
    .to(hi, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" }, 3.75)
    // Take-off: the flight frames backwards, heading on to the left.
    .set(stand, { autoAlpha: 0 }, 3.85)
    .set(fly, { autoAlpha: 1 }, 3.85)
    .fromTo(f, { fly: FLY_CELLS - 1 }, { fly: 0, immediateRender: false, duration: 0.5, ease: "none", onUpdate: () => cell(fly, f.fly, FLY_CELLS) }, 3.85)
    .to(spot, { x: () => -window.innerWidth * 0.75, y: () => -window.innerHeight * 0.12, duration: 1.1, ease: "power2.in" }, 4.0)
    .to(shadow, { autoAlpha: 0, scaleX: 0.3, duration: 0.6 }, 3.9)
    .to(layer, { autoAlpha: 0, duration: 0.3 }, 4.85);

  cell(fly, 0, FLY_CELLS);
  cell(stand, WAVE[0], STAND_CELLS);
  const check = () => {
    if (hurry() && tl.timeScale() < 3) tl.timeScale(3);
  };
  gsap.ticker.add(check);
  await new Promise<void>((resolve) => tl.eventCallback("onComplete", () => resolve()));
  gsap.ticker.remove(check);
  layer.remove();
}
