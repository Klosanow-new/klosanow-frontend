import { Flex, Avatar } from "@chakra-ui/react";
import React from "react";

interface DashboardHeaderMobileProps {
  notificationLength?: number;
}

const DashboardHeaderMobile: React.FC<DashboardHeaderMobileProps> = () => {
  return (
    <Flex justify={"space-between"} align={"center"} display={["flex", "none"]} mb={4}>
      <Avatar name="KlosaNow" src="/avatar.jpg" size="lg" />
    </Flex>
  );
};

export default DashboardHeaderMobile;
