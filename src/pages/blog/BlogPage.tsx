import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { BlogHero } from "./components/BlogHero";
import { FeaturedPost } from "./components/FeaturedPost";
import { PostGrid } from "./components/PostGrid";
import "./blog.css";

export function BlogPage() {
  usePageMotion();

  return (
    <main className="site-shell blog-page">
      <Header />
      <BlogHero />
      <FeaturedPost />
      <PostGrid />
    </main>
  );
}
