import { featuredPost } from "../data";
import { PostAuthor } from "./PostAuthor";

export function FeaturedPost() {
  const post = featuredPost;

  return (
    <section className="blog-featured section">
      <div className="section__inner">
        <article className="post-feature" data-reveal data-spotlight>
          {/* Stands in for a cover photo until real article art exists. */}
          <div className="post-feature__art" aria-hidden="true">
            <span className="post-feature__tag-mark">{post.tag}</span>
          </div>
          <div className="post-feature__body">
            <div className="post-meta">
              <span className="post-meta__date">{post.date}</span>
              <span className="post-meta__tag">{post.tag}</span>
            </div>
            <h2 className="post-feature__title">{post.title}</h2>
            <p className="post-feature__excerpt">{post.excerpt}</p>
            <PostAuthor author={post.author} role={post.role} initials={post.initials} />
          </div>
        </article>
      </div>
    </section>
  );
}
