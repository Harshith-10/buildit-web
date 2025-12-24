import { notFound } from "next/navigation";
import { getLanguages } from "@/actions/code-execution";
import { getProblem } from "@/actions/problem-data";
import ProblemHeader from "@/components/layouts/problem/problem-header";
import ProblemPanes from "@/components/layouts/problem/problem-panes";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;

  const [problem, languages] = await Promise.all([
    getProblem(slug),
    getLanguages(),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ProblemHeader problem={problem} />
      <ProblemPanes problem={problem} languages={languages} />
    </div>
  );
}
