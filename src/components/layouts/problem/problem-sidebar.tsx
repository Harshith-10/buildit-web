"use client";

import { CheckCircle2, ChevronLeft, Circle, FileText } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ProblemItem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: string;
  slug: string;
}

import { useParams } from "next/navigation";

interface ProblemSidebarProps {
  problems: ProblemItem[];
}

export function ProblemSidebar({ problems }: ProblemSidebarProps) {
  const params = useParams();
  const activeProblemSlug = params?.slug as string;
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FileText className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Problem List</span>
                <span className="truncate text-xs">All Problems</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={cn("grid grid-cols-3", open ? "" : "hidden")}
          >
            <span className="flex items-center gap-2 col-span-1 text-xs justify-center">
              <div className="p-1 bg-green-500 rounded-full"></div>
              Easy
            </span>
            <span className="flex items-center gap-2 col-span-1 text-xs justify-center">
              <div className="p-1 bg-yellow-500 rounded-full"></div>
              Medium
            </span>
            <span className="flex items-center gap-2 col-span-1 text-xs justify-center">
              <div className="p-1 bg-red-500 rounded-full"></div>
              Hard
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {problems.map((problem, idx) => {
                const isActive = activeProblemSlug === problem.slug;
                return (
                  <SidebarMenuItem key={problem.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={problem.title}
                      className={cn(
                        "h-auto py-2",
                        idx % 2 === 0 ? "bg-muted-foreground/10" : "",
                      )}
                    >
                      <Link href={`/problem/${problem.slug}`}>
                        {problem.status === "solved" ? (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-green-500"}`}
                          />
                        ) : (
                          <Circle
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                          />
                        )}
                        <div className="flex items-center justify-between gap-0.5 overflow-hidden w-full">
                          <span className="truncate font-medium text-sm">
                            {problem.title}
                          </span>
                          <div
                            className={cn(
                              "p-1 rounded-full",
                              problem.difficulty === "easy" && "bg-green-500",
                              problem.difficulty === "medium" &&
                                "bg-yellow-500",
                              problem.difficulty === "hard" && "bg-red-500",
                            )}
                          ></div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/dashboard"
                className="flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
