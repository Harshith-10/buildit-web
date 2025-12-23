"use server";

const PISTON_API_URL = process.env.PISTON_API_URL || "http://localhost:2000";

export type FileContent = {
  name?: string;
  content: string;
  encoding?: "base64" | "hex" | "utf8";
};

export type ExecuteCodePayload = {
  language: string;
  version: string;
  files: FileContent[];
  stdin?: string;
  args?: string[];
  run_timeout?: number;
  compile_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
};

export type ExecuteCodeResponse = {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number | null;
    signal: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number | null;
    signal: string | null;
  };
  message?: string;
};

export type Testcase = {
  id: string;
  input: string;
  expectedOutput: string | string[];
};

export type ExecuteTestcasesPayload = {
  language: string;
  version: string;
  files: FileContent[];
  testcases: Testcase[];
  args?: string[];
  run_timeout?: number;
  compile_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
};

export type TestcaseResult = {
  id: string;
  input: string;
  expectedOutput: string | string[];
  actualOutput: string;
  passed: boolean;
  run_details: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    memory: number;
    cpu_time: number;
    wall_time: number;
  };
};

export type ExecuteTestcasesResponse = {
  language: string;
  version: string;
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number | null;
    signal: string | null;
  };
  testcases: TestcaseResult[];
  message?: string;
};

export async function executeCode(
  payload: ExecuteCodePayload,
): Promise<ExecuteCodeResponse> {
  try {
    const response = await fetch(`${PISTON_API_URL}/api/v2/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Piston returns errors as { message: string }
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Execute code error:", error);
    return {
      language: payload.language,
      version: payload.version,
      run: {
        stdout: "",
        stderr: error.message || "Unknown error occurred",
        output: error.message || "Unknown error occurred",
        code: -1,
        signal: null,
      },
      message: error.message,
    };
  }
}

export async function executeTestcases(
  payload: ExecuteTestcasesPayload,
): Promise<ExecuteTestcasesResponse> {
  try {
    const response = await fetch(`${PISTON_API_URL}/api/v3/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Execute testcases error:", error);
    // Return a structure that indicates failure, but matching the response type is hard without a valid response.
    // We'll return an empty testcases array and the error message.
    return {
      language: payload.language,
      version: payload.version,
      testcases: [],
      message: error.message || "Unknown error occurred",
    };
  }
}
