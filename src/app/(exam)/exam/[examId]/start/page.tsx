import { notFound } from "next/navigation";
import { getExam } from "@/actions/exam-details";
import { ExamEntryView } from "@/components/layouts/exams/exam-entry-view";

export default async function ExamStartPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = await getExam(examId);

  if (!exam) {
    notFound();
  }

  return (
    <ExamEntryView
      examId={exam.id}
      examTitle={exam.title}
      durationMinutes={exam.durationMinutes}
    />
  );
}
