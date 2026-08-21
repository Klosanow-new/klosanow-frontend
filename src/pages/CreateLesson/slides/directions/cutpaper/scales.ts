import { FitScale } from "../../fit";

/**
 * Cut Paper type scales.
 *
 * Measures derive from the stage padding in _cutpaper.scss (5.4cqw each side, so
 * a full line is 89.2cqw) and, for text inside a plane, from that plane's width
 * minus its own padding.
 */

export const HERO: FitScale = {
  measure: 82,
  lines: 3,
  sizes: [12.5, 10, 8, 6.4, 5.4],
};

/** Beside the image plane the text column is only ~46cqw wide. */
export const HERO_NARROW: FitScale = {
  measure: 42,
  lines: 4,
  sizes: [7.5, 6.2, 5.2, 4.4, 3.8],
};

export const SUB: FitScale = {
  measure: 70,
  lines: 3,
  sizes: [3.1, 2.8, 2.5, 2.25, 2.05],
  kind: "body",
};

export const SUB_NARROW: FitScale = {
  measure: 42,
  lines: 3,
  sizes: [2.6, 2.35, 2.15, 2],
  kind: "body",
};

/** Inside .cp-figureplane: 46cqw wide less its padding. */
export const FIGURE: FitScale = {
  measure: 40,
  lines: 1,
  sizes: [20, 14, 9, 6, 4.6, 3.8],
};

export const CLAIM: FitScale = {
  measure: 74,
  lines: 3,
  sizes: [6.4, 5.4, 4.6, 4, 3.5],
};

export const HEAD: FitScale = {
  measure: 72,
  lines: 2,
  sizes: [6.6, 5.4, 4.4, 3.8, 3.2],
};

export const PAIR_TEXT: FitScale = {
  measure: 36,
  lines: 5,
  sizes: [2.8, 2.55, 2.35, 2.15, 2],
  kind: "body",
};

/** Inside .cp-termplane: max-width 82% of the page less the plane's padding. */
export const TERM: FitScale = {
  measure: 66,
  lines: 2,
  sizes: [10.5, 8, 6.2, 4.8, 4],
};

export const MEANING: FitScale = {
  measure: 66,
  lines: 3,
  sizes: [3.1, 2.8, 2.5, 2.3, 2.1],
  kind: "body",
};

export const EXAMPLE: FitScale = {
  measure: 50,
  lines: 3,
  sizes: [2.2, 2.1, 2, 1.9],
  kind: "body",
};

export const LABEL = {
  measure: 66,
  lines: 2,
  sizes: [1.55, 1.4, 1.25],
  tracking: 0.2,
};
