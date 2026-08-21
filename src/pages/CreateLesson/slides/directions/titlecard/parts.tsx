import React from "react";
import { SlideVisual } from "src/types";
import { hasImage } from "../../layouts/utils";
import { fitCaps } from "../../fit";
import { MICRO } from "./scales";

/**
 * Title Card shared parts.
 *
 * The signature move is a headline that changes colour where it crosses a solid
 * accent slab. It is done by drawing the text twice and clipping the second copy
 * to the slab — never with a blend mode, a gradient or a mask, all of which fall
 * apart at 400 kbps. Both copies are plain text nodes, so no field is ever
 * rendered as HTML.
 */

interface SplitProps {
  text: string;
  /**
   * The `clip-path` inset that selects the part of the headline sitting on the
   * accent plane. Both the text block and the plane are anchored to the same
   * frame edge and expressed in cqw, so the seam stays exact at any line count —
   * which is what makes a one-word title and a 60-character title both split
   * cleanly. A vertical slab clips from the bottom; the compare seam clips from
   * the left.
   *
   * Omit on layouts whose headline does not cross a plane.
   */
  clip?: string;
  className: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2";
}

export const SplitType: React.FC<SplitProps> = ({
  text,
  clip,
  className,
  style,
  as = "h1",
}) => {
  const Tag = as;
  return (
    <div className="tc-split">
      <Tag className={className} style={style}>
        {text}
      </Tag>
      {clip && (
        <div className="tc-split__over" aria-hidden="true" style={{ clipPath: clip }}>
          <Tag className={className} style={style}>
            {text}
          </Tag>
        </div>
      )}
    </div>
  );
};

/**
 * Tracked-out micro label — the only small type in the direction. Fitted because
 * the kicker slot receives `subtitle`, which runs to 90 characters.
 */
export const Micro: React.FC<{
  children: string;
  on?: boolean;
  measure?: number;
}> = ({ children, on, measure }) => (
  <span
    className={`tc-micro${on ? " tc-micro--on" : ""}`}
    style={fitCaps(children, measure ? { ...MICRO, measure } : MICRO)}
  >
    {children}
  </span>
);

/** A full-bleed opaque plane. Hard edges only — this is what survives the encode. */
export const Plane: React.FC<{
  variant: "slab" | "third" | "full" | "seam";
}> = ({ variant }) => (
  <div className={`tc-plane tc-plane--${variant}`} aria-hidden="true" />
);

export const Frame: React.FC<{ visual?: SlideVisual; variant: "half" | "full" }> = ({
  visual,
  variant,
}) => {
  if (!hasImage(visual)) return null;
  return (
    <div className={`tc-frame tc-frame--${variant}`}>
      <img className="tc-frame__img" src={visual.url} alt={visual.alt || ""} />
    </div>
  );
};
