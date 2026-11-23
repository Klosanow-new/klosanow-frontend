import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { DashboardState } from "../../Dashboard";
import { LessonType } from "src/types";

interface LessonTabHeaderProps {
  lessonType: LessonType;
  handleStateUpdate: (x: Partial<DashboardState>) => void;
}

const TABS = [
  { label: "My lessons", lessonType: LessonType.Created },
  { label: "Saved", lessonType: LessonType.Saved },
];

/**
 * Segmented control for created vs saved lessons. Replaces the separate
 * desktop tabs + mobile menu, whose mobile label was hard-coded to
 * "Created Lessons" and never reflected the selected list.
 */
const LessonTabHeader: React.FC<LessonTabHeaderProps> = ({
  lessonType,
  handleStateUpdate,
}) => (
  <Flex
    role="tablist"
    aria-label="Lesson lists"
    bg="ink.100"
    p="1"
    borderRadius="full"
    gap="1"
  >
    {TABS.map((tab) => {
      const selected = tab.lessonType === lessonType;
      return (
        <Box
          as="button"
          type="button"
          role="tab"
          aria-selected={selected}
          key={tab.lessonType}
          onClick={() => handleStateUpdate({ lessonType: tab.lessonType })}
          px="4"
          py="1.5"
          borderRadius="full"
          fontSize="sm"
          fontWeight={selected ? 700 : 500}
          color={selected ? "ink.900" : "ink.500"}
          bg={selected ? "white" : "transparent"}
          boxShadow={selected ? "sm" : "none"}
          transition="all 0.15s ease"
          _hover={{ color: "ink.900" }}
          _focusVisible={{ boxShadow: "outline", outline: "none" }}
        >
          {tab.label}
        </Box>
      );
    })}
  </Flex>
);

export default LessonTabHeader;
