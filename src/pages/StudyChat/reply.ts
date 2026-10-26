export interface QuotedReply {
  senderName: string;
  text: string;
}

// Keep quotes readable for clients that only understand plain message text.
const REPLY_HEADER = /^> Replying to ([^\r\n]{1,80}):\r?\n> ([^\r\n]{1,180})\r?\n\r?\n/;

export const parseReplyMessage = (message: string) => {
  const match = REPLY_HEADER.exec(message);
  if (!match) return { text: message, reply: null };

  return {
    text: message.slice(match[0].length),
    reply: { senderName: match[1], text: match[2] },
  };
};

export const formatReplyMessage = (
  message: string,
  reply: QuotedReply | null,
): string => {
  if (!reply) return message;

  const senderName =
    reply.senderName.replace(/\s+/g, " ").trim().slice(0, 80) || "Unknown sender";
  const text = reply.text.replace(/\s+/g, " ").trim();
  const preview = text.length > 180 ? `${text.slice(0, 177)}...` : text || "Message";

  return `> Replying to ${senderName}:\n> ${preview}\n\n${message}`;
};
