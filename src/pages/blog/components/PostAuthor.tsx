import type { Post } from "../data";

/** Shared byline used by both the featured post and the grid cards. */
export function PostAuthor({ author, role, initials }: Pick<Post, "author" | "role" | "initials">) {
  return (
    <div className="post-author">
      <span className="post-author__avatar" aria-hidden="true">
        {initials}
      </span>
      <div>
        <p className="post-author__name">{author}</p>
        <p className="post-author__role">{role}</p>
      </div>
    </div>
  );
}
