import React from "react";
import { SlideLayout } from "src/types";
import { LayoutProps, bodyOf, hasImage, splitLabelled } from "../../layouts/utils";
import { fitStyle, rowsAttr } from "../../fit";
import { Chip, Cutout, Disc, Label, Plane } from "./parts";
import * as S from "./scales";

/**
 * Cut Paper — hard-edged collage, screen-print registration.
 *
 * Two to four opaque planes per slide, interlocking with the type instead of
 * sitting behind it. Corners are cut at 45 degrees on a consistent diagonal.
 */

const Title: React.FC<LayoutProps> = ({ slide }) => {
  const hasVisual = hasImage(slide.visual);

  return (
    <div className="cp-stage">
      <Disc corner="bl" />
      {hasVisual && (
        <Plane cut="tl" tone="alt" className="cp-titleplane" reg="sw">
          <Cutout visual={slide.visual} />
        </Plane>
      )}
      <div className={`cp-titletext${hasVisual ? " cp-titletext--narrow" : ""}`}>
        <Label>Lesson</Label>
        <h1
          className="cp-hero"
          style={fitStyle(slide.title, hasVisual ? S.HERO_NARROW : S.HERO)}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            className="cp-sub"
            style={fitStyle(slide.subtitle, hasVisual ? S.SUB_NARROW : S.SUB)}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const Statement: React.FC<LayoutProps> = ({ slide }) => (
  <div className="cp-stage cp-stage--statement">
    {slide.emphasis ? (
      <>
        <Plane cut="br" tone="accent" className="cp-figureplane" reg="ne">
          <span className="cp-figure" style={fitStyle(slide.emphasis, S.FIGURE)}>
            {slide.emphasis}
          </span>
        </Plane>
        <div className="cp-claim">
          <h1 className="cp-claimtext" style={fitStyle(slide.title, S.CLAIM)}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="cp-sub" style={fitStyle(slide.subtitle, S.SUB)}>
              {slide.subtitle}
            </p>
          )}
        </div>
      </>
    ) : (
      <div className="cp-titletext">
        <h1 className="cp-hero" style={fitStyle(slide.title, S.HERO)}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="cp-sub" style={fitStyle(slide.subtitle, S.SUB)}>
            {slide.subtitle}
          </p>
        )}
      </div>
    )}
  </div>
);

const Head: React.FC<{ kicker?: string; title: string }> = ({ kicker, title }) => (
  <div className="cp-head">
    {kicker && <Label>{kicker}</Label>}
    <h2 className="cp-headtitle" style={fitStyle(title, S.HEAD)}>
      {title}
    </h2>
  </div>
);

/** Each item is its own paper strip. `stagger` turns the stack into a staircase. */
const Strips: React.FC<{
  items: string[];
  marker: (i: number) => React.ReactNode;
  stagger?: boolean;
  labelled?: boolean;
}> = ({ items, marker, stagger, labelled }) => (
  <ul
    className={`cp-strips${stagger ? " cp-strips--stair" : ""}`}
    data-rows={rowsAttr(items.length)}
  >
    {items.map((item, i) => {
      const { label, text } = labelled
        ? splitLabelled(item)
        : { label: undefined, text: item };
      return (
        <li
          className="cp-strip"
          key={`s-${i}`}
          // Capped at three levels so the deepest strip keeps its measure.
          style={{ "--cp-step": Math.min(i, 3) } as React.CSSProperties}
        >
          {/* One cut corner for every strip: alternating them made the right
              edge read as a zigzag mistake rather than a deliberate cut. */}
          <Plane cut="tr" reg="se">
            <span className="cp-strip__mark">{marker(i)}</span>
            <span className="cp-strip__text">
              {label && <b className="cp-strip__label">{label}</b>}
              {text}
            </span>
          </Plane>
        </li>
      );
    })}
  </ul>
);

const Bullets: React.FC<LayoutProps> = ({ slide }) => (
  <div className="cp-stage">
    <Disc corner="tr" />
    <Head kicker={slide.subtitle} title={slide.title} />
    <Strips
      items={bodyOf(slide)}
      marker={(i) => <Chip>{String(i + 1).padStart(2, "0")}</Chip>}
    />
  </div>
);

const Steps: React.FC<LayoutProps> = ({ slide }) => (
  <div className="cp-stage">
    <Head kicker={slide.subtitle} title={slide.title} />
    <Strips items={bodyOf(slide)} labelled stagger marker={(i) => <Chip>{i + 1}</Chip>} />
  </div>
);

const Summary: React.FC<LayoutProps> = ({ slide }) => (
  <div className="cp-stage">
    <Disc corner="br" />
    <Head kicker={slide.subtitle || "Recap"} title={slide.title} />
    <Strips items={bodyOf(slide)} marker={() => <span className="cp-tick" />} />
  </div>
);

const TwoColumn: React.FC<LayoutProps> = (props) => {
  const { slide } = props;

  // "Text + image" with no image is just a list. Falling back to Bullets beats
  // leaving the cut plane standing empty where the picture would go.
  if (!hasImage(slide.visual)) return <Bullets {...props} />;

  return (
    <div className="cp-stage cp-stage--pair">
      <div className="cp-pairtext">
        <Head kicker={slide.subtitle} title={slide.title} />
        <ul className="cp-plainlist" data-rows={rowsAttr(bodyOf(slide).length)}>
          {bodyOf(slide).map((item, i) => (
            <li key={`c-${i}`}>
              <span className="cp-bullet" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <Plane cut="tl" tone="alt" className="cp-pairplane" reg="sw">
        <Cutout visual={slide.visual} />
      </Plane>
    </div>
  );
};

/** Two planes, one dropped below the other — deliberate mis-alignment. */
const Compare: React.FC<LayoutProps> = ({ slide }) => {
  const pair = bodyOf(slide).slice(0, 2);

  return (
    <div className="cp-stage">
      <Head title={slide.title} />
      <div className="cp-pair">
        {pair.map((item, i) => {
          const { label, text } = splitLabelled(item);
          return (
            <div
              className={`cp-pairslot cp-pairslot--${i === 0 ? "up" : "down"}`}
              key={`p-${i}`}
            >
              <Plane
                cut={i === 0 ? "tr" : "bl"}
                tone={i === 1 ? "accent" : "paper"}
                reg={i === 0 ? "se" : "ne"}
              >
                <Label on={i === 1} measure={34}>
                  {label || (i === 0 ? "First" : "Second")}
                </Label>
                <p className="cp-pairtextline" style={fitStyle(text, S.PAIR_TEXT)}>
                  {text}
                </p>
              </Plane>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Definition: React.FC<LayoutProps> = ({ slide }) => {
  const example = bodyOf(slide)[0];

  return (
    <div className="cp-stage cp-stage--definition">
      <Plane cut="br" tone="alt" className="cp-termplane" reg="se">
        <Label>Definition</Label>
        <h2 className="cp-termtext" style={fitStyle(slide.title, S.TERM)}>
          {slide.title}
        </h2>
      </Plane>
      {slide.subtitle && (
        <p className="cp-meaning" style={fitStyle(slide.subtitle, S.MEANING)}>
          {slide.subtitle}
        </p>
      )}
      {example && (
        <Plane cut="tl" tone="accent" className="cp-exampleplane" reg="ne">
          <Label on measure={46}>
            Example
          </Label>
          <p className="cp-exampletext" style={fitStyle(example, S.EXAMPLE)}>
            {example}
          </p>
        </Plane>
      )}
    </div>
  );
};

export const CUTPAPER: Record<SlideLayout, React.FC<LayoutProps>> = {
  title: Title,
  statement: Statement,
  bullets: Bullets,
  twoColumn: TwoColumn,
  steps: Steps,
  compare: Compare,
  definition: Definition,
  summary: Summary,
};
