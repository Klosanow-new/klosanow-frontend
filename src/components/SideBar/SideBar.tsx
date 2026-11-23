import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlinePlus, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { TbLogout2 } from "react-icons/tb";
import logo from "../../assets/SplashScreenImg/SplashLogo.png";
import { createLessonPagePath, dashboardPagePath } from "src/data/pageUrl";
import { useStoreSelector } from "src/redux/hooks";
import { signOut } from "src/utils/session";
import { primaryNavLinks, isNavLinkActive } from "../Layout/navLinks";
import { NavItem } from "./NavItem";

const SideBar: React.FC = () => {
  const { pathname } = useLocation();
  const user = useStoreSelector((state) => state.user?.data);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Your account";

  return (
    <Flex
      as="aside"
      aria-label="Main navigation"
      w="260px"
      flexShrink={0}
      h="100dvh"
      position="sticky"
      top="0"
      bg="white"
      borderRight="1px solid"
      borderColor="ink.100"
      display={{ base: "none", md: "flex" }}
      flexDirection="column"
      px="4"
      py="6"
      overflowY="auto"
    >
      <Box as={Link} to={dashboardPagePath} px="3" mb="8">
        <Image src={logo} alt="Klosanow" h="34px" w="auto" />
      </Box>

      <Button
        as={Link}
        to={createLessonPagePath}
        colorScheme="brand"
        leftIcon={<Icon as={HiOutlinePlus} boxSize={5} />}
        mb="6"
        mx="1"
      >
        New lesson
      </Button>

      <Text
        px="3"
        mb="2"
        fontSize="xs"
        fontWeight={700}
        color="ink.400"
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        Menu
      </Text>

      <VStack as="nav" align="stretch" spacing="1">
        {primaryNavLinks.map((link) => (
          <NavItem
            key={link.href}
            to={link.href}
            icon={link.icon}
            isActive={isNavLinkActive(link, pathname)}
          >
            {link.label}
          </NavItem>
        ))}
      </VStack>

      <Box flex="1" minH="6" />

      <VStack align="stretch" spacing="1" mb="4">
        <NavItem
          to="/help"
          icon={HiOutlineQuestionMarkCircle}
          isActive={pathname.startsWith("/help")}
        >
          Help &amp; support
        </NavItem>
      </VStack>

      <Flex
        align="center"
        gap="3"
        p="3"
        borderRadius="xl"
        bg="ink.50"
        border="1px solid"
        borderColor="ink.100"
      >
        <Avatar
          size="sm"
          name={fullName}
          src={user?.profilePhoto || undefined}
          bg="brand.500"
          color="white"
        />
        <Box minW="0" flex="1">
          <Text fontSize="sm" fontWeight={700} noOfLines={1}>
            {fullName}
          </Text>
          <Text fontSize="xs" color="ink.500" noOfLines={1}>
            {user?.email}
          </Text>
        </Box>
        <Button
          variant="ghost"
          size="sm"
          p="0"
          minW="8"
          color="ink.500"
          aria-label="Log out"
          title="Log out"
          _hover={{ color: "red.500", bg: "red.50" }}
          onClick={() => signOut()}
        >
          <Icon as={TbLogout2} boxSize={5} />
        </Button>
      </Flex>
    </Flex>
  );
};

export default SideBar;
