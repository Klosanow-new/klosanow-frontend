import React from "react";
import { Text, Box, Flex, IconButton, Button } from "@chakra-ui/react";
import { capitalize, uniqueId } from "lodash";
import { MdArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md";

import { CreateLessonFormContext } from "../../context/CreateLessonFormContext";
import {
  CreateLessonFormStepsType,
  LessonTemplateType,
  SlideItem,
} from "../../../../types";

import { btnStyles } from "../../data";
import { colors } from "src/data/colors";
import SlideRenderer from "../../slides/SlideRenderer";
import { buildTitleSlide } from "../../slides/buildTitleSlide";

const LessonPreview: React.FC = () => {
  const [index, setIndex] = React.useState(0);

  const { template, content, form_info, slideStyle, updateCreateLessonFormValues } =
    React.useContext(CreateLessonFormContext);

  const isSlideTemplate = template === LessonTemplateType.Slide;

  // Scroll is one long document rather than slides, so it keeps the original
  // markup. Only the slide template runs through the design system.
  const scrollTitle = `
    <p style='font-size: 32px; font-weight: 500'>${capitalize(
      form_info?.title || ""
    )}</p>
    <p style='font-size: 18px; margin-top: 12px'>
      ${form_info?.description || ""}
    </p>
    <div class='slide-img-container'>
      <img
        src=${form_info?.thumbnailUrl || ""}
        alt=${form_info?.title || ""}
        class='slide-img'
      />
    </div>
  `;

  const slides: SlideItem[] = [buildTitleSlide(form_info), ...content];
  const scrollItems = [scrollTitle, ...content];

  return (
    <>
      <Flex
        flexDir="column"
        h={{
          base: "calc(100vh - 200px)",
          md: "600px",
        }}
        w="full"
        bg={isSlideTemplate ? "transparent" : "#F8F7FE"}
        justify="space-between"
        as="div"
        position="relative"
        overflow="hidden">
        {isSlideTemplate ? (
          <Box h="100%" minH="0" flex="1">
            <SlideRenderer item={slides[index]} style={slideStyle} />
          </Box>
        ) : (
          <Box
            h="100%"
            padding="16px 24px"
            overflow="scroll"
            className="hide-scroll">
            {scrollItems.map((item) => (
              <div
                key={uniqueId("slide-item")}
                className={"slide"}
                dangerouslySetInnerHTML={{ __html: item as string }}
              />
            ))}
          </Box>
        )}

        {isSlideTemplate && slides.length - 1 > 1 && (
          <Flex w="100%" align="center" justify="center" gap="50px" h="60px">
            {index > 0 ? (
              <IconButton
                aria-label="previous slide"
                bg="transparent"
                _hover={{ bg: "transparent" }}
                onClick={() => setIndex((prev) => prev - 1)}
                icon={<MdArrowBackIosNew />}
              />
            ) : (
              <Box w="40px" />
            )}

            <Text>
              Slide {index + 1}/{slides.length}
            </Text>

            {index < slides.length - 1 ? (
              <IconButton
                aria-label="next slide"
                bg="transparent"
                _hover={{ bg: "transparent" }}
                onClick={() => setIndex((prev) => prev + 1)}
                icon={<MdOutlineArrowForwardIos />}
              />
            ) : (
              <Box w="40px" />
            )}
          </Flex>
        )}
      </Flex>

      <Flex justify="flex-end" mt="12px" gap="24px">
        <Button
          {...btnStyles()}
          type="button"
          _hover={{ color: "none" }}
          onClick={() =>
            updateCreateLessonFormValues({
              activeStep: CreateLessonFormStepsType.Content,
            })
          }>
          Back
        </Button>

        <Button
          {...btnStyles()}
          bg={colors.primary[50]}
          color={colors.neutral[10]}
          type="button"
          _hover={{ color: "none" }}
          onClick={() =>
            updateCreateLessonFormValues({ showRecordLessonModal: true })
          }>
          Start record
        </Button>
      </Flex>
    </>
  );
};

export default LessonPreview;
