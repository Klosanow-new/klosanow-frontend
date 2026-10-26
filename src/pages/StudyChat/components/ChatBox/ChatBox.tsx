import React from "react";
import { Box } from "@chakra-ui/react";
import StudyChatEmptyState from "../StudyChatEmptyState";
import { motion } from "framer-motion";
import StudyChatEmptyStateIllustration from "../../assets/images/StudyChatEmptyStateIllustration.jpg";
import { containerAnimation, contentAnimation } from "../../data";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import useChatWebSocket from "src/hooks/useChatWebSocket";
import { ChatListData, ChatType, MessageType } from "src/types";
import { StudyChatContext } from "../../context/StudyChat";
import { getChat, getStudyChat } from "src/api-endpoints/studyChat";
import { markChatRead } from "src/utils/unreadChats";
import { QuotedReply } from "../../reply";
import { getContactDisplayName, getReplyPreviewText } from "../../utils";

interface ChatBoxProps {
  chat: ChatListData | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  const { eventType } = useChatWebSocket();
  const { loadingMessage, updateStudyChatValues } =
    React.useContext(StudyChatContext);

  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [loadedChatKey, setLoadedChatKey] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);
  const [replySelection, setReplySelection] = React.useState<{
    chatKey: string;
    reply: QuotedReply;
  } | null>(null);
  const requestRef = React.useRef(0);
  const chatKey = `${chat?.type}:${chat?.id || chat?.slug}`;
  const reply = replySelection?.chatKey === chatKey ? replySelection.reply : null;
  const visibleMessages = loadedChatKey === chatKey ? messages : [];

  React.useEffect(() => {
    setReplySelection(null);
    return () => {
      requestRef.current += 1;
    };
  }, [chatKey]);

  const handleReply = (message: MessageType) => {
    setReplySelection({
      chatKey,
      reply: {
        senderName: getContactDisplayName(message.sender) || "Unknown sender",
        text: getReplyPreviewText(message.text),
      },
    });
  };

  const handleRefresh = () => {
    if (!chat?.id) updateStudyChatValues({ isNewChat: true });
    setIsSent(true);
  };

  const handleFetchChat = React.useCallback(async () => {
    const request = ++requestRef.current;
    if (!chat?.id) {
      setMessages([]);
      setLoadedChatKey(chatKey);
      return;
    }

    try {
      if (chat.type === ChatType.Single) {
        const res = await getChat(chat.id);
        if (request !== requestRef.current) return;
        setMessages(res.data);
      } else if (chat.type === ChatType.Group) {
        const studyChatRes = await getStudyChat(chat.id);
        if (request !== requestRef.current) return;
        setMessages(studyChatRes.data);
      } else {
        setMessages([]);
      }
      setLoadedChatKey(chatKey);
    } finally {
      if (request === requestRef.current) {
        updateStudyChatValues({ loadingMessage: false });
        setIsSent(false);
      }
    }
  }, [chatKey, loadingMessage]);

  React.useEffect(() => {
    if (eventType === "ping" || eventType === "message" || isSent)
      handleFetchChat();
  }, [handleFetchChat, eventType, isSent]);

  // An open chat is read, including anything that arrives while it stays open.
  React.useEffect(() => {
    markChatRead(chat);
  }, [chat?.id, messages.length]);

  return (
    <>
      {chat && (
        <Box
          as={motion.div}
          padding={["0 0 10px", "60px 0 0"]}
          animation={containerAnimation}
          initial="hidden"
          animate="show"
          maxW={{
            base: "500px",
            lg: "380px",
            xl: "653px",
          }}
          w="100%"
          h="100dvh"
          top="0"
          right="0"
          position="fixed"
          background="#fff"
          zIndex={10}
        >
          <Box
            as={motion.div}
            animation={contentAnimation}
            display="flex"
            flexDir="column"
            h="100%"
            minH={0}
          >
            <Box flexShrink={0}>
              <ChatHeader data={chat} />
            </Box>
            <ChatBody
              key={`body-${chatKey}`}
              messages={visibleMessages}
              loading={loadingMessage}
              activeChat={chat}
              onReply={handleReply}
            />
            <ChatFooter
              key={`footer-${chatKey}`}
              activeChat={chat}
              loading={loadingMessage}
              refresh={handleRefresh}
              reply={reply}
              onCancelReply={() => setReplySelection(null)}
            />
          </Box>
        </Box>
      )}

      <Box
        display={{
          base: "none",
          lg: "block",
        }}
        w="100%"
        padding={"10px 30px 0"}
      >
        <StudyChatEmptyState
          title="Study Chat"
          image={StudyChatEmptyStateIllustration}
          desc="Send and receive messages from your contacts"
        />
      </Box>
    </>
  );
};

export default ChatBox;
