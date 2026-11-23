import { Box, Button, Link, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Link as RouteLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ResetPasswordSchema } from "../schema/auth.schema";
import { ResetPasswordApi } from "../../../api-endpoints/auth/auth.api";
import { ResetPasswordValues } from "../../../types/auth/authInterface";
import AuthLayout from "src/components/AuthLayout/AuthLayout";
import { PasswordField } from "src/components/AuthLayout/fields";

type FormValues = Omit<ResetPasswordValues, "token">;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const { mutate, isLoading } = useMutation(ResetPasswordApi, {
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset successfully");
      setTimeout(() => navigate("/sign-in"), 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Something went wrong"
      );
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: ResetPasswordSchema,
    onSubmit: (values) => {
      if (!token) {
        toast.error("This reset link is invalid. Request a new one.");
        return;
      }
      mutate({ token, ...values });
    },
  });

  const err = (field: keyof FormValues) =>
    formik.touched[field] && formik.errors[field];

  return (
    <AuthLayout
      eyebrow="Almost there"
      title="Choose a new password"
      subtitle="Use at least 6 characters. You'll sign in with it from now on."
      footer={
        <Link as={RouteLink} to="/sign-in" color="brand.600" fontWeight={700}>
          Back to sign in
        </Link>
      }
    >
      <Box as="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing="5">
          <PasswordField
            name="password"
            label="New password"
            autoComplete="new-password"
            placeholder="Enter a new password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={err("password")}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Re-enter the new password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={err("confirmPassword")}
          />
          <Button
            type="submit"
            colorScheme="brand"
            h="52px"
            w="full"
            isLoading={isLoading}
            loadingText="Saving"
            isDisabled={!(formik.dirty && formik.isValid)}
          >
            Reset password
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
