import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { finePointer, reduceMotion } from "../../../motion/env";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { roles } from "../../../shared/data/audiences";
import { platforms } from "../../product-suite/platforms";
import "./roles.css";

/** Phones stack the products and change role only when asked (a changing height would move the page). */
const compact = typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;

/**
 * "Who are you here as?" (Home; an audience selector since 2026-10-31): the
 * heading, then a question whose audience rolls ("Are you a Clinician?",
 * "Are you an OEM?", ...), the audiences as pills, the chosen audience's
 * products in an even grid (one, two or three), and its next steps.
 *
 * One state drives it all: `active`. The question's word, its article, the
 * line, the products and the actions are each a stack of every audience's
 * version in one grid cell, and `active` only says which is shown, so they
 * change together and the layout never moves (each stack is as big as its
 * largest member). Every product picture is in the page from the start, so
 * nothing reloads as the audiences change.
 *
 * The audiences play by themselves on wider screens: the active pill's bar
 * fills, and when it ends the next audience comes in, so the bar is the
 * only timer. Picking one restarts it. Pointing at the pills, products or
 * actions, keyboard focus inside, the pause button, the section being off
 * screen or the tab being hidden all pause it. On phones and under reduced
 * motion nothing changes by itself. The roles and their products are
 * `roles` in shared/data/audiences.ts.
 */
export function RoleShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Bumped on every manual pick, so the bar starts again from empty.
  const [run, setRun] = useState(0);
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const count = roles.length;
  const autoplay = !reduceMotion && !compact;
  const role = roles[active];

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(section);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const hover = finePointer ? { onPointerEnter: () => setHovered(true), onPointerLeave: () => setHovered(false) } : {};
  const playing = autoplay && !held && !hovered && !focused && inView && !hidden;

  const choose = (index: number) => {
    setActive(index);
    setRun((n) => n + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const next = (active + dir + count) % count;
    choose(next);
    ref.current?.querySelectorAll<HTMLElement>(".role__tab")[next]?.focus();
  };

  /** A stack's member: shown when it's the active audience's. */
  const state = (i: number) => (i === active ? " is-active" : "");

  return (
    <section
      ref={ref}
      id="who-are-you-here-as"
      className="role section"
      aria-labelledby="role-title"
      onFocus={(event) => {
        // Keyboard focus only: a tap on a role shouldn't stop the roles playing.
        if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* A soft plum light that swells as each role comes in. */}
      <span key={`glow-${active}-${run}`} className="role__glow" aria-hidden="true" />

      <div className="section__inner">
        <header className="role__head">
          <h2 id="role-title" className="role__eyebrow" data-reveal>
            ChakraVue ecosystem
          </h2>
          <p className="role__intro" data-reveal>
            Discover the intelligence, tools and technology designed around your role in advancing healthcare.
          </p>
          {autoplay && (
            <button
              type="button"
              className="role__pause"
              onClick={() => setHeld((h) => !h)}
              aria-label={held ? "Play the roles" : "Pause the roles"}
            >
              {held ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" width="11" height="11">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" width="11" height="11">
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              )}
              <span aria-hidden="true">{held ? "Play" : "Pause"}</span>
            </button>
          )}
        </header>

        <div className="role__explore" {...hover}>
          {/* The question: "Are you" stays; the audience, with its article, rolls. Screen readers get one plain
              sentence, not announced as it changes (it changes every few seconds). The chosen audience's next
              steps sit beside it. */}
          <div className="role__top">
            <div className="role__ask" data-motion="own">
              <p className="role__question">
                <span className="sr-only">
                  Are you {role.article} {role.noun}?
                </span>
                <span className="role__q" aria-hidden="true">
                  <span>Are you</span>{" "}
                  <span className="role__roll">
                    {roles.map((r, i) => (
                      <span key={r.id} className={`role__roll-item${state(i)}`}>
                        {r.article} <span className="role__noun">{r.noun}</span>?
                      </span>
                    ))}
                  </span>
                </span>
              </p>
              <div className="role__lines">
                {roles.map((r, i) => (
                  <p key={r.id} className={`role__line${state(i)}`} aria-hidden={i !== active}>
                    {r.line}
                  </p>
                ))}
              </div>
            </div>

            {/* Stacked like the products. */}
            <div className="role__actions-stack" data-motion="own">
              {roles.map((r, i) => (
                <div key={r.id} className={`role__actions${state(i)}`} aria-hidden={i !== active} inert={i !== active}>
                  {r.actions.map((a, n) => (
                    <Link key={a.label} href={a.href} className={`role__action${n === 0 ? " role__action--primary" : ""}`}>
                      {a.label} <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="role__tabs" role="tablist" aria-label="Who are you?" onKeyDown={onKeyDown}>
            {roles.map((r, i) => {
              const on = i === active;
              return (
                <button
                  key={r.id}
                  id={`role-tab-${r.id}`}
                  type="button"
                  role="tab"
                  className={`role__tab${on ? " is-active" : ""}`}
                  aria-selected={on}
                  aria-controls={`role-panel-${r.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(i)}
                >
                  {/* Hollow when idle, filled when chosen: the state reads without colour. */}
                  <span className="role__mark" aria-hidden="true" />
                  <span className="role__tab-label">{r.label}</span>
                  <span className="role__bar" aria-hidden="true">
                    {on && (
                      <span
                        key={run}
                        className={`role__fill${autoplay ? "" : " is-still"}`}
                        style={autoplay ? { animationPlayState: playing ? "running" : "paused" } : undefined}
                        onAnimationEnd={autoplay ? () => setActive((active + 1) % count) : undefined}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="role__stage" data-motion="own">
            {roles.map((r, i) => (
              <div
                key={r.id}
                id={`role-panel-${r.id}`}
                role="tabpanel"
                aria-labelledby={`role-tab-${r.id}`}
                className={`role__products${state(i)}`}
                data-count={Math.min(r.products.length, 3)}
                aria-hidden={i !== active}
                inert={i !== active}
              >
                {r.products.map((p, n) => (
                  <Link
                    key={p.key}
                    href={p.href}
                    className="role__product"
                    data-spotlight
                    style={{ "--n": n } as CSSProperties}
                  >
                    <span className={`role__media${p.image ? "" : " role__media--plain"}`}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.imageAlt}
                          loading="lazy"
                          decoding="async"
                          className={p.imageFit === "contain" ? "role__img--contain" : undefined}
                          style={{ objectPosition: p.coverPosition } as CSSProperties}
                        />
                      ) : (
                        // Software platforms have no picture yet: their category on a lit panel.
                        <span className="role__plain" aria-hidden="true">
                          <span className="role__plain-ring" />
                          <span className="role__plain-tag">{p.tagline}</span>
                        </span>
                      )}
                    </span>
                    <span className="role__product-body">
                      <span className="role__product-tag">{p.tagline}</span>
                      <span className="role__product-name">
                        <BrandText text={p.name} />
                        {p.status && <span className="role__status">{p.status}</span>}
                      </span>
                      <span className="role__product-line">{p.summary}</span>
                      <span className="role__product-cta">
                        {p.href.startsWith("/product-suite") ? "Know more" : p.action}
                        <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* The other product category, then the whole suite. */}
        <div className="role__foot">
          <p className="role__more" data-reveal>
            <span className="role__more-label">Software platforms</span>
            {platforms.map((platform) => (
              <Link key={platform.id} href="/product-suite#platforms" className="role__chip">
                <BrandText text={platform.title} />
              </Link>
            ))}
          </p>
          <Link href="/product-suite" className="hsec-link role__all">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
