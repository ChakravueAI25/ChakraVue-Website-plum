import { useEffect, type ComponentType } from "react";
import { Grain } from "../motion/Grain";
import { PointerFX } from "../motion/PointerFX";
import { AboutUsPage } from "../pages/about-us/AboutUsPage";
import { BlogPage } from "../pages/blog/BlogPage";
import { ContactPage } from "../pages/contact/ContactPage";
import { HomePage } from "../pages/home/HomePage";
import { PrivacyPage } from "../pages/privacy/PrivacyPage";
import { ProductSuitePage } from "../pages/product-suite/ProductSuitePage";
import { ServicesPage } from "../pages/services/ServicesPage";
import { ChatAssistant } from "../shared/components/ChatAssistant";
import { Footer } from "../shared/components/Footer";
import { useRoute } from "./router";

const routes: Record<string, ComponentType> = {
  "/": HomePage,
  "/product-suite": ProductSuitePage,
  "/services": ServicesPage,
  "/about-us": AboutUsPage,
  "/blog": BlogPage,
  "/contact-us": ContactPage,
  "/privacy-policy": PrivacyPage,
};

export function App() {
  const path = useRoute();
  const Page = routes[path] ?? HomePage;
  // Lets page-specific palette touches (theme.css) know where they are.
  useEffect(() => {
    document.documentElement.dataset.page = path === "/" ? "home" : path.slice(1);
  }, [path]);
  return (
    <>
      <Page key={path} />
      {/* Keyed by route so its entrance replays on every page. */}
      <Footer key={`footer-${path}`} />
      {/* Outside the keyed page, so a conversation carries on across pages. */}
      <ChatAssistant />
      <PointerFX />
      <Grain />
    </>
  );
}
