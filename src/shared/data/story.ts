/**
 * The kid's story, told down the homepage. Each chapter starts at a marker
 * placed between sections (ChapterMark), so the technical sections
 * themselves carry no story code. The growth rail reads the markers to name
 * the chapter on screen and to pace the toddler's growing up.
 */
export const chapters = [
  { id: "dream", title: "The dream" },
  { id: "beginning", title: "The beginning" },
  { id: "discovery", title: "The discovery" },
  { id: "transformation", title: "The transformation" },
  { id: "journey", title: "The journey" },
  { id: "aspiration", title: "The aspiration" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];
