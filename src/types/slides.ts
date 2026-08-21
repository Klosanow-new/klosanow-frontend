/**
 * Slide design system types.
 *
 * The core contract: AI (Phase 2) emits `Slide` objects — structured words only.
 * Never HTML, never colours, never sizes. Design lives entirely in code, split
 * across independent axes: direction (the visual language), palette (colour),
 * font pair (type), and depth gesture (the 2.5D treatment).
 */

export type SlideLayout =
  | "title"
  | "statement"
  | "bullets"
  | "twoColumn"
  | "steps"
  | "compare"
  | "definition"
  | "summary";

/**
 * A visual language: its own grid, type scale and geometry, implemented as a
 * full set of layouts. `current` is the original system, kept for comparison.
 */
export type SlideDirectionId =
  | "current"
  | "broadsheet"
  | "titlecard"
  | "cutpaper";

//  2.5D depth treatments

export type DepthGesture = "stack" | "offset" | "arc" | "iso" | "notch";

export interface SlideVisual {
  type: "stock" | "icon" | "none";
  /** Search term for stock lookup — Phase 2 resolves this to a url. */
  query?: string;
  url?: string;
  alt?: string;
}

/**
 * Character limits below are advisory in Phase 1 and become enforced
 * JSON-schema `maxLength` values when AI generation lands. They exist because
 * overflowing text is the single biggest cause of ugly generated slides.
 */
export interface Slide {
  id: string;
  layout: SlideLayout;
  /** max 60 chars */
  title: string;
  /** max 90 chars */
  subtitle?: string;
  /** 2–5 items, each max 90 chars */
  body?: string[];
  /** The one number or word to blow up. Max 12 chars. */
  emphasis?: string;
  visual?: SlideVisual;
  /** Phase 2: teleprompter text during recording. 40–80 words. */
  speakerNotes?: string;
}

export interface SlidePalette {
  id: string;
  name: string;
  /** Slide background — also paints the 16:9 letterbox bars. */
  canvasBg: string;
  /** Raised panel fill. */
  surface: string;
  /** The layers behind a `stack` panel, and secondary fills. */
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  /** Text colour when sitting on `accent`. */
  onAccent: string;
  /** Curated default depth gesture for this palette. */
  depth: DepthGesture;
  /** Dark canvases need the legacy HTML panel forced light. */
  isDark: boolean;
}

export interface SlideFontPair {
  id: string;
  name: string;
  /** CSS font-family stack for headings. */
  heading: string;
  /** CSS font-family stack for body text. */
  body: string;
  /**
   * High-contrast display serifs (Playfair, Fraunces, DM Serif) lose their
   * hairlines at body size after encoding, so they are permitted in heading
   * slots only.
   */
  headingIsDisplaySerif: boolean;
  /** Dynamic @fontsource import so tutors only download the pair they pick. */
  load: () => Promise<unknown>;
}

export interface SlideStyle {
  paletteId: string;
  fontPairId: string;
  /** Visual language. Absent on drafts saved before directions existed. */
  directionId?: SlideDirectionId;
}

/** A slide item is either structured (new) or raw Quill HTML (legacy drafts). */
export type SlideItem = Slide | string;

export const isStructuredSlide = (item: SlideItem): item is Slide =>
  typeof item === "object" && item !== null && "layout" in item;
