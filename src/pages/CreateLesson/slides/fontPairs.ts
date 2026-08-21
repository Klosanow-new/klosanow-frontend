import { SlideFontPair } from "src/types";

// Only the latin subset and the weights actually used, so a pair stays small.
export const SLIDE_FONT_PAIRS: SlideFontPair[] = [
  {
    id: "editorial",
    name: "Editorial",
    heading: "'Playfair Display', Georgia, serif",
    body: "'Encode Sans', system-ui, sans-serif",
    headingIsDisplaySerif: true,
    load: () =>
      Promise.all([
        import("@fontsource/playfair-display/latin-700.css"),
        import("@fontsource/encode-sans/latin-400.css"),
        import("@fontsource/encode-sans/latin-600.css"),
      ]),
  },
  {
    id: "modern",
    name: "Modern",
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    headingIsDisplaySerif: false,
    load: () =>
      Promise.all([
        import("@fontsource/space-grotesk/latin-700.css"),
        import("@fontsource/inter/latin-400.css"),
        import("@fontsource/inter/latin-600.css"),
      ]),
  },
  {
    id: "warm",
    name: "Warm",
    heading: "'Fraunces Variable', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    headingIsDisplaySerif: true,
    load: () =>
      Promise.all([
        import("@fontsource-variable/fraunces/wght.css"),
        import("@fontsource/inter/latin-400.css"),
        import("@fontsource/inter/latin-600.css"),
      ]),
  },
  {
    id: "classic",
    name: "Classic",
    heading: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    headingIsDisplaySerif: true,
    load: () =>
      Promise.all([
        import("@fontsource/dm-serif-display/latin-400.css"),
        import("@fontsource/dm-sans/latin-400.css"),
        import("@fontsource/dm-sans/latin-500.css"),
      ]),
  },
  {
    id: "geometric",
    name: "Geometric",
    heading: "'Outfit', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    headingIsDisplaySerif: false,
    load: () =>
      Promise.all([
        import("@fontsource/outfit/latin-700.css"),
        import("@fontsource/outfit/latin-400.css"),
        import("@fontsource/outfit/latin-500.css"),
      ]),
  },
  {
    id: "bold",
    name: "Bold",
    heading: "'Bricolage Grotesque Variable', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    headingIsDisplaySerif: false,
    load: () =>
      Promise.all([
        import("@fontsource-variable/bricolage-grotesque/wght.css"),
        import("@fontsource/inter/latin-400.css"),
        import("@fontsource/inter/latin-600.css"),
      ]),
  },
];

export const DEFAULT_FONT_PAIR_ID = "modern";

export const getFontPair = (id?: string): SlideFontPair =>
  SLIDE_FONT_PAIRS.find((f) => f.id === id) ??
  SLIDE_FONT_PAIRS.find((f) => f.id === DEFAULT_FONT_PAIR_ID)!;

const loaded = new Set<string>();

export const loadFontPair = async (id: string) => {
  if (loaded.has(id)) return;
  loaded.add(id);
  try {
    await getFontPair(id).load();
  } catch {
    loaded.delete(id);
  }
};
