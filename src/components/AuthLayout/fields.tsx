import React from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from "@chakra-ui/react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

interface FieldProps extends Omit<InputProps, "name"> {
  name: string;
  label: string;
  error?: string | false;
}

/** Labelled input wired for Formik-style `error` strings. */
export const TextField = ({ name, label, error, ...rest }: FieldProps) => (
  <FormControl isInvalid={!!error}>
    <FormLabel htmlFor={name}>{label}</FormLabel>
    <Input id={name} name={name} h="48px" fontSize="sm" {...rest} />
    {error && <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>}
  </FormControl>
);

export const PasswordField = ({ name, label, error, ...rest }: FieldProps) => {
  const [show, setShow] = React.useState(false);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <InputGroup>
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          h="48px"
          fontSize="sm"
          pr="12"
          {...rest}
        />
        <InputRightElement h="full" pr="1">
          <IconButton
            size="sm"
            variant="ghost"
            color="ink.500"
            aria-label={show ? "Hide password" : "Show password"}
            icon={show ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
            onClick={() => setShow((s) => !s)}
          />
        </InputRightElement>
      </InputGroup>
      {error && <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>}
    </FormControl>
  );
};
