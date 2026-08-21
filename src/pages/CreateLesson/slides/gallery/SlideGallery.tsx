import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { DepthGesture, Slide, SlideDirectionId } from "src/types";
import { colors } from "src/data/colors";
import SlideRenderer from "../SlideRenderer";
import StylePicker from "../StylePicker";
import { DEFAULT_SLIDE_STYLE } from "../slideCodec";
import { getPalette } from "../palettes";
import { SLIDE_DIRECTIONS, getDirection } from "../directions";
import { SLIDE_LIMITS } from "../limits";

const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=60";

/** Realistic lesson content — what a tutor actually types. */
const TYPICAL: Slide[] = [
  {
    id: "f-title",
    layout: "title",
    title: "Photosynthesis",
    subtitle: "How plants turn sunlight into food",
    visual: { type: "stock", url: SAMPLE_IMAGE, alt: "Green leaf" },
  },
  {
    id: "f-statement",
    layout: "statement",
    title: "Every gram of plant matter began as air and light",
    emphasis: "90%",
  },
  {
    id: "f-bullets",
    layout: "bullets",
    title: "Two stages of the process",
    subtitle: "Chapter 4",
    body: [
      "Light reactions capture energy in the thylakoid membrane",
      "The Calvin cycle builds sugar from carbon dioxide",
      "Chlorophyll absorbs red and blue light, reflecting green",
      "Oxygen leaves as a by-product of splitting water",
    ],
  },
  {
    id: "f-twocolumn",
    layout: "twoColumn",
    title: "Where it happens",
    subtitle: "Structure",
    body: [
      "Chloroplasts hold stacks of thylakoids",
      "The stroma surrounds them with enzymes",
      "Stomata on the leaf surface let gases in",
    ],
    visual: { type: "stock", query: "chloroplast diagram" },
  },
  {
    id: "f-steps",
    layout: "steps",
    title: "Following the energy",
    subtitle: "Process",
    body: [
      "Absorb: chlorophyll captures a photon",
      "Split: water breaks into hydrogen and oxygen",
      "Store: energy moves into ATP and NADPH",
      "Build: the Calvin cycle assembles glucose",
    ],
  },
  {
    id: "f-compare",
    layout: "compare",
    title: "Photosynthesis vs respiration",
    body: [
      "Photosynthesis: stores energy, uses carbon dioxide, releases oxygen",
      "Respiration: releases energy, uses oxygen, produces carbon dioxide",
    ],
  },
  {
    id: "f-definition",
    layout: "definition",
    title: "Chlorophyll",
    subtitle:
      "The green pigment that absorbs light energy so a plant can begin photosynthesis",
    body: ["A leaf looks green because chlorophyll reflects green light"],
  },
  {
    id: "f-summary",
    layout: "summary",
    title: "What to remember",
    body: [
      "Light energy becomes chemical energy",
      "Water is split, oxygen is released",
      "Carbon dioxide becomes glucose",
      "It all happens inside the chloroplast",
    ],
  },
];

// Exactly at the documented caps. Every layout has to look deliberate here and
// must never overflow or clip — this is the set that catches a broken type scale.
const pad = (n: number, seed: string) =>
  seed.repeat(Math.ceil(n / seed.length)).slice(0, n);

const CAP_TITLE = pad(SLIDE_LIMITS.title, "Photosynthesis and cellular respiration compared ");
const CAP_SUB = pad(SLIDE_LIMITS.subtitle, "The full energy pathway from photon capture to stored glucose in a leaf ");
const CAP_ITEM = (i: number) =>
  pad(SLIDE_LIMITS.bodyItem, `Point ${i + 1}: chlorophyll absorbs a photon and the electron transport chain begins `);
const CAP_BODY = Array.from({ length: SLIDE_LIMITS.bodyMax }, (_, i) => CAP_ITEM(i));

const AT_CAP: Slide[] = [
  {
    id: "c-title",
    layout: "title",
    title: CAP_TITLE,
    subtitle: CAP_SUB,
    visual: { type: "stock", url: SAMPLE_IMAGE, alt: "Green leaf" },
  },
  {
    id: "c-statement",
    layout: "statement",
    title: CAP_TITLE,
    subtitle: CAP_SUB,
    emphasis: pad(SLIDE_LIMITS.emphasis, "Chloroplast"),
  },
  { id: "c-bullets", layout: "bullets", title: CAP_TITLE, subtitle: "Chapter 4", body: CAP_BODY },
  {
    id: "c-twocolumn",
    layout: "twoColumn",
    title: CAP_TITLE,
    subtitle: "Structure",
    body: CAP_BODY,
    visual: { type: "stock", query: "chloroplast diagram" },
  },
  {
    id: "c-steps",
    layout: "steps",
    title: CAP_TITLE,
    subtitle: "Process",
    body: CAP_BODY.map((t, i) => `Stage ${i + 1}: ${t}`.slice(0, SLIDE_LIMITS.bodyItem)),
  },
  { id: "c-compare", layout: "compare", title: CAP_TITLE, body: CAP_BODY.slice(0, 2) },
  { id: "c-definition", layout: "definition", title: CAP_TITLE, subtitle: CAP_SUB, body: [CAP_ITEM(0)] },
  { id: "c-summary", layout: "summary", title: CAP_TITLE, subtitle: "Recap", body: CAP_BODY },
];

// One character in every slot — the other end of the same problem.
const MINIMAL: Slide[] = [
  { id: "m-title", layout: "title", title: "A", subtitle: "B" },
  { id: "m-statement", layout: "statement", title: "A", emphasis: "7" },
  { id: "m-bullets", layout: "bullets", title: "A", subtitle: "B", body: ["C", "D"] },
  {
    id: "m-twocolumn",
    layout: "twoColumn",
    title: "A",
    subtitle: "B",
    body: ["C"],
    visual: { type: "stock", query: "leaf" },
  },
  { id: "m-steps", layout: "steps", title: "A", subtitle: "B", body: ["C", "D"] },
  { id: "m-compare", layout: "compare", title: "A", body: ["C", "D"] },
  { id: "m-definition", layout: "definition", title: "A", subtitle: "B", body: ["C"] },
  { id: "m-summary", layout: "summary", title: "A", body: ["C"] },
];

const SETS: Record<string, { label: string; hint: string; slides: Slide[] }> = {
  typical: { label: "Typical", hint: "What a tutor actually types", slides: TYPICAL },
  cap: {
    label: "At the cap",
    hint: `title ${SLIDE_LIMITS.title}, subtitle ${SLIDE_LIMITS.subtitle}, ${SLIDE_LIMITS.bodyMax} items of ${SLIDE_LIMITS.bodyItem}, emphasis ${SLIDE_LIMITS.emphasis}`,
    slides: AT_CAP,
  },
  minimal: { label: "One character", hint: "Every slot at its shortest", slides: MINIMAL },
};

const LEGACY_HTML =
  "<h2>Older draft slide</h2><p>This came from the Quill editor before the design system existed. It still renders, on a forced light surface.</p><ul><li>Inline colours stay readable</li><li>Lists keep their shape</li></ul>";

const DEPTHS: DepthGesture[] = ["stack", "offset", "arc", "iso", "notch"];

const Pill: React.FC<{
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ selected, onClick, children, title }) => (
  <Box
    as="button"
    type="button"
    onClick={onClick}
    title={title}
    px="14px"
    py="7px"
    borderRadius="8px"
    border="1px solid"
    borderColor={selected ? colors.primary[50] : "#E2E2E2"}
    bg={selected ? colors.primary[5] : "transparent"}
    color={selected ? colors.primary[70] : colors.neutral[100]}
    fontSize="14px"
    textAlign="left"
  >
    {children}
  </Box>
);

const SlideGallery: React.FC = () => {
  const [style, setStyle] = React.useState(DEFAULT_SLIDE_STYLE);
  const [depth, setDepth] = React.useState<DepthGesture | "auto">("auto");
  const [setKey, setSetKey] = React.useState<keyof typeof SETS>("typical");

  const paletteDefault = getPalette(style.paletteId).depth;
  const direction = getDirection(style.directionId);
  const slides = SETS[setKey].slides;

  const setDirection = (id: SlideDirectionId) =>
    setStyle((s) => ({ ...s, directionId: id }));

  return (
    <Box p="24px 32px" maxW="1000px">
      <Text fontSize="28px" fontWeight="600" mb="4px">
        Slide gallery
      </Text>
      <Text fontSize="14px" color="black.30" mb="24px">
        8 layouts across {SLIDE_DIRECTIONS.length} directions, 6 palettes and 6
        typefaces. Switch the content set to check the character limits.
      </Text>

      <Box mb="20px">
        <Text fontSize="14px" fontWeight="600" mb="8px" color="black.30">
          Direction
        </Text>
        <Flex gap="8px" wrap="wrap">
          {SLIDE_DIRECTIONS.map((d) => (
            <Pill
              key={d.id}
              selected={d.id === direction.id}
              onClick={() => setDirection(d.id)}
              title={d.tagline}
            >
              {d.name}
            </Pill>
          ))}
        </Flex>
        <Text fontSize="12px" color="black.20" mt="6px">
          {direction.tagline}
        </Text>
      </Box>

      <Box mb="20px">
        <Text fontSize="14px" fontWeight="600" mb="8px" color="black.30">
          Content
        </Text>
        <Flex gap="8px" wrap="wrap">
          {(Object.keys(SETS) as Array<keyof typeof SETS>).map((k) => (
            <Pill
              key={k}
              selected={k === setKey}
              onClick={() => setSetKey(k)}
              title={SETS[k].hint}
            >
              {SETS[k].label}
            </Pill>
          ))}
        </Flex>
        <Text fontSize="12px" color="black.20" mt="6px">
          {SETS[setKey].hint}
        </Text>
      </Box>

      <Box mb="20px">
        <StylePicker value={style} onChange={setStyle} />
      </Box>

      {direction.usesDepth && (
        <Box mb="32px">
          <Text fontSize="14px" fontWeight="600" mb="8px" color="black.30">
            Depth
          </Text>
          <Flex gap="8px" wrap="wrap">
            {(["auto", ...DEPTHS] as Array<DepthGesture | "auto">).map((d) => (
              <Pill key={d} selected={d === depth} onClick={() => setDepth(d)}>
                <Box as="span" textTransform="capitalize">
                  {d === "auto" ? `Auto (${paletteDefault})` : d}
                </Box>
              </Pill>
            ))}
          </Flex>
        </Box>
      )}

      <Flex flexDir="column" gap="32px">
        {slides.map((slide) => (
          <Box key={slide.id}>
            <Text
              fontSize="12px"
              fontWeight="600"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="black.20"
              mb="8px"
            >
              {slide.layout}
            </Text>
            <Box w="100%" h="0" pb="56.25%" position="relative">
              <Box position="absolute" inset="0">
                <SlideRenderer
                  item={slide}
                  style={style}
                  depthOverride={depth === "auto" ? undefined : depth}
                />
              </Box>
            </Box>
          </Box>
        ))}

        <Box>
          <Text
            fontSize="12px"
            fontWeight="600"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="black.20"
            mb="8px"
          >
            legacy quill html
          </Text>
          <Box w="100%" h="0" pb="56.25%" position="relative">
            <Box position="absolute" inset="0">
              <SlideRenderer
                item={LEGACY_HTML}
                style={style}
                depthOverride={depth === "auto" ? undefined : depth}
              />
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default SlideGallery;
