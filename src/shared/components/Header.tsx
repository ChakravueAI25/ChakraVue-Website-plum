import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRoute } from "../../app/router";
import { reduceMotion } from "../../motion/env";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import { lockScroll } from "../../motion/lenis";
import { RollText } from "../../motion/RollText";
import { contactDetails } from "../../pages/contact/data";
import { experienceCta, navItems } from "../data/content";
import { Link } from "./Link";
import { Logo } from "../../brand/Logo";

type HeaderProps = {
  /** Controls the intro reveal on first paint; defaults to already visible. */
  visible?: boolean;
};

const menuItems = navItems;
/** Links left of the brand; the rest (and "Experience it") sit right of it. */
const START_LINKS = 4;
const menuContacts = contactDetails.filter((detail) => detail.href && detail.label !== "LinkedIn");

export function Header({ visible = true }: HeaderProps) {
  const path = useRoute();
  const ref = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tucks away while you read down the page, returns the moment you scroll
  // back up, or when the pointer reaches for the top edge.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    let hidden = false;
    const setHidden = (hide: boolean) => {
      if (hide === hidden) return;
      hidden = hide;
      gsap.to(el, {
        yPercent: hide ? -110 : 0,
        duration: hide ? 0.55 : 0.7,
        ease: hide ? "power3.in" : "cv.out",
        overwrite: true,
      });
    };
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setHidden(self.scroll() > 220 && self.direction === 1),
    });
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.clientY < 90) setHidden(false);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      trigger.kill();
      window.removeEventListener("pointermove", onPointer);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, []);

  // A new page always arrives with the menu closed.
  useEffect(() => setOpen(false), [path]);

  // While the menu is open the page behind it stays still, Escape closes
  // it, and focus moves into it (and back to the button afterwards).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("is-menu-open");
    lockScroll(true);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // The menu is for phones and tablets: widening the window past it closes it.
    const wide = window.matchMedia("(min-width: 1181px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.classList.remove("is-menu-open");
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const renderItem = (item: (typeof navItems)[number]) => (
    <Link
      href={item.href}
      key={item.label}
      className={item.href !== "/" && item.href === path ? "is-active" : undefined}
      aria-current={item.href !== "/" && item.href === path ? "page" : undefined}
      aria-label={item.label}
    >
      <RollText text={item.label} />
    </Link>
  );

  return (
    <>
      <header ref={ref} className={`header${visible ? "" : " header--hidden"}${scrolled ? " header--scrolled" : ""}${open ? " header--menu" : ""}`}>
        <nav className="header__nav" aria-label="Primary navigation">
          <div className="header__nav-group header__nav-group--start">{navItems.slice(0, START_LINKS).map(renderItem)}</div>
          <Link href="/" className="header__brand" aria-label="ChakraVue AI home" data-magnetic="0.18">
            <Logo className="header__logo" />
            ChakraVue AI
          </Link>
          <div className="header__nav-group header__nav-group--end">
            {navItems.slice(START_LINKS).map(renderItem)}
            <Link href={experienceCta.href} className="header__cta" data-magnetic="0.2">
              {experienceCta.label}
            </Link>
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="header__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="header__toggle-bar" aria-hidden="true" />
            <span className="header__toggle-bar" aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Phones and narrow tablets: every page in one full-screen menu. */}
      <div ref={menuRef} id="site-menu" className={`menu${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav className="menu__nav" aria-label="Menu">
          {menuItems.map((item, i) => {
            const current = item.href === path;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`menu__link${current ? " is-active" : ""}`}
                aria-current={current ? "page" : undefined}
                style={{ "--i": i } as CSSProperties}
                onClick={() => setOpen(false)}
              >
                <span className="menu__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="menu__label">{item.label}</span>
                <span className="menu__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </nav>
        <Link
          href={experienceCta.href}
          className="menu__cta"
          style={{ "--i": menuItems.length } as CSSProperties}
          onClick={() => setOpen(false)}
        >
          {experienceCta.label}
          <span aria-hidden="true">→</span>
        </Link>
        <div className="menu__foot" style={{ "--i": menuItems.length + 1 } as CSSProperties}>
          {menuContacts.map(({ label, value, href }) => (
            <a key={label} href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
              <small>{label}</small>
              {value}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
