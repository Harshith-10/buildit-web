import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { TestcaseResult } from "@/actions/code-execution";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/problem";

interface TestCasesPaneProps {
  problem: Problem;
  activeTab: string;
  onTabChange: (tab: string) => void;
  testCaseResults: TestcaseResult[];
  consoleOutput: {
    stdout: string;
    stderr: string;
    output: string;
  } | null;
  customInput: string;
  onCustomInputChange: (val: string) => void;
}

export default function TestCasesPane({
  problem,
  activeTab,
  onTabChange,
  testCaseResults,
  consoleOutput,
  customInput,
  onCustomInputChange,
}: TestCasesPaneProps) {
  console.log("Problem test cases:", problem.testCases);
  console.log("Test cases length:", problem.testCases?.length);

  return (
    <div className="h-full w-full p-2">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        defaultValue="test-cases"
        className="flex flex-col h-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="input-output">Input Output</TabsTrigger>
        </TabsList>

        {/* Test Cases */}
        <TabsContent
          value="test-cases"
          className="flex-1 min-h-0 flex flex-col"
        >
          {problem.testCases.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No test cases available for this problem.</p>
            </div>
          ) : (
            <Tabs
              defaultValue={problem.testCases[0].id.toString()}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2">
                <TabsList>
                  {problem.testCases.map((testCase, index) => (
                    <TabsTrigger
                      key={testCase.id}
                      value={testCase.id.toString()}
                    >
                      Test Case {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    toast.info("This feature will be added soon!");
                  }}
                >
                  <Plus />
                </Button>
              </div>
              {problem.testCases.map((testCase, _index) => (
                <TabsContent
                  key={testCase.id}
                  value={testCase.id.toString()}
                  className="flex-1 overflow-y-auto min-h-0"
                >
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
          )}
        </TabsContent>

        {/* Input Output */}
        <TabsContent
          value="input-output"
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-2 p-2 h-full">
            <div className="flex flex-col gap-2">
              <Label>Input</Label>
              <Textarea
                className="min-h-20 bg-input/30 rounded-md border font-mono p-2 text-sm h-full"
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Output</Label>
              <div className="min-h-20 bg-input/30 rounded-md border font-mono p-2 text-sm h-full whitespace-pre-wrap overflow-auto">
                {consoleOutput ? (
                  <>
                    {consoleOutput.stdout && (
                      <div className="text-foreground">
                        {consoleOutput.stdout}
                      </div>
                    )}
                    {consoleOutput.stderr && (
                      <div className="text-red-500">{consoleOutput.stderr}</div>
                    )}
                    {!consoleOutput.stdout && !consoleOutput.stderr && (
                      <span className="text-muted-foreground italic">
                        No output
                      </span>
                    )}
                  </>
                ) : (
                  "Run your code to see the output."
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="flex-1 min-h-0 flex flex-col">
          {testCaseResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Run your code to see executed test cases here.
            </div>
          ) : (
            <Tabs
              defaultValue={testCaseResults[0].id.toString()}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 overflow-x-auto">
                <TabsList>
                  {testCaseResults.map((result, index) => (
                    <TabsTrigger
                      key={result.id}
                      value={result.id.toString()}
                      className={cn(
                        "gap-2",
                        result.passed ? "text-green-500" : "text-red-500",
                      )}
                    >
                      Case {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {testCaseResults.map((result) => (
                <TabsContent
                  key={result.id}
                  value={result.id.toString()}
                  className="flex-1 overflow-y-auto min-h-0"
                >
                  <div className="flex flex-col gap-2 p-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-bold text-sm px-2 py-1 rounded",
                          result.passed
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                        )}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                    <Label>Input</Label>
                    <p className="font-mono bg-input/30 rounded-md border p-2 text-sm whitespace-pre-wrap">
                      {result.input}
                    </p>
                    <Label>Expected Output</Label>
                    <p className="font-mono bg-input/30 rounded-md border p-2 text-sm whitespace-pre-wrap">
                      {result.expectedOutput}
                    </p>
                    <Label>Actual Output</Label>
                    <p className="font-mono bg-input/30 rounded-md border p-2 text-sm whitespace-pre-wrap">
                      {result.actualOutput}
                    </p>
                    {result.run_details.stderr && (
                      <>
                        <Label className="text-red-500">Error</Label>
                        <p className="font-mono bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900 p-2 text-sm whitespace-pre-wrap text-red-600 dark:text-red-400">
                          {result.run_details.stderr}
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
