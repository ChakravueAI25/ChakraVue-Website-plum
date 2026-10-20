import { useState, type FormEvent } from "react";
import { BrandText } from "../../../shared/components/BrandText";
import { submitOrCompose, type SubmitResult } from "../../../shared/submit";
import { roleOptions, visit } from "../data";
import { FormOutcome } from "./SignInForm";

/** Today in the visitor's own time zone, as yyyy-mm-dd (the date input's min). */
function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/**
 * Book a visit to the Experience Centre: day, morning or afternoon, how
 * many are coming, who they are, what they'd like to see, and a phone
 * number to confirm on. POSTs to /visit, with the same Gmail hand-off.
 */
export function VisitForm() {
  const [result, setResult] = useState<(SubmitResult & { date: string; slot: string; phone: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const see = data.getAll("see").map(String);
    const first = form.querySelector<HTMLInputElement>('input[name="see"]');
    first?.setCustomValidity(see.length ? "" : "Choose at least one thing to see.");
    if (!form.reportValidity()) return;

    const name = String(data.get("name") ?? "").trim();
    const date = String(data.get("date") ?? "");
    const slot = String(data.get("slot") ?? "");
    const visitors = Number(data.get("visitors") ?? 1);
    const role = String(data.get("role") ?? "");
    const phone = String(data.get("phone") ?? "").trim();

    setBusy(true);
    const outcome = await submitOrCompose(
      "/visit",
      { name, date, slot, visitors, role, see, phone },
      {
        subject: `Experience Centre visit request: ${date}, ${slot}`,
        body: [
          `Name: ${name}`,
          `Date: ${date}`,
          `Time of day: ${slot}`,
          `Visitors: ${visitors}`,
          `Who we are: ${role}`,
          `What we'd like to see: ${see.join(", ")}`,
          `Phone: ${phone}`,
        ].join("\n"),
      },
    );
    setBusy(false);
    setResult({ ...outcome, date, slot: slot.toLowerCase(), phone });
  };

  const sent = result && visit.sent.replace("{date}", result.date).replace("{slot}", result.slot).replace("{phone}", result.phone);

  return (
    <form className="contact-form xp-form" data-reveal data-spotlight onSubmit={onSubmit}>
      <p className="xp-form__eyebrow">{visit.eyebrow}</p>
      <h2 className="contact-form__heading">{visit.title}</h2>
      <p className="xp-form__lead">{visit.lead}</p>

      <label className="contact-form__field">
        <span>Your name*</span>
        <input type="text" name="name" placeholder="Enter your name" autoComplete="name" required />
      </label>

      <div className="xp-form__row">
        <label className="contact-form__field">
          <span>Date*</span>
          <input type="date" name="date" min={today()} required />
        </label>
        <label className="contact-form__field">
          <span>Time of day*</span>
          <select name="slot" defaultValue="" required>
            <option value="" disabled>
              Choose one
            </option>
            {visit.slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="xp-form__row">
        <label className="contact-form__field">
          <span>Visitors*</span>
          <input type="number" name="visitors" min={1} max={20} defaultValue={1} required />
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
      </div>

      <fieldset className="contact-form__field xp-form__choices">
        <legend>
          <span>What would you like to see?*</span>
        </legend>
        <div className="xp-form__chips">
          {visit.interests.map((interest) => (
            <label key={interest} className="xp-chip">
              <input type="checkbox" name="see" value={interest} onChange={(e) => e.currentTarget.form?.querySelector<HTMLInputElement>('input[name="see"]')?.setCustomValidity("")} />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="contact-form__field">
        <span>Phone*</span>
        <input type="tel" name="phone" placeholder="Enter your phone number" autoComplete="tel" pattern="\+?[\d\s\(\)\-]{8,18}" required />
      </label>

      <button type="submit" className="contact-form__submit" data-magnetic="0.3" disabled={busy}>
        <BrandText text={visit.submit} />
      </button>

      <FormOutcome result={result} sent={sent} />
    </form>
  );
}
