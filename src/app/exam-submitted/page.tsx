import ExamSubmissionPage from "@/components/layouts/exam/exam-submission-page";

export default async function ExamSubmittedPage({
    searchParams,
}: {
    searchParams: Promise<{
        status?: string;
        title?: string;
        attempted?: string;
        total?: string;
        violations?: string;
    }>;
}) {
    const params = await searchParams;

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
