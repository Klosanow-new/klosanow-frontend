import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import logo from "../../assets/SplashScreenImg/SplashLogo.png";

interface OnboardingSlidesProps {
  slides: {
    image: string;
    title: string;
    description: string;
    id: string;
  }[];
}

const OnboardingSlides = ({ slides }: OnboardingSlidesProps) => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  const next = () => (isLast ? navigate("/sign-up") : setIndex(index + 1));

  return (
    <Flex minH="100dvh" direction="column" bg="white">
      <Flex
        justify="space-between"
        align="center"
        px={{ base: 5, md: 10 }}
        py="6"
      >
        <Image src={logo} alt="Klosanow" h="32px" />
        {!isLast && (
          <Button as={Link} to="/sign-in" variant="ghost" size="sm" color="ink.500">
            Skip
          </Button>
        )}
      </Flex>

      <Flex flex="1" align="center" justify="center" px="6">
        <Box w="full" maxW="460px" textAlign="center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Flex
                mx="auto"
                boxSize={{ base: "240px", md: "300px" }}
                borderRadius="full"
                bgGradient="radial(brand.50, white)"
                align="center"
                justify="center"
                mb="10"
              >
                <Image
                  src={slide.image}
                  alt=""
                  maxH={{ base: "190px", md: "230px" }}
                />
              </Flex>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} mb="3">
                {slide.title.trim()}
              </Heading>
              <Text color="ink.500" fontSize={{ base: "md", md: "lg" }}>
                {slide.description.trim()}
              </Text>
            </motion.div>
          </AnimatePresence>

          <HStack spacing="2" justify="center" mt="10">
            {slides.map((s, i) => (
              <Box
                key={s.id}
                as="button"
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                h="8px"
                w={i === index ? "28px" : "8px"}
                borderRadius="full"
                bg={i === index ? "brand.500" : "ink.200"}
                transition="all 0.3s ease"
              />
            ))}
          </HStack>
        </Box>
      </Flex>

      <Box px="6" pb="calc(2rem + env(safe-area-inset-bottom))" pt="8">
        <Stack
          maxW="460px"
          mx="auto"
          direction={{ base: "column", sm: "row" }}
          spacing="3"
        >
          {isLast ? (
            <>
              <Button
                as={Link}
                to="/sign-in"
                variant="outline"
                h="52px"
                flex="1"
                order={{ base: 2, sm: 1 }}
              >
                Sign in
              </Button>
              <Button
                colorScheme="brand"
                h="52px"
                flex="1"
                onClick={next}
                order={{ base: 1, sm: 2 }}
              >
                Create an account
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                h="52px"
                flex="1"
                isDisabled={index === 0}
                onClick={() => setIndex(index - 1)}
                order={{ base: 2, sm: 1 }}
              >
                Back
              </Button>
              <Button
                colorScheme="brand"
                h="52px"
                flex="1"
                onClick={next}
                order={{ base: 1, sm: 2 }}
              >
                Next
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Flex>
  );
};

export default OnboardingSlides;
