import { useRef, type FormEvent } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { gmailComposeUrl, interestOptions, whoAreYouOptions } from "../data";

/**
 * No backend/email service is wired up yet, so submitting hands the message
 * off to Gmail (compose view, pre-filled) instead of silently doing nothing
 * or faking a "sent" confirmation. Swap this for a real submit handler once
 * one exists.
 */
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get("name");
  const phone = data.get("phone");
  const email = data.get("email");
  const role = data.get("role");
  const interest = data.get("interest");

  const subject = `Website enquiry from ${name}`;
  const body = [`Name: ${name}`, `Phone: ${phone}`, `Email: ${email}`, `Who are you: ${role}`, `What excited you about us: ${interest}`].join(
    "\n",
  );

  window.open(gmailComposeUrl({ subject, body }), "_blank", "noopener");
}

export function ContactForm() {
  const ref = useRef<HTMLFormElement>(null);

  // The card rises (data-reveal) and its fields follow it in, one by one.
  useMotion(ref, (form) => {
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
    <form ref={ref} className="contact-form" data-reveal data-spotlight onSubmit={handleSubmit}>
      <h2 className="contact-form__heading">Contact Us</h2>

      <label className="contact-form__field">
        <span>Your name*</span>
        <input type="text" name="name" placeholder="Enter your name" required />
      </label>

      <label className="contact-form__field">
        <span>Phone Number*</span>
        <input type="tel" name="phone" placeholder="Enter your phone number" required />
      </label>

      <label className="contact-form__field">
        <span>Email*</span>
        <input type="email" name="email" placeholder="Enter email id" required />
      </label>

      <label className="contact-form__field">
        <span>Who are you?*</span>
        <select name="role" defaultValue="" required>
          <option value="" disabled>
            Choose from the below options
          </option>
          {whoAreYouOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="contact-form__field">
        <span>What Excited You About Us?*</span>
        <select name="interest" defaultValue="" required>
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

      <button type="submit" className="contact-form__submit" data-magnetic="0.3">
        Submit
      </button>
    </form>
  );
}
