import { Box, Center, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import SplashImg from "../../assets/SplashScreenImg/SplashLogo.png";

/** Purely visual. Routing decisions live in the Onboarding page. */
export default function SplashScreen(): JSX.Element {
  return (
    <Center h="100dvh" bg="white" flexDirection="column" gap="8">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      >
        <Image src={SplashImg} alt="Klosanow" h={{ base: "56px", md: "72px" }} />
      </motion.div>
      <Box w="120px" h="4px" bg="brand.50" borderRadius="full" overflow="hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            background: "var(--chakra-colors-brand-500)",
          }}
        />
      </Box>
    </Center>
  );
}
