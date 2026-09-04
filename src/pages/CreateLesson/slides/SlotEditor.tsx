import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Select,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { MdAdd, MdClose } from "react-icons/md";
import { Slide, SlideLayout } from "src/types";
import { colors } from "src/data/colors";
import { LAYOUT_LABELS, LAYOUT_SLOTS, SLIDE_LIMITS } from "./limits";
import { LAYOUT_IDS } from "./layouts";

interface SlotEditorProps {
  slide: Slide;
  onChange: (next: Slide) => void;
}

const Counter: React.FC<{ value: string | undefined; max: number }> = ({
  value,
  max,
}) => {
  const length = value?.length ?? 0;
  const over = length > max;
  return (
    <Text
      fontSize="11px"
      color={over ? colors.error[50] : "black.20"}
      fontWeight={over ? "600" : "400"}
      textAlign="right"
      mt="2px"
    >
      {length}/{max}
      {over ? " — text may clip" : ""}
    </Text>
  );
};

const label = {
  fontSize: "13px",
  fontWeight: "600",
  color: "black.30",
  mb: "4px",
};

const SlotEditor: React.FC<SlotEditorProps> = ({ slide, onChange }) => {
  const slots = LAYOUT_SLOTS[slide.layout] ?? {
    subtitle: true,
    body: true,
    emphasis: false,
    visual: false,
  };
  const body = slide.body ?? [];

  const patch = (partial: Partial<Slide>) => onChange({ ...slide, ...partial });

  const handleLayoutChange = (newLayout: SlideLayout) => {
    const newSlots = LAYOUT_SLOTS[newLayout];
    const newSlide: Slide = {
      ...slide,
      layout: newLayout,
    };
    if (newSlots?.body && (!newSlide.body || newSlide.body.length === 0)) {
      newSlide.body = [""];
    }
    onChange(newSlide);
  };

  const setBodyItem = (index: number, value: string) =>
    patch({ body: body.map((item, i) => (i === index ? value : item)) });

  return (
    <Box
      w="100%"
      maxH="calc(100vh - 240px)"
      minH="480px"
      overflowY="auto"
      className="hide-scroll"
      border={`1px solid ${colors.primary[5]}`}
      borderRadius="12px"
      p="18px"
      bg="white"
      boxShadow="sm"
    >
      <Box mb="16px">
        <Text {...label}>Slide Layout</Text>
        <Select
          size="sm"
          borderRadius="6px"
          value={slide.layout}
          onChange={(e) => handleLayoutChange(e.target.value as SlideLayout)}
        >
          {LAYOUT_IDS.map((id) => (
            <option key={id} value={id}>
              {LAYOUT_LABELS[id]}
            </option>
          ))}
        </Select>
      </Box>

      <Box mb="16px">
        <Text {...label}>
          {slide.layout === "definition" ? "Term" : "Title"}
        </Text>
        <Input
          size="sm"
          borderRadius="6px"
          value={slide.title}
          placeholder="Slide title"
          onChange={(e) => patch({ title: e.target.value })}
        />
        <Counter value={slide.title} max={SLIDE_LIMITS.title} />
      </Box>

      {slots.subtitle && (
        <Box mb="16px">
          <Text {...label}>
            {slide.layout === "definition" ? "Meaning / Definition" : "Subtitle / Kicker"}
          </Text>
          <Input
            size="sm"
            borderRadius="6px"
            value={slide.subtitle ?? ""}
            placeholder={
              slide.layout === "definition"
                ? "What does this term mean?"
                : "Supporting statement or chapter context"
            }
            onChange={(e) =>
              patch({ subtitle: e.target.value || undefined })
            }
          />
          <Counter value={slide.subtitle} max={SLIDE_LIMITS.subtitle} />
        </Box>
      )}

      {slots.emphasis && (
        <Box mb="16px">
          <Text {...label}>Callout / Big Number</Text>
          <Input
            size="sm"
            borderRadius="6px"
            maxW="180px"
            value={slide.emphasis ?? ""}
            placeholder="e.g. 98% or STEP 1"
            onChange={(e) =>
              patch({ emphasis: e.target.value || undefined })
            }
          />
          <Counter value={slide.emphasis} max={SLIDE_LIMITS.emphasis} />
        </Box>
      )}

      {slots.body && (
        <Box mb="16px">
          <Flex align="center" justify="space-between" mb="6px">
            <Text {...label} mb="0">
              {slide.layout === "steps"
                ? "Steps (in sequence)"
                : slide.layout === "compare"
                  ? "Items to compare (2 items)"
                  : slide.layout === "definition"
                    ? "Example"
                    : "Bullet Points"}
            </Text>
            {body.length < SLIDE_LIMITS.bodyMax && (
              <IconButton
                aria-label="add point"
                size="xs"
                variant="ghost"
                colorScheme="purple"
                icon={<MdAdd />}
                onClick={() => patch({ body: [...body, ""] })}
              />
            )}
          </Flex>

          {body.map((item, index) => (
            <Box key={`body-${index}`} mb="10px">
              <Flex gap="6px" align="center">
                <Input
                  size="sm"
                  borderRadius="6px"
                  value={item}
                  placeholder={
                    slide.layout === "compare" || slide.layout === "steps"
                      ? `Item ${index + 1}: Key detail`
                      : `Point ${index + 1}`
                  }
                  onChange={(e) => setBodyItem(index, e.target.value)}
                />
                <IconButton
                  aria-label="remove point"
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  icon={<MdClose />}
                  onClick={() =>
                    patch({ body: body.filter((_, i) => i !== index) })
                  }
                />
              </Flex>
              <Counter value={item} max={SLIDE_LIMITS.bodyItem} />
            </Box>
          ))}

          {body.length === 0 && (
            <Flex
              align="center"
              justify="center"
              p="12px"
              border={`1px dashed ${colors.primary[5]}`}
              borderRadius="6px"
              cursor="pointer"
              onClick={() => patch({ body: [""] })}
            >
              <Text fontSize="12px" color="black.20">
                + Click to add your first point
              </Text>
            </Flex>
          )}
        </Box>
      )}

      <Box>
        <Text {...label}>Speaker Notes (Teleprompter)</Text>
        <Textarea
          size="sm"
          borderRadius="6px"
          rows={5}
          value={slide.speakerNotes ?? ""}
          placeholder="Talking points and explanation what you will say out loud while presenting this slide"
          onChange={(e) =>
            patch({ speakerNotes: e.target.value || undefined })
          }
        />
        <Counter value={slide.speakerNotes} max={SLIDE_LIMITS.speakerNotes} />
      </Box>
    </Box>
  );
};

export default SlotEditor;
