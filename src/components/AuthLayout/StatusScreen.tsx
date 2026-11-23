import React from "react";
import { Box, Flex, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import logo from "src/assets/SplashScreenImg/SplashLogo.png";

interface StatusScreenProps {
  visual: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Centred single-message screen used by verify, reset and error pages. */
const StatusScreen: React.FC<StatusScreenProps> = ({
  visual,
  title,
  children,
  actions,
}) => (
  <Flex minH="100dvh" direction="column" bg="ink.50">
    <Flex px={{ base: 5, md: 10 }} py="6" justify={{ base: "center", md: "flex-start" }}>
      <Box as={Link} to="/">
        <Image src={logo} alt="Klosanow" h="32px" />
      </Box>
    </Flex>
    <Flex flex="1" align="center" justify="center" px="5" pb="16">
      <Box
        w="full"
        maxW="480px"
        bg="white"
        borderRadius="3xl"
        border="1px solid"
        borderColor="ink.100"
        boxShadow="card"
        p={{ base: 8, md: 10 }}
        textAlign="center"
      >
        <Flex justify="center" mb="6">
          {visual}
        </Flex>
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} mb="3">
          {title}
        </Heading>
        {children && (
          <Text as="div" color="ink.500" fontSize="sm" lineHeight="1.7">
            {children}
          </Text>
        )}
        {actions && (
          <Stack spacing="3" mt="8">
            {actions}
          </Stack>
        )}
      </Box>
    </Flex>
  </Flex>
);

export default StatusScreen;
