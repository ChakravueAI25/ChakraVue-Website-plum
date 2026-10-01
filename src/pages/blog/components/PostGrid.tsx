import type { Post } from "../data";
import { posts } from "../data";
import { PostAuthor } from "./PostAuthor";

export function PostGrid() {
  return (
    <section className="blog-grid section">
      <div className="section__inner">
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card" data-reveal data-spotlight>
      <div className="post-card__art" aria-hidden="true">
        <span className="post-card__tag-mark">{post.tag}</span>
      </div>
      <div className="post-meta">
        <span className="post-meta__date">{post.date}</span>
        <span className="post-meta__tag">{post.tag}</span>
      </div>
      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__excerpt">{post.excerpt}</p>
      <PostAuthor author={post.author} role={post.role} initials={post.initials} />
    </article>
  );
}
