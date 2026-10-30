import { useEffect, useRef, useState, type FormEvent } from "react";
import { products } from "../../product-suite/data";
import { platforms } from "../../product-suite/platforms";
import { BrandText } from "../../../shared/components/BrandText";
import "./earlyBird.css";

const interests = [
  ...products.map((product) => product.label),
  ...platforms.map((platform) => platform.title),
  "Gaming-based Surgical Training",
  "Microscope Software Integrations",
];
const roles = ["Ophthalmologist / Eye Surgeon", "Dentist / Dental Surgeon", "Hospital Administrator", "Healthcare Professional", "Researcher / Academic", "Medical Student", "Hospital / Clinic Owner", "Distributor / Industry Partner", "Investor", "Other"];
const timelines = ["Immediately", "Within 3 months", "Within 6 months", "Exploring for the future"];
type Errors = Record<string, string>;

export function EarlyBirdOffer() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status !== "submitting") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("early-bird-open");
    dialog.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("early-bird-open");
      (previous ?? trigger.current)?.focus();
    };
  }, [open, status]);

  const close = () => {
    if (status !== "submitting") {
      setOpen(false);
      setStatus("idle");
      setErrors({});
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = data.getAll("products").map(String);
    const next: Errors = {};
    for (const name of ["name", "email", "phone", "country", "organization", "role"]) {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
      if (!field.value.trim()) next[name] = "This field is required.";
      else if (name === "email" && !field.validity.valid) next[name] = "Enter a valid work email address.";
      else if (name === "phone" && !field.validity.valid) next[name] = "Include a country code, for example +91 6300147979.";
    }
    if (!selected.length) next.products = "Choose at least one product.";
    if (!data.has("consent")) next.consent = "Please agree to be contacted about this inquiry.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/early-bird", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data.entries()), products: selected }),
      });
      if (!response.ok) throw new Error("Submission was not saved.");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const fieldError = (name: string) => errors[name] ? <small className="eb-error" id={`eb-${name}-error`}>{errors[name]}</small> : null;

  return (
    <>
      <aside className="early-bird" aria-label="Early-bird offer">
        <div className="early-bird__copy">
          <span className="early-bird__eyebrow">Early-bird access</span>
          <strong>10,000 <span>points</span></strong>
          <p>Get 10,000 points to explore the <BrandText text="ChakraVue AI" /> ecosystem.</p>
        </div>
        <button ref={trigger} type="button" className="early-bird__cta" onClick={() => setOpen(true)}>Avail now <span aria-hidden="true">→</span></button>
      </aside>

      {open && <div className="eb-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <section ref={dialog} className="eb-dialog" role="dialog" aria-modal="true" aria-labelledby="eb-title" aria-describedby="eb-description">
          <button className="eb-close" type="button" aria-label="Close form" onClick={close} disabled={status === "submitting"}>×</button>
          {status === "success" ? <div className="eb-success">
            <span className="eb-success__mark" aria-hidden="true">✓</span>
            <p className="eb-kicker">Early access registered</p>
            <h2 id="eb-title">Thank you for your interest.</h2>
            <p>Your registration was saved. Our team can follow up about early access and the 10,000-point offer.</p>
            <button type="button" className="eb-submit" onClick={close}>Done</button>
          </div> : <>
            <p className="eb-kicker"><BrandText text="ChakraVue AI" /> · Early-bird offer</p>
            <h2 id="eb-title">Claim Your Early-Bird Access</h2>
            <p id="eb-description" className="eb-description">Tell us a little about yourself and the products you're interested in. Our team will connect with you about early access and your 10,000-point offer.</p>
            {status === "error" && <p className="eb-submit-error" role="alert">We couldn't save your inquiry. Please try again in a moment.</p>}
            <form className="eb-form" onSubmit={submit} noValidate>
              <fieldset><legend>Personal information</legend><div className="eb-grid">
                <label className="eb-field">Full name *<input name="name" autoComplete="name" required aria-describedby={errors.name ? "eb-name-error" : undefined} />{fieldError("name")}</label>
                <label className="eb-field">Work email *<input name="email" type="email" autoComplete="email" required aria-describedby={errors.email ? "eb-email-error" : undefined} />{fieldError("email")}</label>
                <label className="eb-field">Phone number with country code *<input name="phone" type="tel" autoComplete="tel" placeholder="+91 6300147979" pattern="\+[1-9][0-9]{0,3}[ -]?[0-9 ()-]{6,18}" required aria-describedby={errors.phone ? "eb-phone-error" : undefined} />{fieldError("phone")}</label>
                <label className="eb-field">Country *<input name="country" autoComplete="country-name" required aria-describedby={errors.country ? "eb-country-error" : undefined} />{fieldError("country")}</label>
              </div></fieldset>
              <fieldset><legend>Professional information</legend><div className="eb-grid">
                <label className="eb-field eb-field--wide">Organization, hospital, clinic, university, or company *<input name="organization" autoComplete="organization" required aria-describedby={errors.organization ? "eb-organization-error" : undefined} />{fieldError("organization")}</label>
                <label className="eb-field">Role or designation *<select name="role" defaultValue="" required aria-describedby={errors.role ? "eb-role-error" : undefined}><option value="" disabled>Select your role</option>{roles.map((role) => <option key={role}>{role}</option>)}</select>{fieldError("role")}</label>
                <label className="eb-field">Department or specialization<input name="department" /></label>
              </div></fieldset>
              <fieldset><legend>Product interests <span>(select all that apply)</span></legend><div className="eb-check-grid">{interests.map((interest) => <label key={interest} className="eb-check"><input type="checkbox" name="products" value={interest} /><span>{interest}</span></label>)}</div>{fieldError("products")}</fieldset>
              <fieldset><legend>Additional information</legend><div className="eb-grid">
                <label className="eb-field eb-field--wide">Intended use case or area of interest<textarea name="useCase" rows={3} /></label>
                <label className="eb-field">Preferred method of contact<select name="contactMethod" defaultValue=""><option value="">No preference</option><option>Email</option><option>Phone</option><option>WhatsApp</option></select></label>
                <label className="eb-field">Estimated implementation timeline<select name="timeline" defaultValue=""><option value="">Select a timeline</option>{timelines.map((timeline) => <option key={timeline}>{timeline}</option>)}</select></label>
              </div></fieldset>
              <label className="eb-consent"><input type="checkbox" name="consent" required aria-describedby={errors.consent ? "eb-consent-error" : undefined} /><span>I agree to be contacted by the <BrandText text="ChakraVue AI" /> team about this inquiry. *</span></label>{errors.consent && <small className="eb-error" id="eb-consent-error" role="alert">{errors.consent}</small>}
              <div className="eb-actions"><button className="eb-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? <><span className="eb-spinner" /> Saving…</> : "Claim my 10,000 points"}</button><button className="eb-later" type="button" onClick={close} disabled={status === "submitting"}>Maybe Later</button></div>
              <p className="eb-note">This form registers your interest; points are not credited automatically.</p>
            </form>
          </>}
        </section>
      </div>}
    </>
  );
}
