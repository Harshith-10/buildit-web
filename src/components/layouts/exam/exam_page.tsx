"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Runtime, TestcaseResult } from "@/actions/code-execution";
import { executeCode, executeTestcases } from "@/actions/code-execution";
import { bulkSubmitExam } from "@/actions/exam-submission";
import ExamHeader from "@/components/layouts/exam/exam_header";
import ExamPanes from "@/components/layouts/exam/exam_panes";
import ExamSidebar from "@/components/layouts/exam/exam_sidebar";
import { ExamViolationEnforcement } from "@/components/layouts/exam/exam-violation-enforcement";
import { SidebarInset } from "@/components/ui/sidebar";
import { useExamData } from "@/hooks/exam/use-exam-data";
import { useExamSession } from "@/hooks/exam/use-exam-session";
import { useFullscreen } from "@/hooks/exam/use-fullscreen";
import { useExamStore } from "@/stores/exam-store";
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
  const router = useRouter();

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

  const {
    initialize,
    getCode,
    setCode,
    saveSubmission,
    getSubmission,
    markProblemVisited,
    submissions,
    reset,
  } = useExamStore();

  // Initialize store with driver codes
  useEffect(() => {
    initialize(problems, languages);
  }, [problems, languages, initialize]);

  // Track visited problems
  useEffect(() => {
    markProblemVisited(currentProblem.id);
  }, [currentProblem.id, markProblemVisited]);

  // Fullscreen management
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen({
    enabled: !isEnded,
  });

  // Note: We don't auto-enter fullscreen here because it must be triggered by user action
  // The exam entry page handles initial fullscreen on "Start Exam" button click

  // --- Local State for Execution ---
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("test-cases");
  const [consoleOutput, setConsoleOutput] = useState<{
    stdout: string;
    stderr: string;
    output: string;
  } | null>(null);
  const [testCaseResults, setTestCaseResults] = useState<TestcaseResult[]>([]);
  const [customInput, setCustomInput] = useState("");

  // --- Editor Sync ---
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [editorValue, setEditorValue] = useState("");

  // Load code from store when problem or language changes
  useEffect(() => {
    const storedCode = getCode(currentProblem.id, selectedLanguage);
    setEditorValue(storedCode);

    // Also load previous submission results if available
    const prevSubmission = getSubmission(currentProblem.id);
    if (prevSubmission) {
      // If the submission matches current language, maybe show its results?
      // Optional: Restore console/testcase results from store if desired.
      // For now, we mainly rely on code persistence.
      // If we want to restore test results:
      if (prevSubmission.testCaseResults) {
        setTestCaseResults(prevSubmission.testCaseResults);
      }
    } else {
      setTestCaseResults([]);
      setConsoleOutput(null);
    }
  }, [currentProblem.id, selectedLanguage, getCode, getSubmission]);

  // Initialize version when language changes
  useEffect(() => {
    if (languages.length > 0 && selectedLanguage) {
      const sameLangVersions = languages.filter(
        (l) => l.language === selectedLanguage,
      );
      if (sameLangVersions.length > 0) {
        const latest = sameLangVersions.sort((a, b) =>
          b.version.localeCompare(a.version, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )[0];
        setSelectedVersion(latest.version);
      }
    }
  }, [languages, selectedLanguage]);

  const handleCodeChange = (newCode: string) => {
    setEditorValue(newCode);
    // Debounce save to store handles within store?
    // No, store set is direct. We should debounce here or use a dedicated debounce effect.
  };

  // Persist code to store (Debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      setCode(currentProblem.id, selectedLanguage, editorValue);
    }, 800);
    return () => clearTimeout(t);
  }, [editorValue, selectedLanguage, currentProblem.id, setCode]);

  // --- Handlers ---

  const handleRun = async () => {
    if (!navigator.onLine) {
      toast.error("Offline: Cannot execute code. Code is saved locally.");
      return;
    }

    setIsExecuting(true);
    setConsoleOutput(null);
    setTestCaseResults([]);

    const code = editorValue;
    const lang = selectedLanguage;
    const ver = selectedVersion;

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
          setConsoleOutput({
            stdout: res.run.stdout,
            stderr: res.run.stderr,
            output: res.run.output || "",
          });
        }
      } else {
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

          // Store this RUN as a submission attempt in local store?
          // Unclear if 'Run' count as submission, usually 'Submit' does.
          // But user said: "if they click submit for a problem, run the code against the testcases and store the entire information in the store for now."
          // So this logic applies to `handleSubmit`.
        } else if (res.compile && res.compile.code !== 0) {
          setConsoleOutput({
            stdout: res.compile.stdout,
            stderr: res.compile.stderr,
            output: res.compile.output || "",
          });
          setActiveConsoleTab("custom");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!navigator.onLine) {
      toast.error("Offline: Cannot submit. Code is saved locally.");
      return;
    }

    setIsExecuting(true);
    setTestCaseResults([]);
    setConsoleOutput(null);

    try {
      // 1. Run testcases
      const res = await executeTestcases({
        language: selectedLanguage,
        version: selectedVersion,
        files: [{ content: editorValue }],
        testcases: currentProblem.testCases.map((tc) => ({
          id: tc.id.toString(),
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
      });

      if (!res.testcases) {
        toast.error(res.message || "Compilation failed");
        if (res.compile) {
          setConsoleOutput({
            stdout: res.compile.stdout,
            stderr: res.compile.stderr,
            output: res.compile.output || "",
          });
          setActiveConsoleTab("custom");
        }
        return;
      }

      const results = res.testcases;
      setTestCaseResults(results);
      setActiveConsoleTab("results");

      const allPassed = results.every((tc) => tc.passed);
      const status = allPassed ? "accepted" : "rejected"; // simplified status for local store

      if (allPassed) toast.success("All test cases passed!");
      else toast.error("Some test cases failed.");

      // 2. Store Result Locally
      saveSubmission(currentProblem.id, {
        code: editorValue,
        language: selectedLanguage,
        version: selectedVersion,
        status,
        testCaseResults: results,
      });
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFinishExam = async () => {
    // 1. Get all submissions from store
    const allSubmissions = useExamStore.getState().submissions;

    // 2. Submit to DB
    toast.loading("Submitting exam...");
    const res = await bulkSubmitExam({
      sessionId,
      submissions: allSubmissions,
    });

    toast.dismiss();

    if (res.success) {
      // Exit fullscreen before navigation
      await exitFullscreen();
      
      toast.success("Exam submitted successfully!");
      reset(); // Clear store
      endExam(); // Call local end exam logic (clean up tokens etc if any)
      router.push("/exams?status=completed");
    } else {
      toast.error(res.message || "Failed to submit exam. Please try again.");
    }
  };

  // Handle exam termination due to violations
  const handleExamTermination = async () => {
    console.log("[ExamPage] Handling exam termination");
    
    // Exit fullscreen
    await exitFullscreen();
    
    // Auto-submit with current state
    const allSubmissions = useExamStore.getState().submissions;
    
    try {
      await bulkSubmitExam({
        sessionId,
        submissions: allSubmissions,
        terminated: true,
      });
    } catch (error) {
      console.error("[ExamPage] Failed to submit terminated exam:", error);
    }
    
    // Clear store and redirect
    reset();
    endExam();
    
    // Delay redirect to show termination message
    setTimeout(() => {
      router.push("/exams?status=terminated");
    }, 3000);
  };

  return (
    <>
      {/* Violation Enforcement System */}
      <ExamViolationEnforcement 
        enabled={!isEnded} 
        onTerminate={handleExamTermination}
      />
      
      <ExamSidebar
        problems={examProblems}
        currentIndex={currentProblemIndex}
        onSelect={navigateTo}
        attemptedIds={new Set(Object.keys(submissions))}
      />
      <SidebarInset className="h-full overflow-hidden">
        <div className="h-full w-full flex flex-col overflow-hidden">
          <ExamHeader
            title={examTitle}
            timeLeft={timeLeft}
            onFinish={handleFinishExam}
            isSubmitting={isExecuting}
          />
          <ExamPanes
            problem={currentProblem}
            languages={languages}
            currentCode={editorValue}
            onCodeChange={handleCodeChange}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedVersion={selectedVersion}
            onVersionChange={setSelectedVersion}
            isExecuting={isExecuting}
            onRun={handleRun}
            onSubmit={handleSubmit}
            testCaseResults={testCaseResults}
            consoleOutput={consoleOutput}
            activeConsoleTab={activeConsoleTab}
            onConsoleTabChange={setActiveConsoleTab}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
          />
        </div>
      </SidebarInset>
    </>
  );
}
