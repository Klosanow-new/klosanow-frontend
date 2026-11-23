import React from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "src/assets/SplashScreenImg/SplashLogo.png";
import { slides } from "src/pages/Onboarding/utils/SlideData";

interface AuthLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FeatureCarousel = () => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => window.clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <Flex direction="column" align="center" textAlign="center" maxW="420px">
      <Box h="280px" w="full" position="relative" mb="8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flex
              boxSize="260px"
              borderRadius="full"
              bg="whiteAlpha.900"
              align="center"
              justify="center"
              boxShadow="0 20px 60px rgba(41, 29, 81, 0.35)"
            >
              <Image src={slide.image} alt="" maxH="200px" />
            </Flex>
          </motion.div>
        </AnimatePresence>
      </Box>
      <Heading
        as="p"
        fontSize="2xl"
        color="white"
        mb="3"
        minH="64px"
        display="flex"
        alignItems="flex-end"
      >
        {slide.title.trim()}
      </Heading>
      <Text color="whiteAlpha.800" fontSize="md" minH="48px">
        {slide.description.trim()}
      </Text>
      <HStack spacing="2" mt="8">
        {slides.map((s, i) => (
          <Box
            key={s.id}
            as="button"
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)}
            h="8px"
            w={i === index ? "28px" : "8px"}
            borderRadius="full"
            bg={i === index ? "white" : "whiteAlpha.500"}
            transition="all 0.3s ease"
          />
        ))}
      </HStack>
    </Flex>
  );
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) => (
  <Flex minH="100dvh" bg="white">
    {/* Brand panel */}
    <Flex
      display={{ base: "none", lg: "flex" }}
      w="46%"
      maxW="680px"
      position="sticky"
      top="0"
      h="100dvh"
      direction="column"
      justify="space-between"
      p="10"
      overflow="hidden"
      bgGradient="linear(160deg, brand.700 0%, brand.500 60%, #9E7BFF 100%)"
    >
      <Box
        position="absolute"
        top="-120px"
        right="-120px"
        boxSize="360px"
        borderRadius="full"
        bg="whiteAlpha.100"
      />
      <Box
        position="absolute"
        bottom="-160px"
        left="-100px"
        boxSize="420px"
        borderRadius="full"
        bg="whiteAlpha.100"
      />
      <Box as={Link} to="/" position="relative">
        <Flex
          display="inline-flex"
          bg="white"
          borderRadius="xl"
          px="4"
          py="2.5"
          boxShadow="lg"
        >
          <Image src={logo} alt="Klosanow" h="28px" />
        </Flex>
      </Box>
      <Flex justify="center" position="relative">
        <FeatureCarousel />
      </Flex>
      <Text color="whiteAlpha.700" fontSize="sm" position="relative">
        Teaching and learning, made simple — wherever you are.
      </Text>
    </Flex>

    {/* Form panel */}
    <Flex
      flex="1"
      direction="column"
      align="center"
      justify={{ base: "flex-start", md: "center" }}
      px={{ base: "5", sm: "8" }}
      py={{ base: "8", md: "12" }}
      bg={{ base: "white", md: "ink.50" }}
    >
      <Box w="full" maxW="440px">
        <Box
          as={Link}
          to="/"
          display={{ base: "inline-block", lg: "none" }}
          mb="8"
        >
          <Image src={logo} alt="Klosanow" h="32px" />
        </Box>

        <Box
          bg="white"
          borderRadius={{ base: "0", md: "3xl" }}
          borderWidth={{ base: "0", md: "1px" }}
          borderStyle="solid"
          borderColor="ink.100"
          boxShadow={{ base: "none", md: "card" }}
          p={{ base: "0", md: "10" }}
        >
          {eyebrow && (
            <Text
              fontSize="sm"
              fontWeight={700}
              color="brand.600"
              mb="2"
              letterSpacing="0.01em"
            >
              {eyebrow}
            </Text>
          )}
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} mb="2">
            {title}
          </Heading>
          {subtitle && (
            <Text color="ink.500" fontSize="sm" mb="8">
              {subtitle}
            </Text>
          )}
          {!subtitle && <Box mb="8" />}
          {children}
        </Box>

        {footer && (
          <Box mt="6" textAlign="center" fontSize="sm" color="ink.600">
            {footer}
          </Box>
        )}
      </Box>
    </Flex>
  </Flex>
);

export default AuthLayout;
