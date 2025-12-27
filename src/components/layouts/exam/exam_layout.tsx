"use client";

import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface ExamLayoutProps {
  sidebarContent: ReactNode;
  headerContent: ReactNode;
  problemPaneContent: ReactNode;
  editorContent: ReactNode;
  consoleContent: ReactNode;
}

export default function ExamLayout({
  sidebarContent,
  headerContent,
  problemPaneContent,
  editorContent,
  consoleContent,
}: ExamLayoutProps) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <SidebarProvider defaultOpen={true}>
        {sidebarContent}
        <SidebarInset className="h-screen overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-none">{headerContent}</div>

          <div className="flex-1 min-h-0 relative">
            <ResizablePanelGroup orientation="horizontal">
              {/* Problem Description */}
              <ResizablePanel
                defaultSize={40}
                minSize={20}
                className="max-h-full"
              >
                {problemPaneContent}
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Coding Area */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <ResizablePanelGroup orientation="vertical">
                  {/* Editor */}
                  <ResizablePanel defaultSize={70} minSize={20}>
                    {editorContent}
                  </ResizablePanel>

                  <ResizableHandle
                    withHandle
                    orientation="horizontal"
                    className="w-full h-px"
                  />

                  {/* Console/TestCases */}
                  <ResizablePanel defaultSize={30} minSize={10}>
                    {consoleContent}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
