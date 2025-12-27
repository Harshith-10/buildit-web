"use client";

import { CheckCircle2, FileText } from "lucide-react";
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
import type { Problem } from "@/types/problem";

interface ExamSidebarProps {
  problems: Problem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  attemptedIds: Set<string>;
}

export default function ExamSidebar({
  problems,
  currentIndex,
  onSelect,
  attemptedIds,
}: ExamSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground pointer-events-none"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FileText className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Exam Questions</span>
                <span className="truncate text-xs">
                  {problems.length} Problems
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
              {problems.map((problem, idx) => {
                const isAttempted = attemptedIds.has(problem.id);
                const isActive = idx === currentIndex;

                return (
                  <SidebarMenuItem key={problem.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onSelect(idx)}
                      tooltip={problem.title}
                      className={cn("h-auto py-2", isActive && "font-medium")}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] border",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isAttempted
                              ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                              : "border-muted-foreground text-muted-foreground",
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate text-sm">{problem.title}</span>
                      {isAttempted && (
                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-green-500" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {open && (
          <div className="p-4 border-t bg-muted/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                {attemptedIds.size} / {problems.length} Attempted
              </span>
              <span className="font-medium">
                {Math.round((attemptedIds.size / problems.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
                style={{
                  width: `${(attemptedIds.size / problems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
