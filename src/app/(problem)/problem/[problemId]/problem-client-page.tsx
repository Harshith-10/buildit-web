"use client";

import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProblemSidebar } from "@/components/layouts/problem/problem-sidebar";
import { toast } from "sonner";
import { runCode, submitSolution } from "@/actions/problem-data";
import type { Problem, Submission } from "@/types/problem";

import { DescriptionPanel } from "./_components/description-panel";
import { CodeEditorPanel } from "./_components/editor-panel";
import { ConsolePanel } from "./_components/console-panel";

interface ProblemClientPageProps {
  problem: Problem;
  userSubmissions: Submission[];
  problems: {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    status: string;
  }[];
}

export default function ProblemClientPage({
  problem,
  userSubmissions,
  problems,
}: ProblemClientPageProps) {
  // State
  const [activeConsoleTab, setActiveConsoleTab] = React.useState<
    "testcase" | "result"
  >("testcase");
  const [code, setCode] = React.useState("// Write your solution here...");
  const [language, setLanguage] = React.useState("cpp");
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic structure
  const [testResult, setTestResult] = React.useState<any>(null);

  // Handlers
  const handleRun = async () => {
    setIsRunning(true);
    setActiveConsoleTab("result");
    setTestResult(null);
    try {
      const result = await runCode(code, language, problem.id);
      setTestResult(result);
      if (result.success) {
        toast.success("Run completed successfully");
      } else {
        toast.error("Run completed with errors");
      }
    } catch (error) {
      toast.error("Failed to execute code");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab("result");
    setTestResult(null);
    try {
      await submitSolution(code, language, problem.id);
      toast.success("Solution submitted successfully!");
    } catch (error) {
      toast.error("Submission failed");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider
      defaultOpen={true}
      className="h-screen w-full overflow-hidden bg-background text-foreground"
    >
      <ProblemSidebar problems={problems} activeProblemId={problem.id} />

      <SidebarInset className="h-full overflow-hidden flex flex-col">
        <header className="h-12 flex items-center px-4 border-b bg-muted/20 shrink-0 gap-2">
          <SidebarTrigger />
          <span className="text-sm font-medium opacity-70">
            Problem Workspace
          </span>
        </header>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            {/* LEFT PANEL: Description */}
            <ResizablePanel
              defaultSize={40}
              minSize={25}
              maxSize={60}
              className="h-full"
            >
              <DescriptionPanel
                problem={problem}
                userSubmissions={userSubmissions}
              />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="w-1 bg-border/50 hover:bg-primary/50 transition-colors"
            />

            {/* RIGHT PANEL: Editor & Console */}
            <ResizablePanel defaultSize={60} className="h-full">
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* EDITOR */}
                <ResizablePanel
                  defaultSize={70}
                  minSize={30}
                  className="h-full"
                >
                  <CodeEditorPanel
                    language={language}
                    setLanguage={setLanguage}
                    code={code}
                    setCode={setCode}
                  />
                </ResizablePanel>

                <ResizableHandle
                  withHandle
                  className="h-1 bg-border/50 hover:bg-primary/50 transition-colors"
                />

                {/* CONSOLE */}
                <ResizablePanel
                  defaultSize={30}
                  minSize={10}
                  maxSize={50}
                  className="h-full"
                >
                  <ConsolePanel
                    problem={problem}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    testResult={testResult}
                    activeConsoleTab={activeConsoleTab}
                    setActiveConsoleTab={setActiveConsoleTab}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
