"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="prose dark:prose-invert max-w-none min-w-0 text-sm leading-relaxed">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ className, ...props }) => (
                <h1
                  className={cn(
                    "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h2: ({ className, ...props }) => (
                <h2
                  className={cn(
                    "mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0",
                    className,
                  )}
                  {...props}
                />
              ),
              h3: ({ className, ...props }) => (
                <h3
                  className={cn(
                    "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h4: ({ className, ...props }) => (
                <h4
                  className={cn(
                    "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h5: ({ className, ...props }) => (
                <h5
                  className={cn(
                    "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h6: ({ className, ...props }) => (
                <h6
                  className={cn(
                    "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              a: ({ className, ...props }) => (
                <a
                  className={cn(
                    "font-medium underline underline-offset-4",
                    className,
                  )}
                  {...props}
                />
              ),
              p: ({ className, ...props }) => (
                <p
                  className={cn(
                    "leading-7 [&:not(:first-child)]:mt-6",
                    className,
                  )}
                  {...props}
                />
              ),
              ul: ({ className, ...props }) => (
                <ul
                  className={cn("my-6 ml-6 list-disc", className)}
                  {...props}
                />
              ),
              ol: ({ className, ...props }) => (
                <ol
                  className={cn("my-6 ml-6 list-decimal", className)}
                  {...props}
                />
              ),
              li: ({ className, ...props }) => (
                <li className={cn("mt-2", className)} {...props} />
              ),
              blockquote: ({ className, ...props }) => (
                <blockquote
                  className={cn(
                    "mt-6 border-l-2 pl-6 italic [&>*]:text-muted-foreground",
                    className,
                  )}
                  {...props}
                />
              ),
              img: ({
                className,
                alt,
                ...props
              }: React.ImgHTMLAttributes<HTMLImageElement>) => (
                // biome-ignore lint/performance/noImgElement: Ignore this one time
                <img
                  className={cn("rounded-md border", className)}
                  alt={alt}
                  {...props}
                />
              ),
              hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
              table: ({ className, ...props }) => (
                <div className="my-6 w-full overflow-y-auto">
                  <table className={cn("w-full", className)} {...props} />
                </div>
              ),
              tr: ({ className, ...props }) => (
                <tr
                  className={cn("m-0 border-t p-0 even:bg-muted", className)}
                  {...props}
                />
              ),
              th: ({ className, ...props }) => (
                <th
                  className={cn(
                    "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
                    className,
                  )}
                  {...props}
                />
              ),
              td: ({ className, ...props }) => (
                <td
                  className={cn(
                    "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
                    className,
                  )}
                  {...props}
                />
              ),
              pre: ({ className, ...props }) => (
                <pre
                  className={cn(
                    "mb-4 mt-6 overflow-x-auto rounded-lg border px-4 py-4 [&_code]:border-none [&_code]:bg-transparent [&_code]:p-0 max-w-full",
                    className,
                  )}
                  {...props}
                />
              ),
              code: ({ className, ...props }) => (
                <code
                  className={cn(
                    "relative rounded border bg-primary/10 px-[0.3rem] py-[0.2rem] font-mono text-sm",
                    className,
                  )}
                  {...props}
                />
              ),
            }}
          >
            {problem.description}
          </Markdown>

          {/* Legacy/Structural content fallback if description is empty or for specific fields? 
              Ref: ProblemDescription only renders markdown. 
              The previous implementation manually rendered examples/constraints.
              If the problem.description contains EVERYTHING (which usually it does for LeetCode style), we don't need manual sections.
              However, our schema has `content.examples` and `content.constraints`.
              Let's keep the manual sections just in case the description doesn't span them, 
              but `ProblemDescription` didn't use them. 
              WAIT. `ProblemDescription` step 13 code ONLY renders `problem.description`.
              This implies `problem.description` is the source of truth for the FULL text on the problem page.
              So I will rely on `problem.description` as well.
           */}
        </div>
      </ScrollArea>
    </div>
  );
}
