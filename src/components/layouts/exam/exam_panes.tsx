"use client";

import { useEffect, useState } from "react";
import type { Runtime, TestcaseResult } from "@/actions/code-execution";
import ProblemEditor, {
  ProblemEditorHeader,
} from "@/components/layouts/problem/problem-editor";
import ProblemInfo from "@/components/layouts/problem/problem-info";
import TestCasesPane from "@/components/layouts/problem/problem-testcases";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Problem } from "@/types/problem";

// Use same preferences keys or defaults
const DEFAULT_LAYOUT = [40, 60];

interface ExamPanesProps {
  problem: Problem;
  languages: Runtime[];
  currentCode: string;
  onCodeChange: (val: string) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  selectedVersion: string;
  onVersionChange: (ver: string) => void;
  isExecuting: boolean;
  onRun: () => Promise<void>;
  onSubmit: () => Promise<void>;
  testCaseResults: TestcaseResult[];
  consoleOutput: { stdout: string; stderr: string; output: string } | null;
  activeConsoleTab: string;
  onConsoleTabChange: (tab: string) => void;
  customInput: string;
  onCustomInputChange: (val: string) => void;
}

export default function ExamPanes({
  problem,
  languages,
  currentCode,
  onCodeChange,
  selectedLanguage,
  onLanguageChange,
  selectedVersion,
  onVersionChange,
  isExecuting,
  onRun,
  onSubmit,
  testCaseResults,
  consoleOutput,
  activeConsoleTab,
  onConsoleTabChange,
  customInput,
  onCustomInputChange,
}: ExamPanesProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      <ResizablePanel
        className="max-h-full"
        defaultSize={DEFAULT_LAYOUT[0]}
        minSize={20}
      >
        <ProblemInfo problem={problem} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={DEFAULT_LAYOUT[1]} minSize={20}>
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize={60} minSize={20}>
            <div className="flex flex-col h-full items-center justify-center">
              <ProblemEditorHeader
                language={selectedLanguage}
                version={selectedVersion}
                onLanguageChange={onLanguageChange}
                onVersionChange={onVersionChange}
                languages={languages}
                onRun={onRun}
                onSubmit={onSubmit}
                isExecuting={isExecuting}
              />
              <ProblemEditor
                value={currentCode}
                onChange={onCodeChange}
                language={selectedLanguage}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="w-full h-px"
            orientation="horizontal"
          />
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex h-full items-center justify-center">
              <TestCasesPane
                testCases={problem.testCases}
                activeTab={activeConsoleTab}
                onTabChange={onConsoleTabChange}
                results={testCaseResults}
                consoleOutput={consoleOutput}
                customInput={customInput}
                onCustomInputChange={onCustomInputChange}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
