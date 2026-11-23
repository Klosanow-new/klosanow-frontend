import React from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
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
import { useSearchParams } from "react-router-dom";

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
import WatchLessonModal from "../../modals/WatchLessonModal";
import OverlayLoader from "src/components/OverlayLoader";
import { Search } from "src/components/Search/Search";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim();
  const normalizedQuery = searchQuery.toLowerCase();
  const lessons = useStoreSelector((state) => state.lessons["lessons"]);
  const savedLessons = useStoreSelector(
    (state) => state.lessons["savedLessons"]
  );

  const initialState: AllLessonsState = {
    type:
      searchParams.get("type") === LessonType.Saved
        ? LessonType.Saved
        : LessonType.Created,
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
  }[state.type].filter((lesson) =>
    !normalizedQuery ||
    [lesson.title, lesson.about, lesson.tag, lesson.tutor_name, lesson.user?.name]
      .some((value) => value?.toLowerCase().includes(normalizedQuery))
  );

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
          : "Lesson deleted successfully",
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
    <Box
      w="full"
      maxW="1280px"
      mx="auto"
      px={{ base: "4", md: "6", xl: "8" }}
      py={{ base: "5", md: "8" }}>
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
      <Box display={{ base: "block", md: "none" }}>
        <Search mb={5} onPage />
      </Box>
      <Flex
        align={{ base: "flex-start", sm: "center" }}
        justify="space-between"
        direction={{ base: "column", sm: "row" }}
        gap="4"
        mb={{ base: "6", md: "8" }}>
        <Box>
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }}>
            {isSavedView ? "Saved lessons" : "My lessons"}
          </Heading>
          <Text color="ink.500" fontSize="sm" mt="1">
            {lessonData.length}{" "}
            {lessonData.length === 1 ? "lesson" : "lessons"}
            {searchQuery ? ` matching “${searchQuery}”` : ""}
          </Text>
        </Box>
        <Flex role="tablist" bg="ink.100" p="1" borderRadius="full" gap="1">
          {[
            { label: "My lessons", type: LessonType.Created },
            { label: "Saved", type: LessonType.Saved },
          ].map((tab) => {
            const selected = state.type === tab.type;
            return (
              <Box
                as="button"
                type="button"
                role="tab"
                aria-selected={selected}
                key={tab.type}
                onClick={() => {
                  handleStateUpdate({ type: tab.type });
                  const params = new URLSearchParams(searchParams);
                  if (tab.type === LessonType.Saved) params.set("type", "saved");
                  else params.delete("type");
                  setSearchParams(params, { replace: true });
                }}
                px="4"
                py="1.5"
                borderRadius="full"
                fontSize="sm"
                fontWeight={selected ? 700 : 500}
                color={selected ? "ink.900" : "ink.500"}
                bg={selected ? "white" : "transparent"}
                boxShadow={selected ? "sm" : "none"}>
                {tab.label}
              </Box>
            );
          })}
        </Flex>
      </Flex>

      <Box>
        {lessonData.length === 0 ? (
          searchQuery ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="xl" fontWeight="500" role="status">
                No matching lessons
              </Text>
              <Text mt={2}>
                No {state.type} lessons match &quot;{searchQuery}&quot;. Try a
                different search or switch lesson lists.
              </Text>
              <Button
                mt={4}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("q");
                  setSearchParams(params, { replace: true });
                }}>
                Clear search
              </Button>
            </Box>
          ) : isSavedView ? (
            <EmptyState
              title="saved lesson"
              link={studyChatPagePath}
              description="Lessons shared with you in Study Chat will show up here once you save them."
            />
          ) : (
            <EmptyState title="lesson" link={createLessonPagePath} />
          )
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing="5">
            {lessonData.map((lesson) => (
              <LessonCard
                lesson={lesson}
                key={lesson._id}
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
          </SimpleGrid>
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
