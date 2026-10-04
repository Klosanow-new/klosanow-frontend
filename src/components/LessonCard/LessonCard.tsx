import React from "react";
import {
  Box,
  Text,
  Image,
  Button,
  Popover,
  PopoverTrigger,
  IconButton,
  PopoverContent,
  useToast,
} from "@chakra-ui/react";
import { Lesson } from "../../types";
import { capitalize } from "lodash";
import { OptionWhiteIcon } from "../../assets/svgs";
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
  width?: "sm" | "lg";
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  hasOptions,
  hasDescription = true,
  descriptionLength,
  hasWatch = true,
  handleWatch,
  handleDelete,
  handleView,
  deleteLabel,
  width,
}) => {
  const toast = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const {
    thumbnailUrl,
    title,
    about: description,
    tutor_name,
    videoUrl,
  } = lesson;

  // A lesson saved from chat may only carry the populated author.
  const author = tutor_name || lesson.user?.name;
  const [duration, setDuration] = React.useState("");

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!Number.isFinite(video.duration)) return;

    setDuration(formatDuration(video.duration));
  };

  const cardWidth = {
    sm: "299px",
    lg: "354px",
  }[width || "lg"];

  React.useEffect(() => {
    return () => {
      setDuration("");
    };
  }, []);

  return (
    <Box
      width="100%"
      minW={{
        base: "280px",
        sm: "299px",
      }}
      maxW={{
        base: "350px",
        lg: "330px",
        xl: cardWidth,
      }}
      border={"1px solid #eee"}
      borderRadius={12}
      overflow={"hidden"}
      onClick={() => (hasWatch ? () => null : handleWatch(lesson))}>
      <Box position="relative">
        <Image
          width="full"
          height="196px"
          objectFit="cover"
          src={thumbnailUrl}
          fallbackSrc={thumbnailPlaceholder}
          alt={title}
          borderRadius="xl"
          bg="#eee"
          borderBottom={"1px solid #eee"}
        />
        <video
          src={videoUrl}
          ref={videoRef}
          hidden
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
        />

        {hasOptions && (
          <Box position="absolute" top="8px" right="7px">
            <Popover placement="bottom">
              <PopoverTrigger>
                <IconButton
                  aria-label="lesson-option"
                  icon={<OptionWhiteIcon />}
                  bg="transparent"
                  w="max-content"
                  _hover={{
                    bg: "transparent",
                  }}
                />
              </PopoverTrigger>
              <PopoverContent w="max-content" overflow="hidden">
                <Box
                  as="button"
                  fontSize="12px"
                  padding="4px 6px"
                  onClick={() =>
                    copyText(shareableLessonUrl(lesson._id), () => {
                      toast({
                        title: `${lesson.title} copied`,
                        description: "Lesson ready to share",
                        colorScheme: "purple",
                        variant: "subtle",
                      });
                    })
                  }
                  _hover={{
                    bg: "#eee",
                  }}>
                  Share
                </Box>
                <Box
                  as="button"
                  fontSize="12px"
                  padding="4px 6px"
                  onClick={() => handleView && handleView(lesson)}
                  _hover={{
                    bg: "#eee",
                  }}>
                  View
                </Box>
                <Box
                  as="button"
                  fontSize="12px"
                  padding="4px 6px"
                  marginTop={"8px"}
                  color="red"
                  onClick={() => handleDelete && handleDelete(lesson)}
                  _hover={{
                    bg: "red",
                    color: "white",
                  }}>
                  {deleteLabel || "Delete"}
                </Box>
              </PopoverContent>
            </Popover>
          </Box>
        )}

        {duration && (
          <Text
            fontSize="12px"
            background="primary.50"
            color="#fff"
            position="absolute"
            bottom="8px"
            right="7px"
            padding="1px 8px"
            borderRadius="4px">
            {duration}
          </Text>
        )}
      </Box>

      <Box padding="8px 4px " width="full">
        <Text fontSize={16} fontWeight="500" color="#000" mb="4px">
          {capitalize(title)}
        </Text>

        {hasDescription && (
          <Text fontSize={[12, 14]} color="black.30">
            {description.substring(0, descriptionLength || 130)}
            {description.length > (descriptionLength || 130) ? "..." : ""}{" "}
            <Text as="span" color="black.40" fontWeight="500">
              {author}
            </Text>
          </Text>
        )}

        {hasWatch && (
          <Button
            mt="8px"
            bg="primary.50"
            color="#fff"
            fontWeight="400"
            fontSize="16px"
            padding="18px 24px"
            _hover={{
              opacity: 0.8,
            }}
            onClick={() => handleWatch(lesson)}>
            Watch now
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default LessonCard;
