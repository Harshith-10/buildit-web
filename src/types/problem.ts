export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  slug: string;
  description: string;
  content: any;
  driverCode: Record<string, string> | null;
  gradingMetadata: any;
  public: boolean;
  createdBy: string;
  createdAt: Date;
  testCases: TestCase[];
  problemStatement?: string; // Alias for description
}

export interface TestcaseResult {
  id: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  run_details: {
    stdout: string;
    stderr: string;
  };
}
