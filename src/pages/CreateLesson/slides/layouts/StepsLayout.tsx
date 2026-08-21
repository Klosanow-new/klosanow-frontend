import React from "react";
import { AccentBar, DepthPanel, Motif, motifForDepth } from "../depth";
import { LayoutProps, bodyOf, splitLabelled } from "./utils";

const StepsLayout: React.FC<LayoutProps> = ({ slide, depth }) => (
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
          {bodyOf(slide).map((item, i) => {
            const { label, text } = splitLabelled(item);
            return (
              <li className="sl-list__item" key={`s-${i}`}>
                <span className="sl-step">{i + 1}</span>
                <span>
                  {label && <strong>{label}. </strong>}
                  {text}
                </span>
              </li>
            );
          })}
        </ul>
      </DepthPanel>
    </div>
  </>
);

export default StepsLayout;
