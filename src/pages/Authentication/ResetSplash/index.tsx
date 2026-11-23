import { Button, Circle, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import email from "../../../assets/images/email-removebg-preview.png";
import StatusScreen from "src/components/AuthLayout/StatusScreen";

export default function ResetSplash(): JSX.Element {
  return (
    <StatusScreen
      visual={
        <Circle size="120px" bg="brand.50">
          <Image src={email} alt="" w="80px" />
        </Circle>
      }
      title="Check your email"
      actions={
        <>
          <Button as={Link} to="/sign-in" colorScheme="brand" h="52px">
            Return to sign in
          </Button>
          <Button as={Link} to="/forgot-password" variant="ghost" h="48px">
            Use a different email
          </Button>
        </>
      }
    >
      We&apos;ve sent you a link to reset your password. Follow it to choose a
      new one. If you didn&apos;t ask for a reset, you can ignore the email.
    </StatusScreen>
  );
}
