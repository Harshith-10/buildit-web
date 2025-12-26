"use client";

import { CheckCircle2, Circle, FileText, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface ExamProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  slug: string;
}

interface ExamSidebarProps {
  problems: ExamProblem[];
  activeProblemId: string;
  onProblemSelect: (problemId: string) => void;
  attemptedProblems: Set<string>;
  onEndExam?: () => void;
}

export function ExamSidebar({
  problems,
  activeProblemId,
  onProblemSelect,
  attemptedProblems,
  onEndExam,
}: ExamSidebarProps) {
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
                <span className="truncate font-semibold">Exam Questions</span>
                <span className="truncate text-xs">
                  {attemptedProblems.size} of {problems.length} Attempted
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {problems.map((problem, index) => {
                const isActive = activeProblemId === problem.id;
                const isAttempted = attemptedProblems.has(problem.id);
                return (
                  <SidebarMenuItem key={problem.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={problem.title}
                      className="h-auto py-2 cursor-pointer"
                      onClick={() => onProblemSelect(problem.id)}
                    >
                      {isAttempted ? (
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
                          {index + 1}. {problem.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] px-1 py-0 h-3.5 border font-normal w-fit capitalize",
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
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full gap-2 cursor-pointer flex items-center justify-center bg-destructive hover:bg-destructive/80 active:bg-destructive/70 text-destructive-foreground"
              onClick={onEndExam}
              disabled={!onEndExam}
            >
              <Power className="w-4 h-4" />
              End Exam
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
