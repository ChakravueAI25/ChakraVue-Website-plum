import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { BlogHero } from "./components/BlogHero";
import { MediaFeature } from "./components/MediaFeature";
import { SalemVisit } from "./components/SalemVisit";
import "./blog.css";

export function BlogPage() {
  usePageMotion();

  return (
    <main className="site-shell blog-page">
      <Header />
      <BlogHero />
      <MediaFeature />
      <SalemVisit />
    </main>
  );
}
