import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "../../../brand/Logo";
import { reduceMotion } from "../../../motion/env";
import { gsap, ScrollTrigger, SplitText } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { boxStory } from "../data";
import { BoxSound, setSoundPreference, soundPreference } from "./boxSound";
import { CARD_SLOTS, KEY_LENGTH, layouts, type Device, type Fragment, type FragmentKind } from "./boxStoryLayout";
import "./box.css";

/** The shared beat every connected device falls into (seconds). */
const BEAT = 1.6;
/** How far the lid stands open (degrees, about its left hinge). */
const LID_OPEN = -20;

/**
 * "The Box opens": cacophony to symphony, without words. Six clinic
 * machines pulse out of step, each throwing off its own scraps (a paper
 * strip, a photo, a numbers card, a note). A plain box opens, six keys fly
 * out and plug in, each machine falls into the shared beat and warms, and
 * the scraps settle into one patient record, with a line from every
 * machine. One GSAP timeline (~9 s), starting when the stage is 40%
 * visible; plays once, with Replay.
 *
 * The markup is the final ("symphony") frame, so reduced motion and no-JS
 * show that; the timeline sets the opening state and plays to it.
 */
export function BoxStory() {
  const ref = useRef<HTMLDivElement>(null);
  const playRef = useRef<(() => void) | null>(null);
  const sound = useRef<BoxSound | null>(null);
  const soundOn = useRef(false);
  const [soundState, setSoundState] = useState(false);
  const [tall, setTall] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  const layout = tall ? layouts.tall : layouts.wide;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const onChange = () => setTall(query.matches);
    query.addEventListener("change", onChange);
    const on = soundPreference();
    soundOn.current = on;
    setSoundState(on);
    return () => {
      query.removeEventListener("change", onChange);
      sound.current?.dispose();
      sound.current = null;
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn.current;
    soundOn.current = next;
    setSoundState(next);
    setSoundPreference(next);
    if (next) (sound.current ??= new BoxSound()).unlock();
    else sound.current?.stop();
  };

  useMotion(
    ref,
    (root) => {
      const q = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)];
      const devices = q<SVGGElement>(".bx-device");
      const pulses = q<SVGElement>(".bx-device__pulse");
      const keys = q<SVGGElement>(".bx-key");
      const frags = q<SVGGElement>(".bx-frag");
      const staves = q<SVGPathElement>(".bx-stave");
      const cardParts = q<SVGElement>(".bx-card__part");
      const card = root.querySelector(".bx-card");
      const lid = root.querySelector(".bx-lid");
      const headline = root.querySelector<HTMLElement>(".bx-headline");
      const sub = root.querySelector(".bx-sub");
      if (!headline || !lid || !card) return;
      const split = SplitText.create(headline, { type: "words,chars", charsClass: "bx-char" });

      let tl: gsap.core.Timeline | null = null;
      // The lid turns about its hinge through its own transform attribute (an
      // SVG rotation with a centre), so nothing fights the drawing's frame.
      const hinge = lid.getAttribute("data-hinge") ?? "0 0";
      const lidState = { angle: LID_OPEN };
      const setLid = (angle: number) => {
        lidState.angle = angle;
        lid.setAttribute("transform", `rotate(${angle} ${hinge})`);
      };
      let drifts: gsap.core.Tween[] = [];

      const tune = (i: number) => {
        devices[i]?.classList.add("is-tuned");
        // Phase-locked to one clock, so every connected device beats together.
        const pulse = pulses[i];
        if (pulse) pulse.style.animationDelay = `-${((performance.now() / 1000) % BEAT).toFixed(3)}s`;
      };

      const reset = () => {
        tl?.kill();
        drifts.forEach((tween) => tween.kill());
        drifts = [];
        sound.current?.stop();
        devices.forEach((device) => device.classList.remove("is-tuned"));
        pulses.forEach((pulse) => (pulse.style.animationDelay = ""));
        setLid(0);
        keys.forEach((key) => {
          gsap.set(key, { x: Number(key.dataset.fromX), y: Number(key.dataset.fromY), rotation: Number(key.dataset.fromRotate), autoAlpha: 0 });
        });
        frags.forEach((frag) => gsap.set(frag, { x: 0, y: 0, rotation: Number(frag.dataset.rotate), scale: 1, autoAlpha: 0, transformOrigin: "50% 50%" }));
        gsap.set(card, { autoAlpha: 0.18 });
        gsap.set(cardParts, { autoAlpha: 0 });
        gsap.set(staves, { strokeDashoffset: 1, autoAlpha: 1 });
        gsap.set(split.chars, { autoAlpha: 0, yPercent: 60 });
        gsap.set(sub, { autoAlpha: 0, y: 12 });
      };

      const play = () => {
        reset();
        root.classList.add("is-playing");
        tl = gsap.timeline({ onComplete: () => root.classList.remove("is-playing") });

        // 1. Cacophony: every machine throws off its own scraps, out of step.
        tl.to(frags, { autoAlpha: 1, duration: 0.5, stagger: { each: 0.1, from: "random" }, ease: "power2.out" }, 0.2);
        tl.call(() => {
          drifts = frags.map((frag, i) =>
            gsap.to(frag, {
              x: `random(-22, 22)`,
              y: `random(-16, 16)`,
              rotation: `+=random(-14, 14)`,
              duration: 1.3 + (i % 5) * 0.31,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            }),
          );
        }, undefined, 0.2);
        tl.call(() => soundOn.current && (sound.current ??= new BoxSound()).start(), undefined, 0.3);

        // 2. The box opens; the keys rise into view.
        tl.to(lidState, { angle: LID_OPEN, duration: 0.9, ease: "back.out(1.6)", onUpdate: () => setLid(lidState.angle) }, 3.0);
        tl.to(keys, { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, 3.5);
        keys.forEach((key) => tl!.to(key, { y: `+=${key.dataset.rise}`, duration: 0.5, ease: "power2.out" }, 3.6));

        // 3. Each key flies to its machine, seats with a little settle, and
        //    the machine falls into the shared beat.
        keys.forEach((key, i) => {
          const at = 4.5 + i * 0.25;
          const fromX = Number(key.dataset.fromX);
          const fromY = Number(key.dataset.fromY) + Number(key.dataset.rise);
          const lift = Number(key.dataset.lift);
          tl!
            .to(
              key,
              {
                duration: 0.95,
                ease: "power2.inOut",
                rotation: 0,
                motionPath: { path: [{ x: fromX, y: fromY }, { x: fromX * 0.45, y: fromY * 0.5 + lift }, { x: 0, y: 0 }], curviness: 1.25 },
              },
              at,
            )
            .to(key, { y: 4, duration: 0.1, ease: "power2.in" }, at + 0.95)
            .to(key, { y: 0, duration: 0.3, ease: "back.out(3)" }, at + 1.05)
            .call(() => tune(i), undefined, at + 1.0);
        });

        // 4. Symphony: the scraps settle into one record, a line from every machine.
        tl.call(() => {
          drifts.forEach((tween) => tween.kill());
          drifts = [];
          if (soundOn.current) sound.current?.resolve();
        }, undefined, 6.6);
        frags.forEach((frag, i) => {
          tl!.to(
            frag,
            { x: Number(frag.dataset.toX), y: Number(frag.dataset.toY), rotation: 0, scale: 0.85, duration: 0.9, ease: "power3.inOut" },
            6.6 + (i % 6) * 0.04,
          );
        });
        tl.to(staves, { strokeDashoffset: 0, duration: 1.2, stagger: 0.06, ease: "power2.inOut" }, 6.8);
        tl.to(card, { autoAlpha: 1, duration: 0.6 }, 7.3);
        tl.to(cardParts, { autoAlpha: 1, duration: 0.5, stagger: 0.06 }, 7.4);
        tl.to(frags, { autoAlpha: 0, duration: 0.35 }, 7.55);
        tl.to(split.chars, { autoAlpha: 1, yPercent: 0, duration: 0.8, stagger: 0.035, ease: "cv.out" }, 7.6);
        tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.8 }, 8.3);
      };

      playRef.current = play;
      reset();
      const trigger = ScrollTrigger.create({ trigger: root.querySelector(".bx-stage"), start: "40% bottom", once: true, onEnter: play });

      return () => {
        trigger.kill();
        tl?.kill();
        drifts.forEach((tween) => tween.kill());
        sound.current?.stop();
        devices.forEach((device) => device.classList.add("is-tuned"));
        pulses.forEach((pulse) => (pulse.style.animationDelay = ""));
        setLid(LID_OPEN);
        root.classList.remove("is-playing");
        playRef.current = null;
      };
    },
    [tall],
  );

  const { card, box } = layout;
  return (
    <div ref={ref} className={`bx${tall ? " bx--tall" : ""}`}>
      <div className="bx-bar">
        <p className="bx-eyebrow">{boxStory.eyebrow}</p>
        <div className="bx-controls">
          {!reduceMotion && (
            <button type="button" className="bx-btn" onClick={() => playRef.current?.()}>
              <span aria-hidden="true">↻</span> Replay
            </button>
          )}
          <button type="button" className={`bx-btn${soundState ? " is-on" : ""}`} aria-pressed={soundState} onClick={toggleSound}>
            <SoundIcon on={soundState} /> Sound
          </button>
        </div>
      </div>

      <svg className="bx-stage" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={boxStory.alt}>
        {/* The staves: a thin line from every machine's key to the record. */}
        <g className="bx-staves">
          {layout.staves.map((d, i) => (
            <path key={i} className="bx-stave" d={d} pathLength={1} />
          ))}
        </g>

        <RecordCard x={card.x} y={card.y} w={card.w} h={card.h} />

        <g className="bx-frags">
          {layout.fragments.map((frag) => (
            <FragmentShape key={frag.id} frag={frag} card={card} />
          ))}
        </g>

        {layout.devices.map((device, i) => (
          <DeviceFrame key={device.id} device={device} index={i} w={layout.frame.w} h={layout.frame.h} />
        ))}

        {layout.devices.map((device, i) => (
          <KeyShape key={device.id} device={device} slot={layout.keySlots[i]} />
        ))}

        {/* The box: plain, with the mark as supplied (never turned). */}
        <g className="bx-box">
          <rect className="bx-box__body" x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
          <path className="bx-box__seam" d={`M${box.x + 10} ${box.y + 14} H${box.x + box.w - 10}`} />
          <svg x={box.x + box.w / 2 - 17} y={box.y + 24} width={34} height={34} overflow="visible">
            <Logo className="bx-box__mark" />
          </svg>
        </g>
        {/* Drawn open (the final frame); the timeline closes it first. */}
        <g className="bx-lid" data-hinge={`${box.x} ${box.y}`} transform={`rotate(${LID_OPEN} ${box.x} ${box.y})`}>
          <rect className="bx-lid__top" x={box.x - 6} y={box.y - 16} width={box.w + 12} height={16} rx={5} />
        </g>
      </svg>

      <div className="bx-resolve">
        <h3 className="bx-headline">{boxStory.headline}</h3>
        <p className="bx-sub">{boxStory.sub}</p>
      </div>
    </div>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg className="bx-btn__icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 8h3l4-3v10l-4-3H3z" />
      {on ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" /> : <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" />}
    </svg>
  );
}

function DeviceFrame({ device, index, w, h }: { device: Device; index: number; w: number; h: number }) {
  return (
    <g className="bx-device is-tuned" id={`device-${index + 1}`} style={{ "--beat": `${device.beat}s` } as CSSProperties}>
      <rect className="bx-device__frame" x={device.cx - w / 2} y={device.cy - h / 2} width={w} height={h} rx={14} />
      <circle className="bx-device__pulse" cx={device.cx} cy={device.cy - 8} r={34} />
      <g className="bx-device__icon" transform={`translate(${device.cx} ${device.cy - 10})`}>
        <DeviceIcon id={device.id} />
      </g>
      <text className="bx-device__label" x={device.cx} y={device.cy + h / 2 - 12} textAnchor="middle">
        {device.label}
      </text>
    </g>
  );
}

/** Simple line drawings, about 64 × 52, centred on 0,0. */
function DeviceIcon({ id }: { id: string }) {
  switch (id) {
    case "lamp":
      return (
        <>
          <path d="M-26 24H26M-14 24V-4M-14 -4L8 -16M20 24V6M14 6H26" />
          <circle cx={13} cy={-18} r={7} />
          <path className="bx-glow" d="M18 -12L28 2M14 -11L20 4" />
        </>
      );
    case "desk":
      return (
        <>
          <rect x={-26} y={-6} width={40} height={30} rx={4} />
          <rect x={14} y={0} width={12} height={12} rx={2} />
          <rect x={-20} y={-22} width={26} height={12} rx={2} />
          <path d="M-30 24H30" />
        </>
      );
    case "scanner":
      return (
        <>
          <rect x={-28} y={2} width={56} height={18} rx={3} />
          <path d="M-28 2L-20 -16H26L28 2" />
          <path className="bx-glow" d="M-22 11H22" />
        </>
      );
    case "printer":
      return (
        <>
          <rect x={-24} y={-6} width={48} height={22} rx={3} />
          <path d="M-14 -6V-22H14V-6M-14 16V26H14V16M-8 21H8" />
        </>
      );
    case "computer":
      return (
        <>
          <rect x={-24} y={-24} width={48} height={32} rx={3} />
          <path d="M0 8V16M-10 16H10" />
          <rect x={-22} y={20} width={44} height={6} rx={2} />
        </>
      );
    default:
      return (
        <>
          <rect x={-12} y={-24} width={24} height={46} rx={5} />
          <path d="M-4 -19H4" />
          <circle cx={0} cy={16} r={2} />
          <path className="bx-glow" d="M17 -12q6 6 0 12M22 -16q10 10 0 20" />
        </>
      );
  }
}

/** A generic key: a small plug with a glowing tip, seated at its machine. */
function KeyShape({ device, slot }: { device: Device; slot: { x: number; y: number } }) {
  const { socket, flip } = device;
  // Where it waits in the box, in the seated key's own (possibly turned) frame.
  const dx = slot.x - socket.x;
  const dy = slot.y - socket.y;
  const fromX = flip ? -dx : dx;
  const fromY = flip ? -dy : dy;
  return (
    <g transform={`translate(${socket.x} ${socket.y})${flip ? " rotate(180)" : ""}`}>
      <g className="bx-key" data-from-x={fromX} data-from-y={fromY} data-from-rotate={flip ? 180 : 0} data-lift={flip ? 120 : -120} data-rise={flip ? 14 : -14}>
        <rect className="bx-key__body" x={-8} y={0} width={16} height={KEY_LENGTH} rx={4} />
        <path className="bx-key__prongs" d="M-4 0V-8M4 0V-8" />
        <circle className="bx-key__tip" cx={0} cy={KEY_LENGTH - 7} r={3} />
      </g>
    </g>
  );
}

function FragmentShape({ frag, card }: { frag: Fragment; card: { x: number; y: number } }) {
  const slot = CARD_SLOTS[frag.kind];
  const toX = card.x + slot.x + slot.w / 2 - frag.x;
  const toY = card.y + slot.y + slot.h / 2 - frag.y;
  return (
    <g transform={`translate(${frag.x} ${frag.y})`}>
      <g className={`bx-frag bx-frag--${frag.kind}`} data-to-x={toX} data-to-y={toY} data-rotate={frag.rotate}>
        <FragmentArt kind={frag.kind} />
      </g>
    </g>
  );
}

function FragmentArt({ kind }: { kind: FragmentKind }) {
  switch (kind) {
    case "strip":
      return (
        <>
          <rect x={-34} y={-8} width={68} height={16} rx={2} />
          <path d="M-28 2H-16L-12 -5L-8 6L-4 2H28" />
        </>
      );
    case "photo":
      return (
        <>
          <rect x={-24} y={-18} width={48} height={36} rx={3} />
          <circle cx={0} cy={0} r={9} />
          <circle cx={0} cy={0} r={3} />
        </>
      );
    case "numbers":
      return (
        <>
          <rect x={-26} y={-16} width={52} height={32} rx={3} />
          <path d="M-18 -6H6M-18 2H14M-18 10H0" />
        </>
      );
    default:
      return (
        <>
          <rect x={-22} y={-20} width={44} height={40} rx={2} />
          <path d="M-14 -8q4 -4 8 0t8 0t8 0M-14 2q4 -4 8 0t8 0M-14 12H6" />
        </>
      );
  }
}

/** The one clean record: photo, readings and note aligned, the trace beneath. */
function RecordCard({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const { photo, numbers, note, strip } = CARD_SLOTS;
  return (
    <g className="bx-card" transform={`translate(${x} ${y})`}>
      <rect className="bx-card__frame" width={w} height={h} rx={12} />
      <text className="bx-card__title bx-card__part" x={20} y={20}>
        {boxStory.record}
      </text>
      <g className="bx-card__part">
        <rect x={photo.x} y={photo.y} width={photo.w} height={photo.h} rx={6} />
        <circle cx={photo.x + photo.w / 2} cy={photo.y + photo.h / 2} r={14} />
        <circle className="bx-card__fill" cx={photo.x + photo.w / 2} cy={photo.y + photo.h / 2} r={5} />
      </g>
      <g className="bx-card__part">
        <path d={`M${numbers.x} ${numbers.y + 6}H${numbers.x + 90}M${numbers.x} ${numbers.y + 16}H${numbers.x + 110}M${numbers.x} ${numbers.y + 26}H${numbers.x + 70}`} />
      </g>
      <g className="bx-card__part">
        <path d={`M${note.x} ${note.y + 8}H${note.x + 120}M${note.x} ${note.y + 18}H${note.x + 84}`} />
      </g>
      <g className="bx-card__part">
        <path d={`M${strip.x} ${strip.y + 18}H${strip.x + 70}L${strip.x + 78} ${strip.y + 4}L${strip.x + 86} ${strip.y + 30}L${strip.x + 94} ${strip.y + 18}H${strip.x + 150}L${strip.x + 158} ${strip.y + 8}L${strip.x + 166} ${strip.y + 26}L${strip.x + 172} ${strip.y + 18}H${strip.x + strip.w}`} />
      </g>
    </g>
  );
}
