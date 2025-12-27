"use client";

import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background">
      {/* Sidebar - Fixed Width usually, or resizable? 
          Let's make it fixed width for now as per previous design, 
          or user might want full resizable. 
          Given "clean code", a fixed sidebar + resizable workspace is standard.
      */}
      <aside className="w-64 flex-none border-r">{sidebarContent}</aside>

      <main className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex-none">{headerContent}</div>

        <div className="flex-1 min-h-0 relative">
          <ResizablePanelGroup orientation="horizontal">
            {/* Problem Description */}
            <ResizablePanel defaultSize={40} minSize={20}>
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

                <ResizableHandle withHandle orientation="horizontal" />

                {/* Console/TestCases */}
                <ResizablePanel defaultSize={30} minSize={10}>
                  {consoleContent}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
}
