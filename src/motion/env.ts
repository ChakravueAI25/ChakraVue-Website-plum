/** Read once at boot: motion is a per-visit decision, not something to toggle mid-animation. */
export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Mouse/trackpad — cursor, magnetic and hover effects only make sense here. */
export const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Layouts that pin sections; phones scroll straight through instead. */
export const isWide = () => window.matchMedia("(min-width: 901px)").matches;
