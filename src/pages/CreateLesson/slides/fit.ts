import React from "react";

/**
 * Type fitting.
 *
 * Every slot has to look deliberate at one character and at its cap (title 60,
 * subtitle 90, body item 90, emphasis 12) and must never overflow or clip. That
 * is done by choosing the font size from the *text* rather than measuring the
 * rendered DOM: a slot declares its measure, the sizes it is willing to take and
 * how many lines it can afford, and the largest size that fits wins.
 *
 * Sizes come out as a `--fit` custom property in cqw, so the result still scales
 * with the container query and is identical in the small editor preview and at
 * 1280x720. There is one source of truth for each number — the scale below —
 * rather than tiers duplicated between TypeScript and the stylesheet.
 *
 * Two constraints are checked, because they fail differently:
 *   - total length decides the line count;
 *   - the longest single word decides whether a word breaks mid-way. Chakra's
 *     reset sets `word-wrap: break-word` globally, so an over-long word does not
 *     overflow — it splits, which is how "Photosynthesis" became "Photosy /
 *     nthesis" before this existed.
 */

/**
 * Advance width per character as a fraction of font-size, measured across all
 * six pairs (kl/31-metrics.mjs). Worst observed at a 100px probe: 0.486 for a
 * full heading run, 0.526 for a single word, 0.482 for body prose, 0.709 for
 * tracked uppercase.
 *
 * The values below sit above those measurements on purpose. Two of the pairs are
 * variable fonts with an optical-size axis (Fraunces, Bricolage), so their real
 * advance width at the rendered size is not the width measured at the probe size
 * — Fraunces wrapped a 60-character head to three lines where Space Grotesk took
 * two, at an identical font-size. The margin absorbs that; without it the solver
 * is accurate for five pairs and one character short for the sixth.
 */
const RATIO = {
  headingRun: 0.53,
  headingWord: 0.57,
  bodyRun: 0.51,
  bodyWord: 0.54,
  /** Uppercase, and tracking has to be added on top by the caller. */
  caps: 0.75,
};

export interface FitScale {
  /** Usable measure for this slot, in cqw. Also emitted, so CSS cannot drift. */
  measure: number;
  /** Candidate sizes in cqw, largest first. */
  sizes: number[];
  /** How many lines the slot can afford at its position in the layout. */
  lines: number;
  /** Which metric applies — headings are set at weight 700, prose at 400. */
  kind?: "heading" | "body";
}

const longestWord = (text: string) =>
  text.split(/\s+/).reduce((max, w) => Math.max(max, w.length), 0);

/**
 * The largest declared size at which `text` both keeps its longest word intact
 * and stays within its line budget. Falls back to the smallest size, which is
 * why the last entry in `sizes` has to be one that always fits.
 */
export const fitSize = (text: string | undefined, scale: FitScale): number => {
  const value = (text ?? "").trim();
  const { measure, sizes, lines, kind = "heading" } = scale;
  if (!value) return sizes[sizes.length - 1];

  const runRatio = kind === "heading" ? RATIO.headingRun : RATIO.bodyRun;
  const wordRatio = kind === "heading" ? RATIO.headingWord : RATIO.bodyWord;
  const word = longestWord(value);

  for (const size of sizes) {
    if (word * size * wordRatio > measure) continue;
    const perLine = measure / (size * runRatio);
    if (Math.ceil(value.length / perLine) > lines) continue;
    return size;
  }
  return sizes[sizes.length - 1];
};

/**
 * `--fit` is the chosen font-size and `--fit-measure` the max-width the size was
 * solved against, both in cqw. A slot that sets its own max-width from anything
 * other than `--fit-measure` is lying to the solver.
 */
export const fitStyle = (
  text: string | undefined,
  scale: FitScale
): React.CSSProperties =>
  ({
    "--fit": `${fitSize(text, scale)}cqw`,
    "--fit-measure": `${scale.measure}cqw`,
  }) as React.CSSProperties;

/**
 * Tracked uppercase labels take a 90-character subtitle in the kicker slot, where
 * caps plus letter-spacing run to roughly 0.9em per character. Rather than shrink
 * a label to nothing, this caps the line count and lets it wrap.
 */
export const fitCaps = (
  text: string | undefined,
  scale: FitScale & { tracking: number }
): React.CSSProperties => {
  const value = (text ?? "").trim();
  const { measure, sizes, lines, tracking } = scale;
  const perChar = (size: number) => size * (RATIO.caps + tracking);

  let chosen = sizes[sizes.length - 1];
  for (const size of sizes) {
    const perLine = measure / perChar(size);
    if (Math.ceil(value.length / perLine) <= lines) {
      chosen = size;
      break;
    }
  }
  return {
    "--fit": `${chosen}cqw`,
    "--fit-measure": `${measure}cqw`,
  } as React.CSSProperties;
};

/**
 * Row count drives how much vertical room each item in a list may claim. Body is
 * capped at 5 items by SLIDE_LIMITS, so this is always 1–5.
 */
export const rowsAttr = (count: number) => String(Math.min(Math.max(count, 1), 5));
