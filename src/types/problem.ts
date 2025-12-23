export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  content: {
    examples: {
      input: string;
      output: string;
      explanation?: string;
    }[];
    constraints?: string[];
  };
  testCases: TestCase[];
  collection?: {
    id: string;
    name: string;
  };
}

export interface Submission {
  id: string;
  problemId: string;
  status:
    | "accepted"
    | "wrong_answer"
    | "pending"
    | "time_limit_exceeded"
    | "runtime_error"
    | "compile_error";
  score: number;
  runtimeMs?: number;
  memoryKb?: number;
  createdAt: Date;
  answerData: any;
}
