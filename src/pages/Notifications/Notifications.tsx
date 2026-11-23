import { Box, Circle, Flex, Heading, Icon, List, Text } from "@chakra-ui/react";
import { HiOutlineBellSlash } from "react-icons/hi2";
import "../../styles/Notifications.scss";
import NotificationItem from "../../components/NotificationItem/NotificationItem";
import Header from "../../components/Header/Header";
import useLiveNotifications from "src/hooks/useLiveNotifications";

export const sampleNotifications: any[] = [];

export default function Notifications() {
  const { notifications } = useLiveNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <Box
      w="full"
      maxW="820px"
      mx="auto"
      px={{ base: "4", md: "6", xl: "8" }}
      py={{ base: "4", md: "8" }}
    >
      <Header pageName="Notifications" />
      <Flex
        display={{ base: "none", md: "flex" }}
        align="baseline"
        justify="space-between"
        mb="6"
      >
        <Heading as="h1" fontSize="3xl">
          Notifications
        </Heading>
        {unread > 0 && (
          <Text fontSize="sm" fontWeight={600} color="brand.600">
            {unread} unread
          </Text>
        )}
      </Flex>

      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="ink.100"
        boxShadow="card"
        overflow="hidden"
      >
        {notifications.length === 0 ? (
          <Flex direction="column" align="center" textAlign="center" py="16" px="6">
            <Circle size="72px" bg="brand.50" color="brand.500" mb="4">
              <Icon as={HiOutlineBellSlash} boxSize={8} />
            </Circle>
            <Text fontWeight={700} fontSize="lg" color="ink.900">
              You&apos;re all caught up
            </Text>
            <Text color="ink.500" fontSize="sm" mt="1" maxW="320px">
              New messages and lesson activity will show up here.
            </Text>
          </Flex>
        ) : (
          <List px={{ base: 2, md: 4 }} py="2">
            {notifications.map((notificationItem, index) => (
              <NotificationItem
                key={(notificationItem as { _id?: string })._id || index}
                notificationItem={notificationItem}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
