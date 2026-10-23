import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { reduceMotion } from "../../../motion/env";
import { gsap, ScrollTrigger } from "../../../motion/gsap";
import { platforms, type App, type Platform } from "../platforms";
import "./platforms.css";
import { BrandText, setBrandText } from "../../../shared/components/BrandText";

/** A line drawing for each platform; every path draws itself on arrival. */
function Glyph({ kind }: { kind: Platform["glyph"] | App["glyph"] }) {
  const p = { pathLength: 1, className: "plat-glyph__line" };
  return (
    <svg className="plat-glyph" viewBox="0 0 120 120" aria-hidden="true">
      {kind === "implant" && (
        <>
          <path {...p} d="M38 30 C 34 16 44 10 52 14 C 56 10 64 10 68 14 C 76 10 86 16 82 30 C 78 38 42 38 38 30 Z" />
          <path {...p} d="M54 38 h12 v8 h-12 Z" />
          <path {...p} d="M52 46 h16 l-2 44 l-6 8 l-6 -8 Z" />
          <path {...p} d="M50 56 h20 M50 66 h20 M51 76 h18 M53 86 h14" />
          <path {...p} className="plat-glyph__line plat-glyph__line--hot" d="M8 104 C 30 96 44 110 60 106 S 96 96 112 104" />
          <circle {...p} cx="60" cy="98" r="12" className="plat-glyph__line plat-glyph__line--hot" />
        </>
      )}
      {kind === "patient" && (
        <>
          <rect {...p} x="38" y="8" width="44" height="104" rx="8" />
          <path {...p} d="M46 46 C 54 34 66 34 74 46 C 66 58 54 58 46 46 Z" className="plat-glyph__line plat-glyph__line--hot" />
          <circle {...p} cx="60" cy="46" r="5" className="plat-glyph__line plat-glyph__line--hot" />
          <rect {...p} x="48" y="72" width="24" height="10" rx="5" />
          <path {...p} d="M60 72 V82 M52 98 h16" />
        </>
      )}
      {kind === "doctor" && (
        <>
          <path {...p} d="M30 14 V40 C 30 58 58 58 58 40 V14" />
          <path {...p} d="M44 56 V70 C 44 92 78 92 78 70 V62" />
          <circle {...p} cx="78" cy="54" r="8" className="plat-glyph__line plat-glyph__line--hot" />
          <rect {...p} x="72" y="88" width="36" height="24" rx="4" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M108 94 L116 90 V110 L108 106" />
        </>
      )}
      {kind === "bundle" && (
        <>
          <rect {...p} x="12" y="22" width="36" height="76" rx="7" />
          <rect {...p} x="72" y="22" width="36" height="76" rx="7" />
          <circle {...p} cx="30" cy="48" r="7" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M80 50 C 84 42 96 42 100 50 C 96 58 84 58 80 50 Z" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M22 72 h16 M82 72 h16 M22 82 h10 M82 82 h10" />
          <path {...p} d="M48 60 C 56 50 64 70 72 60" className="plat-glyph__line plat-glyph__line--hot" />
        </>
      )}
      {kind === "wellness" && (
        <>
          <path {...p} d="M60 98 C 22 72 16 38 38 30 C 48 26 56 32 60 40 C 64 32 72 26 82 30 C 104 38 98 72 60 98 Z" />
          <path {...p} d="M12 62 H40 L46 48 L54 76 L60 62 H108" className="plat-glyph__line plat-glyph__line--hot" />
        </>
      )}
    </svg>
  );
}

/** `/product-suite?platform=<id>#platforms` (the chat assistant's links, for one) opens that platform. */
function platformFromUrl() {
  const id = new URLSearchParams(window.location.search).get("platform");
  return Math.max(0, platforms.findIndex((item) => item.id === id));
}

/**
 * The software platforms, as a console: pick one from the list and the
 * screen re-renders it with a scan line, the name decoding and the line
 * drawing tracing itself in. A bundle (the Doctor Patient App) shows each
 * of its apps on its own inside the one screen.
 */
export function PlatformConsole() {
  const [active, setActive] = useState(platformFromUrl);
  const ref = useRef<HTMLElement>(null);
  // Until the console has been seen, the first platform waits to draw itself in.
  const seen = useRef(false);
  const platform = platforms[active];

  useEffect(() => {
    // The router announces in-page link changes as hashchange (see navigate).
    const onHash = () => {
      if (new URLSearchParams(window.location.search).has("platform")) setActive(platformFromUrl());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    // On phones the list is a sideways strip: bring the chosen tab into view.
    const list = root.querySelector<HTMLElement>(".plat-list");
    const tab = list?.children[active] as HTMLElement | undefined;
    if (list && tab && list.scrollWidth > list.clientWidth) list.scrollTo({ left: tab.offsetLeft - 18, behavior: "smooth" });
    if (reduceMotion) return;
    const screen = root.querySelector<HTMLElement>(".plat-screen__content");
    const title = root.querySelector<HTMLElement>(".plat-screen__title");
    const tl = gsap.timeline({ paused: !seen.current });
    if (seen.current) {
      tl.fromTo(root.querySelector(".plat-screen__scan"), { yPercent: -100, autoAlpha: 1 }, { yPercent: 900, duration: 0.9, ease: "power2.inOut" }, 0);
    }
    tl.fromTo(screen, { autoAlpha: 0, filter: "blur(6px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "cv.out", clearProps: "filter" }, 0.1)
      .fromTo(root.querySelectorAll(".plat-glyph__line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.04, ease: "power2.inOut" }, 0.15)
      .fromTo(
        root.querySelectorAll(".plat-screen__features li, .plat-screen__flow li"),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "cv.out" },
        0.3,
      );
    if (title) tl.to(title, { duration: 0.9, ease: "none", scrambleText: { text: platforms[active].title, chars: "upperCase", speed: 0.8, revealDelay: 0.15 }, onComplete: () => setBrandText(title, platforms[active].title) }, 0.1);
    const trigger = seen.current
      ? null
      : ScrollTrigger.create({
          trigger: root.querySelector(".plat-screen"),
          start: "top 75%",
          once: true,
          onEnter: () => {
            seen.current = true;
            tl.play();
          },
        });
    return () => {
      trigger?.kill();
      tl.kill();
      if (title) setBrandText(title, platforms[active].title);
    };
  }, [active]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const next = (active + dir + platforms.length) % platforms.length;
    setActive(next);
    ref.current?.querySelectorAll<HTMLElement>(".plat-list button")[next]?.focus();
  };

  return (
    <section ref={ref} id="platforms" className="plat section" aria-labelledby="plat-title">
      <div className="section__inner">
        <header className="plat__head">
          <p className="section-label" data-scramble>
            Software platforms
          </p>
          <h2 id="plat-title" className="plat__title" data-split>
            The software behind the suite.
          </h2>
          <p className="plat__lead" data-split="fade" data-delay="0.15">
            Planning, care and wellness platforms that ChakraVue AI has built alongside its devices.
          </p>
        </header>

        <div className="plat__console" data-reveal>
          <div className="plat-list" role="tablist" aria-label="Software platforms" aria-orientation="vertical" onKeyDown={onKeyDown}>
            {platforms.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`plat-tab-${item.id}`}
                aria-selected={i === active}
                aria-controls="plat-screen"
                tabIndex={i === active ? 0 : -1}
                className={i === active ? "is-active" : ""}
                onClick={() => setActive(i)}
              >
                <span className="plat-list__index">{item.index}</span>
                <span className="plat-list__name">
                  <BrandText text={item.title} />
                </span>
                <span className="plat-list__cat">{item.category}</span>
              </button>
            ))}
          </div>

          <div id="plat-screen" className="plat-screen" role="tabpanel" aria-labelledby={`plat-tab-${platform.id}`}>
            <div className="plat-screen__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>chakravue://{platform.id}</span>
            </div>
            <span className="plat-screen__scan" aria-hidden="true" />
            <div key={platform.id} className="plat-screen__content">
              <div className="plat-screen__top">
                <div>
                  <p className="plat-screen__cat">
                    <b>{platform.index}</b> {platform.category}
                  </p>
                  <h3 className="plat-screen__title">
                    <BrandText text={platform.title} />
                  </h3>
                  <p className="plat-screen__summary">{platform.summary}</p>
                </div>
                <Glyph kind={platform.glyph} />
              </div>

              {platform.features.length > 0 && (
                <ul className="plat-screen__features">
                  {platform.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}

              {platform.apps && (
                <div className="plat-apps">
                  {platform.apps.map((app) => (
                    <article key={app.title} className="plat-app">
                      <div className="plat-app__head">
                        <Glyph kind={app.glyph} />
                        <h4 className="plat-app__title">
                          <BrandText text={app.title} />
                        </h4>
                      </div>
                      <p className="plat-app__summary">{app.summary}</p>
                      <ul className="plat-screen__features plat-app__features">
                        {app.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}

              {platform.flow && (
                <ol className="plat-screen__flow" aria-label="Workflow">
                  {platform.flow.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}

              {platform.note && <p className="plat-screen__note">{platform.note}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
