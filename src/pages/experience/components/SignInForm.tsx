import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrandText } from "../../../shared/components/BrandText";
import { contactError, referralFromUrl, submitOrCompose, type SubmitResult } from "../../../shared/submit";
import { roleOptions, signIn } from "../data";

/**
 * Sign in / sign up: name, one email-or-phone field, who you are, and an
 * optional referral code (pre-filled from `?ref=`). POSTs to /signup; until
 * that exists it hands off to a pre-filled Gmail draft and says so.
 */
export function SignInForm() {
  const contactRef = useRef<HTMLInputElement>(null);
  const [referral, setReferral] = useState("");
  const [result, setResult] = useState<(SubmitResult & { name: string; contact: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setReferral(referralFromUrl()), []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const role = String(data.get("role") ?? "");
    const ref = String(data.get("ref") ?? "").trim();

    const error = contactError(contact);
    contactRef.current?.setCustomValidity(error);
    if (error) {
      form.reportValidity();
      return;
    }

    setBusy(true);
    const outcome = await submitOrCompose(
      "/signup",
      { name, contact, role, ref },
      {
        subject: "ChakraVue AI ID request",
        body: [`Name: ${name}`, `Email or phone: ${contact}`, `Who I am: ${role}`, `Referral code: ${ref || "none"}`].join("\n"),
      },
    );
    setBusy(false);
    setResult({ ...outcome, name, contact });
  };

  return (
    <form className="contact-form xp-form" data-reveal data-spotlight onSubmit={onSubmit}>
      <p className="xp-form__eyebrow">{signIn.eyebrow}</p>
      <h2 className="contact-form__heading">
        <BrandText text={signIn.title} />
      </h2>
      <p className="xp-form__lead">
        <BrandText text={signIn.lead} />
      </p>

      <label className="contact-form__field">
        <span>Your name*</span>
        <input type="text" name="name" placeholder="Enter your name" autoComplete="name" required />
      </label>

      <label className="contact-form__field">
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

      <label className="contact-form__field">
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

      <label className="contact-form__field">
        <span>Referral code (optional)</span>
        <input type="text" name="ref" placeholder="From a QR code or an invite" value={referral} onChange={(e) => setReferral(e.target.value)} />
      </label>

      <button type="submit" className="contact-form__submit" data-magnetic="0.3" disabled={busy}>
        <BrandText text={signIn.submit} />
      </button>

      <FormOutcome result={result} sent={result && signIn.sent.replace("{name}", result.name).replace("{contact}", result.contact)} />
    </form>
  );
}

/** What actually happened, in plain words: sent, or handed to Gmail (never a fake "done"). */
export function FormOutcome({ result, sent }: { result: SubmitResult | null; sent: string | null }) {
  if (!result) return <p className="xp-form__status" role="status" aria-live="polite" />;
  return (
    <p className={`xp-form__status is-${result.outcome}`} role="status" aria-live="polite">
      {result.outcome === "sent" ? (
        <BrandText text={sent ?? ""} />
      ) : (
        <>
          We&apos;ve opened an email to our team in Gmail with your details. Press send there and we&apos;ll reply. Nothing is sent until you
          do.{" "}
          <a href={result.composeUrl} target="_blank" rel="noopener noreferrer">
            Open the email again
          </a>
        </>
      )}
    </p>
  );
}
