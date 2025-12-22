import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestCaseConsoleProps {
  testCases: { input: string; expected: string }[];
  result?: string;
}

export function TestCaseConsole({ testCases, result }: TestCaseConsoleProps) {
  return (
    <div className="flex flex-col h-full bg-background border-t">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40 h-10 box-border">
        <Tabs defaultValue="testcase" className="w-full flex flex-col h-full">
          <div className="flex items-center justify-between shrink-0">
            <TabsList className="h-7 bg-transparent p-0 gap-2">
              <TabsTrigger
                value="testcase"
                className="text-xs h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border rounded-sm px-3"
              >
                Testcase
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="text-xs h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border rounded-sm px-3"
              >
                Test Result
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden mt-2 relative">
            {/* Use absolute positioning to ensure scroll works within this container */}
            <div className="absolute inset-0 overflow-y-auto">
              <TabsContent value="testcase" className="m-0 min-h-full">
                <div className="space-y-4 p-4">
                  {testCases.map((tc, i) => (
                    <div key={tc.input} className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Case {i + 1}
                      </span>
                      <div className="p-2 bg-muted rounded-md font-mono text-xs">
                        <div className="mb-1">
                          <span className="text-muted-foreground">Input:</span>{" "}
                          {tc.input}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Expected:
                          </span>{" "}
                          {tc.expected}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="result" className="m-0 min-h-full p-4">
                {result ? (
                  <div className="font-mono text-sm whitespace-pre-wrap">
                    {result}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm flex items-center justify-center h-20">
                    Run your code to see results
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
