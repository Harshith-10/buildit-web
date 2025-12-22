"use client";

import { CheckCircle2, Circle, FileText, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  status: string;
}

interface ExamSidebarProps {
  problems: Problem[];
  activeProblemId: string;
  onSelect: (id: string) => void;
  title: string;
  onEndExam?: () => void;
}

export function ExamSidebar({
  problems,
  activeProblemId,
  onSelect,
  title,
  onEndExam,
}: ExamSidebarProps) {
  return (
    <Sidebar collapsible="icon">
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
                <span className="truncate font-semibold">{title}</span>
                <span className="truncate text-xs">Exam Questions</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Problem List</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {problems.map((problem) => {
                const isActive = activeProblemId === problem.id;
                return (
                  <SidebarMenuItem key={problem.id}>
                    <SidebarMenuButton
                      onClick={() => onSelect(problem.id)}
                      isActive={isActive}
                      tooltip={problem.title}
                      className="h-auto py-2"
                    >
                      {problem.status === "solved" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex flex-col gap-1 overflow-hidden w-full">
                        <span className="truncate font-medium">
                          {problem.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4 border font-normal w-fit",
                            problem.difficulty === "easy" &&
                              "text-green-600 border-green-200 bg-green-50",
                            problem.difficulty === "medium" &&
                              "text-yellow-600 border-yellow-200 bg-yellow-50",
                            problem.difficulty === "hard" &&
                              "text-red-600 border-red-200 bg-red-50",
                          )}
                        >
                          {problem.difficulty}
                        </Badge>
                      </div>
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
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={onEndExam}
            >
              <Power className="w-4 h-4" />
              <span>End Exam</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
