import { Box, useDisclosure } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { SideBar, NavBar, BottomNav, EnablePushBanner } from "../../";
import NotificationModal from "../../Modals/NotificationModal/NotificationModal";
import { getToken } from "src/utils/constant";
import { useEffect } from "react";
import useLiveNotifications from "src/hooks/useLiveNotifications";
import MobileNoticeModal from "src/pages/Dashboard/components/MobileNotice";

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const token = getToken();
  const { notifications } = useLiveNotifications();

  useEffect(() => {
    if (!token) window.location.reload();
  }, [token]);

  return (
    <Box display="flex">
      <SideBar />
      <Box width="full" h="100vh">
        <NavBar
          notificationCtrl={onOpen}
          notificationLength={notifications.length}
        />
        <NotificationModal
          isOpen={isOpen}
          onClose={onClose}
          notifications={notifications}
        />
        <MobileNoticeModal />
        <Box width="full" overflow={"scroll"} h="calc(100vh - 60px)">
          <EnablePushBanner />

          <Outlet />

          <BottomNav />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
