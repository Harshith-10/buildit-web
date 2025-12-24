"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  executeCode,
  executeTestcases,
  type Runtime,
  type TestcaseResult,
} from "@/actions/code-execution";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Problem } from "@/types/problem";
import ProblemEditor, { ProblemEditorHeader } from "../problem/problem-editor";
import ProblemInfo from "../problem/problem-info";
import TestCasesPane from "../problem/problem-testcases";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Get boilerplate for selected language or default
const getBoilerplate = (problem: Problem, lang: string) => {
  return problem.driverCode?.[lang] || "// Write your code here...";
};

interface ExamPanesProps {
  problem: Problem;
  languages: Runtime[];
  onCodeChange?: (code: string) => void;
  initialCode?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function ExamPanes({
  problem,
  languages,
  onCodeChange,
  initialCode,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: ExamPanesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Set default version when languages load or language changes
  useEffect(() => {
    if (languages.length > 0 && !selectedVersion) {
      const defaultLang = "java";
      const javaVersions = languages.filter((l) => l.language === defaultLang);
      if (javaVersions.length > 0) {
        const latestJava = javaVersions.sort((a, b) =>
          b.version.localeCompare(a.version, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )[0];
        setSelectedLanguage(defaultLang);
        setSelectedVersion(latestJava.version);
        setCode(initialCode || getBoilerplate(problem, defaultLang));
      } else {
        setSelectedLanguage(languages[0].language);
        setSelectedVersion(languages[0].version);
        setCode(initialCode || getBoilerplate(problem, languages[0].language));
      }
    }
  }, [problem, languages, selectedVersion, initialCode]);

  const [activeTab, setActiveTab] = useState("test-cases");
  const [testCaseResults, setTestCaseResults] = useState<TestcaseResult[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<{
    stdout: string;
    stderr: string;
    output: string;
  } | null>(null);
  const [customInput, setCustomInput] = useState("");

  const [code, setCode] = useState(initialCode || getBoilerplate(problem, "java"));

  // Update code when problem changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(getBoilerplate(problem, selectedLanguage));
    }
  }, [problem.id, initialCode, selectedLanguage]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const langVersions = languages.filter((l) => l.language === newLang);
    const latest = langVersions.sort((a, b) =>
      b.version.localeCompare(a.version, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )[0];
    if (latest) {
      setSelectedVersion(latest.version);
    }
    const newCode = getBoilerplate(problem, newLang);
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleVersionChange = (newVer: string) => {
    setSelectedVersion(newVer);
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setTestCaseResults([]);
    setConsoleOutput(null);

    const language = selectedLanguage;
    const version = selectedVersion || "*";

    try {
      if (activeTab === "input-output") {
        const response = await executeCode({
          language,
          version,
          files: [{ content: code }],
          stdin: customInput,
        });

        if (response.message) {
          toast.error(response.message);
        }

        setConsoleOutput(response.run);
      } else {
        const response = await executeTestcases({
          language,
          version,
          files: [{ content: code }],
          testcases: problem.testCases.map((tc) => ({
            id: tc.id.toString(),
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        });

        if (response.message) {
          toast.error(response.message);
        }

        if (response.testcases) {
          setTestCaseResults(response.testcases);
          setActiveTab("results");
        } else if (response.compile && response.compile.code !== 0) {
          setConsoleOutput({
            stdout: response.compile.stdout,
            stderr: response.compile.stderr,
            output: response.compile.output,
          });
          if (!response.testcases) {
            setActiveTab("input-output");
            setConsoleOutput({
              stdout: response.compile.stdout,
              stderr: response.compile.stderr,
              output: response.compile.output,
            });
          }
        }
      }
    } catch (error) {
      toast.error("An error occurred during execution.");
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
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
                  language={selectedLanguage}
                  version={selectedVersion}
                  onLanguageChange={handleLanguageChange}
                  onVersionChange={handleVersionChange}
                  languages={languages}
                  onRun={handleRunCode}
                  isExecuting={isExecuting}
                />
                <ProblemEditor
                  value={code}
                  onChange={handleCodeChange}
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
                  problem={problem}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  testCaseResults={testCaseResults}
                  consoleOutput={consoleOutput}
                  customInput={customInput}
                  onCustomInputChange={setCustomInput}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Navigation buttons */}
      {(hasPrevious || hasNext) && (
        <div className="flex justify-between items-center p-2 border-t bg-background">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Navigate between questions using the sidebar
          </div>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
