import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { AboutHero } from "./components/AboutHero";
import { LeaderStatement } from "./components/LeaderStatement";
import { TeamGrid } from "./components/TeamGrid";
import { leaders } from "./data";
import "./about-us.css";

export function AboutUsPage() {
  usePageMotion();

  return (
    <main className="site-shell about-page">
      <Header />
      <AboutHero />
      {leaders.map((leader, i) => (
        <LeaderStatement key={leader.role} {...leader} reverse={i % 2 === 1} />
      ))}
      <TeamGrid />
    </main>
  );
}
