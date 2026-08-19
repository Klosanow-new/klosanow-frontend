import React from "react";
import { ChatListData } from "src/types";

const STORAGE_KEY = "klosanow-unread-chats";

/**
 * The chat endpoints return no unread count, so read state is tracked per
 * device here. Two pieces are kept:
 *
 * - `keys`: ids flagged by an incoming socket message. The `new-message`
 *   payload may identify a conversation by `studyChatId`, `chatId` or only by
 *   its sender, so whichever arrives is stored and a chat clears every key it
 *   could have been flagged under.
 * - `readAt`: when each chat was last open, so messages that landed while the
 *   app was closed still count as unread on the next load.
 */
interface UnreadState {
  keys: string[];
  readAt: Record<string, string>;
}

const load = (): UnreadState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<UnreadState>) : {};
    return {
      keys: Array.isArray(parsed.keys) ? parsed.keys : [],
      readAt: parsed.readAt || {},
    };
  } catch {
    return { keys: [], readAt: {} };
  }
};

let state: UnreadState = load();
const listeners = new Set<() => void>();

const commit = (next: UnreadState) => {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // A full or unavailable localStorage shouldn't break the badge.
  }
  listeners.forEach((listener) => listener());
};

/** Every id a chat could have been flagged under. */
const chatKeys = (chat: ChatListData): string[] =>
  [chat.id, chat.recipient?._id].filter(Boolean) as string[];

/**
 * Flag a conversation as having something unread. `key` is whichever of
 * `studyChatId`, `chatId` or sender id the socket payload carried.
 */
export const markChatUnread = (key?: string) => {
  if (!key || state.keys.includes(key)) return;
  commit({ ...state, keys: [...state.keys, key] });
};

/** Clear a conversation once the user has it open. */
export const markChatRead = (chat: ChatListData | null) => {
  if (!chat?.id) return;

  const keys = chatKeys(chat);
  commit({
    keys: state.keys.filter((key) => !keys.includes(key)),
    readAt: { ...state.readAt, [chat.id]: new Date().toISOString() },
  });
};

export const isChatUnread = (
  chat: ChatListData,
  unread: UnreadState,
  currentUserId?: string
): boolean => {
  if (chatKeys(chat).some((key) => unread.keys.includes(key))) return true;

  // Nothing arrived over the socket this session, so fall back to the list
  // data: a last message from someone else that postdates the last time this
  // chat was open has not been seen yet.
  const senderId = chat.last_msg_sender_id;
  if (!senderId || !currentUserId || senderId === currentUserId) return false;
  if (!chat.last_msg_time) return false;

  const readAt = unread.readAt[chat.id];
  return !readAt || new Date(chat.last_msg_time) > new Date(readAt);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

export const useUnreadChats = (): UnreadState =>
  React.useSyncExternalStore(subscribe, getSnapshot);
