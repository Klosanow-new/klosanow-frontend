import React from "react";
import { SlideLayout } from "src/types";
import { LayoutProps } from "./utils";
import TitleLayout from "./TitleLayout";
import StatementLayout from "./StatementLayout";
import BulletsLayout from "./BulletsLayout";
import TwoColumnLayout from "./TwoColumnLayout";
import StepsLayout from "./StepsLayout";
import CompareLayout from "./CompareLayout";
import DefinitionLayout from "./DefinitionLayout";
import SummaryLayout from "./SummaryLayout";

export const LAYOUTS: Record<SlideLayout, React.FC<LayoutProps>> = {
  title: TitleLayout,
  statement: StatementLayout,
  bullets: BulletsLayout,
  twoColumn: TwoColumnLayout,
  steps: StepsLayout,
  compare: CompareLayout,
  definition: DefinitionLayout,
  summary: SummaryLayout,
};

export const LAYOUT_IDS = Object.keys(LAYOUTS) as SlideLayout[];

export { default as LegacyLayout } from "./LegacyLayout";
export type { LayoutProps } from "./utils";
