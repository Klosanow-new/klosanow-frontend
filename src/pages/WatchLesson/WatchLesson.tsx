import React from "react";
import {
  Box,
  Button,
  Flex,
  Link,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { capitalize } from "lodash";

import { Lesson } from "src/types";
import { getLesson } from "src/api-endpoints/lessons";
import { useStoreSelector } from "src/redux/hooks";
import { dashboardPagePath } from "src/data/pageUrl";
import thumbnailPlaceholder from "src/assets/images/thumb.jpg";

/**
 * A url with no video extension is a legacy upload — those were stored without
 * one, so the container can only be assumed. Everything this app records is
 * WebM/VP8, so assume that unless the name says otherwise.
 */
const looksLikeWebm = (url: string) => !/\.(mp4|m4v|mov)(\?|#|$)/i.test(url);

const browserCanPlayWebm = () => {
  const probe = document.createElement("video");
  return Boolean(
    probe.canPlayType('video/webm; codecs="vp8, vorbis"') ||
      probe.canPlayType("video/webm"),
  );
};

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
  const [playbackFailed, setPlaybackFailed] = React.useState(false);

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

  // Worth saying up front rather than leaving a black player on screen: iOS
  // Safari cannot decode the VP8 WebM these lessons are recorded in.
  const codecUnsupported =
    !!videoUrl && looksLikeWebm(videoUrl) && !browserCanPlayWebm();

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

      {(codecUnsupported || playbackFailed) && (
        <Alert status="warning" borderRadius="8px" mb="16px" alignItems="flex-start">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="14px">
              This browser can&apos;t play the recording
            </AlertTitle>
            <AlertDescription fontSize="14px" display="block">
              Lessons are recorded as WebM (VP8), which Safari on iPhone and iPad
              cannot decode. Open the link in Chrome on Android or a computer, or{" "}
              <Link
                href={videoUrl}
                isExternal
                textDecoration="underline"
                fontWeight="500"
              >
                download the video file
              </Link>{" "}
              and play it in an app like VLC.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Box w="100%" bg="#000" borderRadius="8px" overflow="hidden">
        <video
          key={videoUrl}
          width="100%"
          height="100%"
          src={videoUrl}
          poster={lesson.thumbnailUrl || thumbnailPlaceholder}
          preload="metadata"
          controls
          // Without playsInline, iOS hijacks playback into fullscreen.
          playsInline
          onError={() => setPlaybackFailed(true)}
          style={{ display: "block", maxHeight: 600, width: "100%" }}
        />
      </Box>

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
