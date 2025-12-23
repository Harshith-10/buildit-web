import { notFound } from "next/navigation";
import {
  getProblem,
  getProblems,
  getUserSubmissions,
} from "@/actions/problem-data";
import ProblemHeader from "@/components/layouts/problem/problem-header";
import ProblemPanes from "@/components/layouts/problem/problem-panes";
import { ProblemSidebar } from "@/components/layouts/problem/problem-sidebar";

interface PageProps {
  params: Promise<{
    problemId: string;
  }>;
}

export default async function ProblemPage({ params }: PageProps) {
  const { problemId } = await params;

  const [problem, _userSubmissions, _problems] = await Promise.all([
    getProblem(problemId),
    getUserSubmissions(problemId),
    getProblems(),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <main className="flex h-screen w-full">
      <ProblemSidebar problems={_problems} activeProblemId={problemId} />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <ProblemHeader problem={problem} />
        <ProblemPanes problem={problem} />
      </div>
    </main>
  );
}
