import React from "react";
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { capitalize } from "lodash";

import { Lesson } from "src/types";
import { getLesson } from "src/api-endpoints/lessons";
import { useStoreSelector } from "src/redux/hooks";
import { dashboardPagePath } from "src/data/pageUrl";
import { VideoPlayer } from "src/components";
import thumbnailPlaceholder from "src/assets/images/thumb.jpg";

const WatchLesson: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lessons = useStoreSelector((state) => state.lessons["lessons"]);

  // The owner following their own link already has the lesson in the store, so
  // it renders without a round trip. Anyone else has to fetch it.
  const cachedLesson = (lessons.data || []).find(
    (item: Lesson) => item._id === lessonId,
  );

  const [lesson, setLesson] = React.useState<Lesson | null>(
    cachedLesson || null,
  );
  const [loading, setLoading] = React.useState(!cachedLesson);
  const [error, setError] = React.useState("");

  const loadLesson = React.useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError("");

    try {
      const res = await getLesson(lessonId);
      const data: Lesson | undefined = res?.data;

      if (!data?.videoUrl) throw new Error("This lesson has no recording");
      setLesson(data);
    } catch (err: any) {
      setError(
        err?.response?.status === 404
          ? "This lesson no longer exists, or the link is incomplete. Ask whoever shared it to send the link again."
          : (err?.response?.data?.message ??
              err?.message ??
              "We could not load this lesson"),
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  React.useEffect(() => {
    if (cachedLesson) {
      setLesson(cachedLesson);
      setLoading(false);
      return;
    }
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, loadLesson]);

  const videoUrl = lesson?.videoUrl || "";

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh" direction="column" gap="12px">
        <Spinner color="primary.50" size="lg" />
        <Text color="black.30">Loading lesson…</Text>
      </Flex>
    );
  }

  if (error || !lesson) {
    return (
      <Flex
        align="center"
        justify="center"
        minH="60vh"
        direction="column"
        gap="16px"
        p="24px"
        textAlign="center"
      >
        <Text fontSize="18px" fontWeight="500">
          This lesson could not be opened
        </Text>
        <Text color="black.30" maxW="480px">
          {error || "This lesson could not be found"}
        </Text>
        <Flex gap="12px">
          <Button onClick={loadLesson} bg="primary.50" color="#fff" _hover={{ opacity: 0.8 }}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => navigate(dashboardPagePath)}>
            Go to dashboard
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Box p={["10px 16px 100px", "24px 30px"]} maxW="1000px" mx="auto">
      <Text fontSize={["20px", "24px"]} fontWeight="500" mb="4px">
        {capitalize(lesson.title)}
      </Text>
      <Text color="black.30" fontSize="14px" mb="16px">
        {lesson.tutor_name || lesson.user?.name}
      </Text>

      <VideoPlayer
        src={videoUrl}
        poster={lesson.thumbnailUrl || thumbnailPlaceholder}
      />

      {lesson.about && (
        <Text fontSize="14px" mt="16px" color="black.30" whiteSpace="pre-wrap">
          {lesson.about}
        </Text>
      )}

      {lesson.tutor_bio && (
        <Text fontSize="14px" mt="12px" fontWeight="500">
          {lesson.tutor_bio}
        </Text>
      )}
    </Box>
  );
};

export default WatchLesson;
