import { useEffect, useRef } from "react";
import { useRoute } from "../../app/router";
import { reduceMotion } from "../../motion/env";
import { whenRevealed } from "../../motion/gate";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import { assistant, useAssistant } from "../chat/assistantState";
import { chapters } from "../data/story";
import "./growRail.css";

/** Cells in the toddler strip (frames of the campaign clip, cut out). */
const FRAMES = 35;
/** The cells where he waves, played when the pointer finds him or when saying hi. */
const WAVE = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];
/** Cells in the flight strip; its last cell is the standing strip's first. */
const FLY_FRAMES = 13;

// Where the page's scroll hands over: the toddler's clip plays through the
// first part, he becomes the doctor, and the doctor grows to full height.
// Pages that tell the story (ChapterMark) pace it by their chapters instead.
const KID_END = 0.56;
const MORPH_END = 0.68;
/** Scroll (as a share of the page) the growing up takes once the journey begins. */
const MORPH_SPAN = 0.05;

// Figure heights on the rail (px) and the readout (m), for each stage.
const KID_PX = [96, 120];
const DOC_PX = [150, 214];
const KID_M = [0.95, 1.1];
const DOC_M = [1.55, 1.74];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The campaign's superhero kid on every page as the interactive Product Assistant:
 * floating on the right side with his cape, saying "Hi!" with an animated wave,
 * and inviting visitors to ask questions with an interactive speech bubble.
 * On wide screens on the homepage, the story height chart accompanies him.
 */
export function GrowRail() {
  const ref = useRef<HTMLElement>(null);
  const path = useRoute();
  const { open, searching } = useAssistant();
  const waveRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reading = root.querySelector<HTMLElement>(".grow-rail__reading");
    const chapterNo = root.querySelector<HTMLElement>(".grow-rail__chapter-no");
    const chapterTitle = root.querySelector<HTMLElement>(".grow-rail__chapter-title");
    const cueNo = root.querySelector<HTMLElement>(".grow-rail__cue-no");
    const cueTitle = root.querySelector<HTMLElement>(".grow-rail__cue-title");
    let cueTimer = 0;

    const cue = () => {
      root.classList.add("is-cue");
      window.clearTimeout(cueTimer);
      window.clearTimeout(inviteTimer);
      cueTimer = window.setTimeout(() => root.classList.remove("is-cue"), 2800);
    };
    let frame = 0;
    let pace = { kidEnd: KID_END, morphEnd: MORPH_END, growEnd: 1 };
    let marks: Array<{ id: string; at: number }> = [];
    let chapter = "";

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      marks = [...document.querySelectorAll<HTMLElement>("[data-chapter]")].map((el) => ({
        id: el.dataset.chapter ?? "",
        at: max > 0 ? Math.min((el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2) / max, 0.985) : 0,
      }));
      const at = (id: string) => marks.find((m) => m.id === id)?.at;
      const journey = at("journey");
      const aspiration = at("aspiration");
      pace =
        journey !== undefined
          ? { kidEnd: journey, morphEnd: Math.min(journey + MORPH_SPAN, 1), growEnd: Math.max(aspiration ?? 1, journey + MORPH_SPAN + 0.01) }
          : { kidEnd: KID_END, morphEnd: MORPH_END, growEnd: 1 };
    };

    const name = (p: number) => {
      const current = marks.filter((m) => m.at <= p + 1e-4).pop()?.id ?? "";
      if (current === chapter) return;
      chapter = current;
      root.classList.toggle("is-handoff", current === "aspiration");
      show();
      const index = chapters.findIndex((c) => c.id === current);
      root.classList.toggle("has-chapter", index >= 0);
      if (index < 0 || !chapterNo || !chapterTitle) return;
      chapterNo.textContent = String(index + 1).padStart(2, "0");
      chapterTitle.textContent = chapters[index].title;
      if (cueNo && cueTitle) {
        cueNo.textContent = chapterNo.textContent;
        cueTitle.textContent = chapterTitle.textContent;
      }
      if (root.classList.contains("is-on")) cue();
      root.classList.remove("is-turning");
      void root.offsetWidth;
      root.classList.add("is-turning");
    };
    let waving: gsap.core.Tween | undefined;
    let flight: gsap.core.Timeline | undefined;
    let flown = false;
    let trigger: ScrollTrigger | undefined;

    let lastRailMorph = "";
    const apply = (p: number) => {
      const { kidEnd, morphEnd, growEnd } = pace;
      const kid = clamp01(p / kidEnd);
      const morph = clamp01((p - kidEnd) / (morphEnd - kidEnd));
      const grow = clamp01((p - morphEnd) / (growEnd - morphEnd));
      frame = Math.round(kid * (FRAMES - 1));
      const kidPx = lerp(KID_PX[0], KID_PX[1], kid);
      const docPx = lerp(DOC_PX[0], DOC_PX[1], grow);
      const metres = morph < 1 ? lerp(lerp(KID_M[0], KID_M[1], kid), DOC_M[0], morph) : lerp(DOC_M[0], DOC_M[1], grow);

      if (!waving) root.style.setProperty("--frame", String(frame));
      root.style.setProperty("--p", p.toFixed(4));
      root.style.setProperty("--morph", morph.toFixed(4));
      // On <html> every write restyles the whole page, so only when it changes.
      const railMorph = morph.toFixed(2);
      if (railMorph !== lastRailMorph) {
        lastRailMorph = railMorph;
        document.documentElement.style.setProperty("--rail-morph", railMorph);
      }
      root.style.setProperty("--burst", (1 - Math.abs(2 * morph - 1)).toFixed(4));
      root.style.setProperty("--kid-h", `${kidPx.toFixed(1)}px`);
      root.style.setProperty("--doc-h", `${docPx.toFixed(1)}px`);
      root.style.setProperty("--top", `${lerp(kidPx * 0.97, docPx, morph).toFixed(1)}px`);
      const grownUp = morph >= 0.5;
      if (grownUp !== root.classList.contains("is-doctor") && root.classList.contains("is-on")) cue();
      root.classList.toggle("is-doctor", grownUp);
      if (reading) reading.textContent = `${metres.toFixed(2)} m`;
      name(p);
    };

    const chart = root.querySelector<HTMLElement>(".grow-rail__chart");
    let inviteTimer = 0;
    const invite = () => {
      root.classList.add("is-inviting");
      window.clearTimeout(inviteTimer);
      inviteTimer = window.setTimeout(() => root.classList.remove("is-inviting"), 4500);
    };
    const flyIn = (delay: number) => {
      flown = true;
      if (reduceMotion || !chart || getComputedStyle(chart).display === "none") {
        inviteTimer = window.setTimeout(invite, (delay + 0.6) * 1000);
        return;
      }
      const step = { f: 0, x: 240 };
      root.classList.add("is-flying");
      root.style.setProperty("--fly", "0");
      root.style.setProperty("--fly-x", "240px");
      flight = gsap
        .timeline({
          delay,
          onComplete: () => {
            root.classList.remove("is-flying");
            invite();
          },
        })
        .to(step, { f: FLY_FRAMES - 1, duration: 1.5, ease: "none", onUpdate: () => root.style.setProperty("--fly", String(Math.round(step.f))) }, 0)
        .to(step, { x: 0, duration: 1.5, ease: "power2.out", onUpdate: () => root.style.setProperty("--fly-x", `${step.x.toFixed(1)}px`) }, 0);
    };

    // The chatbot is visible and ready on every page. On wide screens on the
    // homepage with chapters, the story ruler chart appears alongside him.
    const show = () => {
      const isHome = path === "/" || window.location.pathname === "/" || document.documentElement.dataset.page === "home";
      const chartDisplayed = !!chart && getComputedStyle(chart).display !== "none";
      const story = isHome && marks.length > 0 && chartDisplayed;
      const on = true;
      const chartShows = story && !root.classList.contains("is-handoff");
      document.documentElement.classList.toggle("has-rail-chart", chartShows);
      if (on && !root.classList.contains("is-on")) cue();
      root.classList.toggle("is-on", on);
      if (chartShows && !flown) flyIn(window.scrollY < 10 ? 1.1 : 0);
      const footer = document.querySelector("footer");
      root.classList.toggle("is-at-footer", !!footer && footer.getBoundingClientRect().top < window.innerHeight - 130);
    };

    measure();
    show();

    const off = whenRevealed(() => {
      trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        // Read (show measures the footer) before writing (apply sets
        // styles), so a scroll frame never forces a layout in between.
        onUpdate: (self) => {
          show();
          apply(self.progress);
        },
        onRefresh: (self) => {
          measure();
          apply(self.progress);
          show();
        },
      });
    });

    // The toddler waves hello ("saying hi") at the pointer and on greetings.
    const stage = root.querySelector<HTMLElement>(".grow-rail__stage");
    const guyBtn = root.querySelector<HTMLElement>(".grow-rail__guy-btn");
    const bubble = root.querySelector<HTMLElement>(".grow-rail__bubble");
    const chartBubble = root.querySelector<HTMLElement>(".grow-rail__bubble--chart");

    const wave = () => {
      if (reduceMotion || waving || root.classList.contains("is-flying")) return;
      const step = { i: 0 };
      waving = gsap.to(step, {
        i: WAVE.length - 1,
        duration: 1.25,
        ease: "none",
        onUpdate: () => {
          const f = WAVE[Math.round(step.i)];
          root.style.setProperty("--frame", String(f));
          root.style.setProperty("--bot-frame", String(f));
        },
        onComplete: () => {
          waving = undefined;
          root.style.setProperty("--frame", String(frame));
          root.style.setProperty("--bot-frame", "0");
        },
      });
    };

    stage?.addEventListener("pointerenter", wave);
    guyBtn?.addEventListener("pointerenter", wave);
    bubble?.addEventListener("pointerenter", wave);
    chartBubble?.addEventListener("pointerenter", wave);

    const onBotClick = () => {
      wave();
    };
    guyBtn?.addEventListener("click", onBotClick);
    bubble?.addEventListener("click", onBotClick);
    chartBubble?.addEventListener("click", onBotClick);

    waveRef.current = wave;

    // Welcome greeting wave and speech bubble shortly after page appears
    const welcomeTimer = window.setTimeout(() => {
      show();
      wave();
      invite();
    }, 1000);

    // Periodic gentle wave when idle to remind the user he is there
    const idleTimer = window.setInterval(() => {
      if (ref.current && !ref.current.classList.contains("is-chatting") && !waving) {
        wave();
      }
    }, 22000);

    return () => {
      off();
      trigger?.kill();
      waving?.kill();
      flight?.kill();
      window.clearTimeout(cueTimer);
      window.clearTimeout(inviteTimer);
      window.clearTimeout(welcomeTimer);
      window.clearInterval(idleTimer);
      stage?.removeEventListener("pointerenter", wave);
      guyBtn?.removeEventListener("pointerenter", wave);
      bubble?.removeEventListener("pointerenter", wave);
      chartBubble?.removeEventListener("pointerenter", wave);
      guyBtn?.removeEventListener("click", onBotClick);
      bubble?.removeEventListener("click", onBotClick);
      chartBubble?.removeEventListener("click", onBotClick);
      document.documentElement.classList.remove("has-rail-chart");
    };
  }, []);

  // He waves hello when the chat opens.
  useEffect(() => {
    ref.current?.classList.toggle("is-chatting", open);
    if (open) waveRef.current();
  }, [open]);

  useEffect(() => {
    ref.current?.classList.toggle("is-searching", searching);
  }, [searching]);

  // Wave and invite when navigating between pages
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const t = window.setTimeout(() => {
      waveRef.current();
      root.classList.add("is-inviting");
      window.setTimeout(() => root.classList.remove("is-inviting"), 4500);
    }, 900);
    return () => window.clearTimeout(t);
  }, [path]);

  const launcher = {
    "data-assistant-launcher": "",
    "aria-label": open ? "Close the Product Assistant" : "Ask the Product Assistant about our products",
    "aria-expanded": open,
    "aria-controls": "assist-window",
    onClick: assistant.toggle,
  } as const;

  return (
    <aside
      ref={ref}
      className="grow-rail is-on"
      aria-label="Product Assistant"
    >
      {/* Wide screens on Home: the height chart and the figure growing beside it */}
      <div className="grow-rail__chart">
        <span className="grow-rail__ruler" aria-hidden="true" />
        <span className="grow-rail__mark" aria-hidden="true">
          <span className="grow-rail__reading">0.95 m</span>
        </span>
        <button type="button" className="grow-rail__stage" {...launcher}>
          <span className="grow-rail__burst" aria-hidden="true" />
          <span className="grow-rail__kid" aria-hidden="true" />
          <span className="grow-rail__fly" aria-hidden="true" />
          <span className="grow-rail__doctor" aria-hidden="true" />
        </button>
        {/* Interactive speech bubble */}
        <div
          className="grow-rail__bubble grow-rail__bubble--chart"
          onClick={assistant.toggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              assistant.toggle();
            }
          }}
          aria-label="Ask questions about our products"
        >
          <div className="grow-rail__bubble-row">
            <span className="grow-rail__bubble-tag">Hi! 👋</span>
            <span className="grow-rail__bubble-title">Ask me questions</span>
          </div>
          <span className="grow-rail__bubble-sub">Product Assistant</span>
          <span className="grow-rail__bubble-tail" aria-hidden="true" />
        </div>
        {/* The story's chapter on screen (story.ts), on pages that tell it. */}
        <span className="grow-rail__chapter" aria-hidden="true">
          <span className="grow-rail__chapter-no" />
          <span className="grow-rail__chapter-title" />
        </span>
      </div>

      {/* Floating Interactive Chatbot Guy: displayed on all pages */}
      <div className="grow-rail__bot" aria-label="Product Assistant">
        {/* Interactive Speech Bubble: "Hi! Ask me questions" */}
        <div
          className="grow-rail__bubble"
          onClick={assistant.toggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              assistant.toggle();
            }
          }}
          aria-label="Ask questions about our products"
        >
          <div className="grow-rail__bubble-row">
            <span className="grow-rail__bubble-tag">Hi! 👋</span>
            <span className="grow-rail__bubble-title">Ask me questions</span>
          </div>
          <span className="grow-rail__bubble-sub">Product Assistant</span>
          <span className="grow-rail__bubble-tail" aria-hidden="true" />
        </div>

        {/* The Superhero Kid Chatbot Character Button */}
        <button
          type="button"
          className="grow-rail__guy-btn"
          {...launcher}
        >
          <div className="grow-rail__guy-stage">
            <span className="grow-rail__guy-sprite" aria-hidden="true" />
            <span className="grow-rail__guy-shadow" aria-hidden="true" />
          </div>
        </button>

        {/* Chapter cue if on a chapter page */}
        <span className="grow-rail__cue" aria-hidden="true">
          <span className="grow-rail__cue-no" />
          <span className="grow-rail__cue-title" />
        </span>
      </div>
    </aside>
  );
}
