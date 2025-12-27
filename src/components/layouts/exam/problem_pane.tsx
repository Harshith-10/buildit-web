"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Problem } from "@/types/problem";

// We can add more robust markdown styling here or import a typography prose class
// For now, styling directly with Tailwind for "clean code"

interface ProblemPaneProps {
  problem: Problem;
}

export default function ProblemPane({ problem }: ProblemPaneProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tracking-tight">{problem.title}</h2>
          <Badge
            variant="outline"
            className={getDifficultyColor(problem.difficulty)}
          >
            {problem.difficulty}
          </Badge>
        </div>
        {/* Optional: Add tags or other metadata here */}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
          <Markdown remarkPlugins={[remarkGfm]}>
            {problem.content.description}
          </Markdown>

          {problem.content.examples && problem.content.examples.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="font-semibold text-base mb-4">Examples</h3>
              <div className="space-y-4">
                {problem.content.examples.map((example: any, i: number) => (
                  <div key={i} className="rounded-md border bg-muted/30 p-3">
                    <div className="mb-2 font-semibold text-xs text-muted-foreground uppercase">
                      Example {i + 1}
                    </div>

                    <div className="grid gap-2">
                      <div>
                        <span className="font-semibold text-xs">Input:</span>
                        <code className="ml-2 bg-muted px-1 py-0.5 rounded text-xs font-mono">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Output:</span>
                        <code className="ml-2 bg-muted px-1 py-0.5 rounded text-xs font-mono">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div className="text-muted-foreground text-xs mt-1">
                          <span className="font-semibold">Explanation:</span>{" "}
                          {example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {problem.content.constraints &&
            problem.content.constraints.length > 0 && (
              <>
                <Separator className="my-6" />
                <h3 className="font-semibold text-base mb-2">Constraints</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {problem.content.constraints.map((c: string, i: number) => (
                    <li key={i}>
                      <Markdown>{c}</Markdown>
                    </li>
                  ))}
                </ul>
              </>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
