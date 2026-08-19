import { Box, Button, CloseButton, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { NotificationFillIcon } from "src/assets/svgs";
import usePushNotifications from "src/hooks/usePushNotifications";
import { getStorageItem, setStorageItem } from "src/utils/generics";
import { PUSH_PROMPT_DISMISSED_KEY } from "src/data/constants";

export default function EnablePushBanner() {
  const { isSupported, permission, loading, error, subscribe } =
    usePushNotifications();

  const [dismissed, setDismissed] = useState(
    () => !!getStorageItem<boolean>(PUSH_PROMPT_DISMISSED_KEY),
  );

  const dismiss = () => {
    setStorageItem(PUSH_PROMPT_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (!isSupported || permission !== "default" || dismissed) return null;

  return (
    <Box
      mx={{ base: "4", md: "6" }}
      mt="4"
      p="4"
      borderRadius="xl"
      bg="primary.5"
      border="1px solid"
      borderColor="primary.20"
    >
      <Flex align="flex-start" gap="3">
        <Flex
          align="center"
          justify="center"
          flexShrink="0"
          boxSize="9"
          borderRadius="lg"
          bg="primary.10"
          aria-hidden="true"
        >
          <NotificationFillIcon width="18" height="18" />
        </Flex>

        <Box flex="1">
          <Text fontWeight="semibold" color="primary.90" fontSize="sm">
            Get notified about new messages
          </Text>
          <Text fontSize="sm" color="neutral.100" mt="1">
            Turn on notifications and we'll let you know about new messages even
            when Klosanow isn't open.
          </Text>

          {error && (
            <Text fontSize="sm" color="error.50" mt="2" fontWeight="semibold">
              ⚠️ {error}
            </Text>
          )}

          <Flex gap="3" mt="3" wrap="wrap">
            <Button
              size="sm"
              colorScheme="purple"
              bg="primary.50"
              _hover={{ bg: "primary.60" }}
              borderRadius="lg"
              onClick={subscribe}
              isLoading={loading}
              loadingText="Turning on"
            >
              Turn on
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="neutral.90"
              borderRadius="lg"
              onClick={dismiss}
            >
              Not now
            </Button>
          </Flex>
        </Box>

        <CloseButton
          size="sm"
          onClick={dismiss}
          aria-label="Dismiss notification prompt"
        />
      </Flex>
    </Box>
  );
}
