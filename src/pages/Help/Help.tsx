import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Circle,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  HiChevronRight,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import Header from "../../components/Header/Header";

const options = [
  {
    title: "Email support",
    description:
      "Questions, feedback or a problem with your account? Send us a message and we'll get back to you.",
    icon: HiOutlineEnvelope,
    to: "/help/mail",
    external: false,
  },
  {
    title: "Terms & conditions",
    description: "How Klosanow works, and how we look after your data.",
    icon: HiOutlineDocumentText,
    to: "https://klosanow.com/terms",
    external: true,
  },
];

const Help = () => (
  <Box
    w="full"
    maxW="820px"
    mx="auto"
    px={{ base: "4", md: "6", xl: "8" }}
    py={{ base: "4", md: "8" }}
  >
    <Header pageName="Help" link="/settings" />
    <Heading
      as="h1"
      fontSize="3xl"
      mb="2"
      display={{ base: "none", md: "block" }}
    >
      Help &amp; support
    </Heading>
    <Text color="ink.500" mb="8">
      How can we help you today?
    </Text>

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
      {options.map((opt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const linkProps: any = opt.external
          ? { as: "a", href: opt.to, target: "_blank", rel: "noopener noreferrer" }
          : { as: RouterLink, to: opt.to };
        return (
          <Flex
            key={opt.title}
            {...linkProps}
            gap="4"
            p="5"
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="ink.100"
            boxShadow="card"
            transition="box-shadow 0.2s ease"
            _hover={{ boxShadow: "cardHover" }}
            align="flex-start"
          >
            <Circle size="44px" bg="brand.50" color="brand.600" flexShrink={0}>
              <Icon as={opt.icon} boxSize={5} />
            </Circle>
            <Box flex="1">
              <Text fontWeight={700} color="ink.900" mb="1">
                {opt.title}
              </Text>
              <Text fontSize="sm" color="ink.500">
                {opt.description}
              </Text>
            </Box>
            <Icon as={HiChevronRight} boxSize={5} color="ink.400" mt="3" />
          </Flex>
        );
      })}
    </SimpleGrid>
  </Box>
);

export default Help;
