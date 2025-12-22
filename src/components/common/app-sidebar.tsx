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
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
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
  const searchParams = useSearchParams();

  // Helper to check if two search params objects share the same relevant keys
  const hasMatchingParams = (
    itemHref: string,
    currentParams: ReadonlyURLSearchParams,
  ) => {
    if (!itemHref.includes("?")) return false;
    const itemUrl = new URL(itemHref, "http://localhost");
    const itemParams = itemUrl.searchParams;

    // Check if all params in the item's href match the current params
    // specific focus on 'status' and 'type' as routing params
    for (const [key, value] of itemParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  };

  // Helper to check if current route has conflicting params for a base route
  // e.g. /exams should not be active if we are at /exams?status=upcoming
  const hasConflictingParams = (
    itemHref: string,
    currentParams: ReadonlyURLSearchParams,
  ) => {
    // If item has specific params, it's already handled by hasMatchingParams logic implicitly
    if (itemHref.includes("?")) return false;

    // List of params that act as sub-routes
    const routingParams = ["status", "type"];

    // If current URL has any of these params, and the item's HREF doesn't,
    // then this item (likely a base "All ..." link) should NOT be active.
    for (const param of routingParams) {
      if (currentParams.has(param)) return true;
    }

    return false;
  };

  const isActive = (() => {
    // 1. Exact match (ignoring query params for now, unless item has them)
    // We treat query params as part of the identity if the item defined them.

    const itemHasQuery = item.href?.includes("?");
    const normalizedItemHref = item.href?.split("?")[0];
    const normalizedCurrentRoute = currentRoute.split("?")[0];

    // If item points to dashboard, strict active check prevents it from being active on sub-routes if desired,
    // but usually dashboard is unique. Existing logic had specific check.
    if (item.href === "/dashboard" || item.href === "/student/dashboard") {
      return currentRoute === item.href;
    }

    if (!item.href) return false;

    // Case A: Item has query params (e.g. /exams?status=upcoming)
    if (itemHasQuery) {
      return (
        normalizedItemHref === normalizedCurrentRoute &&
        hasMatchingParams(item.href, searchParams)
      );
    }

    // Case B: Item is a base path (e.g. /exams)
    // It should match if:
    // 1. Paths match/start-with
    // 2. We don't have "conflicting" params (like status=upcoming) that belong to a sibling item
    const isPathMatch =
      currentRoute === item.href ||
      (currentRoute.startsWith(item.href) && item.href !== "/");

    if (isPathMatch) {
      return !hasConflictingParams(item.href, searchParams);
    }

    return false;
  })();

  const hasActiveChild = item.submenu?.some((sub) => {
    // Recursive check concept, but we can reuse similar logic or just check hrefs
    // For simplicity re-evaluating similar logic for children roughly:
    if (!sub.href) return false;

    // Quick active check for parent expanding
    // This duplicates logic slightly but keeps it self-contained for the child check
    const subHasQuery = sub.href.includes("?");
    const normSub = sub.href.split("?")[0];
    const normCurr = currentRoute.split("?")[0];

    if (subHasQuery) {
      return normSub === normCurr && hasMatchingParams(sub.href, searchParams);
    }

    return (
      currentRoute === sub.href ||
      (currentRoute.startsWith(sub.href) &&
        !hasConflictingParams(sub.href, searchParams))
    );
  });

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
              isActive={isActive || hasActiveChild}
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
