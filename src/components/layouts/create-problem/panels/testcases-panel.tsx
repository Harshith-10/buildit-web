"use client";

import { EyeOff, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface TestCasesPanelProps {
  testCases: TestCase[];
  setTestCases: (cases: TestCase[]) => void;
}

export default function TestCasesPanel({
  testCases,
  setTestCases,
}: TestCasesPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const addTestCase = () => {
    const newId = Math.random().toString(36).substring(7);
    const newTestCase: TestCase = {
      id: newId,
      input: "",
      expectedOutput: "",
      isHidden: true, // Default to hidden as per description "choose whether they're hidden or not (use a switch)"
    };
    const newCases = [...testCases, newTestCase];
    setTestCases(newCases);
    setActiveId(newId);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
    );
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const activeTestCase =
    testCases.find((tc) => tc.id === activeId) || testCases[0];

  return (
    <div className="flex bg-background h-full w-full">
      {/* Sidebar List */}
      <div className="w-48 border-r flex flex-col bg-muted/10 h-full">
        <div className="p-2 border-b flex items-center justify-between bg-muted/20">
          <span className="text-sm font-medium">Test Cases</span>
          <Button variant="ghost" size="icon-sm" onClick={addTestCase}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {testCases.map((tc, idx) => (
            <div
              key={tc.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md text-sm cursor-pointer hover:bg-muted/50 transition-colors group",
                activeId === tc.id || (activeId === null && idx === 0)
                  ? "bg-primary/10 text-primary font-medium"
                  : "",
              )}
              onClick={() => setActiveId(tc.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">Case {idx + 1}</span>
                {tc.isHidden && (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTestCase(tc.id);
                }}
              >
                <Trash className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {testCases.length === 0 && (
            <div className="text-xs text-center text-muted-foreground py-4">
              No test cases. <br /> Click + to add.
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {activeTestCase ? (
          <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Test Case Details</h3>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="hidden-switch"
                  className="text-xs cursor-pointer"
                >
                  Hidden Case
                </Label>
                <Switch
                  id="hidden-switch"
                  checked={activeTestCase.isHidden}
                  onCheckedChange={(checked) =>
                    updateTestCase(activeTestCase.id, { isHidden: checked })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              <div className="flex flex-col gap-2 h-full">
                <Label>Input</Label>
                <Textarea
                  className="flex-1 font-mono text-sm resize-none bg-muted/20"
                  placeholder="Enter input..."
                  value={activeTestCase.input}
                  onChange={(e) =>
                    updateTestCase(activeTestCase.id, { input: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2 h-full">
                <Label>Expected Output</Label>
                <Textarea
                  className="flex-1 font-mono text-sm resize-none bg-muted/20"
                  placeholder="Enter expected output..."
                  value={activeTestCase.expectedOutput}
                  onChange={(e) =>
                    updateTestCase(activeTestCase.id, {
                      expectedOutput: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select or create a test case to edit
          </div>
        )}
      </div>
    </div>
  );
}
