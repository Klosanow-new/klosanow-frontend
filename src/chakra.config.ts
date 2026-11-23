import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { colors } from "./data/colors";

const breakpoints = {
  sm: "40em", // 640px
  md: "48em", // 768px
  lg: "62em", // 992px
  xl: "80em", // 1280px
  "2xl": "96em", // 1536px
};

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const fontStack = `'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

const theme = extendTheme({
  config,
  breakpoints,
  fonts: {
    heading: fontStack,
    body: fontStack,
    // Older screens reference fontFamily="primary"; keep it resolving to the
    // brand font instead of falling back to the browser's default serif.
    primary: fontStack,
  },
  colors: {
    ...colors,
    // Chakra colorScheme support (Button colorScheme="brand", Switch, Tabs…)
    brand: {
      50: "#F4F1FE",
      100: "#E5DEFD",
      200: "#D3C7FB",
      300: "#BDABF9",
      400: "#9174F6",
      500: "#7B58F4",
      600: "#6649CB",
      700: "#523BA3",
      800: "#3D2C7A",
      900: "#291D51",
    },
    ink: {
      50: "#F7F7FB",
      100: "#EFEFF5",
      200: "#E2E2EC",
      300: "#C9C9D6",
      400: "#9A9AAE",
      500: "#6E6E85",
      600: "#4D4D63",
      700: "#34344A",
      800: "#1F1F33",
      900: "#121224",
    },
    transparent: {
      100: "transparent",
    },
  },
  radii: {
    xl: "14px",
    "2xl": "18px",
    "3xl": "24px",
  },
  shadows: {
    card: "0 1px 2px rgba(18, 18, 36, 0.04), 0 4px 16px rgba(18, 18, 36, 0.06)",
    cardHover:
      "0 2px 4px rgba(18, 18, 36, 0.06), 0 12px 32px rgba(18, 18, 36, 0.10)",
    outline: "0 0 0 3px rgba(123, 88, 244, 0.35)",
  },
  styles: {
    global: {
      "html, body": {
        bg: "ink.50",
        color: "ink.800",
        fontFamily: "body",
        lineHeight: "base",
      },
      "*::selection": { bg: "brand.100" },
      "*::-webkit-scrollbar": { width: "8px", height: "8px" },
      "*::-webkit-scrollbar-thumb": {
        background: "#D4D4DF",
        borderRadius: "8px",
      },
      "*::-webkit-scrollbar-track": { background: "transparent" },
    },
  },
  components: {
    Heading: {
      baseStyle: { color: "ink.900", letterSpacing: "-0.02em" },
    },
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "xl",
        _focusVisible: { boxShadow: "outline" },
      },
      variants: {
        solid: (props: { colorScheme: string }) =>
          props.colorScheme === "brand"
            ? {
                bg: "brand.500",
                color: "white",
                _hover: {
                  bg: "brand.600",
                  _disabled: { bg: "brand.300" },
                },
                _active: { bg: "brand.700" },
                _disabled: { bg: "brand.300", opacity: 1 },
              }
            : {},
        soft: {
          bg: "brand.50",
          color: "brand.600",
          _hover: { bg: "brand.100" },
          _active: { bg: "brand.200" },
        },
      },
    },
    Input: {
      defaultProps: { focusBorderColor: "brand.500" },
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "ink.200",
            borderRadius: "xl",
            _hover: { borderColor: "ink.300" },
            _placeholder: { color: "ink.400" },
          },
        },
      },
    },
    Textarea: {
      defaultProps: { focusBorderColor: "brand.500" },
      variants: {
        outline: {
          bg: "white",
          borderColor: "ink.200",
          borderRadius: "xl",
          _hover: { borderColor: "ink.300" },
        },
      },
    },
    Select: {
      defaultProps: { focusBorderColor: "brand.500" },
    },
    FormLabel: {
      baseStyle: { fontSize: "sm", fontWeight: 600, color: "ink.700", mb: 2 },
    },
    Tabs: {
      defaultProps: { colorScheme: "brand" },
    },
    Switch: {
      defaultProps: { colorScheme: "brand" },
    },
    Checkbox: {
      defaultProps: { colorScheme: "brand" },
    },
    Radio: {
      defaultProps: { colorScheme: "brand" },
    },
    Progress: {
      defaultProps: { colorScheme: "brand" },
    },
    Modal: {
      baseStyle: {
        dialog: { borderRadius: "2xl", boxShadow: "cardHover" },
        overlay: { bg: "rgba(18, 18, 36, 0.45)", backdropFilter: "blur(2px)" },
      },
    },
    Drawer: {
      baseStyle: {
        overlay: { bg: "rgba(18, 18, 36, 0.45)", backdropFilter: "blur(2px)" },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: "xl",
          borderColor: "ink.100",
          boxShadow: "cardHover",
          py: 2,
        },
        item: {
          fontSize: "sm",
          px: 4,
          py: 2,
          _hover: { bg: "ink.50" },
          _focus: { bg: "ink.50" },
        },
      },
    },
    Tooltip: {
      baseStyle: { borderRadius: "md", bg: "ink.800", fontSize: "xs" },
    },
  },
});

export default theme;
