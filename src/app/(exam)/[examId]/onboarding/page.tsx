import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import OnboardingClient from "@/components/layouts/exam/onboarding-client";
import db from "@/db";
import { exams } from "@/db/schema";

interface PageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function OnboardingPage({ params }: PageProps) {
  const { examId } = await params;

  console.log("[Onboarding Page] Fetching exam with ID:", examId);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
  });

  console.log("[Onboarding Page] Exam found:", exam ? "Yes" : "No");

  if (!exam) {
    console.log("[Onboarding Page] Exam not found, returning 404");
    notFound();
  }

  console.log("[Onboarding Page] Rendering OnboardingClient for exam:", exam.title);

  return <OnboardingClient exam={exam} />;
}
