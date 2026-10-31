import { useRef, useState, type FormEvent } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { EnquiryError, enquiryTypeForInterest, submitEnquiry, type SourceForm } from "../../../shared/api/enquiries";
import { interestOptions, referralOptions, whoAreYouOptions } from "../data";

type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

/**
 * A link can choose the interest for the visitor (`/contact-us?interest=…`,
 * from the audience sections). Only the form's own options are accepted.
 */
function interestFromLink() {
  const asked = new URLSearchParams(window.location.search).get("interest");
  return asked && interestOptions.includes(asked) ? asked : "";
}

/**
 * The Contact form, saved to the enquiries backend. `inDialog`: shown in a
 * pop-up, so it's there at once, with no entrance. `sourceForm` says which
 * place it was sent from.
 */
export function ContactForm({
  inDialog = false,
  heading = "Contact Us",
  sourceForm = "contact-page",
}: {
  inDialog?: boolean;
  heading?: string;
  sourceForm?: SourceForm;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.state === "sending") return; // a second click while the first is out
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const interest = value("interest");
    const type = enquiryTypeForInterest(interest);
    setStatus({ state: "sending" });
    setFieldErrors({});
    try {
      await submitEnquiry({
        name: value("name"),
        phone: value("phone"),
        email: value("email"),
        visitorType: value("role"),
        enquiryType: type,
        // A product goes in productInterest; anything else is kept as the visitor's choice.
        productInterest: type === "product" ? [interest] : undefined,
        message: type === "general" && interest ? `Interested in: ${interest}` : undefined,
        referralSource: value("heardAbout"),
        sourceForm,
        website: value("website"),
      });
      form.reset();
      setStatus({ state: "sent", message: "Thank you. Your enquiry has been received and our team will be in touch soon." });
    } catch (error) {
      const e = error instanceof EnquiryError ? error : new EnquiryError("We couldn't send your enquiry. Please try again.");
      setFieldErrors(e.fields);
      setStatus({ state: "error", message: e.message });
    }
  };
  const fieldError = (name: string) => (fieldErrors[name] ? <small className="contact-form__error">{fieldErrors[name]}</small> : null);

  // The card rises (data-reveal) and its fields follow it in, one by one.
  useMotion(ref, (form) => {
    if (inDialog) return;
    gsap.from(form.querySelectorAll(".contact-form__heading, .contact-form__field, .contact-form__submit"), {
      y: 26,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.07,
      delay: 0.25,
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: form, start: "top 90%", once: true },
    });
  });

  return (
    <form
      ref={ref}
      className={`contact-form${inDialog ? " contact-form--dialog" : ""}`}
      data-reveal={inDialog ? undefined : ""}
      data-spotlight={inDialog ? undefined : ""}
      onSubmit={handleSubmit}
    >
      <h2 className="contact-form__heading">{heading}</h2>

      <label className="contact-form__field">
        <span>Your name*</span>
        <input type="text" name="name" placeholder="Enter your name" required maxLength={140} autoComplete="name" />
        {fieldError("name")}
      </label>

      <label className="contact-form__field">
        <span>Phone number*</span>
        <input type="tel" name="phone" placeholder="Enter your phone number" required maxLength={32} autoComplete="tel" />
        {fieldError("phone")}
      </label>

      <label className="contact-form__field">
        <span>Email*</span>
        <input type="email" name="email" placeholder="Enter your email address" required maxLength={254} autoComplete="email" />
        {fieldError("email")}
      </label>

      <label className="contact-form__field">
        <span>Who are you?*</span>
        <select name="role" defaultValue="" required>
          <option value="" disabled>
            Choose an option
          </option>
          {whoAreYouOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="contact-form__field">
        <span>What interests you?*</span>
        <select name="interest" defaultValue={interestFromLink()} required>
          <option value="" disabled>
            Choose one
          </option>
          {interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="contact-form__field">
        <span>How did you hear about us?*</span>
        <select name="heardAbout" defaultValue="" required>
          <option value="" disabled>
            Choose one
          </option>
          {referralOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {/* Left empty by people; filled only by bots that fill every field. */}
      <input className="contact-form__trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <button type="submit" className="contact-form__submit" data-magnetic="0.3" disabled={status.state === "sending"} aria-busy={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : "Submit"}
      </button>
      {status.message && (
        <p className={`contact-form__status contact-form__status--${status.state}`} role={status.state === "error" ? "alert" : "status"}>
          {status.message}
        </p>
      )}
    </form>
  );
}
