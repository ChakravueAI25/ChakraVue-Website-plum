import { useEffect, useRef } from "react";
import { lockScroll } from "../../motion/lenis";
import { ContactForm } from "../../pages/contact/components/ContactForm";
import "../../pages/contact/contact.css";
import "./contactDialog.css";

/**
 * The Contact page's form in a pop-up (a native <dialog> opened with
 * showModal(): focus stays inside, the page behind is inert, Esc closes it).
 * The page's smooth scroll is held while it's open, so the wheel scrolls
 * the form, not the page behind.
 */
export function ContactDialog({ open, onClose, heading }: { open: boolean; onClose: () => void; heading?: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lockScroll(true);
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => () => lockScroll(false), []);

  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      data-lenis-prevent
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) ref.current?.close();
      }}
    >
      <button type="button" className="contact-dialog__close" aria-label="Close" onClick={() => ref.current?.close()}>
        ×
      </button>
      {open && <ContactForm inDialog heading={heading} />}
    </dialog>
  );
}
