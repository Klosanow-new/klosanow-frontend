import React from "react";
import { AccentBar, Motif, motifForDepth } from "../depth";
import { LayoutProps } from "./utils";

const StatementLayout: React.FC<LayoutProps> = ({ slide, depth }) => (
  <>
    <Motif shape={motifForDepth(depth)} />
    <div className="sl-stage sl-center">
      {slide.emphasis && <span className="sl-num">{slide.emphasis}</span>}
      <h1 className="sl-display">{slide.title}</h1>
      {slide.subtitle && <p className="sl-sub">{slide.subtitle}</p>}
      <AccentBar />
    </div>
  </>
);

export default StatementLayout;
