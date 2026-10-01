import { useEffect, useRef, useState } from "react";
import { useRoute } from "../../app/router";
import { reduceMotion } from "../../motion/env";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import { RollText } from "../../motion/RollText";
import { navItems } from "../data/content";
import { Link } from "./Link";
import { Logo } from "../../brand/Logo";

type HeaderProps = {
  /** Controls the intro reveal on first paint; defaults to already visible. */
  visible?: boolean;
};

export function Header({ visible = true }: HeaderProps) {
  const path = useRoute();
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

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
    <header ref={ref} className={`header${visible ? "" : " header--hidden"}${scrolled ? " header--scrolled" : ""}`}>
      <nav className="header__nav" aria-label="Primary navigation">
        <div className="header__nav-group header__nav-group--start">{navItems.slice(0, 3).map(renderItem)}</div>
        <Link href="/" className="header__brand" aria-label="ChakraVue AI home" data-magnetic="0.18">
          <Logo className="header__logo" />
          ChakraVue AI
        </Link>
        <div className="header__nav-group header__nav-group--end">{navItems.slice(3).map(renderItem)}</div>
      </nav>
    </header>
  );
}
