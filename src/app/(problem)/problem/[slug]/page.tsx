import { notFound } from "next/navigation";
import { getLanguages } from "@/actions/code-execution";
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
    slug: string;
  }>;
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;

  const [problem, _problems, languages] = await Promise.all([
    getProblem(slug),
    getProblems(),
    getLanguages(),
  ]);

  if (!problem) {
    notFound();
  }

  const [_userSubmissions] = await Promise.all([
    getUserSubmissions(problem.id),
  ]);

  return (
    <main className="flex h-screen w-full">
      <ProblemSidebar problems={_problems} activeProblemSlug={slug} />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <ProblemHeader problem={problem} />
        <ProblemPanes problem={problem} languages={languages} />
      </div>
    </main>
  );
}
