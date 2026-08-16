import React from "react";
import {
  Box,
  Circle,
  Flex,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { ChatListData, ChatType, MessageType } from "src/types";
import { getUploadedDataPreview } from "../../utils";
import { useStoreSelector } from "src/redux/hooks";
import { getContactDisplayName } from "../../utils";

interface ChatBodyProps {
  messages: Array<MessageType>;
  loading: boolean;
  activeChat: ChatListData;
}

const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  loading,
  activeChat,
}) => {
  const mediaCacheRef = React.useRef<Record<string, JSX.Element | null>>({});

  const [viewImage, setViewImage] = React.useState("");
  const [, forceUpdate] = React.useState(0);
  const user = useStoreSelector((state) => state.user);

  const [firstUnreadMessageId, setFirstUnreadMessageId] = React.useState<string | null>(null);
  const sessionStartTimeRef = React.useRef(Date.now());

  React.useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    setFirstUnreadMessageId(null);
  }, [activeChat?.id]);

  React.useEffect(() => {
    if (activeChat?.id && messages?.length > 0 && !firstUnreadMessageId) {
      const unreadCount = activeChat.unread_messages || 0;
      if (unreadCount > 0 && unreadCount <= messages.length) {
        const firstUnreadMsg = messages[messages.length - unreadCount];
        setFirstUnreadMessageId(firstUnreadMsg._id);
      }
    }
  }, [activeChat?.id, messages?.length, firstUnreadMessageId]);
  const senderId =
    activeChat.members?.find((item) => item._id === user.data?._id)?._id ||
    activeChat.admin?._id;

  const extractURLs = (text: string) => {
    const urlRegex = /\b((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;
    const matchedUrls = text.match(urlRegex) || [];
    return matchedUrls;
  };

  const reformatText = (text: string) => {
    const urlRegex = /\b((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;

    return text.replace(urlRegex, (url) => {
      try {
        const fixedUrl = url.startsWith("www.") ? "https://" + url : url;
        const urlObj = new URL(fixedUrl);

        const pathname = urlObj.pathname;
        const filename = pathname.substring(pathname.lastIndexOf("/") + 1);

        const ext = filename.includes(".")
          ? filename.split(".").pop()?.toLowerCase()
          : "";

        return ext || url;
      } catch {
        return url;
      }
    });
  };

  const reversedMessages = React.useMemo(() => {
    let newMessages: MessageType[] = [];
    if (activeChat.id) newMessages = [...messages].reverse();
    else newMessages = [];

    return newMessages;
  }, [messages, activeChat?.id]);

  React.useEffect(() => {
    if (!reversedMessages) return;

    let updated = false;
    reversedMessages.forEach((item) => {
      const urls = extractURLs(item.text) || [];
      urls.forEach((url) => {
        if (!(url in mediaCacheRef.current)) {
          const preview =
            getUploadedDataPreview({
              url,
              handleView: () => setViewImage(url),
            }) ?? null;
          mediaCacheRef.current[url] = preview;
          updated = true;
        }
      });
    });

    if (updated) {
      forceUpdate((count) => count + 1);
    }
  }, [reversedMessages]);

  return (
    <Flex
      h={{
        base: "calc(100dvh - 200px)",
        md: "calc(100vh - 264px)",
      }}
      p={"10px 16px 0"}
      overflowY="scroll"
      flexDir={"column-reverse"}
      gap="10px"
      w="100%"
      zIndex={1000}
    >
      <style>{`
        @keyframes pulseHighlight {
          0% { box-shadow: 0 0 0 0px rgba(145, 116, 246, 0.7); }
          50% { box-shadow: 0 0 0 6px rgba(145, 116, 246, 0); }
          100% { box-shadow: 0 0 0 0px rgba(145, 116, 246, 0); }
        }
      `}</style>

      {!loading && messages?.length > 0
        ? reversedMessages?.map((item) => {
            const urls = extractURLs(item.text) || [];
            const isSender = senderId !== item.sender._id;
            const isNewInSession = new Date(item.createdAt).getTime() > sessionStartTimeRef.current;

            return (
              <React.Fragment key={item._id}>
                <Box
                  alignSelf={isSender ? "flex-start" : "flex-end"}
                  maxW="60%"
                >
                  <Flex gap="4px">
                    {isSender && (
                      <Circle size="20px" bg="#eee" overflow="hidden">
                        <Image
                          src={
                            item?.sender.photoURL || "https://picsum.photos/50/50"
                          }
                          alt="chat"
                        />
                      </Circle>
                    )}

                    <Flex
                      backgroundColor={isSender ? "#D3C7FB" : "#F3ECF8"}
                      boxShadow="md"
                      borderRadius={14}
                      minW={50}
                      padding={"4px 8px"}
                      flexDir={"column"}
                      gap={"4px"}
                      style={isNewInSession ? {
                        animation: "pulseHighlight 2.5s ease-out",
                        border: "1.5px solid #9174F6"
                      } : undefined}
                    >
                      {urls.map((url) => {
                        const cachedPreview = mediaCacheRef.current[url];
                        if (cachedPreview !== undefined) {
                          return cachedPreview || null;
                        }
                        return getUploadedDataPreview({
                          url,
                          handleView: () => setViewImage(url),
                        });
                      })}

                      <Text wordBreak={"break-word"} fontSize="14px">
                        {reformatText(item.text)}
                      </Text>

                      {isSender && activeChat.type === ChatType.Group && (
                        <Text fontSize="9px">
                          {getContactDisplayName(item.sender)}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Box>

                {item._id === firstUnreadMessageId && (
                  <Flex align="center" width="100%" my="3" justify="center">
                    <Box flex="1" height="1px" bg="red.200" />
                    <Box px="3" py="1" bg="red.100" color="red.600" borderRadius="full" fontSize="11px" fontWeight="bold" mx="2">
                      New Messages
                    </Box>
                    <Box flex="1" height="1px" bg="red.200" />
                  </Flex>
                )}
              </React.Fragment>
            );
          })
        : undefined}

      <Modal isOpen={!!viewImage} onClose={() => setViewImage("")}>
        <ModalOverlay />
        <ModalContent backgroundColor={"#000000c1"} padding={"6px"}>
          <Image
            src={viewImage}
            w="100%"
            h="100%"
            maxH="600px"
            borderRadius="8px"
            objectFit="contain"
            opacity="0.85"
          />
        </ModalContent>
      </Modal>

      {!loading && messages.length === 0 && (
        <Box textAlign={"center"}>
          <Text>
            Start sending message to {getContactDisplayName(activeChat as any)}
          </Text>
        </Box>
      )}

      {loading && activeChat.id && (
        <Box textAlign={"center"}>
          <Text>Connecting...</Text>
        </Box>
      )}
    </Flex>
  );
};

export default ChatBody;
