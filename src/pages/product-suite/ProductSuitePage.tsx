import { useState } from "react";
import { scrollToY } from "../../motion/lenis";
import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { InUseBanner } from "./components/InUseBanner";
import { PlatformConsole } from "./components/PlatformConsole";
import { ProductSlides } from "./components/ProductSlides";
import { SuiteHero } from "./components/SuiteHero";
import "./product-suite.css";

export function ProductSuitePage() {
  usePageMotion();
  // The hero asks the slideshow for a product; `at` makes a repeat ask count.
  const [request, setRequest] = useState<{ index: number; at: number } | null>(null);

  const open = (index: number) => {
    setRequest({ index, at: performance.now() });
    const slides = document.getElementById("products");
    if (slides) scrollToY(slides.getBoundingClientRect().top + window.scrollY - 24);
  };

  return (
    <main className="site-shell ps-page">
      <Header />
      <SuiteHero onOpen={open} />
      <InUseBanner />
      <ProductSlides request={request} />
      <PlatformConsole />
    </main>
  );
}
