import React from "react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Lesson } from "src/types";
import { VideoPlayer } from "src/components";

interface WatchLessonModalProps {
  show: boolean;
  handleClose: () => void;
  lesson: Lesson | null;
}
const WatchLessonModal: React.FC<WatchLessonModalProps> = ({
  show,
  handleClose,
  lesson,
}) => {
  return (
    <Modal isOpen={show} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent
        maxW={{
          base: "400px",
          md: "600px",
          lg: "900px",
        }}
      >
        <ModalHeader>{lesson?.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box w="100%" h="max-content">
            {lesson?.videoUrl && (
              <VideoPlayer
                src={lesson.videoUrl}
                poster={lesson.thumbnailUrl}
              />
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Box>
            <Text fontSize="14px">{lesson?.about}</Text>
            <Text fontSize="14px" mt="8px" fontWeight="500">
              {lesson?.tutor_name}
            </Text>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WatchLessonModal;
