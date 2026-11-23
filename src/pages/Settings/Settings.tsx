import { Box } from "@chakra-ui/react";
import MobileSettings from "./MobileSettings";
import DesktopSettings from "./DesktopSettings";

export default function Settings(): JSX.Element {
  return (
    <Box w="full" maxW="1280px" mx="auto" px={{ base: "4", md: "6", xl: "8" }} py={{ base: "5", md: "8" }}>
      <Box display={{ base: "none", md: "block" }}>
        <DesktopSettings />
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileSettings />
      </Box>
    </Box>
  );
}
