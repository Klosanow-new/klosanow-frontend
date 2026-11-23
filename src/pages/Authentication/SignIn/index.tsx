import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { Box, Button, Flex, Link, Stack } from "@chakra-ui/react";
import { signInApi } from "../../../api-endpoints/auth/auth.api";
import { SignInValues, UserI } from "../../../types/auth/authInterface";
import { SignInSchema } from "../schema/auth.schema";
import { getSingleUser } from "src/api-endpoints/user/user.api";
import { updateUserData } from "src/redux/reducers/userReducer";
import { savedwithExp, takePostAuthRedirect } from "src/utils/constant";
import { SignInResponse } from "src/api-endpoints/auth/interface";
import AuthLayout from "src/components/AuthLayout/AuthLayout";
import { PasswordField, TextField } from "src/components/AuthLayout/fields";

export default function SignIn() {
  const [verifyRes, setVerifyRes] = useState<SignInResponse | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { mutate, isLoading } = useMutation(signInApi, {
    onSuccess: (data) => {
      if (data) {
        setVerifyRes(data);
        savedwithExp({ ...data }, 1);
      }
      toast.success(data?.message);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || error?.message);
    },
  });

  // Fetch the full profile once the sign-in call returns a token.
  const { isFetching: loadingProfile } = useQuery({
    queryKey: ["user", verifyRes?.data?.user?._id],
    queryFn: () =>
      verifyRes &&
      getSingleUser(verifyRes?.data?.user?._id, verifyRes.data?.token),
    onSuccess: (data: UserI) => {
      dispatch(updateUserData(data));
      navigate(takePostAuthRedirect() || "/dashboard");
    },
    enabled: !!verifyRes,
  });

  const formik = useFormik<SignInValues>({
    initialValues: { email: "", password: "" },
    validationSchema: SignInSchema,
    // The old form silently dropped every space typed into the password, so
    // existing accounts were created without them. Strip whitespace here too
    // so those users can still sign in.
    onSubmit: (values) =>
      mutate({
        email: values.email.trim(),
        password: values.password.replace(/\s/g, ""),
      }),
  });

  const err = (field: keyof SignInValues) =>
    formik.touched[field] && formik.errors[field];

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Klosanow"
      subtitle="Pick up your lessons and study chats right where you left them."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link as={RouteLink} to="/sign-up" color="brand.600" fontWeight={700}>
            Create one
          </Link>
        </>
      }
    >
      <Box as="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing="5">
          <TextField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={err("email")}
          />
          <Box>
            <PasswordField
              name="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err("password")}
            />
            <Flex justify="flex-end" mt="2">
              <Link
                as={RouteLink}
                to="/forgot-password"
                color="brand.600"
                fontSize="sm"
                fontWeight={600}
              >
                Forgot password?
              </Link>
            </Flex>
          </Box>
          <Button
            type="submit"
            colorScheme="brand"
            h="52px"
            w="full"
            isLoading={isLoading || loadingProfile}
            loadingText="Signing in"
            isDisabled={!(formik.dirty && formik.isValid)}
          >
            Sign in
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
