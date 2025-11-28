import { Box, Flex, Text, Circle, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
export default function AIChatListItem() {
  const navigate = useNavigate();
  return (
    <Box
      cursor="pointer"
      onClick={() => navigate("/study-chat/ai")}
      width="full"
      mb="10px"
    >
      <Flex
        align="center"
        justify="space-between"
        borderBottomWidth={"1px"}
        borderBottomColor={"neutral.70"}
        p="10px"
        bg="transparent"
        _hover={{ bg: "primary.100" }}
      >
        <Flex align="center" gap="10px">
          <Circle size="50px" bg="primary.500" overflow="hidden">
            <Image src="" alt="AI" />
          </Circle>
          <Flex></Flex>
        </Flex>
        <Text>Ask me anything about your studies</Text>
      </Flex>
    </Box>
  );
}
