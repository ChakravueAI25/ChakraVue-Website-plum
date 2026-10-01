import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "../../app/router";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Anchor that navigates client-side for internal routes and falls back to a normal link otherwise. */
export function Link({ href, onClick, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const isInternal = href.startsWith("/") && !href.startsWith("//");
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (event.defaultPrevented || !isInternal || isModified) return;
    event.preventDefault();

    // The iris closes onto the point that was clicked (or the link's centre
    // when activated from the keyboard, which reports no pointer position).
    const box = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    navigate(
      href,
      fromKeyboard ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: event.clientX, y: event.clientY },
    );
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
