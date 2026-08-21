import { SlidePalette } from "src/types";
import { colors } from "src/data/colors";

/**
 * Six flat-colour palettes, all derived from the brand tokens in
 * src/data/colors.ts so slides read as Klosanow rather than as generic template
 * output.
 *
 * Every palette is a flat fill. Recording runs at 400 kbps VP8, where large
 * smooth gradients band visibly — solid colour survives the encode untouched.
 * Depth comes from the layered geometry in ./depth, not from tonal blends.
 */
export const SLIDE_PALETTES: SlidePalette[] = [
  {
    id: "ink",
    name: "Ink",
    canvasBg: colors.primary[100],
    surface: colors.primary[90],
    surfaceAlt: colors.primary[80],
    text: colors.neutral[50],
    textMuted: colors.primary[20],
    accent: colors.primary[40],
    onAccent: colors.primary[100],
    depth: "arc",
    isDark: true,
  },
  {
    id: "paper",
    name: "Paper",
    canvasBg: colors.secondary[5],
    surface: colors.neutral[50],
    surfaceAlt: colors.secondary[10],
    text: colors.primary[100],
    textMuted: colors.secondary[80],
    accent: colors.secondary[60],
    onAccent: colors.neutral[50],
    depth: "offset",
    isDark: false,
  },
  {
    id: "violet",
    name: "Violet",
    canvasBg: colors.primary[50],
    surface: colors.primary[60],
    surfaceAlt: colors.primary[70],
    text: colors.neutral[50],
    textMuted: colors.primary[10],
    accent: colors.primary[5],
    onAccent: colors.primary[90],
    depth: "stack",
    isDark: true,
  },
  {
    id: "mist",
    name: "Mist",
    canvasBg: colors.primary[5],
    surface: colors.neutral[50],
    surfaceAlt: colors.primary[10],
    text: colors.primary[90],
    textMuted: colors.primary[70],
    accent: colors.primary[60],
    onAccent: colors.neutral[50],
    depth: "iso",
    isDark: false,
  },
  {
    id: "clay",
    name: "Clay",
    canvasBg: colors.secondary[50],
    surface: colors.secondary[10],
    surfaceAlt: colors.secondary[40],
    text: colors.secondary[100],
    textMuted: colors.secondary[80],
    accent: colors.secondary[100],
    onAccent: colors.secondary[5],
    depth: "notch",
    isDark: false,
  },
  {
    id: "slate",
    name: "Slate",
    canvasBg: colors.neutral[100],
    surface: colors.black[40],
    surfaceAlt: colors.neutral[90],
    text: colors.neutral[50],
    textMuted: colors.neutral[70],
    accent: colors.primary[40],
    onAccent: colors.primary[100],
    depth: "stack",
    isDark: true,
  },
];

export const DEFAULT_PALETTE_ID = "ink";

export const getPalette = (id?: string): SlidePalette =>
  SLIDE_PALETTES.find((p) => p.id === id) ??
  SLIDE_PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!;
