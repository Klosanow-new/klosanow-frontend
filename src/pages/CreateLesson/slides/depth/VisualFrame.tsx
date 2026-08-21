import React from "react";
import { SlideVisual } from "src/types";
import { hasImage } from "../layouts/utils";

const VisualFrame: React.FC<{ visual?: SlideVisual }> = ({ visual }) => {
  // No url, no frame. Callers gate on hasImage() too, so reaching here without
  // one means a slide carries only the model's `query` suggestion.
  if (!hasImage(visual)) return null;

  return (
    <div className="sl-visual">
      <img className="sl-visual__img" src={visual.url} alt={visual.alt || ""} />
      <div className="sl-visual__wash" />
    </div>
  );
};

export default VisualFrame;
