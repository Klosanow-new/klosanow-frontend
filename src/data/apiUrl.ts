export const draftsRoute = "drafts";
export const lessonRoute = "lessons";
export const mediaRoute = "media";
export const userRoute = "users";

// Chats
export const chatApiRoute = "chats";
export const studyChatApiRoute = "studychats";

// Study chat
export const chatWebSocket = "chats";

const allChatsWebSocketSlug = "get-all";
const singleChatWebSocketSlug = "get-one";
const deleteChatWebSocketSlug = "delete-one";
const sendChatWebSocketSlug = "send-message";

export const allChatsWebSocketUrl = `${chatWebSocket}:${allChatsWebSocketSlug}`;
export const singleChatWebSocketUrl = `${chatWebSocket}:${singleChatWebSocketSlug}`;
export const deleteChatWebSocketUrl = `${chatWebSocket}:${deleteChatWebSocketSlug}`;
export const sendChatWebSocketUrl = `${chatWebSocket}:${sendChatWebSocketSlug}`;

// Emitted by the server to the *recipient's* socket when a message arrives.
// `send-message` only echoes back to the sender, so this is the only way to
// know an incoming message landed.
const newMessageWebSocketSlug = "new-message";
export const newMessageWebSocketUrl = `${chatWebSocket}:${newMessageWebSocketSlug}`;

export const studyChatWebSocket = "studychats";
export const createStudyChatsWebSocketSlug = "create";
export const updateStudyChatPhotoWebSocketSlug = "update-photo";
const addMemberChatSocketSlug = "add-members";

export const createStudyChatsWebSocketUrl = `${studyChatWebSocket}:${createStudyChatsWebSocketSlug}`;
export const allStudyChatsWebSocketUrl = `${studyChatWebSocket}:${allChatsWebSocketSlug}`;
export const singleStudyChatWebSocketUrl = `${studyChatWebSocket}:${singleChatWebSocketSlug}`;
export const deleteStudyChatWebSocketUrl = `${studyChatWebSocket}:${deleteChatWebSocketSlug}`;
export const addStudyChatMembersWebSocketUrl = `${studyChatWebSocket}:${addMemberChatSocketSlug}`;
export const sendStudyChatWebSocketUrl = `${studyChatWebSocket}:${sendChatWebSocketSlug}`;
export const updateStudyChatPhotoWebSocketUrl = `${studyChatWebSocket}:${updateStudyChatPhotoWebSocketSlug}`;
export const newStudyChatMessageWebSocketUrl = `${studyChatWebSocket}:${newMessageWebSocketSlug}`;

export const newMessageWebSocketUrls = [
  newMessageWebSocketUrl,
  newStudyChatMessageWebSocketUrl,
  newMessageWebSocketSlug,
];

// Web push
export const vapidPublicKeyRoute = "push/vapid-public-key";
export const pushSubscribeRoute = "push/subscribe";
