import { Button, Circle, Icon, Spinner } from "@chakra-ui/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { HiCheck, HiXMark } from "react-icons/hi2";
import { verifyOtpApi } from "src/api-endpoints/auth/auth.api";
import StatusScreen from "src/components/AuthLayout/StatusScreen";

export default function VerifyOtp(): JSX.Element {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  // StrictMode runs effects twice in development; only verify once.
  const started = useRef(false);

  const verifyMutation = useMutation(verifyOtpApi, {
    onSuccess: (data) => {
      setStatus("success");
      toast.success(data?.message);
      setTimeout(() => navigate("/sign-in"), 2000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setStatus("error");
      setMessage(error.response?.data?.message || error.message);
    },
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (token) verifyMutation.mutate({ token });
    else {
      setStatus("error");
      setMessage("This verification link is incomplete.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "error") {
    return (
      <StatusScreen
        visual={
          <Circle size="88px" bg="red.50" color="red.500">
            <Icon as={HiXMark} boxSize={10} />
          </Circle>
        }
        title="We couldn't verify your account"
        actions={
          <Button as={Link} to="/sign-in" colorScheme="brand" h="52px">
            Go to sign in
          </Button>
        }
      >
        {message || "The link may have expired."} Signing in with an
        unverified account sends you a fresh verification link.
      </StatusScreen>
    );
  }

  return (
    <StatusScreen
      visual={
        status === "success" ? (
          <Circle size="88px" bg="green.50" color="green.500">
            <Icon as={HiCheck} boxSize={10} />
          </Circle>
        ) : (
          <Spinner boxSize="72px" thickness="5px" color="brand.500" emptyColor="ink.100" />
        )
      }
      title={status === "success" ? "You're verified" : "Verifying your account"}
    >
      {status === "success"
        ? "Taking you to sign in…"
        : "This only takes a moment."}
    </StatusScreen>
  );
}
