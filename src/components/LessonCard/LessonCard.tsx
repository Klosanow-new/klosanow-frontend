import React from "react";
import {
  Box,
  Text,
  Image,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  useToast,
} from "@chakra-ui/react";
import {
  HiEllipsisHorizontal,
  HiOutlineEye,
  HiOutlineShare,
  HiOutlineTrash,
  HiPlay,
} from "react-icons/hi2";
import { Lesson } from "../../types";
import { copyText } from "src/pages/StudyChat/utils";
import { shareableLessonUrl } from "src/data/pageUrl";
import thumbnailPlaceholder from "src/assets/images/thumb.jpg";
import { formatDuration } from "src/utils/video";

interface LessonCardProps {
  lesson: Lesson;
  handleWatch: (x: Lesson) => void;
  handleDelete?: (lesson: Lesson) => void;
  handleView?: (x: Lesson) => void;
  hasOptions?: boolean;
  descriptionLength?: number;
  hasWatch?: boolean;
  hasDescription?: boolean;
  deleteLabel?: string;
  /** Kept for API compatibility; cards now fill their grid cell. */
  width?: "sm" | "lg";
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  hasOptions,
  hasDescription = true,
  descriptionLength = 120,
  hasWatch = true,
  handleWatch,
  handleDelete,
  handleView,
  deleteLabel,
}) => {
  const toast = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { thumbnailUrl, title = "Untitled lesson", videoUrl } = lesson;
  // Lessons saved from chat can arrive without an `about` field; calling
  // .substring on undefined used to crash the whole list.
  const description = lesson.about || "";
  const author = lesson.tutor_name || lesson.user?.name;
  const [duration, setDuration] = React.useState("");

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    setDuration(formatDuration(video.duration));
  };

  const shortDescription =
    description.length > descriptionLength
      ? `${description.substring(0, descriptionLength).trimEnd()}…`
      : description;

  const share = () =>
    copyText(shareableLessonUrl(lesson._id), () => {
      toast({
        title: "Link copied",
        description: `Anyone with the link can watch “${title}”.`,
        status: "success",
        duration: 3000,
      });
    });

  return (
    <Box
      role="group"
      w="full"
      bg="white"
      border="1px solid"
      borderColor="ink.100"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="card"
      transition="box-shadow 0.2s ease, transform 0.2s ease"
      _hover={{ boxShadow: "cardHover", transform: "translateY(-2px)" }}
      display="flex"
      flexDirection="column"
    >
      <Box
        position="relative"
        as="button"
        type="button"
        aria-label={`Watch ${title}`}
        onClick={() => handleWatch(lesson)}
        sx={{ aspectRatio: "16 / 9" }}
        w="full"
        bg="ink.100"
        overflow="hidden"
      >
        <Image
          w="full"
          h="full"
          objectFit="cover"
          src={thumbnailUrl}
          fallbackSrc={thumbnailPlaceholder}
          alt=""
          transition="transform 0.35s ease"
          _groupHover={{ transform: "scale(1.04)" }}
        />
        <video
          src={videoUrl}
          ref={videoRef}
          hidden
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
        />
        <Flex
          position="absolute"
          inset="0"
          align="center"
          justify="center"
          bg="blackAlpha.300"
          opacity="0"
          transition="opacity 0.2s ease"
          _groupHover={{ opacity: 1 }}
        >
          <Flex
            boxSize="52px"
            borderRadius="full"
            bg="whiteAlpha.900"
            align="center"
            justify="center"
            color="brand.600"
            boxShadow="lg"
          >
            <Icon as={HiPlay} boxSize={6} ml="2px" />
          </Flex>
        </Flex>
        {duration && (
          <Text
            position="absolute"
            bottom="2"
            right="2"
            fontSize="xs"
            fontWeight={600}
            color="white"
            bg="blackAlpha.700"
            px="2"
            py="0.5"
            borderRadius="md"
          >
            {duration}
          </Text>
        )}
      </Box>

      <Flex direction="column" flex="1" p="4" gap="1.5">
        <Flex align="flex-start" gap="2">
          <Text
            flex="1"
            fontSize="md"
            fontWeight={700}
            color="ink.900"
            noOfLines={2}
            lineHeight="1.35"
          >
            {title}
          </Text>
          {hasOptions && (
            <Menu placement="bottom-end" isLazy>
              <MenuButton
                as={IconButton}
                aria-label="Lesson options"
                icon={<Icon as={HiEllipsisHorizontal} boxSize={5} />}
                size="sm"
                variant="ghost"
                color="ink.500"
                mt="-1"
                mr="-2"
              />
              <MenuList minW="180px">
                <MenuItem
                  icon={<Icon as={HiOutlineShare} boxSize={4} />}
                  onClick={share}
                >
                  Copy share link
                </MenuItem>
                {handleView && (
                  <MenuItem
                    icon={<Icon as={HiOutlineEye} boxSize={4} />}
                    onClick={() => handleView(lesson)}
                  >
                    View details
                  </MenuItem>
                )}
                {handleDelete && (
                  <>
                    <MenuDivider />
                    <MenuItem
                      icon={<Icon as={HiOutlineTrash} boxSize={4} />}
                      color="red.500"
                      onClick={() => handleDelete(lesson)}
                    >
                      {deleteLabel || "Delete"}
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          )}
        </Flex>

        {author && (
          <Text fontSize="xs" fontWeight={600} color="brand.600">
            {author}
          </Text>
        )}

        {hasDescription && shortDescription && (
          <Text fontSize="sm" color="ink.500" noOfLines={3}>
            {shortDescription}
          </Text>
        )}

        {hasWatch && (
          <Button
            mt="auto"
            pt="0"
            alignSelf="flex-start"
            size="sm"
            variant="soft"
            leftIcon={<Icon as={HiPlay} boxSize={4} />}
            onClick={() => handleWatch(lesson)}
            sx={{ marginTop: "auto !important" }}
          >
            Watch now
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default LessonCard;
