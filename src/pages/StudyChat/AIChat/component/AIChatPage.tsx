import React from "react";
import {
  Box,
  Flex,
  Text,
  Circle,
  Image,
  IconButton,
  Spinner,
  Textarea,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoSend } from "react-icons/io5";
import BOT_AVATAR from "src/assets/images/klosanow.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { colors } from "src/data/colors";
import { containerAnimation } from "../../data";
import ReactMarkdown from "react-markdown";
interface Message {
  sender: "user" | "bot";
  text: string;
}

const KlosanowAPI = "https://chat.klosanow.com";

const AIChatPage = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = React.useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I'm Klosanow AI. How can I help you today?",
    },
  ]);

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formatBotMessage = (text: string) => {
    if (!text) return "";
    return text.replace(/\*/g, "").replace(/_/g, "").trim();
  };

  const handleSend = async () => {
    if (!input.trim()) {
      setInput("");
      return;
    }

    const cleanInput = input.trim();

    const userMessage: Message = { sender: "user", text: cleanInput };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${KlosanowAPI}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: JSON.stringify(messages.concat(userMessage)),
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        sender: "bot",
        text:
          formatBotMessage(data.message) || "I had trouble processing that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Network error. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <Box
      as={motion.div}
      animation={containerAnimation}
      display="flex"
      flexDir={"column"}
      padding={["0 0 10px", "60px 0 0"]}
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

      // flex={1}
    >
      {/* HEADER */}
      <Flex
        h="65px"
        bg="#F3ECF8"
        align="center"
        px="10px"
        boxShadow="sm"
        gap="10px"
      >
        <IconButton
          aria-label="back"
          icon={<FaArrowLeft />}
          //   boxSize={6}
          color="neutral.100"
          cursor="pointer"
          variant="ghost"
          onClick={() => navigate(-1)}
        />
        <Circle size="45px" bg="primary.100" overflow="hidden">
          <Image src={BOT_AVATAR} alt="AI" />
        </Circle>

        <Box>
          <Text fontWeight={600} fontSize="17px">
            Klosanow AI
          </Text>
          <Text fontSize="12px" color="gray.600">
            Ask anything about your studies
          </Text>
        </Box>
      </Flex>

      {/* BODY */}
      <Flex
        flex={1}
        flexDir="column"
        overflowY="auto"
        p={"10px 16px 0"}
        gap="10px"
      >
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";

          return (
            <Flex
              key={index}
              justify={isUser ? "flex-end" : "flex-start"}
              maxW="100%"
            >
              <Flex
                bg={isUser ? "#D3C7FB" : "#F3ECF8"}
                maxW="75%"
                borderRadius="14px"
                px="12px"
                py="8px"
                boxShadow="md"
                flexDir="column"
              >
                {!isUser && (
                  <Text fontSize="10px" fontWeight="bold" color="purple.500">
                    Klosanow AI
                  </Text>
                )}

                <ReactMarkdown
                  children={msg.text}
                  components={{
                    p: (props) => (
                      <Text
                        fontSize="14px"
                        mb="6px"
                        wordBreak={"break-word"}
                        overflowWrap={"anywhere"}
                        {...props}
                      />
                    ),
                    strong: (props) => (
                      <b
                        style={{
                          fontWeight: 700,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {props.children}
                      </b>
                    ),
                    li: (props) => (
                      <li
                        style={{
                          marginLeft: "16px",
                          marginBottom: "4px",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {props.children}
                      </li>
                    ),
                  }}
                />
              </Flex>
            </Flex>
          );
        })}

        {loading && (
          <Flex justify="flex-start">
            <Flex
              bg="#F3ECF8"
              px="12px"
              py="8px"
              borderRadius="14px"
              boxShadow="md"
              gap="6px"
              align="center"
            >
              <Spinner size="sm" />
              <Text>...</Text>
            </Flex>
          </Flex>
        )}

        <div ref={messagesEndRef} />
      </Flex>

      {/* FOOTER */}
      <Flex
        bg={colors.primary[5]}
        // p="10px"
        position="sticky"
        bottom={0}
        borderTop="1px solid #eee"
        zIndex={20}
        pb="max(env(safe-area-inset-bottom), 10px)"
      >
        <Flex
          maxW="552px"
          bg={colors.primary[5]}
          w="100%"
          p="13px"
          // p="13px 17px 14px"
          borderRadius="10px"
          alignItems={"center"}
          gap={"16px"}
          position="relative"
        >
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey
                ? (e.preventDefault(), handleSend())
                : null
            }
            resize={"none"}
            rows={1}
            bg="#f7f7f7"
            borderRadius="12px"
            _focus={{ borderColor: "primary.100" }}
            flex={1}
            p={4}
            overflowY={"auto"}
          />

          <IconButton
            aria-label="send"
            icon={<IoSend />}
            colorScheme="purple"
            onClick={handleSend}
            isDisabled={loading || !input.trim()}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default AIChatPage;
