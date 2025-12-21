import {
  BookOpen,
  Clock,
  Code2,
  FileText,
  History,
  LayoutDashboard,
  Play,
  Target,
  Trophy,
} from "lucide-react";
import AppHeader from "@/components/common/app-header";
import AppSidebar, {
  type MenuItem,
  type SidebarSection,
} from "@/components/common/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const mainItems: MenuItem[] = [
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Exams",
    defaultOpen: true,
    submenu: [
      {
        icon: <Play className="h-4 w-4" />,
        label: "Take Exam",
        href: "/exams?status=ongoing",
      },
      {
        icon: <Clock className="h-4 w-4" />,
        label: "Upcoming Exams",
        href: "/exams?status=upcoming",
      },
      {
        icon: <History className="h-4 w-4" />,
        label: "Completed Exams",
        href: "/exams?status=completed",
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
        href: "/collections?type=private",
      },
      {
        icon: <Code2 className="h-4 w-4" />,
        label: "Practice Sheets",
        href: "/collections?type=practice",
      },
      {
        icon: <Target className="h-4 w-4" />,
        label: "Companies",
        href: "/collections?type=company",
      },
    ],
  },
  {
    icon: <Code2 className="h-4 w-4" />,
    label: "Problems",
    href: "/problems",
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <main className="flex w-screen h-screen">
        <AppSidebar sections={[mainSection, exploreSection]} />
        <div className="w-full h-full py-2 pr-2 bg-sidebar">
          <div className="flex flex-col bg-background w-full h-full overflow-auto rounded-lg border-2">
            <AppHeader />
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
