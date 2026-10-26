import type { Slide } from "src/types";

export const TEACHING_CONTEXT_LIMIT = 80;

export const TEACHING_AUDIENCES = {
  beginners: "Beginners",
  secondary: "Secondary",
  university: "University",
  advanced: "Advanced",
};

export const TEACHING_APPROACHES = {
  explain: {
    label: "Build understanding",
    guidance: "3-5 points/slide; why/how; examples; checks+answers in notes",
  },
  apply: {
    label: "Practical application",
    guidance: "3-5 points/slide; worked examples; steps; practice+answers in notes",
  },
  revision: {
    label: "Revision and assessment",
    guidance: "3-5 points/slide; compare concepts; errors; quiz+answers in notes",
  },
};

export type TeachingAudience = keyof typeof TEACHING_AUDIENCES;
export type TeachingApproach = keyof typeof TEACHING_APPROACHES;

export const buildTeachingGuidance = (
  audience: TeachingAudience,
  approach: TeachingApproach
) => `${TEACHING_AUDIENCES[audience]}; ${TEACHING_APPROACHES[approach].guidance}`;

export const buildLessonFocus = (subject = "", description = "") => {
  const title = subject.replace(/\s+/g, " ").trim();
  const goal = description.replace(/\s+/g, " ").trim();
  if (!goal) return title.slice(0, TEACHING_CONTEXT_LIMIT);
  if (!title) return goal.slice(0, TEACHING_CONTEXT_LIMIT);

  // Reserve space for the learning goal instead of letting a long title erase it.
  const shortTitle = title.slice(0, 30);
  return `${shortTitle}: ${goal}`.slice(0, TEACHING_CONTEXT_LIMIT);
};

const visibleBodyCapacity: Record<Slide["layout"], number> = {
  title: 0,
  statement: 0,
  bullets: 5,
  twoColumn: 5,
  steps: 5,
  compare: 2,
  definition: 1,
  summary: 5,
};

export const parseGeneratedTeachingSlides = (value: unknown): Slide[] => {
  if (!Array.isArray(value) || !value.length) {
    throw new Error("No slides came back. Try again.");
  }

  return value.map((slide, index) => {
    const invalid = () => new Error(`Slide ${index + 1} has an invalid format. Try generating again.`);
    if (!slide || typeof slide !== "object" || Array.isArray(slide)) throw invalid();
    if (
      typeof slide.title !== "string" ||
      typeof slide.layout !== "string" ||
      !Object.prototype.hasOwnProperty.call(visibleBodyCapacity, slide.layout) ||
      (slide.id !== undefined && typeof slide.id !== "string") ||
      ["subtitle", "emphasis", "speakerNotes"].some(
        (field) => slide[field] !== undefined && typeof slide[field] !== "string"
      ) ||
      (slide.body !== undefined &&
        (!Array.isArray(slide.body) || slide.body.length > 5 ||
          !slide.body.every((point: unknown) => typeof point === "string")))
    ) throw invalid();

    if (slide.visual !== undefined) {
      const visual = slide.visual;
      if (
        !visual || typeof visual !== "object" || Array.isArray(visual) ||
        !["none", "stock", "icon"].includes(visual.type) ||
        ["query", "url", "alt"].some(
          (field) => visual[field] !== undefined && typeof visual[field] !== "string"
        )
      ) throw invalid();
    }

    return { ...slide, id: slide.id || `s${index + 1}` } as Slide;
  });
};

export const hasHiddenTeachingContent = (slide: Slide) =>
  (slide.body?.filter((point) => point.trim()).length ?? 0) >
    visibleBodyCapacity[slide.layout] ||
  (slide.layout === "compare" && !!slide.subtitle?.trim());

export const revealTeachingContent = (slide: Slide): Slide => {
  // A callout would disappear in bullets. Keep its design and flag it for review.
  if (!hasHiddenTeachingContent(slide) || slide.emphasis?.trim()) return slide;
  const hasImage = slide.visual?.type !== "none" && !!slide.visual?.url;
  return { ...slide, layout: hasImage ? "twoColumn" : "bullets" };
};

export const reviewTeachingSlide = (slide: Slide): string[] => {
  const issues: string[] = [];
  const pointCount = slide.body?.filter((point) => point.trim()).length ?? 0;

  if (hasHiddenTeachingContent(slide)) {
    issues.push(slide.emphasis?.trim()
      ? "This layout hides supporting content. Move the callout text into a point or teacher notes before switching to Bullets."
      : "This layout hides supporting content. Try Text + image if you have an image, or Bullets to show it.");
  }

  if (slide.layout !== "title" && slide.layout !== "summary") {
    if (pointCount < 2) {
      issues.push(
        "Few supporting points. Consider adding a why/how explanation and a concrete example."
      );
    }

    const noteWords = slide.speakerNotes?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    if (noteWords < 40) {
      issues.push(
        "Teacher notes are brief or missing. Add an explanation, example, and check question with its answer."
      );
    }
  }

  return issues;
};
