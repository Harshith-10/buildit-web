"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Problem } from "@/types/problem";
import ProblemDescription from "./problem-description";
import ProblemEditor, { ProblemEditorHeader } from "./problem-editor";
import TestCasesPane from "./problem-testcases";
import ProblemInfo from "./problem-info";

export default function ProblemPanes({ problem }: { problem: Problem }) {
  const [language, setLanguage] = useState("java");

  // Get boilerplate for selected language or default
  const getBoilerplate = (lang: string) => {
    return problem.driverCode?.[lang] || "// Write your code here...";
  };

  const [code, setCode] = useState(getBoilerplate("java"));

  // Update code when language changes, if code matches previous boilerplate (optional logic,
  // but for now simpler to just switch boilerplate if user hasn't edited?
  // User wanted "it will contain the driver codes".
  // Let's simpler: When language changes, set code to that language's driver code.
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(getBoilerplate(newLang));
  };

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      <ResizablePanel className="max-h-full" defaultSize={40} minSize={20}>
        <ProblemInfo problem={problem} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={20}>
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize={60} minSize={20}>
            <div className="flex flex-col h-full items-center justify-center">
              <ProblemEditorHeader
                language={language}
                onLanguageChange={handleLanguageChange}
              />
              <ProblemEditor
                value={code}
                onChange={setCode}
                language={language}
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
              <TestCasesPane problem={problem} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
