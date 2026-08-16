import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  List,
} from "@chakra-ui/react";
import NotificationSettingItem from "../../components/NotificationSettingItem/NotificationSettingItem";
import Header from "../../components/Header/Header";
import usePushNotifications from "src/hooks/usePushNotifications";
import NotificationItem from "../../components/NotificationItem/NotificationItem";
import useLiveNotifications from "src/hooks/useLiveNotifications";

interface NotificationSettingsProps {
  hideHeader?: boolean;
}

export default function NotificationSettings({
  hideHeader = false,
}: NotificationSettingsProps) {
  const settings = [
    { name: "General" },
    { name: "Channels" },
    { name: "Study Chats" },
    { name: "Subscriptions" },
  ];

  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const { notifications } = useLiveNotifications();

  return (
    <Box maxW="720px" m="0 auto" px="4">
      {!hideHeader && <Header pageName="Notifications" />}

      {/* Web Push Notification Prototype Card */}
      <Box
        mt="6"
        p="6"
        borderRadius="xl"
        bg="white"
        boxShadow="0 4px 20px rgba(0,0,0,0.05)"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex justify="space-between" align="center" mb="4">
          <Box>
            <Heading size="md" color="purple.800">
              Push Notifications
            </Heading>
            <Text fontSize="sm" color="gray.500" mt="1">
              Receive background messages even when the app is closed.
            </Text>
          </Box>
          <Badge
            colorScheme={isSupported ? "green" : "red"}
            px="3"
            py="1"
            borderRadius="full"
          >
            {isSupported ? "Supported" : "Unsupported"}
          </Badge>
        </Flex>

        {isSupported && (
          <Box mt="4">
            <Flex gap="4" mb="4" wrap="wrap">
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                >
                  Status
                </Text>
                <Badge colorScheme={isSubscribed ? "green" : "gray"} mt="1">
                  {isSubscribed ? "Subscribed" : "Not Active"}
                </Badge>
              </Box>
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                >
                  Permission
                </Text>
                <Badge
                  colorScheme={
                    permission === "granted"
                      ? "green"
                      : permission === "denied"
                        ? "red"
                        : "yellow"
                  }
                  mt="1"
                >
                  {permission}
                </Badge>
              </Box>
            </Flex>

            {error && (
              <Text color="red.500" fontSize="sm" mb="4" fontWeight="semibold">
                ⚠️ {error}
              </Text>
            )}

            <Flex gap="3">
              {!isSubscribed ? (
                <Button
                  colorScheme="purple"
                  onClick={subscribe}
                  isLoading={loading}
                  loadingText="Subscribing"
                  size="sm"
                  borderRadius="lg"
                  shadow="sm"
                  _hover={{ shadow: "md" }}
                >
                  Enable Push Notifications
                </Button>
              ) : (
                <Button
                  variant="outline"
                  colorScheme="red"
                  onClick={unsubscribe}
                  isLoading={loading}
                  size="sm"
                  borderRadius="lg"
                >
                  Disable Push Notifications
                </Button>
              )}
            </Flex>
          </Box>
        )}
      </Box>

      <Box paddingTop="20px">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb="2">
          Notification Preferences
        </Text>
        {settings?.map((item) => (
          <NotificationSettingItem key={item.name} name={item.name} />
        ))}
      </Box>

      <Box paddingTop="30px" pb="10">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb="4">
          Recent Notifications
        </Text>
        <List spacing="1">
          {notifications.map((notificationItem, index) => (
            <NotificationItem key={index} notificationItem={notificationItem} />
          ))}
        </List>
      </Box>
    </Box>
  );
}
