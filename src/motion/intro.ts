import { reduceMotion } from "./env";
import { fontsReady } from "./fonts";
import { reveal } from "./gate";
import { preloadKid } from "./introKid";
import { playPaper } from "./introPaper";
import { mountIris, openIris } from "./iris";
import { lockScroll } from "./lenis";

const SEEN_KEY = "cv-intro-seen";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const windowLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * First visit: the intro film (webgl/introFilm.ts), a live-rendered shot from
 * an 1887 engineering sheet, where the campaign's kid first flies in and
 * says hi (introKid.ts), then the sheet is torn open onto "VUE AI", to the
 * ChakraVue AI mark. Without WebGL (or if it can't load in time) the same story plays
 * with DOM layers (introPaper.ts). Either way the page then opens through
 * the iris. Later visits in the same session skip straight to a short iris
 * open.
 */
export async function runIntro() {
  if (reduceMotion) return;
  lockScroll(true);

  if (seenThisSession()) {
    await Promise.race([fontsReady, wait(900)]);
    const opening = openIris(1.2);
    lockScroll(false);
    reveal();
    await opening;
    return;
  }

  // The intro runs edge to edge, so the scrollbar is hidden until it opens.
  document.documentElement.classList.add("is-intro");
  const root = mountIris();
  void preloadKid();
  const ready = Promise.all([fontsReady, Promise.race([windowLoaded(), wait(4500)])]);

  let finish: (opening: Promise<void>) => void;
  try {
    const slow = wait(3500).then(() => Promise.reject(new Error("intro film took too long to load")));
    slow.catch(() => undefined);
    const { playFilm } = await Promise.race([import("./webgl/introFilm"), slow]);
    finish = await playFilm(root, ready);
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[intro] falling back to the paper intro:", error);
    root.querySelectorAll(".film, .film__title, .film__skip").forEach((el) => el.remove());
    finish = await playPaper(root, ready);
  }

  document.documentElement.classList.remove("is-intro");
  const opening = openIris(1.25);
  finish(opening);
  lockScroll(false);
  reveal();
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode: the full intro just plays again next time */
  }
  await opening;
}
