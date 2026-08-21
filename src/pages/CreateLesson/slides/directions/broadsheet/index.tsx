import React from "react";
import { SlideLayout } from "src/types";
import { LayoutProps, bodyOf, hasImage, splitLabelled } from "../../layouts/utils";
import { fitCaps, fitStyle, rowsAttr } from "../../fit";
import { Bleed, Row, Rule, Slug } from "./parts";
import * as S from "./scales";

/**
 * Broadsheet — Swiss editorial print.
 *
 * Content hangs from a heavy rule at the top of the page rather than floating in
 * the vertical centre, columns 9–12 are usually left empty, and the only depth
 * cue is the weight of a rule. Nothing is centred; nothing has a shadow.
 */

const Title: React.FC<LayoutProps> = ({ slide }) => {
  const hasVisual = hasImage(slide.visual);

  return (
    <div className={`bs-stage${hasVisual ? " bs-stage--split" : ""}`}>
      <div className="bs-page">
        <Slug label={slide.subtitle ? "Lesson" : undefined} />
        <Rule weight="heavy" />
        <h1
          className="bs-hero"
          style={fitStyle(slide.title, hasVisual ? S.HERO_SPLIT : S.HERO)}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="bs-standfirst" style={fitStyle(slide.subtitle, S.STANDFIRST)}>
            {slide.subtitle}
          </p>
        )}
        <div className="bs-mark" />
      </div>
      {hasVisual && <Bleed visual={slide.visual} />}
    </div>
  );
};

const Statement: React.FC<LayoutProps> = ({ slide }) => (
  <div className="bs-stage">
    <div className="bs-page bs-page--statement">
      {slide.emphasis ? (
        <>
          <span className="bs-figure" style={fitStyle(slide.emphasis, S.FIGURE)}>
            {slide.emphasis}
          </span>
          <Rule weight="heavy" />
          <h1 className="bs-claim" style={fitStyle(slide.title, S.CLAIM)}>
            {slide.title}
          </h1>
        </>
      ) : (
        <h1 className="bs-hero bs-hero--tall" style={fitStyle(slide.title, S.HERO)}>
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p className="bs-standfirst" style={fitStyle(slide.subtitle, S.STANDFIRST)}>
          {slide.subtitle}
        </p>
      )}
    </div>
  </div>
);

const Head: React.FC<{ kicker?: string; title: string }> = ({ kicker, title }) => (
  <>
    <Slug label={kicker} />
    <Rule weight="heavy" />
    <h2 className="bs-head" style={fitStyle(title, S.HEAD)}>
      {title}
    </h2>
  </>
);

const Bullets: React.FC<LayoutProps> = ({ slide }) => {
  const items = bodyOf(slide);
  const rows = rowsAttr(items.length);

  return (
    <div className="bs-stage">
      <div className="bs-page">
        <Head kicker={slide.subtitle} title={slide.title} />
        <ul className="bs-list" data-rows={rows}>
          {items.map((item, i) => (
            <Row key={`b-${i}`} index={String(i + 1).padStart(2, "0")}>
              {item}
            </Row>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Steps: React.FC<LayoutProps> = ({ slide }) => {
  const items = bodyOf(slide);
  const rows = rowsAttr(items.length);

  return (
    <div className="bs-stage">
      <div className="bs-page">
        <Head kicker={slide.subtitle} title={slide.title} />
        <ul className="bs-list bs-list--steps" data-rows={rows}>
          {items.map((item, i) => {
            const { label, text } = splitLabelled(item);
            return (
              <Row key={`s-${i}`} index={<b className="bs-tile">{i + 1}</b>}>
                {label && <span className="bs-row__label">{label}</span>}
                {text}
              </Row>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const Summary: React.FC<LayoutProps> = ({ slide }) => {
  const items = bodyOf(slide);
  const rows = rowsAttr(items.length);

  return (
    <div className="bs-stage">
      <div className="bs-band">
        <span
          className="bs-band__label"
          style={fitCaps(slide.subtitle || "Recap", S.KICKER)}
        >
          {slide.subtitle || "Recap"}
        </span>
        <h2 className="bs-band__title" style={fitStyle(slide.title, S.BAND_TITLE)}>
          {slide.title}
        </h2>
      </div>
      <div className="bs-page bs-page--underband">
        <ul className="bs-list" data-rows={rows}>
          {items.map((item, i) => (
            <Row key={`r-${i}`} index={<span className="bs-tick" />}>
              {item}
            </Row>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TwoColumn: React.FC<LayoutProps> = (props) => {
  const { slide } = props;

  // "Text + image" with no image is just a list. Falling back to Bullets keeps
  // the 12-column grid honest instead of leaving the bleed column empty.
  if (!hasImage(slide.visual)) return <Bullets {...props} />;

  const items = bodyOf(slide);
  const rows = rowsAttr(items.length);

  return (
    <div className="bs-stage bs-stage--split">
      <div className="bs-page">
        <Head kicker={slide.subtitle} title={slide.title} />
        <ul className="bs-list bs-list--narrow" data-rows={rows}>
          {items.map((item, i) => (
            <Row key={`c-${i}`} index={String(i + 1).padStart(2, "0")}>
              {item}
            </Row>
          ))}
        </ul>
      </div>
      <Bleed visual={slide.visual} />
    </div>
  );
};

const Compare: React.FC<LayoutProps> = ({ slide }) => {
  const pair = bodyOf(slide).slice(0, 2);

  return (
    <div className="bs-stage">
      <div className="bs-page">
        <Slug />
        <Rule weight="heavy" />
        <h2 className="bs-head" style={fitStyle(slide.title, S.HEAD)}>
          {slide.title}
        </h2>
        <div className="bs-columns">
          {pair.map((item, i) => {
            const { label, text } = splitLabelled(item);
            const heading = label || (i === 0 ? "First" : "Second");
            return (
              <div className="bs-column" key={`p-${i}`}>
                <span className="bs-column__rank">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Rule weight="mid" />
                <span
                  className="bs-column__label"
                  style={fitCaps(heading, { ...S.KICKER, measure: 36 })}
                >
                  {heading}
                </span>
                <p className="bs-column__text" style={fitStyle(text, S.COLUMN_TEXT)}>
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Definition: React.FC<LayoutProps> = ({ slide }) => {
  const example = bodyOf(slide)[0];

  return (
    <div className="bs-stage">
      <div className="bs-page bs-page--definition">
        <Slug label="Definition" />
        <Rule weight="heavy" />
        <h2 className="bs-hero bs-hero--term" style={fitStyle(slide.title, S.TERM)}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="bs-meaning" style={fitStyle(slide.subtitle, S.MEANING)}>
            {slide.subtitle}
          </p>
        )}
        {example && (
          <div className="bs-footnote">
            <Rule weight="mid" />
            <span className="bs-footnote__label">Example</span>
            <p className="bs-footnote__text" style={fitStyle(example, S.FOOTNOTE)}>
              {example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const BROADSHEET: Record<SlideLayout, React.FC<LayoutProps>> = {
  title: Title,
  statement: Statement,
  bullets: Bullets,
  twoColumn: TwoColumn,
  steps: Steps,
  compare: Compare,
  definition: Definition,
  summary: Summary,
};
