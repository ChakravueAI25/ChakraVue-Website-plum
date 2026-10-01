import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { bootMotion } from "./motion/boot";
import { runIntro } from "./motion/intro";
import "./styles/global.css";
import "./motion/motion.css";
import "./theme/theme.css";
import { initTheme } from "./theme/theme";

// Before React renders: smooth scroll, flags, and the closed iris, so the
// first thing on screen is the intro, never an unanimated page.
bootMotion();

// The site's palette (Plum), applied before the first paint of the page.
initTheme();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void runIntro();
