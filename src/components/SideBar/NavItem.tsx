import { Flex, Icon } from "@chakra-ui/react";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import { Link } from "react-router-dom";

interface IProps {
  icon: IconType;
  children: ReactNode;
  to: string;
  isActive?: boolean;
}

export const NavItem = ({ icon, children, to, isActive }: IProps) => (
  <Flex
    as={Link}
    to={to}
    aria-current={isActive ? "page" : undefined}
    align="center"
    gap="3"
    px="3"
    py="2.5"
    borderRadius="xl"
    fontSize="sm"
    fontWeight={isActive ? 700 : 500}
    color={isActive ? "brand.600" : "ink.600"}
    bg={isActive ? "brand.50" : "transparent"}
    transition="background 0.15s ease, color 0.15s ease"
    _hover={{
      bg: isActive ? "brand.50" : "ink.50",
      color: isActive ? "brand.600" : "ink.900",
    }}
    _focusVisible={{ boxShadow: "outline", outline: "none" }}
  >
    <Icon as={icon} boxSize={5} />
    {children}
  </Flex>
);
