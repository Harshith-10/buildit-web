"use client";

import Markdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DescriptionPanelProps {
  description: string;
  setDescription: (val: string) => void;
}

export default function DescriptionPanel({
  description,
  setDescription,
}: DescriptionPanelProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <Tabs defaultValue="edit" className="flex flex-col h-full">
        <div className="border-b px-2 py-1 bg-muted/20">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="flex-1 p-0 m-0 min-h-0">
          <Textarea
            className="w-full h-full resize-none p-4 rounded-none border-0 focus-visible:ring-0 font-mono"
            placeholder="Enter problem description in Markdown..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </TabsContent>

        <TabsContent
          value="preview"
          className="flex-1 overflow-auto p-4 min-h-0"
        >
          <div className="prose dark:prose-invert max-w-none">
            <Markdown
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
                code: ({ className, ...props }) => (
                  <code
                    className={cn(
                      "relative rounded border bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
                      className,
                    )}
                    {...props}
                  />
                ),
                pre: ({ className, ...props }) => (
                  <pre
                    className={cn(
                      "mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4",
                      className,
                    )}
                    {...props}
                  />
                ),
              }}
            >
              {description || "*No description provided.*"}
            </Markdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
