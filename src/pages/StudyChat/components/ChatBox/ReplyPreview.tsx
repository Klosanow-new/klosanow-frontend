import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { QuotedReply } from "../../reply";

interface ReplyPreviewProps {
  reply: QuotedReply;
  onCancel?: () => void;
}

const ReplyPreview = ({ reply, onCancel }: ReplyPreviewProps) => (
  <Flex
    borderLeft="3px solid #9174F6"
    borderRadius="4px"
    bg="whiteAlpha.600"
    p="6px 8px"
    gap="8px"
    align="center"
    minW={0}
    w="100%"
    role={onCancel ? "status" : undefined}
  >
    <Box minW={0} flex="1">
      <Text fontSize="12px" fontWeight="600" color="#6143B7" noOfLines={1}>
        {onCancel ? `Replying to ${reply.senderName}` : reply.senderName}
      </Text>
      <Text fontSize="12px" color="#555555" noOfLines={2} wordBreak="break-word">
        {reply.text}
      </Text>
    </Box>
    {onCancel && (
      <IconButton
        aria-label="Cancel reply"
        title="Cancel reply"
        icon={<CloseIcon boxSize="10px" />}
        size="sm"
        variant="ghost"
        flexShrink={0}
        onClick={onCancel}
      />
    )}
  </Flex>
);

export default ReplyPreview;
