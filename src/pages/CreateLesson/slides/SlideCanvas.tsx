import React from "react";
import { SlideDirectionId, SlideFontPair, SlidePalette } from "src/types";
import "src/styles/slides.scss";

interface SlideCanvasProps {
  palette: SlidePalette;
  fontPair: SlideFontPair;
  directionId?: SlideDirectionId;
  children: React.ReactNode;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({
  palette,
  fontPair,
  directionId = "current",
  children,
}) => {
  const tokens = {
    "--sl-text": palette.text,
    "--sl-text-muted": palette.textMuted,
    "--sl-surface": palette.surface,
    "--sl-surface-alt": palette.surfaceAlt,
    "--sl-accent": palette.accent,
    "--sl-on-accent": palette.onAccent,
    "--sl-font-heading": fontPair.heading,
    "--sl-font-body": fontPair.body,
    background: palette.canvasBg,
  } as React.CSSProperties;

  return (
    <div className="slide-frame" style={{ background: palette.canvasBg }}>
      <div
        className={`slide-canvas sl-dir--${directionId}${
          fontPair.headingIsDisplaySerif ? " sl-canvas--serif" : ""
        }`}
        style={tokens}
      >
        {children}
      </div>
    </div>
  );
};

export default SlideCanvas;
