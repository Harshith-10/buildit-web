"use client";

import { ExamView } from "@/components/layouts/exams/exam-view";
import { MOCK_EXAM } from "@/data/mock-exam";
import { usePageName } from "@/hooks/use-page-name";

export default function ExamPage() {
  usePageName("Exam");

  return (
    <div className="h-screen w-full bg-background">
      <ExamView examData={MOCK_EXAM} />
    </div>
  );
}
