import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Problem } from "@/types/problem";

export default function TestCasesPane({ problem }: { problem: Problem }) {
  return (
    <div className="h-full w-full p-2">
      <Tabs defaultValue="test-cases">
        <TabsList className="w-full">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="input-output">Input Output</TabsTrigger>
        </TabsList>

        {/* Test Cases */}
        <TabsContent value="test-cases">
          <Tabs defaultValue={problem.testCases[0].id.toString()}>
            <div className="flex items-center gap-2">
              <TabsList>
                {problem.testCases.map((testCase, index) => (
                  <TabsTrigger key={testCase.id} value={testCase.id.toString()}>
                    Test Case {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button size="icon-sm" variant="outline" className="rounded-full">
                <Plus />
              </Button>
            </div>
            {problem.testCases.map((testCase, _index) => (
              <TabsContent key={testCase.id} value={testCase.id.toString()}>
                <div className="flex flex-col gap-2 p-2">
                  <Label>Input</Label>
                  <p className="font-mono bg-input/30 rounded-md border p-2 text-sm">
                    {testCase.input}
                  </p>
                  <Label>Output</Label>
                  <p className="font-mono bg-input/30 rounded-md border p-2 text-sm">
                    {testCase.expectedOutput}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Input Output */}
        <TabsContent value="input-output">
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="flex flex-col gap-2">
              <Label>Input</Label>
              <Textarea className="min-h-20 bg-input/30 rounded-md border font-mono p-2 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Output</Label>
              <div className="min-h-20 bg-input/30 rounded-md border font-mono p-2 text-sm">
                Run your code to see the output.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results"></TabsContent>
      </Tabs>
    </div>
  );
}
