import { Slide, SlideDirectionId, SlideItem, SlideStyle } from "src/types";
import { DEFAULT_PALETTE_ID } from "./palettes";
import { DEFAULT_FONT_PAIR_ID } from "./fontPairs";
import { DEFAULT_DIRECTION_ID } from "./directions";

// Structured slides ride inside the existing `content: Array<string>` so no
// backend change is needed. Quill HTML never parses as JSON, which is what makes
// legacy entries safe to detect and pass through untouched.

interface SlideMeta {
  __slideMeta: true;
  v: number;
  paletteId: string;
  fontPairId: string;
  directionId?: SlideDirectionId;
}

export const DEFAULT_SLIDE_STYLE: SlideStyle = {
  paletteId: DEFAULT_PALETTE_ID,
  fontPairId: DEFAULT_FONT_PAIR_ID,
  directionId: DEFAULT_DIRECTION_ID,
};

const parse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isMeta = (v: unknown): v is SlideMeta =>
  isRecord(v) && v.__slideMeta === true;

const isSlide = (v: unknown): v is Slide =>
  isRecord(v) && typeof v.layout === "string" && typeof v.title === "string";

export const decodeContent = (
  raw?: Array<string>
): { style: SlideStyle; items: SlideItem[] } => {
  let style = DEFAULT_SLIDE_STYLE;
  const items: SlideItem[] = [];

  (raw ?? []).forEach((entry) => {
    if (typeof entry !== "string") return;

    const parsed = parse(entry);

    if (isMeta(parsed)) {
      style = {
        paletteId: parsed.paletteId || DEFAULT_PALETTE_ID,
        fontPairId: parsed.fontPairId || DEFAULT_FONT_PAIR_ID,
        // Drafts saved before directions existed have no id and must keep
        // rendering exactly as they did, so they fall back to `current`.
        directionId: parsed.directionId || DEFAULT_DIRECTION_ID,
      };
      return;
    }

    items.push(isSlide(parsed) ? parsed : entry);
  });

  return { style, items };
};

export const encodeContent = (
  style: SlideStyle,
  items: SlideItem[]
): Array<string> => [
  JSON.stringify({ __slideMeta: true, v: 1, ...style }),
  ...items.map((item) =>
    typeof item === "string" ? item : JSON.stringify(item)
  ),
];
