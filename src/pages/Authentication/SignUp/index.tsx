import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Link,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { SignUpSchema } from "../schema/auth.schema";
import { signUpApi } from "../../../api-endpoints/auth/auth.api";
import { SignUpValues } from "../../../types/auth/authInterface";
import AuthLayout from "src/components/AuthLayout/AuthLayout";
import { PasswordField, TextField } from "src/components/AuthLayout/fields";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MyPhoneInput = PhoneInput.default ? PhoneInput.default : PhoneInput;

export default function SignUp() {
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(signUpApi, {
    onSuccess: (data) => {
      toast.success(data?.message);
      navigate("/please-verify");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || error?.message);
    },
  });

  const formik = useFormik<SignUpValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: (values) => {
      const payload = {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      };
      localStorage.setItem("email", payload.email);
      mutate(payload);
    },
  });

  const err = (field: keyof SignUpValues) =>
    formik.touched[field] && formik.errors[field];

  const bind = (field: keyof SignUpValues) => ({
    name: field,
    value: formik.values[field],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: err(field),
  });

  return (
    <AuthLayout
      eyebrow="Get started — it's free"
      title="Create your account"
      subtitle="Create lessons, share them with learners and keep your study group in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link as={RouteLink} to="/sign-in" color="brand.600" fontWeight={700}>
            Sign in
          </Link>
        </>
      }
    >
      <Box as="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing="5">
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="4">
            <TextField
              label="First name"
              autoComplete="given-name"
              placeholder="Ada"
              {...bind("firstName")}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              placeholder="Obi"
              {...bind("lastName")}
            />
          </SimpleGrid>
          <TextField
            label="Username"
            autoComplete="username"
            placeholder="adaobi"
            {...bind("username")}
          />
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...bind("email")}
          />

          <FormControl isInvalid={!!err("phoneNumber")}>
            <FormLabel htmlFor="phoneNumber">Phone number</FormLabel>
            <Box
              sx={{
                ".react-tel-input .form-control": {
                  width: "100%",
                  height: "48px",
                  borderRadius: "14px",
                  borderColor: "var(--chakra-colors-ink-200)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                },
                ".react-tel-input .form-control:focus": {
                  borderColor: "var(--chakra-colors-brand-500)",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                },
                ".react-tel-input .flag-dropdown": {
                  borderRadius: "14px 0 0 14px",
                  borderColor: "var(--chakra-colors-ink-200)",
                  background: "var(--chakra-colors-ink-50)",
                },
                ".react-tel-input .selected-flag": {
                  borderRadius: "14px 0 0 14px",
                },
              }}
            >
              <MyPhoneInput
                country="ng"
                regions={["africa"]}
                inputProps={{ id: "phoneNumber", name: "phoneNumber" }}
                value={formik.values.phoneNumber}
                onChange={(value: string) =>
                  formik.setFieldValue("phoneNumber", value)
                }
                onBlur={formik.handleBlur("phoneNumber")}
              />
            </Box>
            {err("phoneNumber") && (
              <FormErrorMessage fontSize="xs">
                {err("phoneNumber")}
              </FormErrorMessage>
            )}
          </FormControl>

          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...bind("password")}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            {...bind("confirmPassword")}
          />

          <Button
            type="submit"
            colorScheme="brand"
            h="52px"
            w="full"
            isLoading={isLoading}
            loadingText="Creating account"
            isDisabled={!(formik.dirty && formik.isValid)}
          >
            Create account
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
