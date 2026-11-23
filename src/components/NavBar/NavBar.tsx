import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineCog6Tooth,
  HiOutlineQuestionMarkCircle,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";
import { TbLogout2 } from "react-icons/tb";
import { Search } from "../Search/Search";
import { navBarProps } from "../../types/components/componetInterface";
import { useStoreSelector } from "src/redux/hooks";
import {
  contactsPagePath,
  dashboardPagePath,
  studyChatPageSlug,
} from "../../data/pageUrl";
import { signOut } from "src/utils/session";
import logo from "../../assets/SplashScreenImg/SplashLogo.png";

const NavBar = ({ notificationCtrl, notificationLength }: navBarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useStoreSelector((state) => state.user?.data);
  const isStudyChatPage = pathname.includes(studyChatPageSlug);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Your account";

  return (
    <Flex
      as="header"
      h={{ base: "60px", md: "68px" }}
      flexShrink={0}
      align="center"
      justify="space-between"
      gap="4"
      px={{ base: "4", md: "6", xl: "8" }}
      bg="rgba(255,255,255,0.85)"
      backdropFilter="saturate(180%) blur(10px)"
      borderBottom="1px solid"
      borderColor="ink.100"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      {/* Mobile brand */}
      <Box
        as={Link}
        to={dashboardPagePath}
        display={{ base: "block", md: "none" }}
      >
        <Image src={logo} alt="Klosanow" h="28px" w="auto" />
      </Box>

      {/* Desktop search */}
      <Flex
        align="center"
        gap="3"
        flex="1"
        maxW="520px"
        display={{ base: "none", md: "flex" }}
      >
        <Box flex="1">
          <Search />
        </Box>
        {isStudyChatPage && (
          <Button
            variant="soft"
            size="sm"
            leftIcon={<Icon as={HiOutlineUsers} boxSize={4} />}
            onClick={() => navigate(contactsPagePath)}
          >
            Contacts
          </Button>
        )}
      </Flex>

      <Flex align="center" gap={{ base: 1, md: 3 }}>
        <Box position="relative">
          <IconButton
            aria-label={
              notificationLength > 0
                ? `Notifications, ${notificationLength} new`
                : "Notifications"
            }
            icon={<Icon as={HiOutlineBell} boxSize={6} />}
            variant="ghost"
            borderRadius="full"
            color="ink.600"
            onClick={notificationCtrl}
          />
          {notificationLength > 0 && (
            <Flex
              position="absolute"
              top="1"
              right="1"
              minW="18px"
              h="18px"
              px="1"
              borderRadius="full"
              bg="red.500"
              color="white"
              fontSize="10px"
              fontWeight={700}
              align="center"
              justify="center"
              border="2px solid white"
              pointerEvents="none"
            >
              {notificationLength > 9 ? "9+" : notificationLength}
            </Flex>
          )}
        </Box>

        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            variant="ghost"
            px={{ base: 1, md: 2 }}
            h="auto"
            py="1.5"
            borderRadius="full"
            rightIcon={
              <Icon
                as={HiOutlineChevronDown}
                boxSize={4}
                color="ink.400"
                display={{ base: "none", md: "block" }}
              />
            }
          >
            <Flex align="center" gap="3">
              <Avatar
                size="sm"
                name={fullName}
                src={user?.profilePhoto || undefined}
                bg="brand.500"
                color="white"
              />
              <Box textAlign="left" display={{ base: "none", lg: "block" }}>
                <Text fontSize="sm" fontWeight={700} lineHeight="1.2">
                  {fullName}
                </Text>
                <Text fontSize="xs" color="ink.500" fontWeight={500}>
                  {user?.username ? `@${user.username}` : user?.email}
                </Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList minW="220px">
            <Box px="4" pb="2">
              <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                {fullName}
              </Text>
              <Text fontSize="xs" color="ink.500" noOfLines={1}>
                {user?.email}
              </Text>
            </Box>
            <MenuDivider />
            <MenuItem
              icon={<Icon as={HiOutlineUserCircle} boxSize={4} />}
              onClick={() => navigate("/info")}
            >
              Account info
            </MenuItem>
            <MenuItem
              icon={<Icon as={HiOutlineCog6Tooth} boxSize={4} />}
              onClick={() => navigate("/settings")}
            >
              Settings
            </MenuItem>
            <MenuItem
              icon={<Icon as={HiOutlineQuestionMarkCircle} boxSize={4} />}
              onClick={() => navigate("/help")}
            >
              Help &amp; support
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<Icon as={TbLogout2} boxSize={4} />}
              color="red.500"
              onClick={() => signOut()}
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default NavBar;
