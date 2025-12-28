import { redirect } from "next/navigation";
import { getExamSubmissionData } from "@/actions/exam-submission";
import ExamSubmissionPage from "@/components/layouts/exam/exam-submission-page";

export default async function ExamSubmittedPage({
    searchParams,
}: {
    searchParams: Promise<{
        sessionId?: string;
        // Fallback params for backward compatibility
        status?: string;
        title?: string;
        attempted?: string;
        total?: string;
        violations?: string;
    }>;
}) {
    const params = await searchParams;

    // If sessionId is provided, fetch everything from database
    if (params.sessionId) {
        const data = await getExamSubmissionData(params.sessionId);

        if (!data) {
            // Session not found, redirect to dashboard
            redirect("/dashboard");
        }

        // Map database status to component status
        const status = data.status === "terminated" ? "terminated" : "completed";

        return (
            <ExamSubmissionPage
                submissionStatus={status}
                examTitle={data.examTitle}
                submittedAt={data.submittedAt}
                problemsAttempted={data.problemsAttempted}
                totalProblems={data.totalProblems}
                violationCount={data.violationCount}
            />
        );
    }

    // Fallback: Use query params directly (for backward compatibility)
    const status = params.status === "terminated" ? "terminated" : "completed";
    const examTitle = params.title || "Exam";
    const problemsAttempted = params.attempted
        ? parseInt(params.attempted, 10)
        : 0;
    const totalProblems = params.total ? parseInt(params.total, 10) : 0;
    const violationCount = params.violations
        ? parseInt(params.violations, 10)
        : 0;

    return (
        <ExamSubmissionPage
            submissionStatus={status}
            examTitle={decodeURIComponent(examTitle)}
            submittedAt={new Date()}
            problemsAttempted={problemsAttempted}
            totalProblems={totalProblems}
            violationCount={violationCount}
        />
    );
}
