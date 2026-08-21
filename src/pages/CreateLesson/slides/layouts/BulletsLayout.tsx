import React from "react";
import { AccentBar, DepthPanel, Motif, motifForDepth } from "../depth";
import { LayoutProps, bodyOf } from "./utils";

const BulletsLayout: React.FC<LayoutProps> = ({ slide, depth }) => (
  <>
    <Motif shape={motifForDepth(depth)} />
    <div className="sl-stage">
      <div className="sl-head">
        {slide.subtitle && <span className="sl-label">{slide.subtitle}</span>}
        <h2 className="sl-title">{slide.title}</h2>
        <AccentBar />
      </div>

      <DepthPanel depth={depth}>
        <ul className="sl-list">
          {bodyOf(slide).map((item, i) => (
            <li className="sl-list__item" key={`b-${i}`}>
              <span className="sl-dot" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </DepthPanel>
    </div>
  </>
);

export default BulletsLayout;
