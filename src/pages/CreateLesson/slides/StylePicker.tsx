import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { SlideStyle } from "src/types";
import { colors } from "src/data/colors";
import { SLIDE_PALETTES } from "./palettes";
import { SLIDE_FONT_PAIRS, loadFontPair } from "./fontPairs";

interface StylePickerProps {
  value: SlideStyle;
  onChange: (next: SlideStyle) => void;
}

const StylePicker: React.FC<StylePickerProps> = ({ value, onChange }) => {
  // The pills preview each family, so the picker needs every pair loaded.
  // SlideRenderer still loads only the selected one.
  React.useEffect(() => {
    SLIDE_FONT_PAIRS.forEach((pair) => loadFontPair(pair.id));
  }, []);

  return (
    <Flex flexDir="column" gap="16px">
      <Box>
        <Text fontSize="14px" fontWeight="600" mb="8px" color="black.30">
          Colour
        </Text>
        <Flex gap="10px" wrap="wrap">
          {SLIDE_PALETTES.map((palette) => {
            const selected = palette.id === value.paletteId;
            return (
              <Tooltip key={palette.id} label={palette.name} hasArrow>
                <Box
                  as="button"
                  type="button"
                  aria-label={palette.name}
                  onClick={() =>
                    onChange({ ...value, paletteId: palette.id })
                  }
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg={palette.canvasBg}
                  position="relative"
                  border="2px solid"
                  borderColor={selected ? colors.primary[50] : "#E2E2E2"}
                  outline={selected ? `2px solid ${colors.primary[10]}` : "none"}
                  outlineOffset="1px"
                >
                  <Box
                    position="absolute"
                    bottom="5px"
                    right="5px"
                    w="11px"
                    h="11px"
                    borderRadius="full"
                    bg={palette.accent}
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Flex>
      </Box>

      <Box>
        <Text fontSize="14px" fontWeight="600" mb="8px" color="black.30">
          Typeface
        </Text>
        <Flex gap="8px" wrap="wrap">
          {SLIDE_FONT_PAIRS.map((pair) => {
            const selected = pair.id === value.fontPairId;
            return (
              <Box
                as="button"
                key={pair.id}
                type="button"
                onClick={() => onChange({ ...value, fontPairId: pair.id })}
                px="14px"
                py="7px"
                borderRadius="8px"
                border="1px solid"
                borderColor={selected ? colors.primary[50] : "#E2E2E2"}
                bg={selected ? colors.primary[5] : "transparent"}
                color={selected ? colors.primary[70] : colors.neutral[100]}
                fontFamily={pair.heading}
                fontSize="17px"
                lineHeight="1.2"
              >
                {pair.name}
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Flex>
  );
};

export default StylePicker;
