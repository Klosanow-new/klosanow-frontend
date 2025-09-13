import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

function MobileNoticeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Detect if device is mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const alreadyShown = sessionStorage.getItem("mobileNoticeShown");

    if (isMobile && !alreadyShown) {
      onOpen();
      sessionStorage.setItem("mobileNoticeShown", "true");
    }
  }, [onOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4} rounded="xl" p={2}>
        <ModalHeader fontSize="lg">Hi 👋</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Thank you for using <b>Klosanow!</b> <br />
            Please note that all features are available on the mobile version
            except <b>lesson creation</b>.
          </Text>
          <Text mt={3}>
            To create a video lesson, please use a <b>desktop</b> or{" "}
            <b>laptop</b>.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default MobileNoticeModal;
