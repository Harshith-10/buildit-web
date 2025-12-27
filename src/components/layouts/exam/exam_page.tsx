"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Runtime, TestcaseResult } from "@/actions/code-execution"; // Typings
// We need actions to execute code. Assuming they are imported from here or passed via props?
// The previous code imported `executeCode` and `executeTestcases` from `@/actions/code-execution`.
import { executeCode, executeTestcases } from "@/actions/code-execution";
import CodeEditor from "@/components/layouts/exam/code_editor";
import ExamHeader from "@/components/layouts/exam/exam_header";
// Components
import ExamLayout from "@/components/layouts/exam/exam_layout";
import ExamSidebar from "@/components/layouts/exam/exam_sidebar";
import { showMalpracticeWarning } from "@/components/layouts/exam/malpractice_warning";
import ProblemPane from "@/components/layouts/exam/problem_pane";
import TestCaseConsole from "@/components/layouts/exam/test_case_console";
import { useCodeStorage } from "@/hooks/exam/use-code-storage";
import { useExamData } from "@/hooks/exam/use-exam-data";
// Hooks
import { useExamSession } from "@/hooks/exam/use-exam-session";
import { useMalpractice } from "@/hooks/exam/use-malpractice";
import type { Problem } from "@/types/problem";

interface ExamPageProps {
  sessionId: string;
  examTitle: string;
  initialTimeLeft: number;
  problems: Problem[];
  languages: Runtime[];
}

export default function ExamPage({
  sessionId,
  examTitle,
  initialTimeLeft,
  problems,
  languages,
}: ExamPageProps) {
  // --- Hooks ---
  const { timeLeft, endExam, isEnded } = useExamSession({
    sessionId,
    initialTimeLeft,
  });
  const {
    currentProblem,
    currentProblemIndex,
    navigateTo,
    problems: examProblems,
  } = useExamData({ problems });
  const { saveCode, getCode, storage } = useCodeStorage(sessionId);
  const { triggerViolation } = useMalpractice({
    sessionId,
    enabled: !isEnded,
    onViolation: (count) => {
      showMalpracticeWarning(`Warning: Violation recorded. Count: ${count}`);
    },
  });

  // --- Local State for Execution ---
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("test-cases");
  const [consoleOutput, setConsoleOutput] = useState<{
    stdout: string;
    stderr: string;
  } | null>(null);
  const [testCaseResults, setTestCaseResults] = useState<TestcaseResult[]>([]);
  const [customInput, setCustomInput] = useState("");

  // --- Derived State ---
  const initialCode = getCode(currentProblem.id);
  const [editorValue, setEditorValue] = useState(initialCode);

  // Sync editor value when problem changes
  useEffect(() => {
    // If we have stored code, use it. Else boilerplate.
    // Boilerplate logic needs language.
    // We'll let the user/editor handle initial boilerplate if empty...
    // But strictly, we should provide it.
    // Let's assume `getCode` returns what we need or empty string.
    const stored = getCode(currentProblem.id);
    if (stored) {
      setEditorValue(stored);
    } else {
      // Fallback to boilerplate if exists in problem
      // problem.driverCode is Record<string, string>
      // We default to 'java' usually.
      const boilerplate = currentProblem.driverCode?.["java"] || "";
      setEditorValue(boilerplate);
    }
  }, [currentProblem.id, getCode, currentProblem.driverCode]);

  const handleCodeChange = (newCode: string) => {
    setEditorValue(newCode);
    // We don't have language info here easily unless we track it in local state too.
    // But CodeEditor tracks language internally.
    // The `saveCode` hook expects language.
    // We might need to lift language state up if we want to save it correctly.
  };

  // !!! Lifting Language state for storage !!!
  const [selectedLanguage, setSelectedLanguage] = useState("java"); // CodeEditor initializes to Java

  // Persist code on change (debounced inside hook? No, hook just sets state/localstorage)
  // We should debounce this call.
  useEffect(() => {
    const t = setTimeout(() => {
      saveCode(currentProblem.id, editorValue, selectedLanguage);
    }, 500); // 500ms debounce
    return () => clearTimeout(t);
  }, [editorValue, selectedLanguage, currentProblem.id, saveCode]);

  // --- Handlers ---

  const handleRun = async (code: string, lang: string, ver: string) => {
    setIsExecuting(true);
    setConsoleOutput(null);
    setTestCaseResults([]);

    // Update selected language in case it changed inside editor
    setSelectedLanguage(lang);

    try {
      if (activeConsoleTab === "custom") {
        const res = await executeCode({
          language: lang,
          version: ver,
          files: [{ content: code }],
          stdin: customInput,
        });

        if (res.message) toast.error(res.message);

        if (res.run) {
          setConsoleOutput({ stdout: res.run.stdout, stderr: res.run.stderr });
        }
      } else {
        // Run test cases
        const res = await executeTestcases({
          language: lang,
          version: ver,
          files: [{ content: code }],
          testcases: currentProblem.testCases.map((tc) => ({
            id: tc.id.toString(),
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        });

        if (res.message) toast.error(res.message);

        if (res.testcases) {
          setTestCaseResults(res.testcases);
          setActiveConsoleTab("results");
        } else if (res.compile?.code !== 0) {
          // Compile Error
          setActiveConsoleTab("custom"); // Show error in custom/output tab or dedicated?
          setConsoleOutput({
            stdout: res.compile?.stdout || "",
            stderr: res.compile?.stderr || "Compilation Error",
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const attemptedIds = new Set(Object.keys(storage));

  return (
    <ExamLayout
      headerContent={
        <ExamHeader
          title={examTitle}
          timeLeft={timeLeft}
          onFinish={() => endExam()} // auto=false
          isSubmitting={isEnded}
        />
      }
      sidebarContent={
        <ExamSidebar
          problems={examProblems}
          currentIndex={currentProblemIndex}
          onSelect={navigateTo}
          attemptedIds={attemptedIds}
        />
      }
      problemPaneContent={<ProblemPane problem={currentProblem} />}
      editorContent={
        <CodeEditor
          value={editorValue}
          onChange={handleCodeChange}
          languages={languages}
          initialLanguage={selectedLanguage}
          onRun={handleRun}
          isExecuting={isExecuting}
        />
      }
      consoleContent={
        <TestCaseConsole
          testCases={currentProblem.testCases}
          results={testCaseResults}
          consoleOutput={consoleOutput}
          customInput={customInput}
          onCustomInputChange={setCustomInput}
          activeTab={activeConsoleTab}
          onTabChange={setActiveConsoleTab}
        />
      }
    />
  );
}
