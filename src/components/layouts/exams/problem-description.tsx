import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProblemDescriptionProps {
  title: string;
  difficulty: string;
  description: string;
}

export function ProblemDescription({
  title,
  difficulty,
  description,
}: ProblemDescriptionProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              difficulty === "easy" &&
                "text-green-600 border-green-200 bg-green-50",
              difficulty === "medium" &&
                "text-yellow-600 border-yellow-200 bg-yellow-50",
              difficulty === "hard" && "text-red-600 border-red-200 bg-red-50",
            )}
          >
            {difficulty}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {/* Simple split by newline for basic formatting if not using a markdown renderer yet */}
          {description.split("\n").map((line, i) => (
            <p key={i + line} className="mb-2 min-h-[1em]">
              {line}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
