import React from "react";
import { SlideDirectionId, SlideLayout } from "src/types";
import { LayoutProps, LAYOUTS } from "../layouts";
import { BROADSHEET } from "./broadsheet";
import { TITLECARD } from "./titlecard";
import { CUTPAPER } from "./cutpaper";

export interface SlideDirection {
  id: SlideDirectionId;
  name: string;
  /** One line for the picker — what the language is, not what it looks like. */
  tagline: string;
  layouts: Record<SlideLayout, React.FC<LayoutProps>>;
  /** `current` is the only direction that reads the depth gesture. */
  usesDepth: boolean;
}

export const SLIDE_DIRECTIONS: SlideDirection[] = [
  {
    id: "current",
    name: "Current",
    tagline: "The existing system, kept for comparison",
    layouts: LAYOUTS,
    usesDepth: true,
  },
  {
    id: "broadsheet",
    name: "Broadsheet",
    tagline: "Swiss editorial print — rules, a 12-column grid, no panels",
    layouts: BROADSHEET,
    usesDepth: false,
  },
  {
    id: "titlecard",
    name: "Title Card",
    tagline: "Film titles — full-bleed fields cut once, split-colour headlines",
    layouts: TITLECARD,
    usesDepth: false,
  },
  {
    id: "cutpaper",
    name: "Cut Paper",
    tagline: "Screen-print collage — stacked planes, 45° cuts, hard registration",
    layouts: CUTPAPER,
    usesDepth: false,
  },
];

export const DEFAULT_DIRECTION_ID: SlideDirectionId = "current";

export const getDirection = (id?: string): SlideDirection =>
  SLIDE_DIRECTIONS.find((d) => d.id === id) ??
  SLIDE_DIRECTIONS.find((d) => d.id === DEFAULT_DIRECTION_ID)!;
