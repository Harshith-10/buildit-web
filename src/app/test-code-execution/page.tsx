"use client";

import { useState } from "react";
import { useCodeExecution } from "@/hooks/use-code-execution";

export default function TestCodeExecutionPage() {
  const { runCode, runTestcases, isRunning, error, result } =
    useCodeExecution();
  const [code, setCode] = useState('print("Hello World")');
  const [language, setLanguage] = useState("python");
  const [version, setVersion] = useState("3.10.0");

  const handleRunCode = async () => {
    await runCode({
      language,
      version,
      files: [{ content: code }],
    });
  };

  const handleRunTestcases = async () => {
    await runTestcases({
      language,
      version,
      files: [
        { content: code },
      ],
      testcases: [
        { id: "1", input: "User", expectedOutput: "Hello User!" },
        { id: "2", input: "World", expectedOutput: "Hello World!" },
      ],
    });
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Code Execution Test</h1>

      <div className="grid gap-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Language</label>
          <input
            className="border p-2 w-full"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Version</label>
          <input
            className="border p-2 w-full"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Code</label>
          <textarea
            className="border p-2 w-full font-mono"
            rows={5}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleRunTestcases}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Testcases (Fixed Payload)"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 p-4 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="bg-card p-4 rounded overflow-auto">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
