import { useEffect, useState } from "react";
import { reduceMotion } from "../../motion/env";
import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { JoinChakraVue } from "../../shared/components/JoinChakraVue";
import { BrandStrip } from "./components/BrandStrip";
import { CoreIdea } from "./components/CoreIdea";
import { Hero } from "./components/Hero";
import { HospitalDay } from "./components/HospitalDay";
import { InsightBand } from "./components/InsightBand";
import { LatestPosts } from "./components/LatestPosts";
import { ProductShowcase } from "./components/ProductShowcase";
import { TeamTeaser } from "./components/TeamTeaser";
import "./home.css";

/**
 * The homepage, structured as a company site: what we do (hero), who has
 * featured us, what we believe, the products, Join ChakraVue AI, the idea,
 * a day in the hospital, the team, and the latest writing, then the footer.
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
      <BrandStrip />
      <InsightBand />
      <ProductShowcase />
      <JoinChakraVue variant="band" />
      <CoreIdea />
      <HospitalDay />
      <TeamTeaser />
      <LatestPosts />
    </main>
  );
}
