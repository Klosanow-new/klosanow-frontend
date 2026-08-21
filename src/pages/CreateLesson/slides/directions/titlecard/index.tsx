import React from "react";
import { SlideLayout } from "src/types";
import { LayoutProps, bodyOf, hasImage, splitLabelled } from "../../layouts/utils";
import { fitStyle, rowsAttr } from "../../fit";
import { Frame, Micro, Plane, SplitType } from "./parts";
import * as S from "./scales";

/**
 * Title Card — film title sequence.
 *
 * Every slide is a full-bleed colour field cut once by hard geometry. Scale
 * contrast is the loudest of the three directions: a 3-character emphasis runs to
 * 30cqw while body copy stays near 1.9cqw.
 */

/**
 * The headline's overlap with the bottom slab. The slab is 19cqw tall and
 * .tc-body is anchored 13cqw off the bottom, so 6cqw of the last line sits on
 * the accent — see _titlecard.scss, which owns both numbers.
 */
const SLAB_OVERLAP = "inset(calc(100% - 6cqw) 0 0 0)";

/** The compare seam is at 50cqw; .tc-seamhead starts at the 6.4cqw left margin. */
const SEAM_CLIP = "inset(0 0 0 43.6cqw)";

const Title: React.FC<LayoutProps> = ({ slide }) => {
  const hasVisual = hasImage(slide.visual);

  return (
    <div className="tc-stage tc-stage--title">
      {hasVisual && <Frame visual={slide.visual} variant="full" />}
      <Plane variant="slab" />
      <div className="tc-body">
        <Micro>Lesson</Micro>
        <SplitType
          text={slide.title}
          clip={SLAB_OVERLAP}
          className="tc-hero"
          style={fitStyle(slide.title, S.HERO)}
        />
      </div>
      {slide.subtitle && (
        <p className="tc-slabtext" style={fitStyle(slide.subtitle, S.SLABTEXT)}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * The figure takes whatever height the slab leaves. Both are flex items rather
 * than absolutely positioned siblings, so the claim can never spill off the
 * accent and go invisible against the canvas — the slab is sized by its own
 * content and the figure gets the remainder.
 */
const Statement: React.FC<LayoutProps> = ({ slide }) => (
  <div className="tc-stage tc-stage--statement">
    <div className="tc-figurebox">
      {slide.emphasis && (
        <span className="tc-figure" style={fitStyle(slide.emphasis, S.FIGURE)}>
          {slide.emphasis}
        </span>
      )}
    </div>
    <div className="tc-slab">
      <Micro on>Key idea</Micro>
      <h1 className="tc-claimtext" style={fitStyle(slide.title, S.CLAIM)}>
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="tc-slabsub" style={fitStyle(slide.subtitle, S.SLABSUB)}>
          {slide.subtitle}
        </p>
      )}
    </div>
  </div>
);

/** The credits block: tracked indices, tight leading, one narrow column. */
const Credits: React.FC<{
  items: string[];
  marker: (i: number) => React.ReactNode;
  labelled?: boolean;
}> = ({ items, marker, labelled }) => (
  <ul className="tc-credits" data-rows={rowsAttr(items.length)}>
    {items.map((item, i) => {
      const { label, text } = labelled
        ? splitLabelled(item)
        : { label: undefined, text: item };
      return (
        <li className="tc-credit" key={`i-${i}`}>
          <span className="tc-credit__mark">{marker(i)}</span>
          <span className="tc-credit__text">
            {label && <b className="tc-credit__label">{label}</b>}
            {text}
          </span>
        </li>
      );
    })}
  </ul>
);

const ListHead: React.FC<{ kicker?: string; title: string; on?: boolean }> = ({
  kicker,
  title,
  on,
}) => (
  <div className="tc-listhead">
    {kicker && <Micro on={on}>{kicker}</Micro>}
    <h2 className="tc-listtitle" style={fitStyle(title, S.LIST_TITLE)}>
      {title}
    </h2>
  </div>
);

const Bullets: React.FC<LayoutProps> = ({ slide }) => (
  <div className="tc-stage tc-stage--list">
    <Plane variant="third" />
    <ListHead kicker={slide.subtitle} title={slide.title} />
    <Credits items={bodyOf(slide)} marker={(i) => String(i + 1).padStart(2, "0")} />
  </div>
);

const Steps: React.FC<LayoutProps> = ({ slide }) => (
  <div className="tc-stage tc-stage--list">
    <Plane variant="third" />
    <ListHead kicker={slide.subtitle} title={slide.title} />
    <Credits
      items={bodyOf(slide)}
      labelled
      marker={(i) => <b className="tc-tile">{i + 1}</b>}
    />
  </div>
);

/** Recap inverts the whole frame — the accent becomes the ground. */
const Summary: React.FC<LayoutProps> = ({ slide }) => (
  <div className="tc-stage tc-stage--invert">
    <Plane variant="full" />
    <ListHead kicker={slide.subtitle || "Recap"} title={slide.title} on />
    <Credits items={bodyOf(slide)} marker={() => <span className="tc-square" />} />
  </div>
);

const TwoColumn: React.FC<LayoutProps> = (props) => {
  const { slide } = props;

  // "Text + image" with no image is just a list. Falling back to Bullets beats
  // leaving the picture half of the pair standing empty.
  if (!hasImage(slide.visual)) return <Bullets {...props} />;

  return (
    <div className="tc-stage tc-stage--pair">
      <Frame visual={slide.visual} variant="half" />
      <div className="tc-pairtext">
        {slide.subtitle && <Micro measure={40}>{slide.subtitle}</Micro>}
        <h2 className="tc-listtitle" style={fitStyle(slide.title, S.PAIR_TITLE)}>
          {slide.title}
        </h2>
        <Credits items={bodyOf(slide)} marker={(i) => String(i + 1).padStart(2, "0")} />
      </div>
    </div>
  );
};

/**
 * Compare splits the frame down the middle in solid colour and runs the title
 * across the seam, so the headline itself carries the comparison — and so a long
 * title stays legible where it crosses onto the accent half.
 */
const Compare: React.FC<LayoutProps> = ({ slide }) => {
  const pair = bodyOf(slide).slice(0, 2);

  return (
    <div className="tc-stage tc-stage--compare">
      <Plane variant="seam" />
      <div className="tc-seamhead">
        <SplitType
          text={slide.title}
          clip={SEAM_CLIP}
          className="tc-seamtitle"
          style={fitStyle(slide.title, S.SEAM_TITLE)}
          as="h2"
        />
      </div>
      <div className="tc-sides">
        {pair.map((item, i) => {
          const { label, text } = splitLabelled(item);
          return (
            <div className={`tc-side tc-side--${i === 0 ? "a" : "b"}`} key={`s-${i}`}>
              <Micro on={i === 1} measure={36}>
                {label || (i === 0 ? "First" : "Second")}
              </Micro>
              <p className="tc-sidetext" style={fitStyle(text, S.SIDE_TEXT)}>
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Term above, meaning on the accent slab below — same flex split as Statement. */
const Definition: React.FC<LayoutProps> = ({ slide }) => {
  const example = bodyOf(slide)[0];

  return (
    <div className="tc-stage tc-stage--definition">
      <div className="tc-term">
        <Micro>Definition</Micro>
        <SplitType
          text={slide.title}
          className="tc-hero tc-hero--term"
          style={fitStyle(slide.title, S.TERM)}
          as="h2"
        />
      </div>
      <div className="tc-slab">
        {slide.subtitle && (
          <p className="tc-meaningtext" style={fitStyle(slide.subtitle, S.MEANING)}>
            {slide.subtitle}
          </p>
        )}
        {example && (
          <div className="tc-example">
            <Micro on>Example</Micro>
            <p className="tc-exampletext" style={fitStyle(example, S.EXAMPLE)}>
              {example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TITLECARD: Record<SlideLayout, React.FC<LayoutProps>> = {
  title: Title,
  statement: Statement,
  bullets: Bullets,
  twoColumn: TwoColumn,
  steps: Steps,
  compare: Compare,
  definition: Definition,
  summary: Summary,
};
