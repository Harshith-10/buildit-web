import { notFound } from "next/navigation";
import { getExam } from "@/actions/exam-details";
import { ExamDetailsView } from "@/components/layouts/exams/exam-details-view";

export default async function ExamDetailsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = await getExam(examId);

  if (!exam) {
    notFound();
  }

  return <ExamDetailsView exam={exam} />;
}
