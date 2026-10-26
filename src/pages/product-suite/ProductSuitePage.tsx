import { usePageMotion } from "../../motion/useMotion";
import { AudienceMap } from "../../shared/components/AudienceMap";
import { Header } from "../../shared/components/Header";
import { InsightStatement } from "../../shared/components/InsightStatement";
import { PlatformConsole } from "./components/PlatformConsole";
import { ProductTheater } from "./components/ProductTheater";
import { SuiteHero } from "./components/SuiteHero";
import { suiteLines } from "./data";
import "./product-suite.css";

export function ProductSuitePage() {
  usePageMotion();

  return (
    <main className="site-shell ps-page">
      <Header />
      <SuiteHero />
      <InsightStatement lines={suiteLines} className="insight-statement--lead" pin={false} />
      {/* Who each product is for, before the products themselves. */}
      <AudienceMap variant="detailed" />
      <ProductTheater />
      <PlatformConsole />
    </main>
  );
}
