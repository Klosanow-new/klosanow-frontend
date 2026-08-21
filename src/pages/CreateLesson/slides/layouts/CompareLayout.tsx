import React from "react";
import { AccentBar, DepthPanel, Motif, motifForDepth } from "../depth";
import { LayoutProps, bodyOf, splitLabelled } from "./utils";

const CompareLayout: React.FC<LayoutProps> = ({ slide, depth }) => {
  const panels = bodyOf(slide).slice(0, 2);

  return (
    <>
      <Motif shape={motifForDepth(depth)} />
      <div className="sl-stage">
        <div className="sl-head">
          <h2 className="sl-title">{slide.title}</h2>
          <AccentBar />
        </div>

        <div className="sl-row">
          {panels.map((item, i) => {
            const { label, text } = splitLabelled(item);
            return (
              <DepthPanel depth={depth} key={`p-${i}`}>
                <span className="sl-label">{label || (i === 0 ? "A" : "B")}</span>
                <span>{text}</span>
              </DepthPanel>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CompareLayout;
