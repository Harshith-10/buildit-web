"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Runtime } from "@/actions/code-execution";
import { createProblem } from "@/actions/problem-data";
import CreateProblemHeader from "./create-problem-header";
import CreateProblemPanes from "./create-problem-panels";

interface CreateProblemClientProps {
  languages: Runtime[];
}

export type McqOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type ProblemState = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  type: "coding" | "mcq" | "true_false" | "descriptive";
  // Coding-specific
  driverCode: Record<string, string>;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  // MCQ-specific
  mcqOptions: McqOption[];
  isMultiSelect: boolean;
  // True/False specific
  correctAnswer: boolean | null;
  // Descriptive-specific
  sampleAnswer: string;
  // Common
  tags: string[];
  isPublic: boolean;
};

export default function CreateProblemClient({
  languages,
}: CreateProblemClientProps) {
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemState>({
    title: "",
    description: "",
    difficulty: "medium",
    type: "coding",
    driverCode: {},
    testCases: [],
    mcqOptions: [],
    isMultiSelect: false,
    correctAnswer: null,
    sampleAnswer: "",
    tags: [],
    isPublic: false,
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!problem.title || !problem.description) {
      toast.error("Please fill in the title and description.");
      return;
    }

    setLoading(true);
    try {
      const newProblem = await createProblem({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        type: problem.type,
        isPublic: problem.isPublic,
        driverCode: problem.driverCode,
        testCases: problem.testCases.map(
          ({ input, expectedOutput, isHidden }) => ({
            input,
            expectedOutput,
            isHidden,
          }),
        ),
        content: {
          examples: [],
          constraints: [],
        },
      });

      toast.success("Problem created successfully!");
      router.push(`/problem/${newProblem.slug}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <CreateProblemHeader
        title={problem.title}
        setTitle={(t) => setProblem((p) => ({ ...p, title: t }))}
        onCreate={handleCreate}
        loading={loading}
      />
      <div className="flex-1 overflow-hidden">
        <CreateProblemPanes
          problem={problem}
          setProblem={setProblem}
          languages={languages}
        />
      </div>
    </div>
  );
}
