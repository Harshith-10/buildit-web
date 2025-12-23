"use client";

import {
  CheckCircle2,
  Loader2,
  Play,
  Send,
  Terminal,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/problem";

interface ConsolePanelProps {
  problem: Problem;
  isRunning: boolean;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic result type
  testResult: any;
  activeConsoleTab: "testcase" | "result";
  setActiveConsoleTab: (tab: "testcase" | "result") => void;
}

export function ConsolePanel({
  problem,
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
  testResult,
  activeConsoleTab,
  setActiveConsoleTab,
}: ConsolePanelProps) {
  const [activeTestCaseId, setActiveTestCaseId] = React.useState<string>(
    problem.testCases[0]?.id || "",
  );

  const activeTestCase = problem.testCases.find(
    (t) => t.id === activeTestCaseId,
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Console Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b bg-muted/20 shrink-0">
        <Tabs
          value={activeConsoleTab}
          onValueChange={(v) => setActiveConsoleTab(v as "testcase" | "result")}
          className="h-full"
        >
          <TabsList className="bg-transparent h-full p-0 gap-4">
            <TabsTrigger
              value="testcase"
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Testcases
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Result
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isRunning || isSubmitting}
            onClick={onRun}
            className="h-8 px-4 text-xs font-medium"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            disabled={isRunning || isSubmitting}
            onClick={onSubmit}
            className="h-8 px-4 text-xs font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1.5" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeConsoleTab === "testcase" ? (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {problem.testCases
                  .filter((t) => !t.isHidden)
                  .map((tc, i) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveTestCaseId(tc.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                        tc.id === activeTestCaseId
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      Case {i + 1}
                    </button>
                  ))}
              </div>

              {activeTestCase && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Input
                    </div>
                    <div className="font-mono text-sm bg-muted/30 p-3 rounded-lg border text-foreground">
                      {activeTestCase.input}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Expected Output
                    </div>
                    <div className="font-mono text-sm bg-muted/30 p-3 rounded-lg border text-foreground">
                      {activeTestCase.expectedOutput}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 h-full">
              {!testResult ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                  <Terminal className="w-12 h-12 opacity-10 mb-3" />
                  <p className="text-sm">Run or Submit to see results</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-md border",
                        testResult.success
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20",
                      )}
                    >
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Accepted
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Wrong Answer
                        </>
                      )}
                    </div>
                  </div>

                  {testResult.output && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Your Output
                      </div>
                      <pre className="font-mono text-sm bg-muted/30 p-3 rounded-lg border text-foreground whitespace-pre-wrap overflow-x-auto">
                        {testResult.output}
                      </pre>
                    </div>
                  )}

                  {!testResult.success && testResult.expectedOutput && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Expected Output
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg border font-mono text-sm text-foreground whitespace-pre-wrap">
                        {testResult.expectedOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
