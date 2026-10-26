import { useEffect, useRef } from "react";
import { reduceMotion } from "../../motion/env";
import { whenRevealed } from "../../motion/gate";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import { chapters } from "../data/story";
import "./growRail.css";

/** Cells in the toddler strip (frames of the campaign clip, cut out). */
const FRAMES = 35;
/** The cells where he waves, played when the pointer finds him. */
const WAVE = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];
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
 * The campaign's kid growing up beside the page as it scrolls: a fixed
 * height chart in the right margin with the toddler from the clip (flying in,
 * waving, pointing), who becomes the doctor and grows to full height by the
 * end of the page. On narrower screens it's a small badge whose ring fills
 * as you read, shown for a moment at each turn of the story. Decorative: hidden from assistive tech, never focusable.
 */
export function GrowRail() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reading = root.querySelector<HTMLElement>(".grow-rail__reading");
    const chapterNo = root.querySelector<HTMLElement>(".grow-rail__chapter-no");
    const chapterTitle = root.querySelector<HTMLElement>(".grow-rail__chapter-title");
    const cueNo = root.querySelector<HTMLElement>(".grow-rail__cue-no");
    const cueTitle = root.querySelector<HTMLElement>(".grow-rail__cue-title");
    let cueTimer = 0;
    // On narrow screens the badge would sit on the content, so it only
    // shows for a moment: when it first appears, at each new chapter, and
    // when he grows up.
    const cue = () => {
      root.classList.add("is-cue");
      window.clearTimeout(cueTimer);
      cueTimer = window.setTimeout(() => root.classList.remove("is-cue"), 2800);
    };
    let frame = 0;
    let pace = { kidEnd: KID_END, morphEnd: MORPH_END, growEnd: 1 };
    // Each chapter's start, as the scroll progress at which it reaches mid-screen.
    let marks: Array<{ id: string; at: number }> = [];
    let chapter = "";

    // Re-read on every refresh: images loading and resizes move the markers.
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      marks = [...document.querySelectorAll<HTMLElement>("[data-chapter]")].map((el) => ({
        id: el.dataset.chapter ?? "",
        // Capped, so a chapter near the foot of the page is still reached.
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
      // The closing scene takes over the story, so the rail steps aside.
      root.classList.toggle("is-handoff", current === "aspiration");
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
      // Replays the label's entrance for the new chapter.
      root.classList.remove("is-turning");
      void root.offsetWidth;
      root.classList.add("is-turning");
    };
    let waving: gsap.core.Tween | undefined;
    let flight: gsap.core.Timeline | undefined;
    let flown = false;
    let trigger: ScrollTrigger | undefined;

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

    // The dream: the first time the chart appears, the toddler flies in
    // from the edge of the screen, as he does in the clip, and lands on it.
    const chart = root.querySelector<HTMLElement>(".grow-rail__chart");
    const flyIn = (delay: number) => {
      flown = true;
      if (reduceMotion || !chart || getComputedStyle(chart).display === "none") return;
      const step = { f: 0, x: 240 };
      root.classList.add("is-flying");
      root.style.setProperty("--fly", "0");
      root.style.setProperty("--fly-x", "240px");
      flight = gsap
        .timeline({ delay, onComplete: () => root.classList.remove("is-flying") })
        .to(step, { f: FLY_FRAMES - 1, duration: 1.5, ease: "none", onUpdate: () => root.style.setProperty("--fly", String(Math.round(step.f))) }, 0)
        .to(step, { x: 0, duration: 1.5, ease: "power2.out", onUpdate: () => root.style.setProperty("--fly-x", `${step.x.toFixed(1)}px`) }, 0);
    };

    // Shown once the hero has scrolled away; on a page that tells the story
    // the chart is there from the start, beside the hero. The curtain
    // (intro, page transition) has to have opened first. The badge steps
    // aside for the footer, whose links sit in its corner.
    const show = () => {
      const story = marks.length > 0 && !!chart && getComputedStyle(chart).display !== "none";
      const on = story || window.scrollY > window.innerHeight * 0.55;
      if (on && !root.classList.contains("is-on")) cue();
      root.classList.toggle("is-on", on);
      // At the top of the page, wait for the hero's headline to land first.
      if (on && !flown) flyIn(window.scrollY < 10 ? 1.1 : 0);
      const footer = document.querySelector("footer");
      root.classList.toggle("is-at-footer", !!footer && footer.getBoundingClientRect().top < window.innerHeight - 120);
    };

    const off = whenRevealed(() => {
      trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          apply(self.progress);
          show();
        },
        onRefresh: (self) => {
          measure();
          apply(self.progress);
          show();
        },
      });
    });

    // The toddler waves back at the pointer (not under reduced motion).
    const stage = root.querySelector<HTMLElement>(".grow-rail__stage");
    const wave = () => {
      if (reduceMotion || waving || root.classList.contains("is-doctor") || root.classList.contains("is-flying")) return;
      const step = { i: 0 };
      waving = gsap.to(step, {
        i: WAVE.length - 1,
        duration: 1.1,
        ease: "none",
        onUpdate: () => root.style.setProperty("--frame", String(WAVE[Math.round(step.i)])),
        onComplete: () => {
          waving = undefined;
          root.style.setProperty("--frame", String(frame));
        },
      });
    };
    stage?.addEventListener("pointerenter", wave);

    return () => {
      off();
      trigger?.kill();
      waving?.kill();
      flight?.kill();
      window.clearTimeout(cueTimer);
      stage?.removeEventListener("pointerenter", wave);
    };
  }, []);

  return (
    <aside ref={ref} className="grow-rail" aria-hidden="true">
      {/* Wide screens: the height chart and the figure growing beside it. */}
      <div className="grow-rail__chart">
        <span className="grow-rail__ruler" />
        <span className="grow-rail__mark">
          <span className="grow-rail__reading">0.95 m</span>
        </span>
        <div className="grow-rail__stage">
          <span className="grow-rail__burst" />
          <span className="grow-rail__kid" />
          <span className="grow-rail__fly" />
          <span className="grow-rail__doctor" />
        </div>
        <span className="grow-rail__note">Every doctor started small.</span>
        {/* The story's chapter on screen (story.ts), on pages that tell it. */}
        <span className="grow-rail__chapter">
          <span className="grow-rail__chapter-no" />
          <span className="grow-rail__chapter-title" />
        </span>
      </div>

      {/* Narrow screens: a badge whose ring fills as the page is read. */}
      <div className="grow-rail__badge">
        <svg viewBox="0 0 52 52" className="grow-rail__ring">
          <circle cx="26" cy="26" r="24" pathLength="1" />
          <circle cx="26" cy="26" r="24" pathLength="1" className="grow-rail__ring-fill" />
        </svg>
        <span className="grow-rail__face grow-rail__face--kid" />
        <span className="grow-rail__face grow-rail__face--doctor" />
        <span className="grow-rail__cue">
          <span className="grow-rail__cue-no" />
          <span className="grow-rail__cue-title" />
        </span>
      </div>
    </aside>
  );
}
