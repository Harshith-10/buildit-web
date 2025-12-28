"use client";

import {
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Clock,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SubmissionStatus = "completed" | "terminated";

interface ExamSubmissionPageProps {
    submissionStatus: SubmissionStatus;
    examTitle: string;
    submittedAt: Date;
    problemsAttempted?: number;
    totalProblems?: number;
    violationCount?: number;
}

export default function ExamSubmissionPage({
    submissionStatus,
    examTitle,
    submittedAt,
    problemsAttempted = 0,
    totalProblems = 0,
    violationCount = 0,
}: ExamSubmissionPageProps) {
    const router = useRouter();
    const isCompleted = submissionStatus === "completed";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Bar */}
            <header className="border-b px-6 py-4">
                <h1 className="text-sm font-medium text-muted-foreground">Exam Submission</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-xl mx-auto space-y-8">
                    {/* Status Section */}
                    <div className="text-center space-y-4">
                        <div
                            className={cn(
                                "inline-flex items-center justify-center w-20 h-20 rounded-full",
                                isCompleted ? "bg-emerald-500" : "bg-destructive"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
                            ) : (
                                <XCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {isCompleted ? "Exam Submitted" : "Exam Terminated"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isCompleted
                                    ? "Your responses have been saved successfully."
                                    : "Your exam was ended early due to policy violations."}
                            </p>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="rounded-xl border bg-card p-6 space-y-4 text-center">
                        {/* Exam Name */}
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                Exam
                            </p>
                            <p className="font-medium">{examTitle}</p>
                        </div>

                        <Separator />

                        {/* Submission Time */}
                        <div className="flex items-center justify-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm">
                                    {submittedAt.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                    {" at "}
                                    {submittedAt.toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Completed: Show progress */}
                        {isCompleted && totalProblems > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Questions Attempted</span>
                                        <span className="font-medium">
                                            {problemsAttempted} of {totalProblems}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all"
                                            style={{ width: `${(problemsAttempted / totalProblems) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Terminated: Show violation info */}
                        {!isCompleted && (
                            <>
                                <Separator />
                                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                    <p className="text-sm font-medium">
                                        {violationCount} Policy Violation{violationCount !== 1 ? "s" : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Your submission will be reviewed by your instructor.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1"
                            size="lg"
                            onClick={() => router.push("/dashboard")}
                        >
                            Go to Dashboard
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        {isCompleted && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1"
                                onClick={() => router.push("/exams")}
                            >
                                View All Exams
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t px-6 py-4 text-center">
                <p className="text-xs text-muted-foreground">
                    {isCompleted
                        ? "You may now close this window."
                        : "This incident has been recorded."}
                </p>
            </footer>
        </div>
    );
}
