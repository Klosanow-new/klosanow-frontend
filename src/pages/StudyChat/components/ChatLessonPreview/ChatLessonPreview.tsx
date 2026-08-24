import React from "react";
import {
  Box,
  Flex,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { MdPlayArrow } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { capitalize } from "lodash";

import { getLesson } from "src/api-endpoints/lessons";
import { Lesson } from "src/types";
import { VideoPlayer } from "src/components";
import thumbnailPlaceholder from "src/assets/images/thumb.jpg";
import { PREVIEW_MAX_HEIGHT } from "../ChatMediaPreview/ChatMediaPreview";

interface ChatLessonPreviewProps {
  lessonId: string;
}

/** A shared lesson never changes under the reader mid-conversation. */
const LESSON_STALE_MS = 5 * 60 * 1000;

const statusOf = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status;

/**
 * A lesson shared into a chat, playable without leaving it.
 *
 * The message text holds the lesson id, not the video url, so a file that gets
 * moved or re-encoded is fixed once in the lesson record instead of staying
 * broken in every old message that ever linked it.
 *
 * This is a UX component. It is not access control — the video url it plays is
 * public, and hiding it from the page does not change who can reach it.
 */
const ChatLessonPreview: React.FC<ChatLessonPreviewProps> = ({ lessonId }) => {
  const [playing, setPlaying] = React.useState(false);

  // Keyed by id, so the same lesson shared a dozen times in one group chat is
  // still a single request — including when ChatBody hands the same cached
  // element to two bubbles, which mounts two components against one query.
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLesson(lessonId),
    staleTime: LESSON_STALE_MS,
    // A deleted or unreachable lesson is an answer, not a failure to retry.
    retry: (count, err) => {
      const status = statusOf(err);
      return (!status || status >= 500) && count < 1;
    },
  });

  const lesson: Lesson | undefined = data?.data;

  const notice = (message: string, action?: React.ReactNode) => (
    <Box
      bg="orange.50"
      border="1px solid"
      borderColor="orange.200"
      borderRadius="8px"
      p="8px 10px"
      maxW="240px"
    >
      <Text fontSize="12px" color="orange.800">
        {message}
      </Text>
      {action}
    </Box>
  );

  if (isLoading) {
    return (
      <Skeleton h={PREVIEW_MAX_HEIGHT} w="240px" borderRadius="8px" />
    );
  }

  if (error) {
    const status = statusOf(error);

    if (status === 404) return notice("This lesson has been deleted.");
    if (status === 403 || status === 401)
      return notice("You do not have access to this lesson.");

    return notice(
      "This lesson could not be loaded.",
      <Box
        as="button"
        mt="4px"
        fontSize="12px"
        fontWeight="500"
        textDecoration="underline"
        color="orange.800"
        onClick={() => refetch()}
      >
        {isFetching ? "Retrying…" : "Try again"}
      </Box>,
    );
  }

  if (!lesson) return notice("This lesson is no longer available.");
  if (!lesson.videoUrl) return notice("This lesson has no recording yet.");

  return (
    <>
      <Box
        position="relative"
        borderRadius="8px"
        overflow="hidden"
        bg="#000"
        cursor="pointer"
        maxW="240px"
        onClick={() => setPlaying(true)}
      >
        <Image
          src={lesson.thumbnailUrl}
          fallbackSrc={thumbnailPlaceholder}
          w="100%"
          h={PREVIEW_MAX_HEIGHT}
          objectFit="cover"
          opacity="0.85"
        />

        <Flex position="absolute" inset="0" align="center" justify="center">
          <Flex
            align="center"
            justify="center"
            boxSize="40px"
            borderRadius="full"
            bg="blackAlpha.700"
            color="#fff"
            fontSize="24px"
          >
            <MdPlayArrow />
          </Flex>
        </Flex>

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          px="8px"
          pb="6px"
          pt="18px"
          bgGradient="linear(to-t, blackAlpha.800, transparent)"
        >
          <Text color="#fff" fontSize="12px" fontWeight="500" noOfLines={2}>
            {capitalize(lesson.title)}
          </Text>
          {(lesson.tutor_name || lesson.user?.name) && (
            <Text color="whiteAlpha.800" fontSize="10px" noOfLines={1}>
              {lesson.tutor_name || lesson.user?.name}
            </Text>
          )}
        </Box>
      </Box>

      <Modal
        isOpen={playing}
        onClose={() => setPlaying(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent backgroundColor="#000000c1" padding="6px">
          <ModalCloseButton color="#fff" zIndex={1} />
          <VideoPlayer
            src={lesson.videoUrl}
            poster={lesson.thumbnailUrl || thumbnailPlaceholder}
            autoPlay
            maxHeight="70vh"
            protected
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatLessonPreview;
