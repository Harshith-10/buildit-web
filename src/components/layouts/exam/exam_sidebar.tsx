"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Questions
        </h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {problems.map((problem, idx) => {
            const isAttempted = attemptedIds.has(problem.id);
            const isActive = idx === currentIndex;

            return (
              <Button
                key={problem.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/10 hover:bg-primary/15",
                )}
                onClick={() => onSelect(idx)}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs border",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isAttempted
                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 truncate text-left">
                  <span
                    className={cn(
                      "block truncate text-sm",
                      isActive && "font-medium",
                    )}
                  >
                    {problem.title}
                  </span>
                </div>
                {isAttempted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {attemptedIds.size} / {problems.length} Attempted
          </span>
          <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${(attemptedIds.size / problems.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
