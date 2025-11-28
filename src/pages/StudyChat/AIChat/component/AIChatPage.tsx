import React from "react";
import {
  Box,
  Flex,
  Text,
  Circle,
  Image,
  Input,
  IconButton,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoSend } from "react-icons/io5";
import BOT_AVATAR from "src/assets/images/klosanow.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const KlosanowAPI = "https://klosanow-ai.pxxl.click";

const AIChatPage = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = React.useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I'm Klosanow AI. How can I help you today?",
    },
  ]);

  console.log(messages);

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formatBotMessage = (text: string) => {
    if (!text) return "";

    let cleaned = text.replace(/\*/g, "").replace(/_/g, "").replace(/~/g, "");
    cleaned = cleaned.replace(/\s+/g, " ");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };

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
      console.log("Data from backend", data, res);

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
      bg="#fff"
      w="100%"
      h="100vh"
      maxW="653px"
      position="fixed"
      right="0"
      top="0"
      zIndex={50}
      as={motion.div}
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
        <Icon
          as={FaArrowLeft}
          boxSize={6}
          color="neutral.100"
          cursor="pointer"
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
        flexDir="column"
        overflowY="scroll"
        h="calc(100vh - 130px)"
        px="16px"
        py="12px"
        gap="12px"
      >
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";

          return (
            <Flex
              key={index}
              justify={isUser ? "flex-end" : "flex-start"}
              w="100%"
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
                    AI Tutor
                  </Text>
                )}
                <Text fontSize="14px" whiteSpace="pre-wrap">
                  {msg.text}
                </Text>
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
              <Text>Thinking...</Text>
            </Flex>
          </Flex>
        )}

        <div ref={messagesEndRef} />
      </Flex>

      {/* FOOTER */}
      <Flex
        h="65px"
        p="12px 16px"
        borderTop="1px solid #eee"
        align="center"
        gap="10px"
      >
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          bg="#f7f7f7"
        />

        <IconButton
          aria-label="send"
          icon={<IoSend />}
          colorScheme="purple"
          onClick={handleSend}
          isDisabled={loading}
        />
      </Flex>
    </Box>
  );
};

export default AIChatPage;
