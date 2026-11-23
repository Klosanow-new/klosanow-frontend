import { Flex, Icon, Text } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { isNavLinkActive, mobileNavLinks } from "../Layout/navLinks";

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Flex
      as="nav"
      aria-label="Primary"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="sticky"
      display={{ base: "flex", md: "none" }}
      justify="space-around"
      bg="rgba(255,255,255,0.94)"
      backdropFilter="saturate(180%) blur(10px)"
      borderTop="1px solid"
      borderColor="ink.100"
      pt="2"
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
    >
      {mobileNavLinks.map((link) => {
        const active = isNavLinkActive(link, pathname);
        return (
          <Flex
            key={link.label}
            as={Link}
            to={link.href}
            aria-current={active ? "page" : undefined}
            direction="column"
            align="center"
            gap="1"
            minW="64px"
            py="1"
            color={active ? "brand.600" : "ink.500"}
          >
            <Flex
              align="center"
              justify="center"
              h="28px"
              w="52px"
              borderRadius="full"
              bg={active ? "brand.50" : "transparent"}
              transition="background 0.15s ease"
            >
              <Icon as={link.icon} boxSize={5} />
            </Flex>
            <Text fontSize="11px" fontWeight={active ? 700 : 500}>
              {link.label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default BottomNav;
