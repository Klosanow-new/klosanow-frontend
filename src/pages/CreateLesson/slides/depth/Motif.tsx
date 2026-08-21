import React from "react";
import { DepthGesture } from "src/types";

export type MotifShape = "none" | "circle" | "arc" | "grid";

// Background geometry paired to each depth gesture. `offset` gets nothing on
// purpose — that palette is meant to read clean and editorial.
const MOTIF_FOR_DEPTH: Record<DepthGesture, MotifShape> = {
  arc: "arc",
  stack: "circle",
  offset: "none",
  iso: "grid",
  notch: "circle",
};

export const motifForDepth = (depth: DepthGesture) => MOTIF_FOR_DEPTH[depth];

const Motif: React.FC<{ shape: MotifShape }> = ({ shape }) =>
  shape === "none" ? null : <div className={`sl-motif sl-motif--${shape}`} />;

export default Motif;
