import { upperFirst } from "lodash";
import { Slide } from "src/types";

interface TitleSlideInput {
  title: string;
  description: string;
  thumbnailUrl: string;
}

export const TITLE_SLIDE_ID = "__title";

export const buildTitleSlide = (form: TitleSlideInput): Slide => ({
  id: TITLE_SLIDE_ID,
  layout: "title",
  title: upperFirst(form.title || "Untitled lesson"),
  subtitle: form.description || undefined,
  visual: form.thumbnailUrl
    ? { type: "stock", url: form.thumbnailUrl, alt: form.title }
    : { type: "none" },
});
