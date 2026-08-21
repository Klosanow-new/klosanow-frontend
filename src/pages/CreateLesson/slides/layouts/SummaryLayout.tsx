import React from "react";
import { MdCheck } from "react-icons/md";
import { AccentBar, DepthPanel, Motif, motifForDepth } from "../depth";
import { LayoutProps, bodyOf } from "./utils";

const SummaryLayout: React.FC<LayoutProps> = ({ slide, depth }) => (
  <>
    <Motif shape={motifForDepth(depth)} />
    <div className="sl-stage">
      <div className="sl-head">
        <span className="sl-label">{slide.subtitle || "Recap"}</span>
        <h2 className="sl-title">{slide.title}</h2>
        <AccentBar />
      </div>

      <DepthPanel depth={depth}>
        <ul className="sl-list">
          {bodyOf(slide).map((item, i) => (
            <li className="sl-list__item" key={`r-${i}`}>
              <MdCheck className="sl-check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </DepthPanel>
    </div>
  </>
);

export default SummaryLayout;
