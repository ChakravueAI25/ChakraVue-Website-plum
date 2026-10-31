import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { lockScroll } from "../../../motion/lenis";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { DEMO_POINTS } from "../../../shared/data/audiences";
import { gmailComposeUrl, referralOptions, whoAreYouOptions } from "../../contact/data";
import type { DemoChoice } from "../demo";

const EMAIL = "chakravueai@chakravue.ai";

type Field = "name" | "phone" | "email" | "role" | "heardAbout" | "organisation" | "message";
type Errors = Partial<Record<Field, string>>;

/** The Contact page's required details, checked the same way on blur and on submit. */
const rules: Partial<Record<Field, (value: string) => string>> = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
  phone: (v) => {
    const digits = v.replace(/\D/g, "");
    return /^\+?[\d\s()-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15
      ? ""
      : "Please enter a valid phone number (add the country code if you're outside India).";
  },
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
  role: (v) => (v ? "" : "Please choose who you are."),
  heardAbout: (v) => (v ? "" : "Please tell us how you heard about us."),
};
const ORDER: Field[] = ["name", "phone", "email", "role", "heardAbout"];

/** The request as plain text: the email body, and what "Copy request" copies. */
function requestText(choice: DemoChoice, data: FormData) {
  const value = (key: Field) => String(data.get(key) ?? "").trim();
  return [
    `Demo request: ${choice.item.name}`,
    `For: ${choice.audience.label}`,
    `Declared demo allocation: ${DEMO_POINTS.toLocaleString("en-US")} points`,
    "",
    `Name: ${value("name")}`,
    `Phone: ${value("phone")}`,
    `Email: ${value("email")}`,
    `Who are you: ${value("role")}`,
    `Heard about us: ${value("heardAbout")}`,
    `Organisation: ${value("organisation") || "-"}`,
    `Message: ${value("message") || "-"}`,
  ].join("\n");
}

type Sent = { subject: string; body: string; url: string; opened: boolean };

/**
 * "Try Demo": a request for one product's demo, in a modal dialog. It asks
 * for the Contact page's details (name, phone, email, who you are) plus an
 * optional organisation and note; the product is fixed by the card.
 *
 * The site has no form backend or email service yet, so, like the Contact
 * page, sending hands the finished request to Gmail's compose view, and the
 * dialog says plainly that the visitor still has to press Send there. It
 * offers a direct email and a copy of the request if Gmail doesn't open.
 * Swap `send` for a real submit handler once one exists.
 *
 * A native <dialog> opened with showModal(): focus stays inside, the page
 * behind is inert, and Esc closes it. Focus returns to the card's button.
 */
export function DemoRequest({ choice, onClose }: { choice: DemoChoice | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<Sent | null>(null);
  const [copied, setCopied] = useState(false);
  // Keeps the last product on screen while the dialog closes.
  const [shown, setShown] = useState<DemoChoice | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !choice) return;
    opener.current = document.activeElement as HTMLElement | null;
    setShown(choice);
    setErrors({});
    setSent(null);
    setCopied(false);
    if (!dialog.open) dialog.showModal();
    lockScroll(true);
  }, [choice]);

  // Once the form shows: the first empty required field (the details are
  // kept between products), or Send when they're all filled in.
  useEffect(() => {
    const form = formRef.current;
    if (!shown || sent || !form) return;
    const empty = ORDER.map((name) => form.elements.namedItem(name) as HTMLInputElement | null).find((el) => el && !el.value);
    (empty ?? form.querySelector<HTMLElement>("[type=submit]"))?.focus();
  }, [shown, sent]);

  // Leaving the page with the dialog open (the privacy link) must not leave the scroll locked.
  useEffect(() => () => lockScroll(false), []);

  const close = () => dialogRef.current?.close();

  const onDialogClose = () => {
    lockScroll(false);
    onClose();
    opener.current?.focus({ preventScroll: true });
  };

  const check = (name: Field, value: string) => rules[name]?.(value) ?? "";

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target as unknown as HTMLInputElement;
    const name = target.name as Field;
    if (!rules[name]) return;
    // Only once something has been typed, or to clear an error already shown.
    if (!target.value && !errors[name]) return;
    setErrors((prev) => ({ ...prev, [name]: check(name, target.value) }));
  };

  const onInput = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement;
    const name = target.name as Field;
    if (errors[name] && !check(name, target.value)) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shown) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const next: Errors = {};
    for (const name of ORDER) next[name] = check(name, String(data.get(name) ?? ""));
    setErrors(next);
    const firstBad = ORDER.find((name) => next[name]);
    if (firstBad) {
      (form.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
      return;
    }

    const subject = `Demo request: ${shown.item.name} (${String(data.get("name")).trim()})`;
    const body = requestText(shown, data);
    const url = gmailComposeUrl({ subject, body });
    // Not "noopener" in the features: that makes open() return null, and we
    // need to know whether a pop-up blocker stopped it.
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null;
    setSent({ subject, body, url, opened: !!tab });
  };

  useEffect(() => {
    if (sent) dialogRef.current?.querySelector<HTMLElement>(".demo-req__done h3")?.focus();
  }, [sent]);

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const fieldProps = (name: Field) => ({
    name,
    id: `demo-req-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `demo-req-${name}-error` : undefined,
  });
  const error = (name: Field) =>
    errors[name] ? (
      <span id={`demo-req-${name}-error`} className="demo-req__error">
        {errors[name]}
      </span>
    ) : null;

  const item = shown?.item;
  const mailto = sent ? `mailto:${EMAIL}?subject=${encodeURIComponent(sent.subject)}&body=${encodeURIComponent(sent.body)}` : "";

  return (
    <dialog
      ref={dialogRef}
      className="demo-req"
      aria-labelledby="demo-req-title"
      aria-describedby="demo-req-desc"
      onClose={onDialogClose}
      // A click on the backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="demo-req__panel">
        <button type="button" className="demo-req__close" onClick={close} aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>

        {item && shown && (
          <header className="demo-req__head">
            <img
              className="demo-req__thumb"
              src={item.cover}
              alt=""
              style={item.coverPosition ? { objectPosition: item.coverPosition } : undefined}
            />
            <div>
              <p className="demo-req__eyebrow">Request a demo</p>
              <h2 id="demo-req-title" className="demo-req__title">
                <BrandText text={item.name} />
              </h2>
              <p className="demo-req__meta">
                For {shown.audience.label} · <strong>{DEMO_POINTS.toLocaleString("en-US")}</strong> demo points declared
              </p>
            </div>
          </header>
        )}

        {/* Hidden, not unmounted, while the request is out: the details carry over to the next product. */}
        <form ref={formRef} className="demo-req__form" hidden={!!sent} noValidate onSubmit={send} onBlur={onBlur} onInput={onInput}>
          <p id="demo-req-desc" className="demo-req__intro">
            Tell us who you are and our team will get in touch to arrange this demo. Fields marked * are required.
          </p>

          <div className="demo-req__grid">
            <label className="demo-req__field" htmlFor="demo-req-name">
              <span>Your name*</span>
              <input type="text" autoComplete="name" placeholder="Enter your name" required {...fieldProps("name")} />
              {error("name")}
            </label>

            <label className="demo-req__field" htmlFor="demo-req-phone">
              <span>Phone number*</span>
              <input type="tel" autoComplete="tel" inputMode="tel" placeholder="Enter your phone number" required {...fieldProps("phone")} />
              {error("phone")}
            </label>

            <label className="demo-req__field" htmlFor="demo-req-email">
              <span>Email*</span>
              <input type="email" autoComplete="email" inputMode="email" placeholder="Enter your email address" required {...fieldProps("email")} />
              {error("email")}
            </label>

            <label className="demo-req__field" htmlFor="demo-req-role">
              <span>Who are you?*</span>
              <select defaultValue="" required {...fieldProps("role")}>
                <option value="" disabled>
                  Choose an option
                </option>
                {whoAreYouOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error("role")}
            </label>

            <label className="demo-req__field demo-req__field--wide" htmlFor="demo-req-heardAbout">
              <span>How did you hear about us?*</span>
              <select defaultValue="" required {...fieldProps("heardAbout")}>
                <option value="" disabled>
                  Choose one
                </option>
                {referralOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error("heardAbout")}
            </label>

            <label className="demo-req__field demo-req__field--wide" htmlFor="demo-req-organisation">
              <span>Hospital, institution or company</span>
              <input type="text" autoComplete="organization" placeholder="Optional" maxLength={120} {...fieldProps("organisation")} />
            </label>

            <label className="demo-req__field demo-req__field--wide" htmlFor="demo-req-message">
              <span>Anything we should know?</span>
              <textarea rows={3} placeholder="Optional: what you'd like to see in the demo" maxLength={1000} {...fieldProps("message")} />
            </label>
          </div>

          <p className="demo-req__privacy">
            We use these details only to arrange your demo. See our{" "}
            <Link href="/privacy-policy" onClick={close}>
              Privacy Policy
            </Link>
            .
          </p>

          <div className="demo-req__actions">
            <button type="button" className="demo-btn demo-btn--ghost" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="demo-btn demo-btn--primary">
              Send request <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="demo-req__how">Sending opens your request in Gmail, ready for you to send to our team.</p>
        </form>
        {sent && (
          <div className="demo-req__done">
            <span className="demo-req__tick" aria-hidden="true">
              ✓
            </span>
            <h3 tabIndex={-1}>{sent.opened ? "Your request is ready in Gmail" : "One more step"}</h3>
            <p>
              {sent.opened
                ? "We've opened it in a new tab. Press Send there and our team will be in touch to arrange your demo."
                : "Your browser stopped the new tab. Open your request in Gmail and press Send, and our team will be in touch."}
            </p>
            <div className="demo-req__actions demo-req__actions--done">
              <a className="demo-btn demo-btn--primary" href={sent.url} target="_blank" rel="noopener noreferrer">
                {sent.opened ? "Open Gmail again" : "Open in Gmail"} <span aria-hidden="true">↗</span>
              </a>
              <button type="button" className="demo-btn demo-btn--ghost" onClick={close}>
                Done
              </button>
            </div>
            <p className="demo-req__alt">
              Not using Gmail? <a href={mailto}>Email {EMAIL}</a> from your own mail app, or{" "}
              <button type="button" className="demo-req__link" onClick={copy}>
                {copied ? "copied" : "copy the request"}
              </button>{" "}
              to paste anywhere.
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
