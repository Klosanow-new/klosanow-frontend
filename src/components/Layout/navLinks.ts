import { IconType } from "react-icons";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import {
  allLessonsPagePath,
  dashboardPagePath,
  studyChatPagePath,
} from "src/data/pageUrl";

export interface AppNavLink {
  label: string;
  href: string;
  icon: IconType;
  /** Extra path prefixes that should also highlight this link. */
  matches?: string[];
}

export const primaryNavLinks: AppNavLink[] = [
  { label: "Home", href: dashboardPagePath, icon: HiOutlineHome },
  {
    label: "Lessons",
    href: allLessonsPagePath,
    icon: HiOutlineBookOpen,
    matches: ["/lesson"],
  },
  {
    label: "Study Chat",
    href: studyChatPagePath,
    icon: HiOutlineChatBubbleLeftRight,
  },
  { label: "Notifications", href: "/notifications", icon: HiOutlineBell },
  {
    label: "Settings",
    href: "/settings",
    icon: HiOutlineCog6Tooth,
    matches: ["/info", "/free", "/basic", "/premium"],
  },
];

export const mobileNavLinks: AppNavLink[] = [
  primaryNavLinks[0],
  primaryNavLinks[1],
  primaryNavLinks[2],
  {
    label: "Profile",
    href: "/settings",
    icon: HiOutlineUserCircle,
    matches: ["/info", "/free", "/basic", "/premium", "/help"],
  },
];

export const isNavLinkActive = (link: AppNavLink, pathname: string) => {
  const path = pathname.toLowerCase();
  const prefixes = [link.href, ...(link.matches || [])].map((p) =>
    p.toLowerCase()
  );
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
};
