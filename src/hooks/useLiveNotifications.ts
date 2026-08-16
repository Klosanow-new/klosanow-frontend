import { useStoreSelector } from "src/redux/hooks";
import { formatDistanceToNow } from "date-fns";
import { NotificationItemProps } from "src/types";

export default function useLiveNotifications() {
  const user = useStoreSelector((state) => state.user);

  const notifications: NotificationItemProps[] = (user.data?.notifications || []).map((notif: any) => {
    let timeStr = "";
    if (notif.createdAt || notif.time) {
      try {
        const date = new Date(notif.createdAt || notif.time);
        if (!isNaN(date.getTime())) {
          timeStr = `${formatDistanceToNow(date)} ago`;
        } else {
          timeStr = notif.time || "";
        }
      } catch {
        timeStr = notif.time || "";
      }
    }

    // Check sender info
    const senderName = notif.sender
      ? `${notif.sender.firstName || ""} ${notif.sender.lastName || ""}`.trim()
      : "";

    return {
      name: notif.name || senderName || notif.title || "",
      action: notif.action || notif.message || notif.text || notif.body || "",
      time: timeStr,
      backgroundImageUrl: notif.backgroundImageUrl || notif.photoUrl || notif.sender?.photoUrl || "/logo.png",
      isRead: notif.isRead ?? notif.read ?? false,
    };
  });

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    length: notifications.length,
  };
}
