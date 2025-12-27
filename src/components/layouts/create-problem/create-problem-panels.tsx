"use client";

import type { Runtime } from "@/actions/code-execution";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { ProblemState } from "./create-problem-client";
import CodePanel from "./panels/code-panel";
import DescriptionPanel from "./panels/description-panel";
import DescriptivePanel from "./panels/descriptive-panel";
import McqOptionsPanel from "./panels/mcq-options-panel";
import MetadataPanel from "./panels/metadata-panel";
import TestCasesPanel from "./panels/testcases-panel";
import TrueFalsePanel from "./panels/true-false-panel";

interface CreateProblemPanesProps {
  problem: ProblemState;
  setProblem: React.Dispatch<React.SetStateAction<ProblemState>>;
  languages: Runtime[];
}

export default function CreateProblemPanes({
  problem,
  setProblem,
  languages,
}: CreateProblemPanesProps) {
  // Render right panels based on problem type
  const renderRightPanels = () => {
    switch (problem.type) {
      case "coding":
        return (
          <>
            <ResizablePanel defaultSize={60} minSize={30}>
              <CodePanel
                driverCode={problem.driverCode}
                setDriverCode={(code, lang) =>
                  setProblem((p) => ({
                    ...p,
                    driverCode: { ...p.driverCode, [lang]: code },
                  }))
                }
                languages={languages}
              />
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="w-full h-px"
              orientation="horizontal"
            />
            <ResizablePanel defaultSize={40} minSize={30}>
              <TestCasesPanel
                testCases={problem.testCases}
                setTestCases={(tc) =>
                  setProblem((p) => ({ ...p, testCases: tc }))
                }
              />
            </ResizablePanel>
          </>
        );

      case "mcq":
        return (
          <ResizablePanel defaultSize={100} minSize={50}>
            <McqOptionsPanel
              options={problem.mcqOptions}
              setOptions={(opts) =>
                setProblem((p) => ({ ...p, mcqOptions: opts }))
              }
              isMulti={problem.isMultiSelect}
              setIsMulti={(m) =>
                setProblem((p) => ({ ...p, isMultiSelect: m }))
              }
            />
          </ResizablePanel>
        );

      case "true_false":
        return (
          <ResizablePanel defaultSize={100} minSize={20}>
            <TrueFalsePanel
              correctAnswer={problem.correctAnswer}
              setCorrectAnswer={(ans) =>
                setProblem((p) => ({ ...p, correctAnswer: ans }))
              }
            />
          </ResizablePanel>
        );

      case "descriptive":
        return (
          <ResizablePanel defaultSize={100} minSize={20}>
            <DescriptivePanel
              sampleAnswer={problem.sampleAnswer}
              setSampleAnswer={(ans) =>
                setProblem((p) => ({ ...p, sampleAnswer: ans }))
              }
            />
          </ResizablePanel>
        );

      default:
        return null;
    }
  };

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      {/* Left Pane: Description & Metadata (stacked vertically) */}
      <ResizablePanel defaultSize={40} minSize={25} className="max-h-full">
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize={60} minSize={50}>
            <DescriptionPanel
              description={problem.description}
              setDescription={(d) =>
                setProblem((p) => ({ ...p, description: d }))
              }
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="w-full h-px"
            orientation="horizontal"
          />

          <ResizablePanel defaultSize={40} minSize={35}>
            <MetadataPanel
              difficulty={problem.difficulty}
              setDifficulty={(d) =>
                setProblem((p) => ({ ...p, difficulty: d }))
              }
              type={problem.type}
              setType={(t) => setProblem((p) => ({ ...p, type: t }))}
              isPublic={problem.isPublic}
              setIsPublic={(p) => setProblem((pr) => ({ ...pr, isPublic: p }))}
              tags={problem.tags}
              setTags={(t) => setProblem((p) => ({ ...p, tags: t }))}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Pane: Changes based on problem type */}
      <ResizablePanel defaultSize={60} minSize={30}>
        <ResizablePanelGroup orientation="vertical" className="h-full">
          {renderRightPanels()}
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
