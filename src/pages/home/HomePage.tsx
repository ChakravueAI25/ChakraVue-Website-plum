import { useEffect, useState } from "react";
import { reduceMotion } from "../../motion/env";
import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { BrandStrip } from "./components/BrandStrip";
import { CampaignClose } from "./components/CampaignClose";
import { CampaignFilm } from "./components/CampaignFilm";
import { CoreIdea } from "./components/CoreIdea";
import { Hero } from "./components/Hero";
import { InsightBand } from "./components/InsightBand";
import { LatestPosts } from "./components/LatestPosts";
import { ProductShowcase } from "./components/ProductShowcase";
import { TeamTeaser } from "./components/TeamTeaser";
import { ValueCards } from "./components/ValueCards";
import "./home.css";

/**
 * The homepage, structured as a company site: what we do (hero), the
 * "Analogue to AI" campaign film, who has featured us, what we believe, the
 * products, the idea, how it works, the team, the latest writing, and the
 * campaign's closing frame with the next steps, then the contact footer.
 */
export function HomePage() {
  // As before, the nav only appears once the headline has landed.
  const [navIn, setNavIn] = useState(reduceMotion);
  usePageMotion();

  // Safety net: never leave the nav hidden if the intro can't run.
  useEffect(() => {
    if (navIn) return;
    const timer = window.setTimeout(() => setNavIn(true), 6000);
    return () => window.clearTimeout(timer);
  }, [navIn]);

  return (
    <main className="site-shell home">
      <Header visible={navIn} />
      <Hero onIntroDone={() => setNavIn(true)} />
      <CampaignFilm />
      <BrandStrip />
      <InsightBand />
      <ProductShowcase />
      <CoreIdea />
      <ValueCards />
      <TeamTeaser />
      <LatestPosts />
      <CampaignClose />
    </main>
  );
}
