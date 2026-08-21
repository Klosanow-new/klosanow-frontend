import { FitScale } from "../../fit";

/**
 * Title Card type scales.
 *
 * Measures derive from the margins in _titlecard.scss (ml 6.4, mr 6, so a full
 * line is 87.6cqw) and from each plane's share of the frame. The ladders here are
 * the steepest in the system on purpose: a 3-character emphasis is set at 30cqw
 * and body copy at 1.9cqw, roughly a 16x jump.
 */

export const HERO: FitScale = {
  measure: 86,
  lines: 3,
  sizes: [15, 12, 10.5, 8.5, 7, 6],
};

export const TERM: FitScale = {
  measure: 86,
  lines: 2,
  sizes: [13, 10.5, 8, 6.2, 5.2],
};

export const SLABTEXT: FitScale = {
  measure: 54,
  lines: 2,
  sizes: [2.9, 2.6, 2.4, 2.2, 2],
  kind: "body",
};

/**
 * One line, always — the figure is the whole point of the statement slide. The
 * ceiling is 26cqw rather than 30 because the figure gets whatever height the
 * content-sized slab leaves, and 30cqw did not fit beneath a two-line claim.
 */
export const FIGURE: FitScale = {
  measure: 86,
  lines: 1,
  sizes: [26, 21, 14, 10, 7.5, 6],
};

/** Two lines: a third pushed the slab tall enough to squeeze out the figure. */
export const CLAIM: FitScale = {
  measure: 70,
  lines: 2,
  sizes: [7, 6, 5.2, 4.4, 3.8, 3.3],
};

export const SLABSUB: FitScale = {
  measure: 62,
  lines: 2,
  sizes: [2.4, 2.2, 2.05, 1.9],
  kind: "body",
};

/** The list head sits clear of the full-height plane on the right. */
export const LIST_TITLE: FitScale = {
  measure: 58,
  lines: 2,
  sizes: [7.4, 5.8, 4.6, 3.9, 3.3],
};

export const PAIR_TITLE: FitScale = {
  measure: 42,
  lines: 3,
  sizes: [5.8, 4.6, 3.9, 3.3, 2.9],
};

export const SEAM_TITLE: FitScale = {
  measure: 80,
  lines: 2,
  sizes: [6.8, 5.4, 4.4, 3.8, 3.2],
};

export const SIDE_TEXT: FitScale = {
  measure: 38,
  lines: 5,
  sizes: [2.9, 2.6, 2.4, 2.2, 2],
  kind: "body",
};

export const MEANING: FitScale = {
  measure: 72,
  lines: 3,
  sizes: [3.1, 2.8, 2.5, 2.25, 2.05],
  kind: "body",
};

export const EXAMPLE: FitScale = {
  measure: 76,
  lines: 2,
  sizes: [2.1, 2, 1.9],
  kind: "body",
};

/** Tracked uppercase: ~0.72em per character plus the letter-spacing. */
export const MICRO = {
  measure: 62,
  lines: 2,
  sizes: [1.5, 1.35, 1.2],
  tracking: 0.24,
};
