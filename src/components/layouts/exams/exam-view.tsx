"use client";

import { Play, Send, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { MOCK_EXAM } from "@/data/mock-exam";
import { usePageName } from "@/hooks/use-page-name";
import { CodeEditor } from "./code-editor";
import { ExamSidebar } from "./exam-sidebar";
import { ProblemDescription } from "./problem-description";
import { TestCaseConsole } from "./test-case-console";

interface ExamViewProps {
  examData: typeof MOCK_EXAM;
}

export function ExamView({ examData }: ExamViewProps) {
  usePageName("Exam");
  const router = useRouter();

  const [activeProblemId, setActiveProblemId] = useState(
    examData.questions[0].id,
  );
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState(examData.durationMinutes * 60);

  // Initialize code map with default code
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    examData.questions.forEach((q) => {
      initialMap[q.id] = q.defaultCode || "";
    });
    setCodeMap(initialMap);
  }, [examData]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeProblem = examData.questions.find(
    (q) => q.id === activeProblemId,
  );

  const handleRunCode = () => {
    setIsRunning(true);
    setTestResult(undefined);
    // Simulate run delay
    setTimeout(() => {
      setIsRunning(false);
      setTestResult("All test cases passed! (Mock Result)");
    }, 1500);
  };

  const handleSubmit = () => {
    toast.success("Exam submitted successfully!");
    router.push("/dashboard"); // Or wherever appropriate
  };

  if (!activeProblem) return <div>Loading...</div>;

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "20rem",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        <ExamSidebar
          problems={examData.questions}
          activeProblemId={activeProblemId}
          onSelect={setActiveProblemId}
          title={examData.title}
          onEndExam={handleSubmit}
        />

        <SidebarInset className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b flex items-center justify-between px-4 bg-muted/40 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background border rounded-md shadow-sm">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span
                  className={`font-mono font-medium ${timeLeft < 300 ? "text-red-500" : ""}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? "Running..." : "Run"}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Problem Description */}
            <div className="flex-1 min-w-[300px] border-r h-full overflow-hidden">
              <ProblemDescription
                title={activeProblem.title}
                difficulty={activeProblem.difficulty}
                description={activeProblem.description}
              />
            </div>

            {/* Code Editor & Console */}
            <div className="flex-1 min-w-[400px] flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
              <div className="flex-1 overflow-hidden relative">
                {/* Absolute positioning to ensure editor fills space */}
                <div className="absolute inset-0">
                  <CodeEditor
                    value={codeMap[activeProblemId] || ""}
                    onChange={(val) =>
                      setCodeMap((prev) => ({
                        ...prev,
                        [activeProblemId]: val,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Console Toggle/Area */}
              <div className="h-[200px] shrink-0 border-t border-[#333] bg-background">
                <TestCaseConsole
                  testCases={activeProblem.testCases || []}
                  result={testResult}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
