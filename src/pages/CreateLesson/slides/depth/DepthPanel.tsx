import React from "react";
import { DepthGesture } from "src/types";

const LAYER_COUNT: Record<DepthGesture, number> = {
  stack: 2,
  offset: 1,
  iso: 1,
  notch: 1,
  arc: 0,
};

interface DepthPanelProps {
  depth: DepthGesture;
  children: React.ReactNode;
  className?: string;
}

const DepthPanel: React.FC<DepthPanelProps> = ({
  depth,
  children,
  className,
}) => (
  <div
    className={`sl-panel sl-panel--${depth}${className ? ` ${className}` : ""}`}
  >
    {Array.from({ length: LAYER_COUNT[depth] }, (_, i) => (
      <div key={`layer-${i}`} className="sl-panel__layer" />
    ))}
    <div className="sl-panel__inner">{children}</div>
  </div>
);

export default DepthPanel;
