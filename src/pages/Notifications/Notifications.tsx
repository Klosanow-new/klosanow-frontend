import { Box, List, Text, Center } from "@chakra-ui/react";
import "../../styles/Notifications.scss";
import NotificationItem from "../../components/NotificationItem/NotificationItem";
import Header from "../../components/Header/Header";
import useLiveNotifications from "src/hooks/useLiveNotifications";

export const sampleNotifications: any[] = [];

export default function Notifications() {
  const { notifications } = useLiveNotifications();

  return (
    <Box>
      <Header pageName="Notification" />
      <Box px="4" py="2">
        {notifications.length === 0 ? (
          <Center height="200px">
            <Text color="gray.500" fontSize="md">
              No notifications yet.
            </Text>
          </Center>
        ) : (
          <List>
            {notifications.map((notificationItem, index) => (
              <NotificationItem key={index} notificationItem={notificationItem} />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
