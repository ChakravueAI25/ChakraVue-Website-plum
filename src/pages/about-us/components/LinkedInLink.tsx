/**
 * A person's LinkedIn profile, opened in a new tab. The "in" glyph sits in
 * a small amber ring; `label` adds the word beside it (the leader cards),
 * without it the link is the glyph alone (the team grid).
 */
export function LinkedInLink({ href, name, label = false, className = "" }: { href: string; name: string; label?: boolean; className?: string }) {
  return (
    <a
      className={`in-link${label ? " in-link--label" : ""} ${className}`.trim()}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on LinkedIn (opens in a new tab)`}
    >
      <span className="in-link__glyph" aria-hidden="true">
        <svg viewBox="3 3 18 18" focusable="false">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.887v6.454zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      </span>
      {label && (
        <span className="in-link__text" aria-hidden="true">
          LinkedIn
        </span>
      )}
    </a>
  );
}
