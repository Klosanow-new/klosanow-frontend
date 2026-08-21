import { FileUrlKey } from "../types/generics";

export const USER_KEY = "USER_KEY";

export const USER = () => {
  let storeL = localStorage.getItem(USER_KEY);

  if (storeL) {
    return JSON.parse(storeL);
  }

  let storeS = sessionStorage.getItem(USER_KEY);

  if (storeS) {
    return JSON.parse(storeS);
  }

  return storeS;
};

export function savedwithExp(
  value: Record<string, unknown>,
  days: number,
  storage?: "sessionStorage" | "localStorage"
) {
  const now = new Date();

  let exp = days * 86400; // secs in a day

  const item = {
    ...value,
    expiry: now.getTime() + exp,
  };

  // console.log("At expiry savedwithExp", item);

  if (storage === "sessionStorage") {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.setItem(USER_KEY, JSON.stringify(item));
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(item));
  }
}

export const getToken = (key?: string): string | null => {
  const userKey = key || "USER_KEY";

  const stored =
    localStorage.getItem(userKey) || sessionStorage.getItem(userKey);

  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Record<string, any>;

    const token = parsed.data?.token || null;

    return token;
  } catch (error) {
    console.error("Error parsing token from storage:", error);
    return null;
  }
};

export const getDraftId = () => localStorage.getItem("draft_id");

export const setDraftId = (id: string) => localStorage.setItem("draft_id", id);

export const clearDraftId = () => localStorage.setItem("draft_id", "");

export const getFileUrl = (fileKey: FileUrlKey) =>
  localStorage.getItem(fileKey);

export const setFileUrl = (fileKey: FileUrlKey, file_url: string) =>
  localStorage.setItem(fileKey, file_url);

export const clearFileUrl = (fileKey: FileUrlKey) =>
  localStorage.setItem(fileKey, "");

/**
 * Where to land after signing in. Set when a guarded route turns a visitor
 * away, so someone opening a shared lesson link while signed out still reaches
 * the lesson instead of the dashboard.
 *
 * sessionStorage on purpose: the axios 401 interceptor calls
 * localStorage.clear() before bouncing to sign-in, which would wipe this.
 */
const POST_AUTH_REDIRECT_KEY = "post_auth_redirect";

export const setPostAuthRedirect = (path: string) =>
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path);

export const takePostAuthRedirect = () => {
  const path = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  return path;
};
