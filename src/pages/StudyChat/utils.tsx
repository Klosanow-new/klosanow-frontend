import { Box, Flex } from "@chakra-ui/react";
import {
  ChatData,
  ChatListData,
  ChatType,
  Contact,
  GroupedContact,
  StudyChatListData,
} from "../../types/studyChat";
import { DeleteIcon } from "./assets/svgs";
import { BsFillSendFill } from "react-icons/bs";
import { groupBy } from "lodash";
import { formatISO } from "date-fns";
import { watchLessonPageSlug } from "src/data/pageUrl";
import ChatMediaPreview, {
  ChatMediaType,
} from "./components/ChatMediaPreview/ChatMediaPreview";
import ChatLessonPreview from "./components/ChatLessonPreview/ChatLessonPreview";

export const getContactsListWithChar = (contacts: Contact[]) => {
  const sortedContacts = [...contacts].sort((a, b) => {
    const nameA = getContactDisplayName(a).trim()[0]?.toLowerCase() ?? "";
    const nameB = getContactDisplayName(b).trim()[0]?.toLowerCase() ?? "";

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  const groupedContacts = groupBy(
    sortedContacts,
    (item) =>
      `${item.firstName ?? ""} ${item.lastName ?? ""}`
        .trim()[0]
        ?.toUpperCase() ?? ""
  );

  const grouped = Object.keys(groupedContacts).map((value, keyIndex) => {
    let arr: GroupedContact;

    Object.values(groupedContacts).map((groupedContact, valueIndex) => {
      if (!groupedContact) return;

      if (keyIndex === valueIndex) {
        arr = { contactsChar: value, contacts: groupedContact };
      }
    });

    return arr!;
  });

  return grouped;
};

export const getContactDisplayName = (contact: Contact): string => {
  if (!contact) return "";

  if (contact.username) return contact.username;

  if (contact.firstName || contact.lastName) {
    return `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim();
  }

  if ((contact as any).name) return (contact as any).name;

  return "";
};
const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "ico",
  "svg",
];
const VIDEO_EXTENSIONS = ["mp4", "m4v", "webm", "ogv", "mov", "mkv"];
const AUDIO_EXTENSIONS = [
  "mp3",
  "wav",
  "ogg",
  "oga",
  "aac",
  "m4a",
  "opus",
  "flac",
];
const DOC_EXTENSIONS = ["pdf", "txt", "doc", "docx", "ppt", "pptx"];

/**
 * Containers that carry either an audio or a video track. A voice note recorded
 * in Chrome is `audio/webm`, so the extension alone cannot tell it apart from a
 * screen recording — only the `audio-`/`vid-` prefix can.
 */
const AMBIGUOUS_EXTENSIONS = ["webm", "ogg", "mp4", "mkv"];

export type { ChatMediaType };

/**
 * Matching used to be `extension.includes(format)` over the whole pathname,
 * which is why a url containing "ico", "png" or "gif" anywhere rendered as an
 * image, and why a /watch/:id link whose hex id happened to contain "aac" came
 * out as an <audio> element. Compare the real extension exactly instead.
 */
const extensionFromUrl = (pathname: string) => {
  const segment = pathname.split("/").pop() ?? "";
  const dot = segment.lastIndexOf(".");
  if (dot < 0) return "";

  const extension = segment.slice(dot + 1).toLowerCase();

  // A long or punctuated tail is part of a name, not a file extension.
  return /^[a-z0-9]{2,5}$/.test(extension) ? extension : "";
};

/**
 * Uploads made before names carried an extension are only recognisable by the
 * prefix `buildMediaFileName` still uses today. Without this, every video sent
 * to a chat before that change would render as a bare link.
 */
const legacyTypeFromName = (pathname: string): ChatMediaType => {
  const segment = (pathname.split("/").pop() ?? "").toLowerCase();

  if (segment.startsWith("vid")) return "video";
  if (segment.startsWith("audio") || segment.includes("-audio"))
    return "audio";
  if (segment.startsWith("thumb") || segment.startsWith("img")) return "image";

  return "other";
};

/**
 * Ids are Mongo ObjectIds today, but a length range beats hardcoding 24 hex
 * characters — the point is to reject a path that merely starts with /watch/.
 */
const LESSON_PATH = new RegExp(
  `^/${watchLessonPageSlug}/([A-Za-z0-9_-]{8,64})/?$`,
);

/**
 * The lesson id in one of our own share links, or null for anything else.
 *
 * Host-checked on purpose: some other site's /watch/<something> is a link, not
 * one of our lessons. The cost is that a link pasted across environments (a
 * production url opened on staging) stays a plain link, which is the right way
 * for this to fail.
 */
export const lessonIdFromUrl = (value: string): string | null => {
  try {
    // "watch this <link>." — the url matcher swallows trailing punctuation, and
    // none of those characters can appear in an id or matter in the path.
    const trimmed = value.replace(/[.,;:!?)\]}]+$/, "");
    const url = new URL(
      trimmed.startsWith("www.") ? `https://${trimmed}` : trimmed,
    );
    const bare = (host: string) => host.replace(/^www\./i, "").toLowerCase();

    if (bare(url.host) !== bare(window.location.host)) return null;

    return LESSON_PATH.exec(url.pathname)?.[1] ?? null;
  } catch (e) {
    return null;
  }
};

const getTypeFromUrl = (value: string, type?: string): ChatMediaType => {
  try {
    // A known MIME type beats anything the url can tell us.
    if (type) {
      const category = type.split("/")[0].toLowerCase();
      if (category === "video" || type.includes("video")) return "video";
      if (category === "audio" || type.includes("audio")) return "audio";
      if (category === "image" || type.includes("image")) return "image";
      if (category === "application" || category === "text") return "doc";
    }

    // Our own lesson links carry no file extension, so without this they fall
    // through every branch below and render as a bare url.
    if (lessonIdFromUrl(value)) return "lesson";

    const { pathname } = new URL(value);
    const extension = extensionFromUrl(pathname);

    if (!extension) return legacyTypeFromName(pathname);

    // For a container that holds either track, trust the upload prefix and fall
    // through to the extension only when there isn't one.
    if (AMBIGUOUS_EXTENSIONS.includes(extension)) {
      const hint = legacyTypeFromName(pathname);
      if (hint === "audio" || hint === "video") return hint;
    }

    if (IMAGE_EXTENSIONS.includes(extension)) return "image";
    if (VIDEO_EXTENSIONS.includes(extension)) return "video";
    if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
    if (DOC_EXTENSIONS.includes(extension)) return "doc";

    return "other";
  } catch (e) {
    return "other";
  }
};

export const getUploadedDataPreview = (data: {
  url: string;
  mediaType?: string;
  handleView?: (type: ChatMediaType) => void;
}) => {
  const { url, mediaType, handleView } = data;
  const type = getTypeFromUrl(url, mediaType);

  if (type === "lesson") {
    const lessonId = lessonIdFromUrl(url);

    // The card fetches the lesson itself, so it owns its own viewer — there is
    // no url to hand back to `handleView`, only an id.
    if (lessonId) {
      return <ChatLessonPreview key={`lesson-${lessonId}`} lessonId={lessonId} />;
    }
  }

  return (
    <ChatMediaPreview
      key={`${type}-${url}`}
      url={url}
      type={type}
      handleView={handleView}
    />
  );
};

export const renderPreveiwAction = (send: () => void, remove?: () => void) => (
  <Flex alignItems="center" justifyContent="space-between" padding="0 10px">
    <Box as="button" padding="3px" onClick={send}>
      <BsFillSendFill />
    </Box>

    {remove && (
      <Box as="button" onClick={remove}>
        <DeleteIcon />
      </Box>
    )}
  </Flex>
);

export const transformNameToSlug = (value: string) =>
  value.split(" ").join("_").toLowerCase();

export const getChatListData = (
  chats: Array<ChatData>,
  userId: string
): ChatListData[] => {
  return chats.map((item) => {
    const recipient = item.members.filter((item) => item._id !== userId)[0];
    return {
      id: item?._id,
      createdAt: item?.createdAt,
      admin: item.members.filter((item) => item._id === userId)[0],
      recipient,
      name: `${recipient?.name ?? ""} `.trim(),
      username: `${recipient?.username ?? ""} `.trim(),
      img: recipient?.photoURL,
      slug: transformNameToSlug(
        `${recipient?.username ?? recipient?.name ?? ""}`.trim()
      ),
      last_msg_time:
        item?.lastChatMessage[0]?.createdAt || formatISO(new Date()),
      type: ChatType.Single,
      last_msg: item?.lastChatMessage[0]?.text.substring(0, 20),
      last_msg_sender_id: item?.lastChatMessage[0]?.sender?._id,
    };
  });
};

export const getStudyChatListData = (
  chats: StudyChatListData[]
): ChatListData[] => {
  return chats.map((item) => {
    const owner = item.members.filter((member) => member._id === item.owner)[0];

    return {
      id: item._id,
      name: item?.title ?? owner?.username,
      username: item?.title ?? owner?.username,
      img: item?.photoUrl,
      slug: transformNameToSlug(item.title),
      last_msg_time: item?.createdAt,
      type: ChatType.Group,
      admin: owner,
      members: item?.members,
      createdAt: item?.createdAt,
    };
  });
};

export const copyText = async (value: string, toastAction: () => void) => {
  await navigator.clipboard.writeText(value);

  const timeout = setTimeout(toastAction, 500);

  return () => clearTimeout(timeout);
};
