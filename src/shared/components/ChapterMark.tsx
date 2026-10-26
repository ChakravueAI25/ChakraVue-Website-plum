import type { ChapterId } from "../data/story";

/** Where a chapter of the kid's story begins (story.ts); read by the growth rail. */
export function ChapterMark({ id }: { id: ChapterId }) {
  return <span className="chapter-mark" data-chapter={id} aria-hidden="true" />;
}
