import { colors } from "../../../data/colors";

export const heading2 = {
  fontFamily: "heading",
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "140%",
  color: "#121224",
  letterSpacing: "-0.02em",
};

export const inputStyles = {
  variant: "flushed",
  focusBorderColor: "#958DA5",
  w: "100%",
};

export const formButtonStyles = {
  bg: colors.neutral[10],
  border: `1px solid ${colors.primary[50]}`,
  borderRadius: "14px",
  padding: "24px 10px",
  fontWeight: "600",
  fontSize: "16px",
  iconSpacing: "10px",
};

export const createButtonStyles = {
  color: colors.neutral[10],
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "160%",
  w: "226px",
  bg: colors.primary[50],
  mt: "48px",
  padding: "24px",
  borderRadius: "14px",
  _hover: { bg: colors.primary[60] },
};

export const flyoutActionsStyles = {
  color: colors.neutral[10],
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "160%",
  letterSpacing: "-0.6px",
  alignItems: "center",
  gap: "10px",
};
