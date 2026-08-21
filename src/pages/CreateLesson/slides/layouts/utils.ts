import { DepthGesture, Slide, SlideVisual } from "src/types";

export interface LayoutProps {
  slide: Slide;
  depth: DepthGesture;
}

/**
 * A visual only counts once it has a real url.
 *
 * The model emits `visual.query` — a suggestion of what picture belongs here —
 * and nothing resolves that to an image. Treating a bare query as "has a visual"
 * made every layout hold space for a picture that never arrived, and the frame
 * components used to fill that space with the query text itself, which then got
 * screen-captured into the tutor's recording.
 */
export const hasImage = (
  visual?: SlideVisual
): visual is SlideVisual & { url: string } =>
  !!visual && visual.type !== "none" && !!visual.url;

// Lets a body item carry its own kicker: "Light reactions: happen in the
// thylakoid" renders as a labelled panel. Without a separator it is plain text.
export const splitLabelled = (item: string) => {
  const match = item.match(/^(.{2,28}?)\s*(?:—|:)\s+(.+)$/);
  return match ? { label: match[1], text: match[2] } : { text: item };
};

export const bodyOf = (slide: Slide) => slide.body?.filter(Boolean) ?? [];
