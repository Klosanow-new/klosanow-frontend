import React from "react";
import { Box, Button, Collapse, Flex, Text } from "@chakra-ui/react";
import { SlideItem, isStructuredSlide } from "src/types";
import { colors } from "src/data/colors";
import { reviewTeachingSlide } from "./teaching";

interface TeachingReviewProps {
  slides: SlideItem[];
  warnings: string[];
  onSelect: (index: number) => void;
}

const TeachingReview: React.FC<TeachingReviewProps> = ({ slides, warnings, onSelect }) => {
  const [expanded, setExpanded] = React.useState(false);
  const flagged = slides.flatMap((slide, index) => {
    if (!isStructuredSlide(slide)) return [];
    const issues = reviewTeachingSlide(slide);
    return issues.length ? [{ index, title: slide.title, issues }] : [];
  });

  if (!flagged.length && !warnings.length) return null;

  return (
    <Box mb="20px" p="16px" bg="white" border={`1px solid ${colors.primary[10]}`} borderRadius="12px">
      <Flex align="center" justify="space-between" gap="12px" wrap="wrap">
        <Text fontSize="14px" fontWeight="600">
          Teaching review{flagged.length ? `: ${flagged.length} slides to check` : ""}
        </Text>
        {flagged.length > 0 && (
          <Button size="xs" variant="outline" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? "Hide checks" : "Review slides"}
          </Button>
        )}
      </Flex>
      <Text fontSize="12px" color="black.30" mt="4px">
        Short slides can be intentional. These checks flag thin content, hidden points, and brief notes; they do not verify facts.
      </Text>
      {warnings.map((warning, index) => (
        <Text key={index} mt="6px" fontSize="13px" color={colors.secondary[80]}>
          {warning}
        </Text>
      ))}
      <Collapse in={expanded} animateOpacity>
        <Box mt="12px" maxH="280px" overflowY="auto">
          {flagged.map(({ index, title, issues }) => (
            <Box key={index} py="10px" borderTop={`1px solid ${colors.primary[5]}`}>
              <Button size="sm" variant="link" color={colors.primary[50]} whiteSpace="normal" textAlign="left" onClick={() => onSelect(index)}>
                Slide {index + 1}: {title || "Untitled"}
              </Button>
              {issues.map((issue) => (
                <Text key={issue} fontSize="12px" color="black.30" mt="4px">{issue}</Text>
              ))}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default TeachingReview;
