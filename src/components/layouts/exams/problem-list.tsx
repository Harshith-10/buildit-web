import { CheckCircle2, Circle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  status: string;
}

interface ProblemListProps {
  problems: Problem[];
  activeProblemId: string;
  onSelect: (id: string) => void;
}

export function ProblemList({
  problems,
  activeProblemId,
  onSelect,
}: ProblemListProps) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b bg-muted/40">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Problem List
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {problems.map((problem) => {
            const isActive = activeProblemId === problem.id;
            return (
              <Button
                key={problem.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-3 px-3",
                  isActive ? "bg-accent text-accent-foreground" : "",
                )}
                onClick={() => onSelect(problem.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  {problem.status === "solved" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col items-start gap-1 overflow-hidden w-full">
                    <span className="font-medium truncate w-full text-left">
                      {problem.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 border font-normal",
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
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
