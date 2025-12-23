import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Problem } from "@/types/problem";
import ProblemDescription from "./problem-description";
import ProblemEditor, { ProblemEditorHeader } from "./problem-editor";
import TestCasesPane from "./problem-testcases";

export default function ProblemPanes({ problem }: { problem: Problem }) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      <ResizablePanel className="max-h-full" defaultSize={40} minSize={20}>
        <ProblemDescription problem={problem} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={20}>
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize={60} minSize={20}>
            <div className="flex flex-col h-full items-center justify-center">
              <ProblemEditorHeader />
              <ProblemEditor />
            </div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="w-full h-px"
            orientation="horizontal"
          />
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex h-full items-center justify-center">
              <TestCasesPane problem={problem} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
