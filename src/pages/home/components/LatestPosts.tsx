import { Link } from "../../../shared/components/Link";
import { featuredPost, posts } from "../../blog/data";

const latest = [featuredPost, ...posts].slice(0, 3);

/** Latest from the blog: the three most recent posts. */
export function LatestPosts() {
  return (
    <section className="hnews section" aria-labelledby="hnews-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <h2 className="section-label" data-scramble>
              Blog
            </h2>
            <h3 id="hnews-title" className="hsec-title" data-split>
              Latest from the team.
            </h3>
          </div>
          <Link href="/blog" className="hsec-link" data-reveal>
            Read the blog <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="hnews__grid">
          {latest.map((post) => (
            <Link key={post.slug} href="/blog" className="hnews__card" data-reveal data-spotlight>
              <div className="hnews__art" aria-hidden="true">
                <span>{post.tag}</span>
              </div>
              <p className="hnews__meta">
                <span>{post.date}</span>
                <span className="hnews__tag">{post.tag}</span>
              </p>
              <h4 className="hnews__title">{post.title}</h4>
              <p className="hnews__excerpt">{post.excerpt}</p>
              <p className="hnews__author">
                <span className="hnews__avatar" aria-hidden="true">
                  {post.initials}
                </span>
                <span>
                  {post.author}
                  <small>{post.role}</small>
                </span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
