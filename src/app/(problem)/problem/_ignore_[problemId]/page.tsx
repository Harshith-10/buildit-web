import { notFound } from "next/navigation";
import {
  getProblem,
  getProblems,
  getUserSubmissions,
} from "@/actions/problem-data";
import ProblemClientPage from "./problem-client-page";

interface PageProps {
  params: Promise<{
    problemId: string;
  }>;
}

export default async function ProblemPage({ params }: PageProps) {
  const { problemId } = await params;

  const [problem, userSubmissions, problems] = await Promise.all([
    getProblem(problemId),
    getUserSubmissions(problemId),
    getProblems(),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <ProblemClientPage
      problem={problem}
      userSubmissions={userSubmissions}
      problems={problems}
    />
  );
}
