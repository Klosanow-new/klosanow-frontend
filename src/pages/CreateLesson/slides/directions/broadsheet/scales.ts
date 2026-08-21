import { FitScale } from "../../fit";

/**
 * Broadsheet type scales.
 *
 * All of the direction's sizing lives here so the numbers can be read against
 * each other. `measure` is the usable width of the slot in cqw, derived from the
 * page margins in _broadsheet.scss:
 *
 *   full page     100 − 5.6 (left) − 5 (right)       = 89.4cqw
 *   split page    62 (grid col) − 5.6 − 3.4          = 53cqw
 *
 * and is emitted as the slot's max-width, so the width the solver used and the
 * width the browser lays out against cannot drift apart.
 */

/** A one-word 60-char title still fits on 3 lines at the smallest size. */
export const HERO: FitScale = {
  measure: 82,
  lines: 3,
  sizes: [12.5, 10, 8, 6.4, 5.4],
};

/** The narrow column beside a full-bleed image needs its own ladder. */
export const HERO_SPLIT: FitScale = {
  measure: 50,
  lines: 4,
  sizes: [8.5, 7, 5.8, 4.9, 4.2],
};

export const TERM: FitScale = {
  measure: 84,
  lines: 2,
  sizes: [11.5, 9, 7, 5.4, 4.6],
};

/**
 * Two lines, not three: at the 60-char title cap the hero already takes three
 * lines, and a third standfirst line pushed the page past the bottom margin.
 */
export const STANDFIRST: FitScale = {
  measure: 62,
  lines: 2,
  sizes: [3.2, 2.9, 2.6, 2.3, 2.1, 1.9],
  kind: "body",
};

/** The statement figure: one line, always. 12 chars is the cap. */
export const FIGURE: FitScale = {
  measure: 88,
  lines: 1,
  sizes: [25, 19, 13, 9, 7],
};

export const CLAIM: FitScale = {
  measure: 86,
  lines: 2,
  sizes: [6.6, 5.6, 4.8, 4.2, 3.6],
};

export const HEAD: FitScale = {
  measure: 88,
  lines: 2,
  sizes: [6.4, 5.2, 4.3, 3.7, 3.2],
};

export const BAND_TITLE: FitScale = {
  measure: 84,
  lines: 2,
  sizes: [6.2, 5, 4.2, 3.6, 3.1],
};

export const COLUMN_TEXT: FitScale = {
  measure: 40,
  lines: 5,
  sizes: [2.9, 2.6, 2.4, 2.2, 2],
  kind: "body",
};

/** Two lines: the term above it can take two, and the footnote another two. */
export const MEANING: FitScale = {
  measure: 62,
  lines: 2,
  sizes: [3.4, 3, 2.7, 2.4, 2.2, 2],
  kind: "body",
};

export const FOOTNOTE: FitScale = {
  measure: 76,
  lines: 2,
  sizes: [2.2, 2.1, 2, 1.9],
  kind: "body",
};

/** Tracked uppercase runs ~0.72em per character before letter-spacing. */
export const KICKER = {
  measure: 76,
  lines: 2,
  sizes: [1.5, 1.35, 1.2],
  tracking: 0.2,
};
