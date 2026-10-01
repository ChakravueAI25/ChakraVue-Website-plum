import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { ContactForm } from "./components/ContactForm";
import { ContactInfo } from "./components/ContactInfo";
import { ContactMap } from "./components/ContactMap";
import "./contact.css";

export function ContactPage() {
  usePageMotion();

  return (
    <main className="site-shell contact-page">
      <Header />
      <section className="contact-main section">
        <div className="section__inner contact-grid">
          <ContactInfo />
          <ContactForm />
        </div>
        <div className="section__inner">
          <ContactMap />
        </div>
      </section>
    </main>
  );
}
