import { SlideLayout } from "src/types";

// Mirrors the backend's src/llm/schema.ts. The layouts are designed for these
// bounds — overflowing text is the main cause of ugly slides.
export const SLIDE_LIMITS = {
  title: 60,
  subtitle: 90,
  bodyItem: 90,
  emphasis: 12,
  bodyMax: 5,
  speakerNotes: 700,
};

export const LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: "Title",
  statement: "Big statement",
  bullets: "Bullets",
  twoColumn: "Text + image",
  steps: "Numbered steps",
  compare: "Compare two",
  definition: "Definition",
  summary: "Summary",
};

/**
 * Which slots each layout actually renders.
 *
 * `visual` has no editor control: the model's `visual.query` is a suggestion of
 * what picture belongs on a slide, and nothing resolves it to an image, so asking
 * a tutor to refine a search term that searches nothing was busywork. The flag
 * stays because it still describes which layouts have an image slot, and a real
 * image picker will need it.
 */
export const LAYOUT_SLOTS: Record<
  SlideLayout,
  { subtitle: boolean; body: boolean; emphasis: boolean; visual: boolean }
> = {
  title: { subtitle: true, body: false, emphasis: false, visual: true },
  statement: { subtitle: true, body: false, emphasis: true, visual: false },
  bullets: { subtitle: true, body: true, emphasis: false, visual: false },
  twoColumn: { subtitle: true, body: true, emphasis: false, visual: true },
  steps: { subtitle: true, body: true, emphasis: false, visual: false },
  compare: { subtitle: false, body: true, emphasis: false, visual: false },
  definition: { subtitle: true, body: true, emphasis: false, visual: false },
  summary: { subtitle: true, body: true, emphasis: false, visual: false },
};
