import type { CSSProperties } from "react";
import { LOGO_DISC, LOGO_GLYPHS, LOGO_VIEWBOX } from "./logoData";
import "./logo.css";

type LogoProps = {
  className?: string;
  /** Draw the black disc behind the glyphs (off for glyph-only rings). */
  disc?: boolean;
  title?: string;
};

/** The ChakraVue AI mark. Glyphs are separate paths, so each can be animated. */
export function Logo({ className = "", disc = true, title }: LogoProps) {
  return (
    <svg className={`logo ${className}`.trim()} viewBox={LOGO_VIEWBOX} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {disc && <path className="logo__disc" d={LOGO_DISC} />}
      <g className="logo__glyphs">
        {LOGO_GLYPHS.map((glyph, i) => (
          <path key={i} className="logo__glyph" d={glyph.d} fillRule="evenodd" style={{ "--i": i, "--a": glyph.angle } as CSSProperties} />
        ))}
      </g>
    </svg>
  );
}
