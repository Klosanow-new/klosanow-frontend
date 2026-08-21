import React from "react";
import { AccentBar, DepthPanel, Motif, VisualFrame, motifForDepth } from "../depth";
import { LayoutProps, hasImage } from "./utils";

const TitleLayout: React.FC<LayoutProps> = ({ slide, depth }) => {
  const hasVisual = hasImage(slide.visual);

  return (
    <>
      <Motif shape={motifForDepth(depth)} />
      <div className="sl-stage">
        {hasVisual ? (
          <div className="sl-row sl-row--wide-left">
            <div className="sl-col sl-center">
              <AccentBar />
              <h1 className="sl-title">{slide.title}</h1>
              {slide.subtitle && <p className="sl-sub">{slide.subtitle}</p>}
            </div>

            <DepthPanel depth={depth}>
              <VisualFrame visual={slide.visual} />
            </DepthPanel>
          </div>
        ) : (
          <div className="sl-col sl-center">
            <AccentBar />
            <h1 className="sl-display">{slide.title}</h1>
            {slide.subtitle && <p className="sl-sub">{slide.subtitle}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default TitleLayout;
