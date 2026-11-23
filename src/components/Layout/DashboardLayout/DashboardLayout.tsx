import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { SideBar, NavBar, BottomNav, EnablePushBanner } from "../../";
import NotificationModal from "../../Modals/NotificationModal/NotificationModal";
import useLiveNotifications from "src/hooks/useLiveNotifications";
import MobileNoticeModal from "src/pages/Dashboard/components/MobileNotice";

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { notifications } = useLiveNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  // ProtectedRoute already redirects signed-out visitors. The previous
  // `if (!token) window.location.reload()` here could loop forever when the
  // persisted user outlived the stored token.

  return (
    <Flex minH="100dvh" bg="ink.50">
      <SideBar />
      <Flex direction="column" flex="1" minW="0" h="100dvh">
        <NavBar notificationCtrl={onOpen} notificationLength={unread} />
        <NotificationModal
          isOpen={isOpen}
          onClose={onClose}
          notifications={notifications}
        />
        <MobileNoticeModal />
        <Box
          as="main"
          flex="1"
          minH="0"
          overflowY="auto"
          overflowX="hidden"
          pb={{ base: "88px", md: "0" }}
        >
          <EnablePushBanner />
          <Outlet />
        </Box>
        <BottomNav />
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
