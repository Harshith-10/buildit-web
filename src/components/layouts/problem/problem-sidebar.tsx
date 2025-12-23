"use client";

import { CheckCircle2, Circle, FileText, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";

interface ProblemItem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
}

interface ProblemSidebarProps {
  problems: ProblemItem[];
  activeProblemId: string;
}

export function ProblemSidebar({
  problems,
  activeProblemId,
}: ProblemSidebarProps) {
  // const { toggleSidebar } = useSidebar();

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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {problems.map((problem) => {
                const isActive = activeProblemId === problem.id;
                return (
                  <SidebarMenuItem key={problem.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={problem.title}
                      className="h-auto py-2"
                    >
                      <Link href={`/problem/${problem.id}`}>
                        {problem.status === "solved" ? (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-green-500"}`}
                          />
                        ) : (
                          <Circle
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                          />
                        )}
                        <div className="flex flex-col gap-0.5 overflow-hidden w-full">
                          <span className="truncate font-medium text-xs">
                            {problem.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] px-1 py-0 h-3.5 border font-normal w-fit",
                              problem.difficulty === "Easy" &&
                                "text-green-600 border-green-200 bg-green-50",
                              problem.difficulty === "Medium" &&
                                "text-yellow-600 border-yellow-200 bg-yellow-50",
                              problem.difficulty === "Hard" &&
                                "text-red-600 border-red-200 bg-red-50",
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
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
              <Link href="/dashboard">
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
