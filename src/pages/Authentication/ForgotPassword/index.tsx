import { Box, Button, Link, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordApi } from "../../../api-endpoints/auth/auth.api";
import { forgotValues } from "../../../types/auth/authInterface";
import { ForgetPasswordSchema } from "../schema/auth.schema";
import AuthLayout from "src/components/AuthLayout/AuthLayout";
import { TextField } from "src/components/AuthLayout/fields";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(forgotPasswordApi, {
    onSuccess: (data) => {
      toast.success(
        data?.message || "We've sent a password reset link to your email."
      );
      navigate("/reset-verify");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const formik = useFormik<forgotValues>({
    initialValues: { email: "" },
    validationSchema: ForgetPasswordSchema,
    onSubmit: (values) => mutate({ email: values.email.trim() }),
  });

  return (
    <AuthLayout
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link as={RouteLink} to="/sign-in" color="brand.600" fontWeight={700}>
            Back to sign in
          </Link>
        </>
      }
    >
      <Box as="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing="6">
          <TextField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />
          <Button
            type="submit"
            colorScheme="brand"
            h="52px"
            w="full"
            isLoading={isLoading}
            loadingText="Sending link"
            isDisabled={!(formik.dirty && formik.isValid)}
          >
            Send reset link
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
