import React from "react";
import { Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { MdPlayArrow } from "react-icons/md";
import { colors } from "src/data/colors";
import DummyFileIllustration from "../../assets/images/file.png";

/**
 * `lesson` is a link to one of our own lessons rather than an uploaded file, and
 * is rendered by ChatLessonPreview — it never reaches this component.
 */
export type ChatMediaType =
  | "video"
  | "audio"
  | "image"
  | "doc"
  | "lesson"
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

  if (type === "image") {
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
