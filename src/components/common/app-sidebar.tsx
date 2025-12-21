"use client";

import {
  BookOpen,
  ChevronsUpDown,
  Clock,
  Code2,
  FileText,
  Flame,
  History,
  LayoutDashboard,
  LifeBuoy,
  Play,
  Settings,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import Logo from "@/components/common/logo";
import User from "@/components/common/user-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import { getUserFull, type UserFullData } from "@/actions/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "../ui/scroll-area";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  submenu?: MenuItem[];
  defaultOpen?: boolean;
  className?: string;
  indicator?: boolean;
}

interface SidebarSection {
  label: string;
  items: MenuItem[];
}

const mainItems: MenuItem[] = [
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    href: "/student/dashboard",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Exams",
    defaultOpen: true,
    submenu: [
      {
        icon: <Play className="h-4 w-4" />,
        label: "Take Exam",
        href: "/student/exams/take-exam",
      },
      {
        icon: <Clock className="h-4 w-4" />,
        label: "Upcoming",
        href: "/student/exams/upcoming",
      },
      {
        icon: <History className="h-4 w-4" />,
        label: "Past Exams",
        href: "/student/exams/past",
      },
    ],
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Collections",
    submenu: [
      {
        icon: <FileText className="h-4 w-4" />,
        label: "Your Collections",
        href: "/student/collections/personal",
      },
      {
        icon: <Code2 className="h-4 w-4" />,
        label: "Practice Sheets",
        href: "/student/collections/practice-sheets",
      },
      {
        icon: <Target className="h-4 w-4" />,
        label: "Companies",
        href: "/student/collections/companies",
      },
    ],
  },
  {
    icon: <Code2 className="h-4 w-4" />,
    label: "Practice",
    href: "/student/problems",
  },
];

const mainSection: SidebarSection = {
  label: "Main",
  items: mainItems,
};

const exploreItems: MenuItem[] = [
  {
    icon: <Trophy className="h-4 w-4" />,
    label: "Leaderboard",
    href: "/student/leaderboard",
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Resources",
    href: "/student/resources",
  },
];

const exploreSection: SidebarSection = {
  label: "Explore",
  items: exploreItems,
};

interface AppSidebarProps {
  sections?: SidebarSection[];
}

export default function AppSidebar({
  sections = [mainSection, exploreSection],
}: AppSidebarProps) {
  const { open } = useSidebar();
  const currentRoute = usePathname();
  //   const [user, setUser] = useState<UserFullData | null>(null);

  //   useEffect(() => {
  //     getUserFull().then((data) => {
  //       setUser(data);
  //     });
  //   }, []);

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarHeader className="justify-center">
        {open ? (
          <div className="flex items-center gap-2 p-2">
            <Logo className="h-8 w-8" />
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 flex flex-col">
                <h1 className="text-xl font-bold text-foreground flex-1">
                  BuildIT
                </h1>
              </div>
              <SidebarTrigger />
            </div>
          </div>
        ) : (
          <div className="pt-2 flex flex-col gap-2 items-center justify-center">
            <Logo className="h-6 w-6" />
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-full">
          {sections.map((section: SidebarSection, idx: number) => (
            <div key={section.label}>
              <SidebarGroup>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {section.items.map((item: MenuItem) => (
                    <RecursiveSidebarItem
                      item={item}
                      currentRoute={currentRoute}
                      key={item.label}
                    />
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
              {idx !== sections.length - 1 && <SidebarSeparator />}
            </div>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Stats Row */}
        {open /* && user?.role === "student" */ && (
          <div className="flex items-center justify-center gap-4 rounded-lg bg-sidebar-accent/50 p-3 mx-2 my-2">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {/* {user?.streak || 0} */}
                12
              </span>
            </div>
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Target className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {/* {user?.problemsSolved || 0}/{user?.totalProblems || 0} */}
                79/100
              </span>
            </div>
          </div>
        )}

        <SidebarMenu className={`transition-all ${open ? "px-2" : ""}`}>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support" asChild>
              <Link href="/support">
                <LifeBuoy className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className={`pb-2 ${open ? "px-2" : ""}`}>
          <User size={open ? "default" : "small"} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function RecursiveSidebarItem({
  item,
  currentRoute,
}: {
  item: MenuItem;
  currentRoute: string;
}) {
  const isActive =
    item.href === currentRoute ||
    (!!item.href &&
      currentRoute.startsWith(item.href) &&
      item.href !== "/dashboard");
  const hasActiveChild = item.submenu?.some(
    (sub) =>
      sub.href === currentRoute ||
      (sub.href && currentRoute.startsWith(sub.href)),
  );

  return (
    <SidebarMenu key={item.label}>
      {item.submenu ? (
        <Collapsible
          className="group/collapsible"
          defaultOpen={item.defaultOpen || hasActiveChild}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.label}
              className={item.className}
              isActive={hasActiveChild}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.indicator && (
                <div className="w-2 h-2 relative">
                  <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.submenu.map((submenuItem: MenuItem) => (
                <RecursiveSidebarItem
                  item={submenuItem}
                  currentRoute={currentRoute}
                  key={submenuItem.label}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <SidebarMenuItem className={item.className}>
          <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
            <Link href={item.href || "#"}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.indicator && (
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

export type { MenuItem, SidebarSection };
