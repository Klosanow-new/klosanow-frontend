import React from "react";
import { SlideVisual } from "src/types";
import { hasImage } from "../../layouts/utils";
import { fitCaps } from "../../fit";
import { LABEL } from "./scales";

/**
 * Cut Paper shared parts.
 *
 * Depth comes from registration: every plane is drawn twice, the lower copy
 * offset by a deliberate 1.7cqw with zero blur, so it reads as screen-print
 * mis-registration rather than a drop shadow. A hard, high-contrast offset is the
 * one depth cue that costs a low-bitrate encoder nothing — there is no gradient
 * in it to band.
 */

export type Cut = "tl" | "tr" | "br" | "bl";

interface PlaneProps {
  children?: React.ReactNode;
  /** Which corner is cut at 45 degrees. */
  cut?: Cut;
  /** Fill token. `alt` is the secondary paper, `accent` inverts the text. */
  tone?: "paper" | "alt" | "accent";
  className?: string;
  /** Registration offset direction. */
  reg?: "se" | "sw" | "ne" | "none";
  style?: React.CSSProperties;
}

export const Plane: React.FC<PlaneProps> = ({
  children,
  cut = "tr",
  tone = "paper",
  className,
  reg = "se",
  style,
}) => (
  <div
    className={`cp-plane cp-plane--${tone} cp-cut--${cut} cp-reg--${reg}${
      className ? ` ${className}` : ""
    }`}
    style={style}
  >
    <div className="cp-plane__reg" aria-hidden="true" />
    <div className="cp-plane__face">{children}</div>
  </div>
);

/** A solid half-disc, used as a corner cap. Flat fill, hard edge. */
export const Disc: React.FC<{ corner: "bl" | "br" | "tr" }> = ({ corner }) => (
  <div className={`cp-disc cp-disc--${corner}`} aria-hidden="true" />
);

/** Fitted, because the label slot takes a 90-character subtitle. */
export const Label: React.FC<{
  children: string;
  on?: boolean;
  measure?: number;
}> = ({ children, on, measure }) => (
  <span
    className={`cp-label${on ? " cp-label--on" : ""}`}
    style={fitCaps(children, measure ? { ...LABEL, measure } : LABEL)}
  >
    {children}
  </span>
);

export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <b className="cp-chip">{children}</b>
);

export const Cutout: React.FC<{ visual?: SlideVisual }> = ({ visual }) => {
  if (!hasImage(visual)) return null;
  return <img className="cp-cutout__img" src={visual.url} alt={visual.alt || ""} />;
};
