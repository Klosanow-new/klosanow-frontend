import React from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import ChatListItem from "./ChatListItem";
import { uniqueId } from "lodash";
import { ChatListData } from "../../../../types/studyChat";
import { Link, useNavigate } from "react-router-dom";
import {
  contactsPagePath,
  createStudyChatPath,
} from "../../../../data/pageUrl";
import { BsChatLeftText } from "react-icons/bs";
import { ContactIcon } from "src/assets/svgs";
import Klosanow from "src/assets/images/klosanow.png";
interface ChatListProps {
  list: ChatListData[] | null;
}

const ChatList: React.FC<ChatListProps> = ({ list }) => {
  const navigate = useNavigate();

  return (
    <Box width="100%" maxWidth="523px" bg="#fafafa" p="24px 30px">
      <Flex justifyContent="space-between" mb="24px" alignItems="center">
        <Heading
          fontFamily="Playfair Display, serif"
          fontSize={["18px", "24px"]}
        >
          All Chats ({list?.length})
        </Heading>

        <Flex align="center" gap="6px">
          <Box
            as="button"
            display={["flex", "none"]}
            onClick={() => navigate(contactsPagePath)}
          >
            <ContactIcon />
          </Box>

          <Button
            onClick={() =>
              navigate(
                { pathname: createStudyChatPath },
                {
                  state: {
                    contacts: [],
                    isContactsAdded: false,
                  },
                }
              )
            }
            bg="#9174F6"
            _hover={{ bg: "#A790F8" }}
            color="#fff"
            fontSize={["13px", "16px"]}
          >
            Create Study Group
          </Button>
        </Flex>
      </Flex>

      <Flex
        gap="20px"
        p={2}
        align="center"
        borderBottomWidth={"2px"}
        cursor="pointer"
        onClick={() => navigate("/study-chat/ai")}
      >
        <Flex align="center" gap="10px">
          <Circle size="50px" bg="primary.100">
            <Image src={Klosanow} alt="AI" />
          </Circle>
        </Flex>
        <Text>Klosanow AI</Text>
      </Flex>

      {list && list.length > 0 ? (
        <Flex
          gap="20px"
          flexDir="column"
          h="598px"
          overflowY="scroll"
          className="scrollbar"
          pr={{
            base: "5px",
            lg: "13px",
          }}
        >
          {list.map((item) => (
            <ChatListItem data={item} key={uniqueId("chat-list")} />
          ))}
        </Flex>
      ) : (
        <Box display={"grid"} placeItems={"center"} mt="100px">
          <BsChatLeftText fontSize={78} />
          <Text fontSize="13px">You have not initiated any chat.</Text>
          <Text fontSize="13px" textAlign={"center"}>
            Click{" "}
            <Link to={contactsPagePath} style={{ textDecoration: "underline" }}>
              here
            </Link>{" "}
            to start a chat or click{" "}
            <span
              onClick={() =>
                navigate(
                  { pathname: createStudyChatPath },
                  {
                    state: {
                      contacts: [],
                      isContactsAdded: false,
                    },
                  }
                )
              }
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              here
            </span>{" "}
            to start a group chat.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ChatList;
