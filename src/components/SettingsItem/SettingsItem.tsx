import { Box, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

interface props {
  imageSrc: string;
  text: string;
  link: string;
  action?: () => void;
  isDisabled?: boolean;
}

const SettingsItem = ({
  imageSrc,
  text,
  link,
  action,
  isDisabled,
}: props) => {
  const content = (
    <Box
      display="flex"
      padding="5px"
      margin="10px 0px"
      gap="6"
      alignItems="center"
      opacity={isDisabled ? 0.5 : 1}
      cursor={isDisabled ? "not-allowed" : "pointer"}
      onClick={() => !isDisabled && action && action()}
    >
      <Image src={imageSrc} alt="user" w="1.8rem" h="1.8rem" />
      <Text>{text}</Text>
    </Box>
  );

  if (isDisabled) {
    return (
      <Box aria-disabled="true" pointerEvents="none">
        {content}
      </Box>
    );
  }

  const isExternal = /^(https?:)?\/\//.test(link);

  if (isExternal) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link to={link}>{content}</Link>;
};

export default SettingsItem;
