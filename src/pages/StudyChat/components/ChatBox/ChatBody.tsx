import React from "react";
import {
  Box,
  Circle,
  Flex,
  IconButton,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { ChatListData, ChatType, MessageType } from "src/types";
import {
  ChatMediaType,
  getContactDisplayName,
  getUploadedDataPreview,
  lessonIdFromUrl,
} from "../../utils";
import { useStoreSelector } from "src/redux/hooks";
import { VideoPlayer } from "src/components";
import { BsReply } from "react-icons/bs";
import { parseReplyMessage } from "../../reply";
import ReplyPreview from "./ReplyPreview";

interface MessageRowProps {
  children: React.ReactNode;
  isIncoming: boolean;
  onReply: () => void;
}

const MessageRow = ({ children, isIncoming, onReply }: MessageRowProps) => {
  const [offset, setOffset] = React.useState(0);
  const gestureRef = React.useRef<{
    pointerId: number;
    x: number;
    y: number;
    direction: "pending" | "horizontal" | "vertical";
  } | null>(null);

  const resetGesture = () => {
    gestureRef.current = null;
    setOffset(0);
  };

  return (
    <Box
      role="group"
      alignSelf={isIncoming ? "flex-start" : "flex-end"}
      maxW={{ base: "90%", md: "80%" }}
      position="relative"
      pr="36px"
      style={{ touchAction: "pan-y pinch-zoom" }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" || !event.isPrimary) return;
        if ((event.target as Element).closest(
          "button, a, input, textarea, audio, video, [role='button']",
        )) return;
        gestureRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          direction: "pending",
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const gesture = gestureRef.current;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (
          gesture.direction === "pending" &&
          Math.max(Math.abs(dx), Math.abs(dy)) > 10
        ) {
          gesture.direction = dx < 0 && Math.abs(dx) > Math.abs(dy) * 1.5
            ? "horizontal"
            : "vertical";
        }
        if (gesture.direction === "horizontal") {
          setOffset(Math.max(-72, Math.min(0, dx)));
        }
      }}
      onPointerUp={(event) => {
        const gesture = gestureRef.current;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        const shouldReply =
          gesture.direction === "horizontal" &&
          dx <= -56 &&
          Math.abs(dx) > Math.abs(dy) * 1.5;
        resetGesture();
        if (shouldReply) onReply();
      }}
      onPointerCancel={resetGesture}
      onLostPointerCapture={resetGesture}
    >
      <IconButton
        aria-label="Reply to message"
        title="Reply"
        icon={<BsReply />}
        size="sm"
        variant="ghost"
        color="#6143B7"
        position="absolute"
        right="0"
        top="50%"
        transform="translateY(-50%)"
        opacity={offset < 0 ? 1 : { base: 1, md: 0 }}
        _groupHover={{ opacity: 1 }}
        _groupFocusWithin={{ opacity: 1 }}
        _focusVisible={{ opacity: 1, boxShadow: "outline" }}
        onClick={onReply}
      />
      <Box
        transform={`translateX(${offset}px)`}
        transition={offset ? "none" : "transform 0.15s ease"}
      >
        {children}
      </Box>
    </Box>
  );
};

interface ChatBodyProps {
  messages: Array<MessageType>;
  loading: boolean;
  activeChat: ChatListData;
  onReply: (message: MessageType) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  loading,
  activeChat,
  onReply,
}) => {
  const mediaCacheRef = React.useRef<Record<string, JSX.Element | null>>({});

  const [viewMedia, setViewMedia] = React.useState<{
    url: string;
    type: ChatMediaType;
  } | null>(null);
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
  const senderId = user.data?._id;

  const extractURLs = (text: string) => {
    const urlRegex = /\b((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;
    const matchedUrls = text.match(urlRegex) || [];
    return matchedUrls;
  };

  const reformatText = (text: string) => {
    const urlRegex = /\b((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;

    const stripped = text.replace(urlRegex, (url) => {
      try {
        const fixedUrl = url.startsWith("www.") ? "https://" + url : url;
        const urlObj = new URL(fixedUrl);

        // A lesson link is rendered as a playable card above this text, so the
        // url itself is noise. It has no file extension, so without this it
        // falls past the check below and prints in full.
        if (lessonIdFromUrl(fixedUrl)) return "";

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

    // Removing a url can leave the gap it sat in, or nothing but whitespace when
    // the message was only a link.
    return stripped.replace(/[ \t]{2,}/g, " ").trim();
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
      const urls = extractURLs(parseReplyMessage(item.text).text) || [];
      urls.forEach((url) => {
        if (!(url in mediaCacheRef.current)) {
          const preview =
            getUploadedDataPreview({
              url,
              handleView: (type) => setViewMedia({ url, type }),
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
      flex="1"
      minH={0}
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
            const parsedMessage = parseReplyMessage(item.text);
            const urls = extractURLs(parsedMessage.text) || [];
            const visibleText = reformatText(parsedMessage.text);
            const isSender = senderId !== item.sender._id;
            const isNewInSession = new Date(item.createdAt).getTime() > sessionStartTimeRef.current;

            return (
              <React.Fragment key={item._id}>
                <MessageRow isIncoming={isSender} onReply={() => onReply(item)}>
                  <Flex gap="4px" minW={0}>
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
                      minW={0}
                      maxW="100%"
                      padding={"4px 8px"}
                      flexDir={"column"}
                      gap={"4px"}
                      style={isNewInSession ? {
                        animation: "pulseHighlight 2.5s ease-out",
                        border: "1.5px solid #9174F6"
                      } : undefined}
                    >
                      {parsedMessage.reply && (
                        <ReplyPreview reply={parsedMessage.reply} />
                      )}
                      {urls.map((url) => {
                        const cachedPreview = mediaCacheRef.current[url];
                        if (cachedPreview !== undefined) {
                          return cachedPreview || null;
                        }
                        return getUploadedDataPreview({
                          url,
                          handleView: (type) => setViewMedia({ url, type }),
                        });
                      })}

                      {/*
                        A message that was nothing but a lesson link has no text
                        left once the link is stripped — render no bubble line at
                        all rather than an empty one under the card.
                      */}
                      {visibleText && (
                        <Text wordBreak={"break-word"} fontSize="14px">
                          {visibleText}
                        </Text>
                      )}

                      {isSender && activeChat.type === ChatType.Group && (
                        <Text fontSize="9px">
                          {getContactDisplayName(item.sender)}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </MessageRow>

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

      <Modal
        isOpen={!!viewMedia}
        onClose={() => setViewMedia(null)}
        size={viewMedia?.type === "video" ? "xl" : "md"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent backgroundColor={"#000000c1"} padding={"6px"}>
          <ModalCloseButton color="#fff" zIndex={1} />

          {viewMedia?.type === "video" ? (
            <VideoPlayer src={viewMedia.url} autoPlay maxHeight="70vh" />
          ) : (
            <Image
              src={viewMedia?.url}
              w="100%"
              h="100%"
              maxH="600px"
              borderRadius="8px"
              objectFit="contain"
              opacity="0.85"
            />
          )}
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
