import React from "react";
import { AccentBar, DepthPanel, Motif, motifForDepth } from "../depth";
import { LayoutProps, bodyOf } from "./utils";

const DefinitionLayout: React.FC<LayoutProps> = ({ slide, depth }) => {
  const example = bodyOf(slide)[0];

  return (
    <>
      <Motif shape={motifForDepth(depth)} />
      <div className="sl-stage sl-center">
        <span className="sl-label">Definition</span>
        <h2 className="sl-term sl-display">{slide.title}</h2>
        <AccentBar />
        {slide.subtitle && <p className="sl-sub">{slide.subtitle}</p>}

        {example && (
          <DepthPanel depth={depth}>
            <span className="sl-label">Example</span>
            <span>{example}</span>
          </DepthPanel>
        )}
      </div>
    </>
  );
};

export default DefinitionLayout;
