import React from "react";
import { AccentBar, DepthPanel, Motif, VisualFrame, motifForDepth } from "../depth";
import { LayoutProps, bodyOf, hasImage } from "./utils";
import BulletsLayout from "./BulletsLayout";

const TwoColumnLayout: React.FC<LayoutProps> = (props) => {
  const { slide, depth } = props;

  // "Text + image" with no image is just a list. Falling back to Bullets beats
  // rendering an empty depth panel where the picture would go.
  if (!hasImage(slide.visual)) return <BulletsLayout {...props} />;

  return (
    <>
      <Motif shape={motifForDepth(depth)} />
      <div className="sl-stage">
        <div className="sl-head">
          {slide.subtitle && <span className="sl-label">{slide.subtitle}</span>}
          <h2 className="sl-title">{slide.title}</h2>
          <AccentBar />
        </div>

        <div className="sl-row sl-row--wide-left">
          <div className="sl-col">
            <ul className="sl-list">
              {bodyOf(slide).map((item, i) => (
                <li className="sl-list__item" key={`c-${i}`}>
                  <span className="sl-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <DepthPanel depth={depth}>
            <VisualFrame visual={slide.visual} />
          </DepthPanel>
        </div>
      </div>
    </>
  );
};

export default TwoColumnLayout;
