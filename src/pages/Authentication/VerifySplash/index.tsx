import { Button, Circle, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import email from "../../../assets/images/email-removebg-preview.png";
import StatusScreen from "src/components/AuthLayout/StatusScreen";

export default function VerifySplash(): JSX.Element {
  const userEmail = localStorage.getItem("email");

  return (
    <StatusScreen
      visual={
        <Circle size="120px" bg="brand.50">
          <Image src={email} alt="" w="80px" />
        </Circle>
      }
      title="Check your inbox"
      actions={
        <Button as={Link} to="/sign-in" colorScheme="brand" h="52px">
          I&apos;ve verified — sign in
        </Button>
      }
    >
      We sent a verification link to{" "}
      <Text as="span" fontWeight={700} color="ink.800">
        {userEmail || "your email address"}
      </Text>
      . Open it to activate your account.
      <Text mt="3" fontSize="xs" color="ink.400">
        Can&apos;t find it? Check your spam folder. Signing in with an
        unverified account sends a fresh link.
      </Text>
    </StatusScreen>
  );
}
