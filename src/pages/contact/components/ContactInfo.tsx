import { contactDetails } from "../data";

export function ContactInfo() {
  return (
    <div className="contact-info">
      <h2 className="contact-info__heading" data-split>
        Get in Touch With Us
      </h2>
      <p className="contact-info__intro" data-split="fade" data-delay="0.2">
        Have a question, partnership inquiry, or want to learn more about ChakraVue AI? We’re here to help. Reach out
        to our team, and we’ll get back to you as soon as possible.
      </p>
      <dl className="contact-info__list">
        {contactDetails.map(({ label, value, href }) => {
          const isExternal = href?.startsWith("http");
          return (
            <div className="contact-info__item" key={label} data-reveal>
              <dt className="contact-info__label">{label}</dt>
              <dd className="contact-info__value">
                {href ? (
                  <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
