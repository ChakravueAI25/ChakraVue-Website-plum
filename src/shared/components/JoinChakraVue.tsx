import { useEffect, useRef, useState, type FormEvent } from "react";
import { roleOptions } from "../data/content";
import { contactError, referralFromUrl, submitOrCompose, type SubmitResult } from "../submit";
import { BrandText } from "./BrandText";
import { FormOutcome } from "./FormOutcome";
import { Link } from "./Link";
import "./join.css";

/** All of the component's public copy (also listed in COPY.md). */
export const joinCopy = {
  eyebrow: "One ChakraVue ID",
  title: "Join ChakraVue AI.",
  lead: "Get a ChakraVue ID to try the products online, book a visit, and hear when something new is live.",
  perks: ["Try the products online", "Book a visit", "Hear when something new is live"],
  subscribe: "Keep me posted",
  submit: "Get my ChakraVue ID",
  /** {contact} is filled in. Only shown once the backend has accepted it. */
  sent: "Thanks. Your ChakraVue ID is on its way to {contact}. We write rarely, and only when something is live.",
  privacy: "Only used to send your ChakraVue ID and updates. See our",
  privacyLink: "Privacy Policy",
  footer: "Join ChakraVue AI",
};

type JoinProps = {
  /** "band": the home page; "page": a section on /experience and /hospital-system; "footer": one line under Reach us. */
  variant: "band" | "page" | "footer";
  id?: string;
};

/**
 * One place to sign up or subscribe: name, one email-or-phone field, who
 * you are, "Keep me posted" (on by default) and an optional referral code
 * (pre-filled from `?ref=`). POSTs `{ name, contact, role, subscribe, ref }`
 * to `VITE_EXPERIENCE_API + /signup`; until that exists it hands off to a
 * pre-filled Gmail draft and says so, never a fake success.
 */
export function JoinChakraVue({ variant, id }: JoinProps) {
  if (variant === "footer") {
    return (
      <Link href="/experience#join" className="footer__join">
        <BrandText text={joinCopy.footer} /> <span aria-hidden="true">→</span>
      </Link>
    );
  }
  return <JoinSection variant={variant} id={id} />;
}

function JoinSection({ variant, id }: { variant: "band" | "page"; id?: string }) {
  const contactRef = useRef<HTMLInputElement>(null);
  const [referral, setReferral] = useState("");
  const [result, setResult] = useState<(SubmitResult & { contact: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const titleId = `${id ?? `join-${variant}`}-title`;

  useEffect(() => setReferral(referralFromUrl()), []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const role = String(data.get("role") ?? "");
    const subscribe = data.get("subscribe") === "on";
    const ref = String(data.get("ref") ?? "").trim();

    contactRef.current?.setCustomValidity(contactError(contact));
    if (!form.reportValidity()) return;

    setBusy(true);
    const outcome = await submitOrCompose(
      "/signup",
      { name, contact, role, subscribe, ref },
      {
        subject: "Join ChakraVue AI",
        body: [
          `Name: ${name}`,
          `Email or phone: ${contact}`,
          `Who I am: ${role}`,
          `Keep me posted: ${subscribe ? "Yes" : "No"}`,
          `Referral code: ${ref || "none"}`,
        ].join("\n"),
      },
    );
    setBusy(false);
    setResult({ ...outcome, contact });
  };

  return (
    <section id={id} className={`join join--${variant} section`} aria-labelledby={titleId}>
      <div className="join__glow" aria-hidden="true" />
      <div className="section__inner join__inner">
        <div className="join__copy">
          <p className="join__eyebrow" data-reveal>
            <BrandText text={joinCopy.eyebrow} />
          </p>
          <h2 id={titleId} className="join__title" data-split>
            <BrandText text={joinCopy.title} />
          </h2>
          <p className="join__lead" data-split="fade" data-delay="0.15">
            <BrandText text={joinCopy.lead} />
          </p>
          <ul className="join__perks" data-reveal>
            {joinCopy.perks.map((perk, i) => (
              <li key={perk}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <form className="join__form" data-reveal data-spotlight onSubmit={onSubmit}>
          <div className="join__grid">
            <label className="join__field">
              <span>Your name*</span>
              <input type="text" name="name" placeholder="Enter your name" autoComplete="name" required />
            </label>
            <label className="join__field">
              <span>Email or phone*</span>
              <input
                ref={contactRef}
                type="text"
                name="contact"
                placeholder="you@example.com or +91 …"
                autoComplete="email"
                required
                onInput={(event) => event.currentTarget.setCustomValidity("")}
              />
            </label>
            <label className="join__field">
              <span>Who are you?*</span>
              <select name="role" defaultValue="" required>
                <option value="" disabled>
                  Choose one
                </option>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="join__field">
              <span>Referral code (optional)</span>
              <input type="text" name="ref" placeholder="From a QR code or an invite" value={referral} onChange={(e) => setReferral(e.target.value)} />
            </label>
          </div>

          <label className="join__check">
            <input type="checkbox" name="subscribe" defaultChecked />
            <span className="join__box" aria-hidden="true" />
            {joinCopy.subscribe}
          </label>

          <button type="submit" className="join__submit" data-magnetic="0.3" disabled={busy}>
            <BrandText text={joinCopy.submit} />
            <span aria-hidden="true">→</span>
          </button>

          <p className="join__privacy">
            {joinCopy.privacy} <Link href="/privacy-policy">{joinCopy.privacyLink}</Link>.
          </p>

          <FormOutcome result={result} sent={result && joinCopy.sent.replace("{contact}", result.contact)} />
        </form>
      </div>
    </section>
  );
}
