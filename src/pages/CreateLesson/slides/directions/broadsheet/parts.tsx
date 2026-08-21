import React from "react";
import { SlideVisual } from "src/types";
import { hasImage } from "../../layouts/utils";
import { fitCaps } from "../../fit";
import { KICKER } from "./scales";

/**
 * Broadsheet shared parts.
 *
 * The whole direction is rules, a 12-column grid and negative space — there are
 * no panels and no shadows anywhere, so nothing here can smear at 400 kbps.
 * Rules are never thinner than 0.4cqw (~5px at 1280) for the same reason.
 */

/**
 * Running head: a micro label, a heavy rule, and nothing else. The label slot
 * receives `subtitle`, which can be 90 characters, so it is fitted and allowed to
 * wrap rather than set nowrap and run off the page.
 */
export const Slug: React.FC<{ label?: string; index?: string }> = ({
  label,
  index,
}) => (
  <div className="bs-slug">
    <span className="bs-slug__label" style={fitCaps(label, KICKER)}>
      {label || " "}
    </span>
    {index && <span className="bs-slug__index">{index}</span>}
  </div>
);

export const Rule: React.FC<{ weight?: "hair" | "mid" | "heavy" }> = ({
  weight = "mid",
}) => <div className={`bs-rule bs-rule--${weight}`} />;

/** An image, full-bleed to the frame edge. No mat, no radius, no wash. */
export const Bleed: React.FC<{ visual?: SlideVisual; side?: "right" | "left" }> = ({
  visual,
  side = "right",
}) => {
  if (!hasImage(visual)) return null;
  return (
    <div className={`bs-bleed bs-bleed--${side}`}>
      <img className="bs-bleed__img" src={visual.url} alt={visual.alt || ""} />
    </div>
  );
};

/**
 * A list row: an index figure hung in the left margin, a rule above, and the
 * text in a wide measure. This is the only list construction in the direction —
 * bullets, steps and summary differ in what sits in the index slot, not in
 * geometry, which is what keeps them recognisably one family. Row type size
 * comes from `data-rows` on the parent list.
 */
export const Row: React.FC<{
  index: React.ReactNode;
  children: React.ReactNode;
}> = ({ index, children }) => (
  <li className="bs-row">
    <span className="bs-row__index">{index}</span>
    <span className="bs-row__body">{children}</span>
  </li>
);
