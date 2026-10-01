const FAMILIES = ["Audiowide"];

/**
 * Resolves once the web fonts are usable (or after `maxMs`). Text is split
 * into lines by measuring it, so splitting before the real font arrives
 * would break lines in the wrong places.
 *
 * `document.fonts.ready` alone isn't enough: it resolves immediately if the
 * Google Fonts stylesheet hasn't registered its @font-face rules yet.
 */
export function waitForFonts(maxMs = 2500): Promise<void> {
  if (!("fonts" in document)) return Promise.resolve();
  const deadline = performance.now() + maxMs;

  return new Promise((resolve) => {
    const finish = () => {
      const loads = FAMILIES.map((family) => document.fonts.load(`16px "${family}"`).catch(() => []));
      const timeout = new Promise((r) => setTimeout(r, Math.max(0, deadline - performance.now())));
      Promise.race([Promise.all(loads).then(() => document.fonts.ready), timeout]).then(() => resolve());
    };
    const attempt = () => {
      const faces = [...document.fonts].map((face) => face.family.replace(/["']/g, ""));
      const registered = FAMILIES.every((family) => faces.includes(family));
      if (registered || performance.now() > deadline) finish();
      else setTimeout(attempt, 40);
    };
    attempt();
  });
}

export const fontsReady = waitForFonts();
