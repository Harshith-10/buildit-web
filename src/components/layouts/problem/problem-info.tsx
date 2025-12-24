import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Problem } from "@/types/problem";
import ProblemDescription from "./problem-description";
import ProblemSubmissions from "./problem-submissions";

export default function ProblemInfo({ problem }: { problem: Problem }) {
  return (
    <Tabs defaultValue="description" className="h-full">
      <div className="px-2 pt-2">
        <TabsList className="w-full">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="description" className="flex-1 overflow-hidden">
        <ProblemDescription problem={problem} />
      </TabsContent>
      <TabsContent value="submissions" className="flex-1 overflow-hidden">
        {/* <ProblemEditorial problem={problem} /> */}
        <ProblemSubmissions problemId={problem.id} />
      </TabsContent>
    </Tabs>
  );
}
