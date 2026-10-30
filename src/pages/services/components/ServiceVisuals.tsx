import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";

/** Adds .is-live while the element is on screen, so its loops only run when seen. */
function useLive(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => el.classList.toggle("is-live", entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/* --- 01 FEA: the study models, rendered plain (no contour plot) ----------- */

/** Half-width of the tapered implant body at height y. */
const implantHalf = (y: number) => 78 - ((y - 130) / 260) * 24;

const IMPLANT_BODY = "M75 42 L225 42 L228 130 L205 388 Q150 424 95 388 L72 130 Z";
/** The body plus room for the threads, used to clip the moving threads. */
const THREAD_CLIP = "M58 130 L242 130 L220 392 Q150 432 80 392 Z";

/** Slanted thread bands, one pitch apart, each ending in a pointed crest past the body. */
const THREADS = (() => {
  const bands: string[] = [];
  const half = (y: number) => implantHalf(Math.max(130, Math.min(390, y)));
  for (let y = 100; y < 440; y += 30) {
    const l = 150 - half(y) - 12;
    const r = 150 + half(y - 12) + 12;
    bands.push(`M${l} ${y + 2} L${l + 14} ${y - 5} L${r - 14} ${y - 17} L${r} ${y - 10} L${r - 14} ${y - 3} L${l + 14} ${y + 9} Z`);
  }
  return bands;
})();

const MANDIBLE =
  "M70 38 C 76 26 94 24 100 36 L 104 60 L 108 120 C 130 190 170 205 200 205 C 230 205 270 190 292 120 L 296 60 L 300 36 C 306 24 324 26 330 38 C 334 80 334 120 328 150 C 318 230 250 275 200 275 C 150 275 82 230 72 150 C 66 120 66 80 70 38 Z";

/** Teeth along the alveolar crest. */
const TEETH = Array.from({ length: 12 }, (_, i) => {
  const t = i / 11;
  const a = Math.PI * (0.06 + t * 0.88);
  return { x: 200 - Math.cos(a) * 92, y: 128 + Math.sin(a) * 80, r: t > 0.3 && t < 0.7 ? 7 : 10 };
});

const PLATE_HOLES: Array<[number, number]> = [
  [-30, -7],
  [-14, 7],
  [14, -7],
  [30, 7],
];

type Study = "implant" | "mandible";
type Load = "axial" | "oblique";

type Viewport = Awaited<ReturnType<typeof import("./fea3d")["createFeaViewport"]>>;

export function FeaVisual() {
  const [study, setStudy] = useState<Study>("implant");
  const [load, setLoad] = useState<Load>("axial");
  const [mesh, setMesh] = useState(false);
  const [is3d, setIs3d] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<Viewport | null>(null);
  useLive(ref);

  // The 3D models load once the section is near; the drawings stand in until
  // then, and stay if WebGL isn't available.
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = ref.current;
    if (!canvas || !root) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("./fea3d")
          .then(({ createFeaViewport }) => {
            if (cancelled) return;
            viewport.current = createFeaViewport(canvas);
            setIs3d(true);
          })
          .catch(() => {});
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
      viewport.current?.destroy();
      viewport.current = null;
    };
  }, []);

  useEffect(() => viewport.current?.setStudy(study), [study, is3d]);
  useEffect(() => viewport.current?.setLoad(load), [load, is3d]);
  useEffect(() => viewport.current?.setMesh(mesh), [mesh, is3d]);

  // The viewport settles in when the section arrives.
  useMotion(ref, (root) => {
    gsap.from(root.querySelector(".fea__view"), {
      autoAlpha: 0,
      scale: 0.96,
      duration: 1.2,
      ease: "cv.out",
      scrollTrigger: { trigger: root, start: "top 72%", once: true },
    });
  });

  const angle = load === "axial" ? 0 : 28;
  const loadStyle = (x: number, y: number): CSSProperties => ({ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` });

  return (
    <div ref={ref} className="svis fea">
      <div className="svis__tabs" role="tablist" aria-label="Case study">
        {(["implant", "mandible"] as const).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={study === key} className={study === key ? "is-active" : ""} onClick={() => setStudy(key)}>
            {key === "implant" ? "Implant thread study" : "Mandibular fixation"}
          </button>
        ))}
      </div>

      <div className={`fea__view${is3d ? " is-3d" : ""}`}>
        <canvas ref={canvasRef} className="fea__canvas" aria-label={study === "implant" ? "3D implant model, drag to turn" : "3D mandible fixation model, drag to turn"} data-cursor="Drag" />
        <p className="fea__caption" aria-hidden="true">
          <b>Static structural</b>
          {study === "implant" ? "Implant model" : "Fixation model"}
          <span>Load: {load}</span>
        </p>

        {study === "implant" ? (
          <svg key="implant" className="svis__svg fea__svg svis__study" viewBox="0 -50 300 510" role="img" aria-label="Tapered threaded dental implant model">
            <defs>
              <linearGradient id="feaTi" x1="0" x2="1">
                <stop offset="0" stopColor="#6d747a" />
                <stop offset="0.28" stopColor="#dfe3e6" />
                <stop offset="0.5" stopColor="#f4f6f7" />
                <stop offset="0.78" stopColor="#a3aaaf" />
                <stop offset="1" stopColor="#5b6166" />
              </linearGradient>
              <linearGradient id="feaThread" x1="0" x2="1">
                <stop offset="0" stopColor="#80878d" />
                <stop offset="0.35" stopColor="#f2f4f5" />
                <stop offset="0.8" stopColor="#b2b8bc" />
                <stop offset="1" stopColor="#686e73" />
              </linearGradient>
              <clipPath id="feaThreadClip">
                <path d={THREAD_CLIP} />
              </clipPath>
              <clipPath id="feaBodyClip">
                <path d={IMPLANT_BODY} />
              </clipPath>
              <pattern id="feaMesh" width="16" height="14" patternUnits="userSpaceOnUse">
                <path d="M0 14 L8 0 L16 14 Z M8 0 L24 0" fill="none" stroke="rgba(20,24,28,0.45)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <ellipse cx="150" cy="440" rx="80" ry="10" className="fea__shadow" />
            <path d={IMPLANT_BODY} fill="url(#feaTi)" />
            {[56, 76, 96, 116].map((y) => (
              <g key={y}>
                <rect x="70" y={y} width="160" height="7" fill="rgba(40,44,48,0.45)" />
                <rect x="70" y={y + 7} width="160" height="3" fill="rgba(255,255,255,0.5)" />
              </g>
            ))}
            <ellipse cx="150" cy="42" rx="75" ry="9" fill="#eef1f3" stroke="rgba(40,44,48,0.3)" />
            <ellipse cx="150" cy="42" rx="30" ry="4" fill="#8d9499" />
            <g clipPath="url(#feaThreadClip)">
              <g className="fea__threads">
                {THREADS.map((d, i) => (
                  <g key={i}>
                    <path d={d} transform="translate(0 8)" fill="rgba(30,34,38,0.35)" />
                    <path d={d} fill="url(#feaThread)" />
                  </g>
                ))}
              </g>
            </g>
            <g clipPath="url(#feaBodyClip)">
              <rect className="fea__scan" x="40" y="0" width="220" height="70" fill="url(#feaMesh)" />
            </g>
            <g className="fea__load" style={loadStyle(150, 30)}>
              <line x1="150" y1="-40" x2="150" y2="22" />
              <path d="M140 14 L150 30 L160 14 Z" />
            </g>
          </svg>
        ) : (
          <svg key="mandible" className="svis__svg fea__svg svis__study" viewBox="0 20 400 300" role="img" aria-label="Mandible with a fracture fixation plate and screws">
            <defs>
              <linearGradient id="feaBone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3eee6" />
                <stop offset="1" stopColor="#c7bdae" />
              </linearGradient>
              <radialGradient id="feaBoneShade" cx="0.5" cy="0.2" r="0.7">
                <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
                <stop offset="1" stopColor="rgba(60,48,36,0.35)" />
              </radialGradient>
              <clipPath id="feaJawClip">
                <path d={MANDIBLE} />
              </clipPath>
              <pattern id="feaMesh2" width="16" height="14" patternUnits="userSpaceOnUse">
                <path d="M0 14 L8 0 L16 14 Z M8 0 L24 0" fill="none" stroke="rgba(40,30,20,0.4)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <ellipse cx="200" cy="296" rx="120" ry="10" className="fea__shadow" />
            <path d={MANDIBLE} fill="url(#feaBone)" stroke="rgba(90,74,58,0.5)" strokeWidth="1.2" />
            <path d={MANDIBLE} fill="url(#feaBoneShade)" />
            {TEETH.map((t, i) => (
              <ellipse key={i} cx={t.x} cy={t.y} rx={t.r} ry={t.r * 0.7} fill="#faf7f1" stroke="rgba(90,74,58,0.35)" />
            ))}
            <path className="fea__fracture" d="M150 200 L146 214 L154 228 L147 244 L155 258 L151 272" />
            <g transform="translate(151 238) rotate(-24)">
              <path d="M-38 -12 H38 A12 12 0 0 1 38 12 H-38 A12 12 0 0 1 -38 -12 Z" fill="none" stroke="#aab1b6" strokeWidth="5" strokeLinejoin="round" />
              <path d="M-22 0 H22" stroke="#aab1b6" strokeWidth="5" />
              {PLATE_HOLES.map(([x, y]) => (
                <g key={`${x}${y}`}>
                  <circle cx={x} cy={y} r="7.5" fill="#d9dde0" stroke="#6f767b" strokeWidth="1.5" />
                  <path d={`M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}`} stroke="#5b6166" strokeWidth="1.6" />
                </g>
              ))}
            </g>
            <g clipPath="url(#feaJawClip)">
              <rect className="fea__scan fea__scan--jaw" x="0" y="0" width="400" height="60" fill="url(#feaMesh2)" />
            </g>
            {/* The bite load sits on the fixed side, over the molars behind the plate. */}
            <g className="fea__load" style={loadStyle(132, 146)}>
              <line x1="132" y1="84" x2="132" y2="138" />
              <path d="M122 130 L132 146 L142 130 Z" />
            </g>
          </svg>
        )}
      </div>

      <div className="svis__control fea__control">
        <div className="fea__switch" role="group" aria-label="Load case">
          <span>Load</span>
          {(["axial", "oblique"] as const).map((key) => (
            <button key={key} type="button" aria-pressed={load === key} className={load === key ? "is-active" : ""} onClick={() => setLoad(key)}>
              {key}
            </button>
          ))}
        </div>
        {is3d && (
          <div className="fea__switch" role="group" aria-label="View">
            <span>View</span>
            {([false, true] as const).map((on) => (
              <button key={String(on)} type="button" aria-pressed={mesh === on} className={mesh === on ? "is-active" : ""} onClick={() => setMesh(on)}>
                {on ? "Mesh" : "Solid"}
              </button>
            ))}
          </div>
        )}
        <p className="svis__legend">
          <em>Illustrative</em>
        </p>
      </div>
    </div>
  );
}

/* --- 02 Cessation: the conversation, playing out --- */

const CHAT = [
  { who: "bot", text: "How many cigarettes do you usually have in a day?" },
  { who: "you", text: "About ten. More when work gets stressful.", voice: true },
  { who: "bot", text: "So stress is one of your triggers. When do the cravings hit hardest?" },
  { who: "you", text: "Straight after lunch, every single day.", voice: true },
  { who: "bot", text: "Let's plan for that moment: a short walk and a glass of water after lunch. I'll check in with you tomorrow." },
];

export function ChatVisual() {
  const ref = useRef<HTMLDivElement>(null);
  useLive(ref);

  useMotion(ref, (root) => {
    const bubbles = gsap.utils.toArray<HTMLElement>(".chat__msg", root);
    const typing = root.querySelector<HTMLElement>(".chat__typing");
    gsap.set(bubbles, { autoAlpha: 0, y: 14 });
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.5 });
    bubbles.forEach((bubble) => {
      const fromBot = bubble.classList.contains("chat__msg--bot");
      if (fromBot && typing) tl.set(typing, { autoAlpha: 1 }).to({}, { duration: 0.9 }).set(typing, { autoAlpha: 0 });
      tl.to(bubble, { autoAlpha: 1, y: 0, duration: 0.45, ease: "cv.out" });
      if (!fromBot) tl.from(bubble.querySelectorAll(".chat__transcript"), { autoAlpha: 0, duration: 0.4 }, "+=0.5");
      tl.to({}, { duration: 1.1 });
    });
    tl.to(bubbles, { autoAlpha: 0, y: -10, duration: 0.5, stagger: 0.05 }, "+=1.5");
    ScrollTrigger.create({ trigger: root, start: "top 80%", end: "bottom top", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
  });

  return (
    <div ref={ref} className="svis svis--chat">
      <div className="chat" data-motion="own">
        <div className="chat__head">
          <span className="chat__avatar" aria-hidden="true" />
          <div>
            <b>Quit coach</b>
            <small>Remembers your journey</small>
          </div>
        </div>
        <div className="chat__body" aria-label="Example conversation">
          {CHAT.map((m, i) => (
            <div key={i} className={`chat__msg chat__msg--${m.who}`}>
              {m.voice ? (
                <>
                  <span className="chat__voice" aria-hidden="true">
                    {Array.from({ length: 18 }, (_, k) => (
                      <i key={k} style={{ "--k": k, height: 4 + ((k * 7) % 13) } as CSSProperties} />
                    ))}
                  </span>
                  <span className="chat__transcript">{m.text}</span>
                  <span className="chat__match chat__transcript">Understood · meaning matched</span>
                </>
              ) : (
                m.text
              )}
            </div>
          ))}
          <div className="chat__typing" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}
