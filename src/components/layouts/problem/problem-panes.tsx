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
import ProblemEditor, { ProblemEditorHeader } from "./problem-editor";
import ProblemInfo from "./problem-info";
import TestCasesPane from "./problem-testcases";

// Get boilerplate for selected language or default
const getBoilerplate = (problem: Problem, lang: string) => {
  return problem.driverCode?.[lang] || "// Write your code here...";
};

export default function ProblemPanes({
  problem,
  languages,
}: {
  problem: Problem;
  languages: Runtime[];
}) {
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Set default version when languages load or language changes to java initial
  useEffect(() => {
    if (languages.length > 0 && !selectedVersion) {
      // Default to java if exists, else first
      const defaultLang = "java";
      const javaVersions = languages.filter((l) => l.language === defaultLang);
      if (javaVersions.length > 0) {
        // Find latest version (simple string compare for now or assuming order?)
        // API usually returns sorted or we can just pick one.
        // Let's pick the last one assuming ascending, or just the first one.
        // Actually, we should probably sort valid semver.
        // For now, let's just pick the last in the list as "latest" if multiple.
        // Piston API: "Returns a list of available languages...".
        // Let's just pick the one that matches "java" and has highest version.
        // For simplicity, let's just pick the first one matching the selected language.
        const latestJava = javaVersions.sort((a, b) =>
          b.version.localeCompare(a.version, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )[0];
        setSelectedLanguage(defaultLang);
        setSelectedVersion(latestJava.version);
        setCode(getBoilerplate(problem, defaultLang));
      } else {
        setSelectedLanguage(languages[0].language);
        setSelectedVersion(languages[0].version);
        setCode(getBoilerplate(problem, languages[0].language));
      }
    }
  }, [problem, languages, selectedVersion]);

  const [activeTab, setActiveTab] = useState("test-cases");
  const [testCaseResults, setTestCaseResults] = useState<TestcaseResult[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<{
    stdout: string;
    stderr: string;
    output: string;
  } | null>(null);
  const [customInput, setCustomInput] = useState("");

  const [code, setCode] = useState(getBoilerplate(problem, "java"));

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    // Find latest version for newLang
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
    setCode(getBoilerplate(problem, newLang));
  };

  const handleVersionChange = (newVer: string) => {
    setSelectedVersion(newVer);
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setTestCaseResults([]);
    setConsoleOutput(null);

    // Use selected state
    const language = selectedLanguage;
    const version = selectedVersion || "*";

    try {
      if (activeTab === "input-output") {
        // Run against custom input
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
        // Run against test cases
        // If we are in Results tab, we also run all test cases.
        // Usually "Run" vs "Submit". "Run" -> Execute against sample test cases (or all visible).
        // For now, let's execute against ALL provided test cases in `problem.testCases`.
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
          // Compilation error
          setConsoleOutput({
            stdout: response.compile.stdout,
            stderr: response.compile.stderr,
            output: response.compile.output,
          });
          // Switch to Input/Output to show error? Or show in Results?
          // Maybe better to just show a toast or handle comp error display globally.
          // For now, let's fallback to input-output pane execution to show generic error if testcases are empty.
          if (!response.testcases) {
            setActiveTab("input-output");
            // Construct a fake run result for display
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
                onChange={setCode}
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
  );
}
