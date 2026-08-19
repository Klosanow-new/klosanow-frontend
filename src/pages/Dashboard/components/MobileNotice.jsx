import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

const STORAGE_KEY = "mobileNoticeShown";

function MobileNoticeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Detect if device is mobile
  useEffect(() => {
    // ?mobileNotice=1 forces the modal open on any device, so it can be
    // re-tested without clearing sessionStorage.
    const forced = new URLSearchParams(window.location.search).has(
      "mobileNotice"
    );
    if (forced) {
      onOpen();
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY);

    if (isMobile && !alreadyShown) {
      onOpen();
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
  }, [onOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      // "inside" keeps the header and footer pinned, so the close button and
      // the Got it button stay on screen even if the text has to scroll.
      scrollBehavior="inside"
      size={{ base: "sm", md: "md" }}
    >
      <ModalOverlay />
      <ModalContent
        rounded="xl"
        p={2}
        containerProps={{
          // iOS Safari resolves Chakra's default -webkit-fill-available to the
          // height *with* the URL bar hidden, so the centred modal ends up
          // partly outside the visible viewport. dvh tracks the real one.
          sx: {
            height: "100vh",
            "@supports (height: 100dvh)": { height: "100dvh" },
          },
          px: 4,
          pt: "max(1rem, env(safe-area-inset-top))",
          pb: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <ModalHeader fontSize="lg" pr={14}>
          Hi 👋
        </ModalHeader>
        <ModalCloseButton size="lg" top={3} insetEnd={3} minW={11} h={11} />
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
        <ModalFooter>
          <Button
            onClick={onClose}
            backgroundColor="rgba(123, 88, 244, 1)"
            color="white"
            fontSize={16}
            fontWeight="normal"
            width="100%"
            h={12}
            _hover={{
              bg: "white",
              borderColor: "rgba(123, 88, 244, 1)",
              borderWidth: "1px",
              color: "rgba(123, 88, 244, 1)",
            }}
          >
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MobileNoticeModal;
