"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  executeCode,
  executeTestcases,
  type Runtime,
  type TestcaseResult,
} from "@/actions/code-execution";
import { submitSolution } from "@/actions/problem-data";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useProblemStore } from "@/stores/problem-store";
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
  const {
    code: storeCode,
    setCode: setStoreCode,
    lastLanguage,
    setLastLanguage,
    lastLanguageVersion,
    preferences,
  } = useProblemStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize language from store or default
  useEffect(() => {
    if (mounted && languages.length > 0) {
      if (lastLanguage && languages.some((l) => l.language === lastLanguage)) {
        setSelectedLanguage(lastLanguage);
        // Try to match last used version
        const sameLangVersions = languages.filter(
          (l) => l.language === lastLanguage,
        );
        const match = sameLangVersions.find(
          (l) => l.version === lastLanguageVersion,
        );

        if (match) {
          setSelectedVersion(match.version);
        } else {
          // Fallback to latest
          const latest = sameLangVersions.sort((a, b) =>
            b.version.localeCompare(a.version, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          )[0];
          if (latest) setSelectedVersion(latest.version);
        }
      } else if (!selectedVersion) {
        // Default to java if exists, else first
        const defaultLang = "java";
        const javaVersions = languages.filter(
          (l) => l.language === defaultLang,
        );
        if (javaVersions.length > 0) {
          const latestJava = javaVersions.sort((a, b) =>
            b.version.localeCompare(a.version, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          )[0];
          setSelectedLanguage(defaultLang);
          setSelectedVersion(latestJava.version);
        } else {
          setSelectedLanguage(languages[0].language);
          setSelectedVersion(languages[0].version);
        }
      }
    }
  }, [mounted, languages, lastLanguage, lastLanguageVersion, selectedVersion]);

  const [activeTab, setActiveTab] = useState("test-cases");
  const [testCaseResults, setTestCaseResults] = useState<TestcaseResult[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<{
    stdout: string;
    stderr: string;
    output: string;
  } | null>(null);
  const [customInput, setCustomInput] = useState("");

  const currentCode = useMemo(() => {
    if (!mounted) return getBoilerplate(problem, selectedLanguage);
    return (
      storeCode[problem.id]?.[selectedLanguage] ??
      getBoilerplate(problem, selectedLanguage)
    );
  }, [storeCode, problem, selectedLanguage, mounted]);

  const handleCodeChange = (val: string) => {
    setStoreCode(problem.id, selectedLanguage, val);
  };

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

    const newVer = latest ? latest.version : "";
    setSelectedVersion(newVer);
    setLastLanguage(newLang, newVer);
  };

  const handleVersionChange = (newVer: string) => {
    setSelectedVersion(newVer);
    setLastLanguage(selectedLanguage, newVer);
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
          files: [{ content: currentCode }],
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
          files: [{ content: currentCode }],
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

  const handleSubmit = async () => {
    setIsExecuting(true);
    setTestCaseResults([]);
    setConsoleOutput(null);

    try {
      const res = await submitSolution(
        currentCode,
        selectedLanguage,
        problem.id,
        selectedVersion,
      );

      if (res.status === "accepted") {
        toast.success("Solution Accepted!");
        setActiveTab("results");
        if (res.testCases) setTestCaseResults(res.testCases);
      } else {
        toast.error(res.message || "Solution rejected");
        if (res.testCases) {
          setTestCaseResults(res.testCases);
          setActiveTab("results");
        }
      }
      // biome-ignore lint/suspicious/noExplicitAny: Capture all errors
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    } finally {
      setIsExecuting(false);
    }
  };

  // const onLayout = (sizes: number[]) => {
  //   setPreferences({ panelLayout: sizes });
  // };

  if (!mounted) return null;

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      <ResizablePanel
        className="max-h-full"
        defaultSize={preferences.panelLayout[0]}
        minSize={20}
      >
        <ProblemInfo problem={problem} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={preferences.panelLayout[1]} minSize={20}>
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
                onSubmit={handleSubmit}
                isExecuting={isExecuting}
              />
              <ProblemEditor
                value={currentCode}
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
                testCases={problem.testCases}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                results={testCaseResults}
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
