import { USER_KEY } from "./constant";

/**
 * Sign the current user out everywhere.
 *
 * Before this existed the sidebar "Logout" button had no handler, and the
 * mobile one only closed the socket, so the persisted redux user survived and
 * the next visit to a protected route still let the user in.
 */
export const signOut = (redirectTo = "/sign-in") => {
  const keepFirstVisit = localStorage.getItem("isFirstVisit");
  sessionStorage.removeItem(USER_KEY);
  localStorage.clear();
  if (keepFirstVisit) localStorage.setItem("isFirstVisit", keepFirstVisit);

  // Full navigation so the redux store, query cache and socket all reset.
  window.location.replace(redirectTo);
};
