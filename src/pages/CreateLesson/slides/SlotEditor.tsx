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
      textAlign="right"
    >
      {length}/{max}
      {over ? " — will be cut off" : ""}
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
  const slots = LAYOUT_SLOTS[slide.layout];
  const body = slide.body ?? [];

  const patch = (partial: Partial<Slide>) => onChange({ ...slide, ...partial });

  const setBodyItem = (index: number, value: string) =>
    patch({ body: body.map((item, i) => (i === index ? value : item)) });

  return (
    <Box
      w="100%"
      h="616px"
      overflowY="auto"
      className="hide-scroll"
      border={`1px solid ${colors.primary[5]}`}
      borderRadius="8px"
      p="16px"
    >
      <Box mb="14px">
        <Text {...label}>Layout</Text>
        <Select
          size="sm"
          value={slide.layout}
          onChange={(e) => patch({ layout: e.target.value as SlideLayout })}
        >
          {LAYOUT_IDS.map((id) => (
            <option key={id} value={id}>
              {LAYOUT_LABELS[id]}
            </option>
          ))}
        </Select>
      </Box>

      <Box mb="14px">
        <Text {...label}>
          {slide.layout === "definition" ? "Term" : "Title"}
        </Text>
        <Input
          size="sm"
          value={slide.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <Counter value={slide.title} max={SLIDE_LIMITS.title} />
      </Box>

      {slots.subtitle && (
        <Box mb="14px">
          <Text {...label}>
            {slide.layout === "definition" ? "Meaning" : "Subtitle or kicker"}
          </Text>
          <Input
            size="sm"
            value={slide.subtitle ?? ""}
            onChange={(e) =>
              patch({ subtitle: e.target.value || undefined })
            }
          />
          <Counter value={slide.subtitle} max={SLIDE_LIMITS.subtitle} />
        </Box>
      )}

      {slots.emphasis && (
        <Box mb="14px">
          <Text {...label}>Big number or word</Text>
          <Input
            size="sm"
            maxW="140px"
            value={slide.emphasis ?? ""}
            onChange={(e) =>
              patch({ emphasis: e.target.value || undefined })
            }
          />
          <Counter value={slide.emphasis} max={SLIDE_LIMITS.emphasis} />
        </Box>
      )}

      {slots.body && (
        <Box mb="14px">
          <Flex align="center" justify="space-between" mb="4px">
            <Text {...label} mb="0">
              {slide.layout === "steps"
                ? "Steps, in order"
                : slide.layout === "compare"
                  ? "The two things to compare"
                  : slide.layout === "definition"
                    ? "Example"
                    : "Points"}
            </Text>
            {body.length < SLIDE_LIMITS.bodyMax && (
              <IconButton
                aria-label="add point"
                size="xs"
                variant="ghost"
                icon={<MdAdd />}
                onClick={() => patch({ body: [...body, ""] })}
              />
            )}
          </Flex>

          {body.map((item, index) => (
            <Box key={`body-${index}`} mb="8px">
              <Flex gap="6px" align="flex-start">
                <Input
                  size="sm"
                  value={item}
                  placeholder={
                    slide.layout === "compare" || slide.layout === "steps"
                      ? "Label: the detail"
                      : "A short point"
                  }
                  onChange={(e) => setBodyItem(index, e.target.value)}
                />
                <IconButton
                  aria-label="remove point"
                  size="sm"
                  variant="ghost"
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
            <Text fontSize="12px" color="black.20">
              No points yet — use + to add one.
            </Text>
          )}
        </Box>
      )}

      <Box>
        <Text {...label}>What you will say (speaker notes)</Text>
        <Textarea
          size="sm"
          rows={5}
          value={slide.speakerNotes ?? ""}
          placeholder="What the tutor says out loud while this slide is showing"
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
