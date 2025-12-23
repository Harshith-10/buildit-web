"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  ListTodo,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Cpu,
  Database,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem, Submission } from "@/types/problem";

interface DescriptionPanelProps {
  problem: Problem;
  userSubmissions: Submission[];
}

export function DescriptionPanel({
  problem,
  userSubmissions,
}: DescriptionPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="description" className="h-full flex flex-col">
        <div className="flex items-center px-4 h-12 border-b bg-muted/20 shrink-0">
          <TabsList className="bg-transparent h-9 p-0 gap-2">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs px-3 h-8 rounded-md gap-2 border border-transparent data-[state=active]:border-primary/20"
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs px-3 h-8 rounded-md gap-2 border border-transparent data-[state=active]:border-primary/20"
            >
              <Clock className="w-3.5 h-3.5" />
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="solution"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs px-3 h-8 rounded-md gap-2 border border-transparent data-[state=active]:border-primary/20"
            >
              <ListTodo className="w-3.5 h-3.5" />
              Solution
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="description"
          className="flex-1 overflow-hidden mt-0"
        >
          <ScrollArea className="h-full">
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      problem.difficulty === "Easy"
                        ? "default"
                        : problem.difficulty === "Medium"
                          ? "secondary"
                          : "destructive"
                    }
                    className={cn(
                      "capitalize shadow-none px-2.5 rounded-md",
                      problem.difficulty === "Easy" &&
                        "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20",
                      problem.difficulty === "Medium" &&
                        "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20",
                      problem.difficulty === "Hard" &&
                        "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20",
                    )}
                  >
                    {problem.difficulty}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {problem.description}
                </p>
              </div>

              {/* Examples */}
              {problem.content?.examples?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-semibold text-sm">Examples</h3>
                  {problem.content.examples.map((ex, i) => (
                    <div
                      key={ex.input}
                      className="rounded-lg border bg-muted/30 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                        Example {i + 1}
                      </div>
                      <div className="p-4 space-y-3 text-sm font-mono">
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Input
                          </span>
                          <div className="bg-background/50 p-2.5 rounded border">
                            {ex.input}
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Output
                          </span>
                          <div className="bg-background/50 p-2.5 rounded border">
                            {ex.output}
                          </div>
                        </div>
                        {ex.explanation && (
                          <div className="grid gap-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              Explanation
                            </span>
                            <div className="text-muted-foreground px-1">
                              {ex.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.content?.constraints && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Constraints
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground marker:text-muted-foreground/50">
                    {problem.content.constraints.map((c, i) => (
                      <li key={i} className="pl-1">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded border text-xs font-mono">
                          {c}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="submissions"
          className="flex-1 overflow-hidden mt-0"
        >
          <ScrollArea className="h-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">My Submissions</h3>
              {userSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-1.5 rounded-full bg-background border",
                            sub.status === "accepted"
                              ? "text-emerald-500 border-emerald-200 dark:border-emerald-900"
                              : "text-rose-500 border-rose-200 dark:border-rose-900",
                          )}
                        >
                          {sub.status === "accepted" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm capitalize">
                            {sub.status.replace("_", " ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sub.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs font-mono text-muted-foreground">
                        {sub.runtimeMs && (
                          <div className="flex items-center gap-1 justify-end">
                            <Cpu className="w-3 h-3" />
                            {sub.runtimeMs}ms
                          </div>
                        )}
                        {sub.memoryKb && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <Database className="w-3 h-3" />
                            {(sub.memoryKb / 1024).toFixed(2)}MB
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="solution" className="flex-1 overflow-hidden mt-0">
          <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm">
              Solution walkthrough is currently unavailable.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
