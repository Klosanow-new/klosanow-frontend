import React from "react";
import { Link } from "react-router-dom";
import { Button, Circle, Flex, Image, Text } from "@chakra-ui/react";
import EmptyStateImg from "src/assets/images/file.png";

interface EmptyStateProps {
  title: string;
  link: string;
  height?: "sm" | "lg";
  description?: React.ReactNode;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  link,
  height,
  description,
  actionLabel,
}) => {
  const minH = { sm: "260px", lg: "420px" }[height || "lg"];
  const isLesson = title.toLowerCase() === "lesson";

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap="3"
      minH={minH}
      w="full"
      px="6"
      py="10"
      bg="white"
      border="1px dashed"
      borderColor="ink.200"
      borderRadius="2xl"
    >
      <Circle size="96px" bg="brand.50">
        <Image src={EmptyStateImg} alt="" w="56%" />
      </Circle>
      <Text fontSize="lg" fontWeight={700} color="ink.900" mt="2">
        No {title.toLowerCase()}s yet
      </Text>
      <Text fontSize="sm" color="ink.500" maxW="360px">
        {description ??
          (isLesson
            ? "Record or upload your first lesson and it will show up here."
            : `Your ${title.toLowerCase()}s will appear here.`)}
      </Text>
      <Button
        as={Link}
        to={link}
        colorScheme="brand"
        size="sm"
        mt="2"
        px="5"
      >
        {actionLabel ||
          (link.includes("study-chat") ? "Open Study Chat" : "Create a lesson")}
      </Button>
    </Flex>
  );
};

export default EmptyState;
