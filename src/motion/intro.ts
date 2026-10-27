import { reduceMotion } from "./env";
import { fontsReady } from "./fonts";
import { reveal } from "./gate";
import { playLogoIntro } from "./introLogo";
import { mountIris, openIris, releaseIris } from "./iris";
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
 * First visit: the logo intro (introLogo.ts). The ChakraVue AI mark gathers
 * out of a particle burst, then the page opens through its ring. If the film
 * can't load in time, the iris simply opens. Later visits in the same
 * session skip straight to a short iris open.
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
  const ready = Promise.all([fontsReady, Promise.race([windowLoaded(), wait(4500)])]);
  const open = () => {
    document.documentElement.classList.remove("is-intro");
    lockScroll(false);
    reveal();
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode: the intro just plays again next time */
    }
  };

  try {
    await playLogoIntro(root, ready, open);
    releaseIris();
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[intro] opening without the logo film:", error);
    await Promise.race([ready, wait(1500)]);
    const opening = openIris(1.25);
    open();
    await opening;
  }
}
