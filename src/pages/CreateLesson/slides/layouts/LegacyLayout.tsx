import React from "react";
import { Motif, motifForDepth } from "../depth";
import { DepthGesture } from "src/types";

interface LegacyLayoutProps {
  html: string;
  depth: DepthGesture;
}

// Quill HTML from drafts authored before the design system. The surface is
// forced light because tutors may have picked their own inline text colours,
// which would disappear on a dark palette.
const LegacyLayout: React.FC<LegacyLayoutProps> = ({ html, depth }) => (
  <>
    <Motif shape={motifForDepth(depth)} />
    <div className="sl-stage">
      <div className="sl-legacy" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </>
);

export default LegacyLayout;
