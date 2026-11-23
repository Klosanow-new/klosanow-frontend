import { Button, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import StatusScreen from "src/components/AuthLayout/StatusScreen";

export default function Error() {
  const navigate = useNavigate();
  return (
    <StatusScreen
      visual={
        <Text
          fontSize="6xl"
          fontWeight={800}
          lineHeight="1"
          bgGradient="linear(135deg, brand.600, #9E7BFF)"
          bgClip="text"
        >
          404
        </Text>
      }
      title="This page doesn't exist"
      actions={
        <>
          <Button as={Link} to="/dashboard" colorScheme="brand" h="52px">
            Go to dashboard
          </Button>
          <Button variant="ghost" h="48px" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </>
      }
    >
      The link may be broken, or the page may have moved.
    </StatusScreen>
  );
}
