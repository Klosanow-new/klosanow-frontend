import assert from "node:assert/strict";
import test from "node:test";
import {
  TEACHING_CONTEXT_LIMIT,
  TEACHING_AUDIENCES,
  TEACHING_APPROACHES,
  buildLessonFocus,
  buildTeachingGuidance,
  hasHiddenTeachingContent,
  parseGeneratedTeachingSlides,
  revealTeachingContent,
  reviewTeachingSlide,
} from "./teaching.ts";
import { bodyOf } from "./layouts/utils.ts";

const slide = (overrides = {}) => ({
  id: "s1",
  layout: "bullets",
  title: "How evaporation works",
  body: ["Heat gives water molecules energy", "Some molecules escape as water vapour"],
  speakerNotes: Array(45).fill("explanation").join(" "),
  ...overrides,
});

test("every teaching profile fits the supported context field without truncation", () => {
  for (const audience of Object.keys(TEACHING_AUDIENCES)) {
    for (const approach of Object.keys(TEACHING_APPROACHES)) {
      const guidance = buildTeachingGuidance(audience, approach);
      assert.ok(guidance.length <= TEACHING_CONTEXT_LIMIT, guidance);
      assert.ok(guidance.startsWith(TEACHING_AUDIENCES[audience]));
      assert.match(guidance, /3-5 points\/slide/);
      assert.match(guidance, /answers in notes$/);
    }
  }
});

test("long lesson titles leave room for the learning goal", () => {
  const focus = buildLessonFocus("T".repeat(100), "Explain evaporation using wet clothes drying");
  assert.equal(focus, `${"T".repeat(30)}: Explain evaporation using wet clothes drying`);
  assert.ok(focus.length <= TEACHING_CONTEXT_LIMIT);
});

test("lesson focus handles missing values and normalizes whitespace", () => {
  assert.equal(buildLessonFocus(), "");
  assert.equal(buildLessonFocus("  Water\n cycle  "), "Water cycle");
  assert.equal(buildLessonFocus("", "Explain\t evaporation"), "Explain evaporation");
  assert.equal(buildLessonFocus("T".repeat(100)).length, TEACHING_CONTEXT_LIMIT);
  assert.equal(buildLessonFocus("Topic", "G".repeat(100)).length, TEACHING_CONTEXT_LIMIT);
});

test("body-bearing title and statement slides reveal their existing points", () => {
  for (const layout of ["title", "statement"]) {
    const original = slide({ layout, subtitle: "Why drying happens" });
    const revealed = revealTeachingContent(original);
    assert.equal(revealed.layout, "bullets");
    assert.equal(original.layout, layout);
    assert.deepEqual(revealed, { ...original, layout: "bullets" });
    assert.equal(revealed.body, original.body);
  }
});

test("definition and compare layouts reveal all points rather than silently slicing them", () => {
  for (const layout of ["definition", "compare"]) {
    const original = slide({ layout, body: ["First", "Second", "Third"], visual: { type: "none" } });
    assert.ok(hasHiddenTeachingContent(original));
    assert.deepEqual(revealTeachingContent(original), { ...original, layout: "bullets" });
  }
});

test("compare subtitles are preserved and made visible", () => {
  const original = slide({ layout: "compare", subtitle: "A crucial distinction" });
  assert.equal(revealTeachingContent(original).layout, "bullets");
  assert.equal(revealTeachingContent(original).subtitle, original.subtitle);
});

test("intentional sparse layouts and full-content layouts stay unchanged", () => {
  const originals = [
    slide({ layout: "title", body: undefined }),
    slide({ layout: "statement", body: [] }),
    slide({ layout: "definition", body: ["One example", "", " "] }),
    slide({ layout: "compare", body: ["First", "Second"] }),
    ...["bullets", "steps", "summary", "twoColumn"].map((layout) => slide({ layout })),
  ];
  for (const original of originals) {
    assert.equal(revealTeachingContent(original), original);
  }
});

test("whitespace-only points do not consume a visible comparison or definition slot", () => {
  const comparison = slide({ layout: "compare", body: [" ", "First", "Second"] });
  assert.deepEqual(bodyOf(comparison).slice(0, 2), ["First", "Second"]);
  assert.equal(hasHiddenTeachingContent(comparison), false);
  const definition = slide({ layout: "definition", body: ["\t", "Example"] });
  assert.equal(bodyOf(definition)[0], "Example");
  assert.equal(hasHiddenTeachingContent(definition), false);
});

test("a visible callout is not lost by automatic layout conversion", () => {
  const original = slide({ layout: "statement", emphasis: "98%" });
  assert.equal(revealTeachingContent(original), original);
  assert.match(reviewTeachingSlide(original).join(" "), /layout hides supporting content/);
  assert.match(reviewTeachingSlide(original).join(" "), /Move the callout text/);
});

test("real images remain visible when revealing supporting content", () => {
  const original = slide({ layout: "title", visual: { type: "stock", url: "https://example.com/image.jpg", alt: "Water" } });
  const revealed = revealTeachingContent(original);
  assert.equal(revealed.layout, "twoColumn");
  assert.equal(revealed.visual, original.visual);
  assert.equal(revealed.body, original.body);
});

test("generated drafts are checked before any layout processing or editor insertion", () => {
  for (const value of [
    undefined,
    [],
    [null],
    ["text"],
    [slide({ layout: "unsupported" })],
    [slide({ title: null })],
    [slide({ id: 123 })],
    [slide({ body: "not an array" })],
    [slide({ body: [null] })],
    [slide({ body: Array(6).fill("too many") })],
    [slide({ speakerNotes: {} })],
    [slide({ visual: { type: "stock", url: {} } })],
  ]) {
    assert.throws(() => parseGeneratedTeachingSlides(value));
  }
});

test("valid generated drafts keep all text and get an ID if omitted", () => {
  const original = slide({ id: undefined });
  const [parsed] = parseGeneratedTeachingSlides([original]);
  assert.deepEqual(parsed, { ...original, id: "s1" });
  assert.equal(parsed.body, original.body);
  assert.equal(original.id, undefined);
});

test("sparse teaching slides are flagged without fabricated supporting content", () => {
  const original = slide({ body: ["One fact"], speakerNotes: "" });
  const before = structuredClone(original);
  const issues = reviewTeachingSlide(original);
  assert.equal(issues.length, 2);
  assert.match(issues[0], /Few supporting points/);
  assert.match(issues[1], /Teacher notes are brief or missing/);
  assert.deepEqual(original, before);
});

test("supporting points and substantial teacher notes pass the content checks", () => {
  assert.deepEqual(reviewTeachingSlide(slide()), []);
  assert.deepEqual(reviewTeachingSlide(slide({ speakerNotes: `  ${Array(40).fill("explanation").join("\n  ")}  ` })), []);
});

test("title and recap slides are not required to have dense content", () => {
  for (const layout of ["title", "summary"]) {
    assert.deepEqual(reviewTeachingSlide(slide({ layout, body: [], speakerNotes: undefined })), []);
  }
});
