import React from "react";
import {
  Flex,
  Button,
  IconButton,
  Text,
  Box,
  useToast,
  Badge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Collapse,
} from "@chakra-ui/react";
import { AiFillDelete } from "react-icons/ai";
import {
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdContentCopy,
  MdAdd,
  MdExpandMore,
  MdExpandLess,
  MdAutoAwesome,
} from "react-icons/md";
import {
  CreateLessonFormStepsType,
  Slide,
  SlideItem,
  SlideLayout,
  isStructuredSlide,
} from "src/types";
import { CreateLessonFormContext } from "../../context/CreateLessonFormContext";
import { colors } from "src/data/colors";
import { getLessonContentActions } from "../../data";
import { saveToDrafts, updateDraft } from "src/api-endpoints/lessons";
import { draftsPagePath } from "src/data/pageUrl";
import { useNavigate } from "react-router-dom";
import OverlayLoader from "src/components/OverlayLoader";
import { clearFileUrl } from "src/utils/constant";
import StylePicker from "../../slides/StylePicker";
import SlotEditor from "../../slides/SlotEditor";
import DocumentUpload from "../../slides/DocumentUpload";
import TeachingReview from "../../slides/TeachingReview";
import SlideRenderer from "../../slides/SlideRenderer";
import { encodeContent } from "../../slides/slideCodec";
import { LAYOUT_LABELS } from "../../slides/limits";

interface LessonDescriptionState {
  activeIndex: number;
  content: Array<SlideItem>;
  showTooltip: boolean;
  loading: boolean;
}

const Editor = React.lazy(() => import("./Editor"));

const SlideLessonContent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const editorRef = React.useRef<HTMLDivElement>(null);

  const {
    draft_id,
    template,
    form_info,
    content,
    slideStyle,
    updateCreateLessonFormValues,
  } = React.useContext(CreateLessonFormContext);

  const [state, setState] = React.useState<LessonDescriptionState>({
    activeIndex: 0,
    content: content || [],
    showTooltip: false,
    loading: false,
  });

  const [showDocUpload, setShowDocUpload] = React.useState(
    !content || content.length === 0
  );
  const [generationWarnings, setGenerationWarnings] = React.useState<string[]>([]);

  const handleStateUpdate = (newState: Partial<LessonDescriptionState>) =>
    setState((prev) => ({ ...prev, ...newState }));

  const handleProceed = () =>
    updateCreateLessonFormValues({
      activeStep: CreateLessonFormStepsType.Record,
      content: state.content,
    });

  const handleSelect = (index: number) => {
    handleStateUpdate({ activeIndex: index });
  };

  const handleReviewSelect = (index: number) => {
    handleSelect(index);
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ block: "start" });
      editorRef.current?.focus({ preventScroll: true });
    });
  };

  // Live auto-update for structured slides
  const handleUpdateCurrentSlide = (updated: Slide) => {
    setState((prev) => ({
      ...prev,
      content: prev.content.map((item, i) =>
        i === prev.activeIndex ? updated : item
      ),
    }));
  };

  // Live auto-update for legacy HTML slides
  const handleUpdateLegacyContent = (htmlValue: string) => {
    setState((prev) => ({
      ...prev,
      content: prev.content.map((item, i) =>
        i === prev.activeIndex ? htmlValue : item
      ),
    }));
  };

  // Move slide up or down in the deck
  const handleMoveSlide = (
    fromIndex: number,
    direction: "up" | "down",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= state.content.length) return;

    setState((prev) => {
      const newContent = [...prev.content];
      const [moved] = newContent.splice(fromIndex, 1);
      newContent.splice(toIndex, 0, moved);

      let nextActive = prev.activeIndex;
      if (prev.activeIndex === fromIndex) {
        nextActive = toIndex;
      } else if (prev.activeIndex === toIndex) {
        nextActive = fromIndex;
      }

      return {
        ...prev,
        content: newContent,
        activeIndex: nextActive,
      };
    });
  };

  // Duplicate an existing slide
  const handleDuplicateSlide = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = state.content[index];
    if (!target) return;

    const duplicate: SlideItem = isStructuredSlide(target)
      ? {
          ...target,
          id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: `${target.title} (Copy)`,
        }
      : target;

    setState((prev) => {
      const newContent = [...prev.content];
      newContent.splice(index + 1, 0, duplicate);
      return {
        ...prev,
        content: newContent,
        activeIndex: index + 1,
      };
    });

    toast({
      title: "Slide duplicated",
      status: "info",
      duration: 2000,
      position: "top-right",
    });
  };

  // Delete a slide
  const handleRemoveSlide = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setState((prev) => {
      const newContent = prev.content.filter((_, i) => i !== index);
      let nextActive = prev.activeIndex;
      if (nextActive >= newContent.length) {
        nextActive = Math.max(0, newContent.length - 1);
      } else if (nextActive > index) {
        nextActive = nextActive - 1;
      }
      return {
        ...prev,
        content: newContent,
        activeIndex: nextActive,
      };
    });
  };

  // Add a brand new structured slide with chosen layout
  const handleAddNewSlide = (layout: SlideLayout = "bullets") => {
    const newSlide: Slide = {
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      layout,
      title: layout === "title" ? (form_info.title || "Lesson Title") : "Key Point Heading",
      subtitle: layout === "definition" ? "Meaning / Definition" : "",
      body:
        layout === "title"
          ? undefined
          : layout === "compare"
          ? ["Item A: detail", "Item B: detail"]
          : ["First key takeaway or point"],
      speakerNotes: "",
    };

    setState((prev) => {
      const newContent = [...prev.content, newSlide];
      return {
        ...prev,
        content: newContent,
        activeIndex: newContent.length - 1,
      };
    });
  };

  // Handle AI generation completion
  const handleGenerated = (generated: Slide[], warnings: string[]) => {
    const offset = state.content.length;
    const withIds = generated.map((slide, i) => ({
      ...slide,
      id: slide.id || `g${offset + i + 1}`,
    }));

    setState((prev) => ({
      ...prev,
      content: [...prev.content, ...withIds],
      activeIndex: offset, // Immediately navigate to the first newly generated slide!
    }));

    setShowDocUpload(false); // Collapse upload to focus on editing
    setGenerationWarnings((previous) => [...new Set([...previous, ...warnings])]);

    toast({
      title: `${withIds.length} slides ready for editing`,
      description: "Check the teaching review, supporting points, and teacher notes before recording.",
      status: "success",
      duration: 5000,
      position: "top-right",
    });
  };

  const handleDraft = async () => {
    handleStateUpdate({ loading: true });
    try {
      const formData = {
        ...form_info,
        about: form_info.description,
        content: encodeContent(slideStyle, state.content),
        template,
      };

      const draftAction = () =>
        draft_id ? updateDraft(draft_id, formData) : saveToDrafts(formData);

      const res = await draftAction();

      if (!res) throw new Error("Unable to save draft");
      handleStateUpdate({ loading: false });
      clearFileUrl("thumbnail_url");
      navigate(draftsPagePath);
    } catch (error: any) {
      handleStateUpdate({ loading: false });
      toast({
        title: error.message ?? error.response ?? "Something went wrong",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const renderActions = getLessonContentActions(
    {
      handleDraft,
      handleBack: () =>
        updateCreateLessonFormValues({
          activeStep: CreateLessonFormStepsType.FormInfo,
          content: state.content,
        }),
      handleProceed,
      handleTooltip: (showTooltip) => handleStateUpdate({ showTooltip }),
    },
    state.content.length <= 1
  );

  const isTooltipActive = state.showTooltip && state.content.length <= 1;
  const currentSlide = state.content[state.activeIndex] as SlideItem | undefined;
  const isStructured = currentSlide ? isStructuredSlide(currentSlide) : false;

  return (
    <>
      <OverlayLoader loading={state.loading} description="Processing draft" />

      {/* Page Header */}
      <Flex justify="space-between" align="center" mb="16px" flexWrap="wrap" gap="12px">
        <Box>
          <Text fontSize="32px" fontWeight="600">
            Create your lessons
          </Text>
          <Text fontSize="14px" color="black.30">
            Edit text, adjust layouts, and preview your presentation live before recording.
          </Text>
        </Box>
      </Flex>

      {/* AI Document Upload Section (Expandable/Collapsible) */}
      <Box
        mb="24px"
        border={`1px solid ${colors.primary[5]}`}
        borderRadius="12px"
        bg={colors.primary[5] + "25"}
        overflow="hidden"
      >
        <Flex
          justify="space-between"
          align="center"
          p="12px 18px"
          cursor="pointer"
          onClick={() => setShowDocUpload((prev) => !prev)}
          _hover={{ bg: colors.primary[5] + "45" }}
          transition="background 0.15s"
        >
          <Flex align="center" gap="10px">
            <MdAutoAwesome color={colors.primary[50]} size={20} />
            <Box>
              <Text fontSize="14px" fontWeight="600">
                AI Slide Generator
              </Text>
              <Text fontSize="12px" color="black.30">
                {state.content.length > 0
                  ? "Generate additional slides from PDF, Word, or PowerPoint"
                  : "Upload a syllabus or document to generate your entire slide deck with AI"}
              </Text>
            </Box>
          </Flex>
          <Button
            size="xs"
            variant="ghost"
            rightIcon={showDocUpload ? <MdExpandLess /> : <MdExpandMore />}
          >
            {showDocUpload ? "Hide generator" : "Open generator"}
          </Button>
        </Flex>

        <Collapse in={showDocUpload} animateOpacity>
          <Box p="14px 18px" borderTop={`1px solid ${colors.primary[5]}`}>
            <DocumentUpload
              onGenerated={handleGenerated}
              subject={form_info.title}
              description={form_info.description}
            />
          </Box>
        </Collapse>
      </Box>

      <TeachingReview
        slides={state.content}
        warnings={generationWarnings}
        onSelect={handleReviewSelect}
      />

      {/* Studio Workspace */}
      {state.content.length === 0 ? (
        /* Empty State */
        <Box
          p="48px 24px"
          textAlign="center"
          border={`2px dashed ${colors.primary[10]}`}
          borderRadius="16px"
          bg="white"
          my="20px"
        >
          <Text fontSize="20px" fontWeight="600" mb="8px">
            No slides created yet
          </Text>
          <Text fontSize="14px" color="black.30" maxW="480px" mx="auto" mb="24px">
            Use the AI Document Generator above to automatically create structured slides, or start manually by adding your first slide.
          </Text>
          <Flex justify="center" gap="12px" flexWrap="wrap">
            <Button
              bg={colors.primary[50]}
              color="white"
              _hover={{ opacity: 0.9 }}
              leftIcon={<MdAdd />}
              onClick={() => handleAddNewSlide("title")}
            >
              Add Title Slide
            </Button>
            <Button
              variant="outline"
              borderColor={colors.primary[50]}
              color={colors.primary[50]}
              leftIcon={<MdAdd />}
              onClick={() => handleAddNewSlide("bullets")}
            >
              Add Bullets Slide
            </Button>
          </Flex>
        </Box>
      ) : (
        /* Main 3-Part Studio: Slide Deck Navigator + Field Editor + Sticky 16:9 Preview */
        <Flex
          gap="20px"
          align="flex-start"
          flexDir={{ base: "column", lg: "row" }}
          w="100%"
        >
          {/* 1. SLIDE LIST NAVIGATOR */}
          <Box
            w={{ base: "100%", lg: "270px" }}
            flexShrink={0}
            border={`1px solid ${colors.primary[5]}`}
            borderRadius="12px"
            p="14px"
            bg="white"
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center" mb="12px">
              <Text fontSize="14px" fontWeight="700" color="black.50">
                Slides ({state.content.length})
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  size="xs"
                  bg={colors.primary[50]}
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  leftIcon={<MdAdd />}
                >
                  Add Slide
                </MenuButton>
                <MenuList zIndex={10}>
                  <MenuItem onClick={() => handleAddNewSlide("bullets")}>
                    Bullet Points
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("statement")}>
                    Big Statement
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("twoColumn")}>
                    Text + Image
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("steps")}>
                    Numbered Steps
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("definition")}>
                    Definition
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("compare")}>
                    Compare
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("summary")}>
                    Summary
                  </MenuItem>
                  <MenuItem onClick={() => handleAddNewSlide("title")}>
                    Title Slide
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>

            {/* Scrollable list of slide cards */}
            <Flex
              flexDir="column"
              gap="8px"
              maxH="calc(100vh - 280px)"
              overflowY="auto"
              className="hide-scroll"
              pr="2px"
            >
              {state.content.map((item, index) => {
                const structured = isStructuredSlide(item);
                const isActive = state.activeIndex === index;
                const titleText = structured
                  ? item.title || "Untitled slide"
                  : "Legacy rich text";
                const layoutName = structured
                  ? LAYOUT_LABELS[item.layout] || item.layout
                  : "Text";

                return (
                  <Box
                    key={structured ? item.id || `slide-${index}` : `slide-${index}`}
                    cursor="pointer"
                    onClick={() => handleSelect(index)}
                    border={`2px solid ${
                      isActive ? colors.primary[50] : colors.primary[5]
                    }`}
                    bg={isActive ? colors.primary[5] + "35" : "white"}
                    _hover={{ borderColor: colors.primary[20] }}
                    borderRadius="10px"
                    p="10px 12px"
                    transition="all 0.15s ease"
                  >
                    <Flex justify="space-between" align="center" mb="4px">
                      <Flex align="center" gap="6px">
                        <Text
                          fontSize="12px"
                          fontWeight="700"
                          color={isActive ? colors.primary[50] : "black.30"}
                        >
                          {index < 9 ? "0" : ""}
                          {index + 1}
                        </Text>
                        <Badge
                          fontSize="10px"
                          colorScheme={isActive ? "purple" : "gray"}
                          textTransform="none"
                          borderRadius="4px"
                          px="6px"
                        >
                          {layoutName}
                        </Badge>
                      </Flex>

                      {/* Quick action buttons */}
                      <Flex
                        align="center"
                        gap="1px"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip label="Move up" fontSize="xs">
                          <IconButton
                            aria-label="Move up"
                            size="xs"
                            variant="ghost"
                            isDisabled={index === 0}
                            icon={<MdKeyboardArrowUp />}
                            onClick={(e) => handleMoveSlide(index, "up", e)}
                          />
                        </Tooltip>
                        <Tooltip label="Move down" fontSize="xs">
                          <IconButton
                            aria-label="Move down"
                            size="xs"
                            variant="ghost"
                            isDisabled={index === state.content.length - 1}
                            icon={<MdKeyboardArrowDown />}
                            onClick={(e) => handleMoveSlide(index, "down", e)}
                          />
                        </Tooltip>
                        <Tooltip label="Duplicate" fontSize="xs">
                          <IconButton
                            aria-label="Duplicate"
                            size="xs"
                            variant="ghost"
                            icon={<MdContentCopy />}
                            onClick={(e) => handleDuplicateSlide(index, e)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete" fontSize="xs">
                          <IconButton
                            aria-label="Delete"
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            icon={<AiFillDelete />}
                            onClick={(e) => handleRemoveSlide(index, e)}
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>

                    <Text
                      fontSize="13px"
                      fontWeight={isActive ? "600" : "500"}
                      color={isActive ? "black" : "black.40"}
                      noOfLines={1}
                    >
                      {titleText}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>

          {/* 2 & 3. WORKSPACE: Field Editor (Left) & Sticky 16:9 Canvas Preview (Right) */}
          <Box flex="1" minW="0" w="100%">
            {currentSlide ? (
              <Flex
                gap="20px"
                align="flex-start"
                flexDir={{ base: "column", xl: "row" }}
              >
                {/* FIELD EDITOR */}
                <Box
                  ref={editorRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={`Editing slide ${state.activeIndex + 1}`}
                  w={{ base: "100%", xl: "48%" }}
                  minW="0"
                >
                  <Flex justify="space-between" align="center" mb="10px">
                    <Text fontSize="16px" fontWeight="600">
                      Editing Slide {state.activeIndex + 1}
                    </Text>
                    <Badge colorScheme="green" fontSize="11px" borderRadius="4px" px="6px">
                      Auto-Saved
                    </Badge>
                  </Flex>

                  {isStructured ? (
                    <SlotEditor
                      slide={currentSlide as Slide}
                      onChange={handleUpdateCurrentSlide}
                    />
                  ) : (
                    <Box
                      bg="white"
                      p="16px"
                      borderRadius="12px"
                      border={`1px solid ${colors.primary[5]}`}
                    >
                      <React.Suspense fallback={<Box p="20px">Loading editor...</Box>}>
                        <Editor
                          value={currentSlide as string}
                          placeholder="Your lesson content goes in here..."
                          onChange={handleUpdateLegacyContent}
                        />
                      </React.Suspense>
                    </Box>
                  )}
                </Box>

                {/* STICKY LIVE PREVIEW */}
                <Box
                  w={{ base: "100%", xl: "52%" }}
                  minW="0"
                  position={{ base: "relative", xl: "sticky" }}
                  top={{ xl: "20px" }}
                  alignSelf="flex-start"
                >
                  <Flex justify="space-between" align="center" mb="10px">
                    <Text fontSize="15px" fontWeight="600" color="black.40">
                      Live Presentation Preview
                    </Text>
                    <Text fontSize="12px" color="black.30">
                      16:9 aspect ratio
                    </Text>
                  </Flex>

                  {/* 16:9 Slide Canvas */}
                  <Box
                    w="100%"
                    borderRadius="12px"
                    overflow="hidden"
                    boxShadow="md"
                    border={`1px solid ${colors.primary[10]}`}
                    position="relative"
                    pb="56.25%"
                    h="0"
                    bg="#f8f9fa"
                  >
                    <Box position="absolute" inset="0">
                      <SlideRenderer item={currentSlide} style={slideStyle} />
                    </Box>
                  </Box>

                  {/* Speaker Prompter Notes Callout */}
                  {isStructured && (currentSlide as Slide).speakerNotes && (
                    <Box
                      mt="14px"
                      p="12px 16px"
                      bg={colors.primary[5] + "35"}
                      border={`1px solid ${colors.primary[5]}`}
                      borderRadius="10px"
                    >
                      <Text
                        fontSize="11px"
                        fontWeight="700"
                        color={colors.primary[50]}
                        mb="4px"
                        letterSpacing="0.5px"
                      >
                        TEACHER NOTES / NARRATION
                      </Text>
                      <Text fontSize="13px" color="black.40" lineHeight="1.5">
                        {(currentSlide as Slide).speakerNotes}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Flex>
            ) : null}
          </Box>
        </Flex>
      )}

      {/* Global Slide Design Picker */}
      <Box
        mt="28px"
        p="16px 20px"
        border={`1px solid ${colors.primary[5]}`}
        borderRadius="12px"
        bg="white"
        boxShadow="sm"
      >
        <Text fontSize="16px" fontWeight="600" mb="12px">
          Slide Theme & Typography
        </Text>
        <StylePicker
          value={slideStyle}
          onChange={(next) =>
            updateCreateLessonFormValues({ slideStyle: next })
          }
        />
      </Box>

      {/* Bottom Step Actions */}
      <Box position="relative" mt="20px">
        {isTooltipActive && (
          <Box
            position="absolute"
            top="-60px"
            right="10px"
            bg="#eee"
            p="7px"
            borderRadius="4px"
            maxW="200px"
          >
            <Text fontSize="12px">Slides should be at least two,</Text>
            <Text fontSize="12px">use scroll template for one content</Text>
          </Box>
        )}

        {renderActions}
      </Box>
    </>
  );
};

export default SlideLessonContent;
