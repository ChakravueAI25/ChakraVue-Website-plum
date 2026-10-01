import { finePointer, reduceMotion } from "./env";
import { ScrollTrigger } from "./gsap";
import { mountIris } from "./iris";
import { initLenis } from "./lenis";

/** Runs before React renders: flags, smooth scroll and the closed curtain. */
export function bootMotion() {
  const html = document.documentElement;
  html.classList.toggle("motion-ok", !reduceMotion);
  html.classList.toggle("fine-pointer", finePointer);

  initLenis();
  if (!reduceMotion) mountIris();

  // Images and fonts that arrive late shift layout under existing triggers,
  // so re-measure once things settle.
  let timer = 0;
  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
  };
  document.addEventListener(
    "load",
    (event) => {
      if (event.target instanceof HTMLImageElement) refresh();
    },
    true,
  );
  document.fonts?.addEventListener("loadingdone", refresh);
}
