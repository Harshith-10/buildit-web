import User from "@/components/common/user-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Problem } from "@/types/problem";

interface ProblemHeaderProps {
  problem: Problem;
}

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <header className="flex justify-between p-2 w-full border-b">
      <div className="flex items-center">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2" />
        <h1 className="text-lg font-semibold">{problem.title}</h1>
        <Separator orientation="vertical" className="mx-2" />
        <Badge
          className={`capitalize text-white ${
            problem.difficulty === "easy"
              ? "bg-green-500"
              : problem.difficulty === "medium"
                ? "bg-yellow-600"
                : "bg-red-600"
          }`}
        >
          {problem.difficulty}
        </Badge>
      </div>
      <div className="flex gap-2 px-2">
        <User size="small" />
      </div>
    </header>
  );
}
