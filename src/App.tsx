import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { DashboardLayout } from "./components";
import {
  Dashboard,
  StudyChat,
  CreateLesson,
  Settings,
  SignUp,
  SignIn,
  ForgotPassword,
  ResetPassword,
  MailUs,
  Help,
  NotificationSettings,
  Notifications,
  Onboarding,
  FreeStorageView,
  BasicStorageView,
  PremiumStorageView,
  Error,
  AccountInfo,
  VerifyOtp,
  VerifySplash,
  ResetSplash,
  WatchLesson,
} from "./pages";
import ProtectedRoute from "./utils/ProtectedRoute";
import SlideGallery from "./pages/CreateLesson/slides/gallery/SlideGallery";
import {
  createLessonPagePath,
  dashboardPageSlug,
  studyChatPagePath,
  slideGalleryPageSlug,
  watchLessonPagePath,
} from "./data/pageUrl";
import useChatWebSocket from "./hooks/useChatWebSocket";
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreDispatch, useStoreSelector } from "./redux/hooks";
import { fetchChats, fetchStudyChats } from "./api-endpoints/studyChat";
import {
  clearIncompleteStorageFile,
  getStorageItem,
  removeStorageItem,
} from "./utils/generics";
import { InviteLink } from "./pages/StudyChat/flyouts";
import { CHAT_CONTACT_KEY } from "./data/constants";
import { useToast, Box } from "@chakra-ui/react";
import { getSingleUser } from "./api-endpoints/user/user.api";
import { updateUserData, addNotification } from "./redux/reducers/userReducer";
import { markChatUnread } from "./utils/unreadChats";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useStoreDispatch();
  const user = useStoreSelector((state) => state.user);
  const { onNewMessage, isConnected } = useChatWebSocket();
  const storageContact = getStorageItem(CHAT_CONTACT_KEY);
  const toast = useToast();

  const playChime = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();

      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.4,
      );
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (err) {
      console.error("Audio chime failed:", err);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const userId = user.data?._id;
    const token = user.token;
    if (userId && token) {
      try {
        const response = await getSingleUser(userId, token);
        dispatch(updateUserData(response as any));
      } catch (err) {
        console.error("Error updating user details:", err);
      }
    }
  }, [user.data?._id, user.token, dispatch]);

  useEffect(() => {
    if (user.isAuth && user.token) {
      fetchUser();
    }
  }, [user.isAuth, user.token, fetchUser]);

  const showBackgroundNotification = useCallback(
    async (payload: any, name: string) => {
      if (!("serviceWorker" in navigator)) return false;
      if (
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      ) {
        return false;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return false;

        const tag =
          payload?.chatId || payload?.studyChatId || payload?._id || undefined;

        const options: any = {
          body:
            payload?.text || payload?.message || "You received a new message.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag,
          renotify: !!tag,
          data: { url: "/study-chat" },
        };

        await registration.showNotification(name || "New message", options);
        return true;
      } catch (err) {
        console.error("Background notification failed:", err);
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    if (!isConnected) return;

    return onNewMessage((payload) => {
      const sender = payload?.sender;
      const name = [sender?.firstName, sender?.lastName]
        .filter(Boolean)
        .join(" ");

      const alertUser = async () => {
        if (
          document.hidden &&
          (await showBackgroundNotification(payload, name))
        ) {
          return;
        }

        playChime();

        toast({
          title: name || "New message",
          description: (
            <Box
              as="div"
              cursor="pointer"
              onClick={() => {
                navigate("/study-chat");
                toast.closeAll();
              }}
              _hover={{ textDecoration: "underline" }}
              py="1"
            >
              {payload?.text || payload?.message || "Click to open chat"}
            </Box>
          ),
          status: "info",
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      };

      alertUser();

      const notifObj = {
        _id: payload._id || new Date().getTime().toString(),
        sender: payload.sender,
        message: payload.text || payload.message || "sent you a message",
        action: "sent you a message",
        createdAt: payload.createdAt || new Date().toISOString(),
        isRead: false,
      };
      dispatch(addNotification(notifObj));

      markChatUnread(
        payload.studyChatId || payload.chatId || payload.sender?._id,
      );

      dispatch(fetchChats());
      dispatch(fetchStudyChats());
      fetchUser();
    });
  }, [
    isConnected,
    dispatch,
    fetchUser,
    toast,
    playChime,
    navigate,
    showBackgroundNotification,
  ]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE" && event.data.url) {
        navigate(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [navigate]);

  useEffect(() => {
    if (!storageContact) return;
    const timeout = setTimeout(() => {
      removeStorageItem(CHAT_CONTACT_KEY);
    }, 30000);

    return () => clearInterval(timeout);
  }, [storageContact]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      clearIncompleteStorageFile("chat-audio", (errMsg) => {
        toast({
          title: "Unable to delete file",
          description: errMsg || "Failed to delete",
        });
      });

      clearIncompleteStorageFile("chat-file", (errMsg) => {
        toast({
          title: "Unable to delete file",
          description: errMsg || "Failed to delete",
        });
      });

      clearIncompleteStorageFile("study_chat", (errMsg) => {
        toast({
          title: "Unable to delete file",
          description: errMsg || "Failed to delete",
        });
      });
    }, 60000);

    return () => clearInterval(timeout);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Onboarding />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/please-verify" element={<VerifySplash />} />
          <Route path="/auth/verify-otp/:token" element={<VerifyOtp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-verify" element={<ResetSplash />} />

          <Route path="/auth/reset-otp/:token" element={<ResetPassword />} />
          {import.meta.env.DEV ? (
            <Route path={slideGalleryPageSlug} element={<SlideGallery />} />
          ) : null}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* dashboard routes */}
              <Route path={dashboardPageSlug} index element={<Dashboard />} />
              <Route
                path={`${createLessonPagePath}/*`}
                index
                element={<CreateLesson />}
              />

              <Route path={`${studyChatPagePath}/*`} element={<StudyChat />} />

              {/* Shared lesson links land here */}
              <Route
                path={`${watchLessonPagePath}/:lessonId`}
                element={<WatchLesson />}
              />


              <Route path="/invite" element={<InviteLink />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route
                path="/settings/notifications"
                element={<NotificationSettings />}
              />
              <Route path="/help" element={<Help />} />

              {/* Storage view Route */}
              <Route path="/free" element={<FreeStorageView />} />
              <Route path="/basic" element={<BasicStorageView />} />
              <Route path="/premium" element={<PremiumStorageView />} />
              <Route path="/info" element={<AccountInfo />} />

              <Route path="/help/mail" element={<MailUs />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Error />} />
        </Routes>
      </AnimatePresence>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
