import React from "react";
import { Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { MdPlayArrow } from "react-icons/md";
import { colors } from "src/data/colors";
import DummyFileIllustration from "../../assets/images/file.png";

/**
 * `lesson` is a link to one of our own lessons rather than an uploaded file, and
 * is rendered by ChatLessonPreview — it never reaches this component.
 *
 * `media` is a webm/ogg/mp4/mkv url whose name carries no hint of which track it
 * holds; this component resolves it to `audio` or `video` from the file itself.
 */
export type ChatMediaType =
  | "video"
  | "audio"
  | "image"
  | "doc"
  | "lesson"
  | "media"
  | "other";

interface ChatMediaPreviewProps {
  url: string;
  type: ChatMediaType;
  /**
   * Opens the full-size viewer for images and video. Receives the resolved type
   * so the caller can pick a viewer without re-deriving it from the url.
   */
  handleView?: (type: ChatMediaType) => void;
}

/** Every attachment in a chat bubble is capped at this height. */
export const PREVIEW_MAX_HEIGHT = "156px";

/**
 * A voice note is far more common in a chat than a webm screen recording, so an
 * undecided container ends up as audio. Playing a video's soundtrack is a much
 * milder failure than the silent black rectangle a video element shows for a
 * file with no video track — and on iOS `loadedmetadata` is the one event we
 * cannot count on firing for a format Safari would rather not preload.
 */
const PROBE_TIMEOUT_MS = 5000;
const PROBE_FALLBACK = "audio" as const;

/**
 * One chat attachment. Media that fails to load is called out rather than left
 * as a black rectangle — an object deleted or overwritten in storage is exactly
 * what "the video is corrupted" looks like from inside a chat.
 */
const ChatMediaPreview: React.FC<ChatMediaPreviewProps> = ({
  url,
  type,
  handleView,
}) => {
  const [failed, setFailed] = React.useState(false);
  const [probed, setProbed] = React.useState<"audio" | "video" | null>(null);

  // `media` means the url could not say which track the container holds. Every
  // other type is already decided by the time it gets here.
  const resolved = type === "media" ? probed : type;

  React.useEffect(() => {
    if (type !== "media" || probed) return;

    const timeout = setTimeout(() => setProbed(PROBE_FALLBACK), PROBE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [type, probed]);

  const absoluteUrl = url.startsWith("http") ? url : `https://${url}`;

  if (failed) {
    return (
      <Box
        bg="orange.50"
        border="1px solid"
        borderColor="orange.200"
        borderRadius="8px"
        p="8px 10px"
      >
        <Text fontSize="12px" color="orange.800">
          This file is no longer available.
        </Text>
        <Link
          href={absoluteUrl}
          isExternal
          fontSize="12px"
          textDecoration="underline"
          color="orange.800"
        >
          Try opening it directly
        </Link>
      </Box>
    );
  }

  /**
   * Metadata alone carries the track list, so a video element with
   * `preload="metadata"` answers the question without fetching the media: a
   * file with no video track reports a 0-wide frame. The bytes it does pull are
   * cached, so the audio or video element that replaces it re-uses them.
   */
  if (resolved === null) {
    return (
      <Box h="50px" display="flex" alignItems="center">
        <video
          src={url}
          preload="metadata"
          muted
          playsInline
          onLoadedMetadata={(e) =>
            setProbed(e.currentTarget.videoWidth > 0 ? "video" : "audio")
          }
          onError={() => setFailed(true)}
          style={{ width: "1px", height: "1px", opacity: 0 }}
        />
        <Spinner size="sm" color={colors.primary[10]} />
      </Box>
    );
  }

  if (resolved === "image") {
    return (
      <Box
        bg="#eee"
        borderRadius="8px"
        cursor={handleView ? "pointer" : "default"}
        onClick={() => handleView && handleView("image")}
      >
        <Image
          src={url}
          w="100%"
          h="100%"
          maxH={PREVIEW_MAX_HEIGHT}
          borderRadius="8px"
          objectFit="contain"
          opacity="0.85"
          onError={() => setFailed(true)}
        />
      </Box>
    );
  }

  if (type === "audio") {
    return (
      <Box h="50px">
        <audio
          src={url}
          style={{ width: "100%", height: "100%" }}
          controls
          onError={() => setFailed(true)}
        />
      </Box>
    );
  }

  if (type === "video") {
    return (
      <Box
        position="relative"
        borderRadius="8px"
        overflow="hidden"
        bg="#000"
        cursor="pointer"
        onClick={() => handleView && handleView("video")}
      >
        {/*
          There is no poster for chat attachments, so the video element is the
          thumbnail. The #t fragment makes the browser decode a frame slightly
          in rather than leaving the box black.
        */}
        <video
          src={`${url}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            maxHeight: PREVIEW_MAX_HEIGHT,
            display: "block",
            pointerEvents: "none",
          }}
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
      </Box>
    );
  }

  if (type === "doc") {
    return (
      <Link href={absoluteUrl} isExternal>
        <Box bg={colors.neutral[60]} w="70px" borderRadius="8px">
          <Image
            src={DummyFileIllustration}
            w="100%"
            h="100%"
            borderRadius="8px"
            objectFit="contain"
          />
        </Box>
      </Link>
    );
  }

  return (
    <a href={absoluteUrl} target="_blank" rel="noopener noreferrer">
      <u>{url}</u>
    </a>
  );
};

export default ChatMediaPreview;
