import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useToast,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { capitalize, uniqueId } from "lodash";

import { EmptyState } from "src/components";
import { Lesson, LessonType } from "src/types";
import { LessonCard, LessonDetailFlyout } from "src/components";
import {
  deleteLesson,
  fetchLessons,
  fetchSavedLessons,
  unsaveLesson,
} from "src/api-endpoints/lessons";
import { useStoreDispatch, useStoreSelector } from "src/redux/hooks";
import { createLessonPagePath, studyChatPagePath } from "src/data/pageUrl";
import { CaretDownIcon } from "src/assets/svgs";
import WatchLessonModal from "../../modals/WatchLessonModal";
import OverlayLoader from "src/components/OverlayLoader";

interface AllLessonsState {
  type: LessonType;
  showModal: boolean;
  activeLesson: Lesson | null;
  showFlyout: boolean;
  loading: boolean;
  actonType: "delete" | "share" | null;
}

const AllLessons: React.FC = () => {
  const toast = useToast();
  const dispatch = useStoreDispatch();
  const lessons = useStoreSelector((state) => state.lessons["lessons"]);
  const savedLessons = useStoreSelector(
    (state) => state.lessons["savedLessons"]
  );

  const initialState: AllLessonsState = {
    type: LessonType.Created,
    showModal: false,
    activeLesson: null,
    showFlyout: false,
    loading: false,
    actonType: null,
  };

  const [state, setState] = React.useState(initialState);
  const [lessonToDelete, setLessonToDelete] = React.useState<Lesson | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const promptDeleteLesson = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    onOpen();
  };

  const handleStateUpdate = (newState: Partial<AllLessonsState>) =>
    setState((state) => ({ ...state, ...newState }));

  const isSavedView = state.type === LessonType.Saved;

  const lessonData = {
    [LessonType.Created]: [...(lessons.data || [])].reverse(),
    [LessonType.Saved]: [...(savedLessons.data || [])].reverse(),
  }[state.type];

  const lessonText =
    state.type === LessonType.Created ? LessonType.Saved : LessonType.Created;

  const handleDelete = async (id: string) => {
    handleStateUpdate({ loading: true, actonType: "delete" });

    try {
      const res = isSavedView ? await unsaveLesson(id) : await deleteLesson(id);

      if (!res)
        throw new Error(
          isSavedView ? "Unable to remove lesson" : "Unable to delete lesson"
        );
      handleStateUpdate({ loading: false, actonType: null });
      toast({
        title: isSavedView
          ? "Lesson removed successfully"
          : "Lesson deleted succesfully",
        duration: 3000,
        position: "top-right",
        status: "success",
      });
      dispatch(isSavedView ? fetchSavedLessons() : fetchLessons());
    } catch (error) {
      handleStateUpdate({ loading: false, actonType: null });
      toast({
        title: "Something went wrong",
        description: "Try again later",
        duration: 3000,
        position: "top-right",
        status: "error",
      });
    }
  };

  useQuery({
    queryKey: ["lessons"],
    queryFn: () => dispatch(fetchLessons()),
  });

  useQuery({
    queryKey: ["savedLessons"],
    queryFn: () => dispatch(fetchSavedLessons()),
  });

  return (
    <Box p={["10px 16px 100px", "24px 30px"]}>
      <OverlayLoader
        loading={state.loading}
        description={
          state.actonType === "delete"
            ? isSavedView
              ? "Removing lesson"
              : "Deleting lesson"
            : "Sharing lesson"
        }
      />
      <Flex
        align="center"
        mb={{
          base: "56px",
          md: "70px",
        }}>
        <Text
          fontSize={{
            base: "24px",
          }}
          fontWeight="500">
          {capitalize(state.type)} lessons
        </Text>

        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="lesson"
              icon={<CaretDownIcon />}
              bg="transparent"
              _hover={{ bg: "transparent" }}
            />
          </PopoverTrigger>
          <PopoverContent w="max-content">
            <Box
              as="button"
              onClick={() => handleStateUpdate({ type: lessonText })}
              padding="12px 24px"
              _hover={{
                bg: "#eee",
              }}>
              {capitalize(lessonText)} lessons
            </Box>
          </PopoverContent>
        </Popover>
      </Flex>

      <Box>
        {lessonData.length === 0 ? (
          isSavedView ? (
            <EmptyState
              title="saved lesson"
              link={studyChatPagePath}
              description="Lessons shared with you in Study Chat will show up here once you save them."
            />
          ) : (
            <EmptyState title="lesson" link={createLessonPagePath} />
          )
        ) : (
          <Flex
            justify={{
              base: "center",
              md: "flex-start",
            }}
            align="center"
            flexWrap="wrap"
            gap="24px">
            {lessonData.map((lesson) => (
              <LessonCard
                lesson={lesson}
                key={uniqueId(`lesson_${lesson._id}`)}
                handleWatch={(activeLesson) =>
                  handleStateUpdate({ showModal: true, activeLesson })
                }
                handleView={(activeLesson) =>
                  handleStateUpdate({ showFlyout: true, activeLesson })
                }
                hasOptions
                deleteLabel={isSavedView ? "Remove" : undefined}
                handleDelete={promptDeleteLesson}
              />
            ))}
          </Flex>
        )}
      </Box>

      <WatchLessonModal
        show={state.showModal}
        handleClose={() => handleStateUpdate({ showModal: false })}
        lesson={state.activeLesson}
      />

      <LessonDetailFlyout
        show={state.showFlyout}
        handleClose={() => handleStateUpdate({ showFlyout: false })}
        lesson={state.activeLesson}
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {isSavedView ? "Remove Lesson" : "Delete Lesson"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {isSavedView
                ? "Remove this lesson from your saved lessons? You can save it again from the chat it was shared in."
                : "Are you sure you want to delete this lesson? This action cannot be undone."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                No
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (lessonToDelete?._id) {
                    handleDelete(lessonToDelete._id);
                    onClose();
                    setLessonToDelete(null);
                  }
                }}
                ml={3}>
                {isSavedView ? "Yes, remove" : "Yes, delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AllLessons;
