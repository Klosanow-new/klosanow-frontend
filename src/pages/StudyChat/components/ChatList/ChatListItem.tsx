import React from "react";
import { Box, Text, Image, Flex, Circle } from "@chakra-ui/react";
import { ChatListData } from "../../../../types/studyChat";
import { useSearchParams } from "react-router-dom";
import { StudyChatContext } from "../../context/StudyChat";
import { formatDistanceToNow } from "date-fns";
import { getContactDisplayName } from "../../utils";

interface ChatListItemProps {
  data: ChatListData | null;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ data }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { updateStudyChatValues } = React.useContext(StudyChatContext);

  const param = searchParams.get("slug");

  const icon = data?.img || "https://picsum.photos/40/40";

  const isActive = param === data?.slug;

  const hasUnread = !!data?.unread_messages && data.unread_messages > 0;

  const rowBg = isActive ? "#F3ECF8" : "#fafafa";

  const updateUrl = () => {
    setSearchParams({ slug: data?.slug || "" });
    updateStudyChatValues({ activeChat: data, loadingMessage: true });
  };

  return (
    <Box as="div" width="full" cursor="pointer" onClick={updateUrl}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth="0.2px"
        borderBottomColor="neutral.70"
        padding="10px 10px"
        bg={isActive ? "#F3ECF8" : "transparent"}
      >
        <Flex justifyContent="space-between" gap="8px">
          <Box position="relative" flexShrink={0}>
            <Circle size="50px" bg="#b1b1b1" overflow="hidden">
              <Image src={icon} />
            </Circle>

            {hasUnread && (
              <Circle
                size="14px"
                bg="#9174F6"
                position="absolute"
                top="1px"
                right="1px"
                borderWidth="2px"
                borderStyle="solid"
                borderColor={rowBg}
              />
            )}
          </Box>

          <Flex justifyContent="center" flexDir="column">
            <Text
              fontSize={14}
              fontWeight={hasUnread ? 700 : 500}
              color={hasUnread ? "#000" : "#2A2A2A"}
              lineHeight="17.5px"
              marginBottom="5px"
            >
              {getContactDisplayName(data as any)}
            </Text>

            {data?.last_msg && (
              <Text
                fontSize={12}
                fontWeight={hasUnread ? 600 : 400}
                color={hasUnread ? "#111" : "#555555"}
                lineHeight="15px"
              >
                {data.last_msg}
              </Text>
            )}
          </Flex>
        </Flex>

        <Flex alignItems="center" justifyContent="center" flexDir="column">
          <Text
            fontSize={12}
            fontWeight={400}
            color="#555555"
            lineHeight="15px"
            marginBottom="5px"
          >
            {formatDistanceToNow(data?.last_msg_time || "")} ago
          </Text>

          {hasUnread ? (
            <Circle size="20px" p={2} bg="#BDABF9">
              <Text fontSize={12}>{data?.unread_messages}</Text>
            </Circle>
          ) : undefined}
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatListItem;
