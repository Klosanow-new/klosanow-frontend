import { Box, Center, Image } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import SplashImg from "../../assets/SplashScreenImg/SplashLogo.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SplashScreen(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    const value = localStorage.getItem("isFirstVisit");

    if (value === null) {
      const t = setTimeout(() => {
        navigate("/");
        localStorage.setItem("isFirstVisit", "true");
      }, 3000);
      return () => clearTimeout(t);
    } else if (value === "true") {
      const t = setTimeout(() => {
        navigate("/sign-in");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [navigate]);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, translateY: 150, scale: 0.9 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 30,
          delay: 0.1,
          duration: 1.5,
        }}
        exit={{ opacity: 0, translateY: 80, scale: 0.9 }}
      >
        <Box>
          <Center h="100dvh">
            <Image src={SplashImg} alt="klosanow logo" />
          </Center>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
