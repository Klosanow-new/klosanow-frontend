import React from "react";
import { DepthGesture, SlideItem, SlideStyle, isStructuredSlide } from "src/types";
import SlideCanvas from "./SlideCanvas";
import { LegacyLayout } from "./layouts";
import { getDirection } from "./directions";
import { getPalette } from "./palettes";
import { getFontPair, loadFontPair } from "./fontPairs";

interface SlideRendererProps {
  item: SlideItem;
  style: SlideStyle;
  /** Gallery only — lets the design gesture be cycled independently. */
  depthOverride?: DepthGesture;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({
  item,
  style,
  depthOverride,
}) => {
  const palette = getPalette(style.paletteId);
  const fontPair = getFontPair(style.fontPairId);
  const direction = getDirection(style.directionId);
  const depth = depthOverride ?? palette.depth;

  React.useEffect(() => {
    loadFontPair(fontPair.id);
  }, [fontPair.id]);

  const Layout = isStructuredSlide(item) ? direction.layouts[item.layout] : null;

  return (
    <SlideCanvas palette={palette} fontPair={fontPair} directionId={direction.id}>
      {Layout && isStructuredSlide(item) ? (
        <Layout slide={item} depth={depth} />
      ) : (
        <LegacyLayout html={item as string} depth={depth} />
      )}
    </SlideCanvas>
  );
};

export default SlideRenderer;
