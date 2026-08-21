import React from "react";
import {
  Flex,
  Button,
  IconButton,
  Text,
  Box,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { AiFillDelete } from "react-icons/ai";
import {
  CreateLessonFormStepsType,
  Slide,
  SlideItem,
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
import SlideRenderer from "../../slides/SlideRenderer";
import { encodeContent } from "../../slides/slideCodec";
import { LAYOUT_LABELS } from "../../slides/limits";

interface LessonDescriptionState {
  index: number;
  value: string;
  slideDraft: Slide | null;
  isEditing: boolean;
  content: Array<SlideItem>;
  showTooltip: boolean;
  loading: boolean;
}

const Editor = React.lazy(() => import("./Editor"));

const SlideLessonContent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    draft_id,
    template,
    form_info,
    content,
    slideStyle,
    updateCreateLessonFormValues,
  } = React.useContext(CreateLessonFormContext);

  const intialState: LessonDescriptionState = {
    index: content.length || 0,
    value: "",
    slideDraft: null,
    isEditing: false,
    content: content || [],
    showTooltip: false,
    loading: false,
  };
  const [state, setState] = React.useState(intialState);

  const handleStateUpdate = (newState: Partial<LessonDescriptionState>) =>
    setState((state) => ({ ...state, ...newState }));

  const handleProceed = () =>
    updateCreateLessonFormValues({
      activeStep: CreateLessonFormStepsType.Record,
      content: state.content,
    });

  const handleAddSlide = () => {
    if (!state.value) return;

    handleStateUpdate({
      index: state.content.length + 1,
      content: [...state.content, state.value],
      value: "",
      isEditing: false,
    });
  };

  const handleUpdateSlide = () => {
    const replacement: SlideItem | null = state.slideDraft ?? state.value ?? null;
    if (!replacement) return;

    handleStateUpdate({
      index: state.content.length,
      content: state.content.map((item, index) =>
        state.index === index ? replacement : item
      ),
      value: "",
      slideDraft: null,
      isEditing: false,
    });
  };

  const handleCancelEdit = () =>
    handleStateUpdate({
      value: "",
      slideDraft: null,
      isEditing: false,
      index: state.content.length,
    });

  const handleRemove = (index: number) => {
    handleStateUpdate({
      content: state.content.filter((_, ix) => ix !== index),
      ...(state.index === index
        ? { value: "", slideDraft: null, isEditing: false }
        : {}),
    });
  };

  const handleSelect = (item: SlideItem, index: number) =>
    handleStateUpdate({
      index,
      isEditing: true,
      slideDraft: isStructuredSlide(item) ? item : null,
      value: isStructuredSlide(item) ? "" : item,
    });

  const handleGenerated = (generated: Slide[]) => {
    const offset = state.content.length;
    const withIds = generated.map((slide, i) => ({
      ...slide,
      id: `g${offset + i + 1}`,
    }));

    handleStateUpdate({
      content: [...state.content, ...withIds],
      index: offset + withIds.length,
      value: "",
      slideDraft: null,
      isEditing: false,
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
        }),
      handleProceed,
      handleTooltip: (showTooltip) => handleStateUpdate({ showTooltip }),
    },
    state.content.length <= 1
  );

  const isTooltipActive = state.showTooltip && state.content.length <= 1;
  const editingSlide = state.slideDraft;

  return (
    <>
      <OverlayLoader loading={state.loading} description="Processing draft" />
      <Text fontSize="32px" fontWeight="500" mb="16px">
        Create your lessons
      </Text>

      <Box mb="20px">
        <DocumentUpload
          onGenerated={handleGenerated}
          subject={form_info.title}
        />
      </Box>

      <Text fontSize="20px" mb="8px">
        {editingSlide
          ? `Editing slide ${state.index + 1}`
          : `Slide ${state.index < 10 ? "0" : ""}${state.index + 1}`}
      </Text>

      <Flex
        gap="24px"
        flexDir={{
          base: "column-reverse",
          md: "row",
        }}
      >
        {editingSlide ? (
          <Flex flexDir="column" gap="12px" flex="1" minW="0">
            <SlotEditor
              slide={editingSlide}
              onChange={(next) => handleStateUpdate({ slideDraft: next })}
            />
            <Box>
              <Text fontSize="13px" fontWeight="600" color="black.30" mb="6px">
                Preview
              </Text>
              <Box w="100%" h="0" pb="56.25%" position="relative">
                <Box position="absolute" inset="0">
                  <SlideRenderer item={editingSlide} style={slideStyle} />
                </Box>
              </Box>
            </Box>
          </Flex>
        ) : (
          <Editor
            value={state.value}
            placeholder="Your lesson content goes in here..."
            onChange={(value) => handleStateUpdate({ value })}
          />
        )}

        <Flex flexDir="column" gap="16px" w="100%" maxW="220px">
          <Button
            onClick={() =>
              state.isEditing ? handleUpdateSlide() : handleAddSlide()
            }
            w="100%"
            isDisabled={state.isEditing ? !editingSlide && !state.value : !state.value}
            _disabled={{ cursor: "not-allowed" }}
          >
            {state.isEditing ? "Update" : "Add"} Slide
          </Button>

          {state.isEditing && (
            <Button
              w="100%"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          )}

          {state.content.length >= 1 && (
            <Flex flexDir="column" gap="10px">
              {state.content.map((item, index) => {
                const structured = isStructuredSlide(item);
                const active = state.isEditing && state.index === index;

                return (
                  <Flex
                    cursor="pointer"
                    key={`slide-${index}`}
                    onClick={() => handleSelect(item, index)}
                    border={`1px solid ${
                      active ? colors.primary[50] : colors.primary[5]
                    }`}
                    bg={active ? colors.primary[5] : "transparent"}
                    borderRadius="8px"
                    padding="8px 12px"
                    align="center"
                    justify="space-between"
                    gap="6px"
                  >
                    <Box minW="0">
                      <Text fontSize="14px">
                        Slide {index < 10 ? "0" : ""}
                        {index + 1}
                      </Text>
                      {structured && (
                        <Text
                          fontSize="11px"
                          color="black.30"
                          noOfLines={1}
                          title={item.title}
                        >
                          {item.title}
                        </Text>
                      )}
                    </Box>

                    <Flex align="center" gap="2px" flexShrink={0}>
                      {structured ? (
                        <Badge
                          fontSize="9px"
                          colorScheme="purple"
                          textTransform="none"
                        >
                          {LAYOUT_LABELS[item.layout]}
                        </Badge>
                      ) : (
                        <Badge fontSize="9px" textTransform="none">
                          Text
                        </Badge>
                      )}

                      <IconButton
                        aria-label="delete"
                        size="sm"
                        bg="transparent"
                        _hover={{ bg: "transparent" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        icon={<AiFillDelete />}
                      />
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </Flex>
      </Flex>

      <Box
        mt="24px"
        p="16px 20px"
        border={`1px solid ${colors.primary[5]}`}
        borderRadius="12px"
      >
        <Text fontSize="16px" fontWeight="500" mb="12px">
          Slide design
        </Text>
        <StylePicker
          value={slideStyle}
          onChange={(next) =>
            updateCreateLessonFormValues({ slideStyle: next })
          }
        />
      </Box>

      <Box position={"relative"}>
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
