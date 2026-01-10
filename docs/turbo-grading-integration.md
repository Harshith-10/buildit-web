# Turbo Engine & Grading System Integration

This document explains the integration of the Turbo code execution engine and the grading system into the BuildIT platform.

## Overview

The system now uses **Turbo** as the exclusive code execution engine, replacing the previous Piston implementation. Additionally, a comprehensive **grading system** has been integrated to support multiple scoring strategies for exams and assignments.

## Architecture

### 1. Turbo Engine (`src/lib/turbo.ts`)

The Turbo engine adapter provides a standardized interface for code execution with the following features:

- **Test Case Execution**: Run code against multiple test cases with automatic pass/fail detection
- **Compilation Support**: Separate compilation and execution phases
- **Resource Limits**: Configurable time and memory limits
- **Multi-language Support**: Java, Python, JavaScript, TypeScript, C++, C, Rust, Go

#### Environment Configuration

Set the Turbo API base URL in your `.env` file:

```env
TURBO_API_BASE_URL=http://localhost:4000/api/v1
```

If not set, defaults to `http://localhost:4000/api/v1`.

#### Key Functions

- `executeCode()` - Execute code with optional test cases
- `getRuntimes()` - Get available language runtimes
- `getPackages()` - Get installed language packages
- `mapTestCases()` - Convert internal test case format to Turbo format
- `getStatusMessage()` - Get human-readable status messages

#### Example Usage

```typescript
import { executeCode, mapTestCases } from "@/lib/turbo";

const result = await executeCode(
  userCode,
  "python",
  testCases,
  undefined, // stdin
  "3.10"     // version
);

// Check compilation
if (result.compile?.status === "COMPILATION_ERROR") {
  console.error("Compilation failed:", result.compile.stderr);
}

// Check test cases
const passed = result.testcases.filter(tc => tc.passed).length;
console.log(`${passed}/${result.testcases.length} test cases passed`);
```

### 2. Grading System (`src/lib/grading.ts`)

The grading system supports multiple scoring strategies with optional partial credit based on test case pass rates.

#### Grading Strategies

##### 1. **Linear Strategy** (`linear`)

Awards the same points for each question, regardless of difficulty.

**Config:**
```typescript
{
  marks: 10 // Points per question
}
```

**Scoring:**
- Without partial: `score = passedQuestions * marks`
- With partial: `score = Σ(percentage * marks)` for each question

##### 2. **Difficulty-Based Strategy** (`difficulty_based`)

Awards different points based on question difficulty.

**Config:**
```typescript
{
  easy: 20,
  medium: 40,
  hard: 50
}
```

**Scoring:**
- Without partial: `score = Σ(marks[difficulty])` for passed questions
- With partial: `score = Σ(percentage * marks[difficulty])` for each question

##### 3. **Count-Based Strategy** (`count_based`)

Threshold-based scoring where reaching certain question counts awards specific marks.

**Config:**
```typescript
{
  rules: [
    { count: 5, marks: 100 },
    { count: 3, marks: 70 },
    { count: 1, marks: 40 }
  ]
}
```

**Scoring:**
- Finds the highest threshold met
- Does not support partial scoring (binary pass/fail only)

##### 4. **Standard Strategy** (`standard_20_40_50`)

Predefined difficulty-based scoring with easy=20, medium=40, hard=50.

**Config:** None required (uses defaults)

**Scoring:** Same as difficulty-based with preset values

#### Partial Grading

Partial grading is automatically enabled when `questionScores` is provided. Each question's score is calculated based on the percentage of test cases passed.

**Example:**
```typescript
import { calculateGradingScore } from "@/lib/grading";

const score = calculateGradingScore({
  strategy: "difficulty_based",
  config: { easy: 20, medium: 40, hard: 50 },
  passedQuestionIds: ["q1"], // Fully passed questions
  questionDifficulties: {
    "q1": "easy",
    "q2": "medium",
    "q3": "hard"
  },
  questionScores: {
    "q1": 1.0,   // 100% passed
    "q2": 0.5,   // 50% passed
    "q3": 0.75   // 75% passed
  }
});
// Result: (1.0 * 20) + (0.5 * 40) + (0.75 * 50) = 77.5
```

### 3. Code Execution Actions (`src/actions/code-execution.ts`)

Unified API for code execution that adapts Turbo's interface to work with existing frontend components.

#### Functions

- `executeCode()` - Execute code with stdin input
- `executeTestcases()` - Execute code against multiple test cases
- `getLanguages()` - Get available programming languages

These functions handle conversion between the internal format and Turbo's API format.

### 4. Exam Submission Actions (`src/lib/exam/submit-actions.ts`)

Handles exam question submissions with integrated grading.

#### Flow

1. **Validation** - Check user authorization and assignment status
2. **Test Case Retrieval** - Fetch hidden test cases (or all if none hidden)
3. **Code Execution** - Run code against test cases using Turbo
4. **Verdict Determination** - Classify as passed/failed/compile_error/runtime_error
5. **Score Calculation** - Calculate score using configured grading strategy
6. **Database Update** - Store submission and update assignment score

#### Features

- **Monotonic Scoring**: Scores only increase (never decrease)
- **Partial Credit**: Automatically calculated based on test case pass rate
- **Best Attempt**: Tracks best score across all submissions
- **Detailed Results**: Returns verdict, test cases passed, and execution details

## Database Schema

### Exam Configuration

Exams have grading configuration stored in the `exams` table:

```typescript
{
  gradingStrategy: "difficulty_based" | "linear" | "count_based" | "standard_20_40_50",
  gradingConfig: {
    // Strategy-specific configuration
    easy?: number,
    medium?: number,
    hard?: number,
    marks?: number,
    rules?: Array<{count: number, marks: number}>,
    enablePartialPoints?: boolean
  }
}
```

### Assignment Submissions

```typescript
{
  assignmentId: string,
  questionId: string,
  language: string,
  code: string,
  verdict: "passed" | "failed" | "compile_error" | "runtime_error",
  testCasesPassed: number,
  totalTestCases: number
}
```

## Configuration

### Environment Variables

```env
# Turbo Engine API URL
TURBO_API_BASE_URL=http://localhost:4000/api/v1

# Database connection (already configured)
DATABASE_URL=postgresql://...
```

### Default Timeouts & Limits

Configured in `src/lib/turbo.ts`:

```typescript
const DEFAULT_TIMEOUTS = {
  run: 5000,      // 5 seconds
  compile: 10000  // 10 seconds
}

const DEFAULT_MEMORY_LIMITS = {
  run: 256 * 1024 * 1024,     // 256 MB
  compile: 512 * 1024 * 1024  // 512 MB
}
```

## Error Handling

### TurboError

Custom error class for Turbo engine failures:

```typescript
try {
  const result = await executeCode(...);
} catch (error) {
  if (error instanceof TurboError) {
    console.error(`Turbo Error ${error.statusCode}:`, error.message);
    console.error('Response:', error.responseBody);
  }
}
```

### Graceful Degradation

- Compilation errors return detailed stderr output
- Runtime errors include error type and message
- Network errors are caught and returned as execution failures
- Missing test cases result in appropriate error messages

## Testing

### Test Case Format

Internal format:
```typescript
{
  id: string,
  input: string,
  expectedOutput: string,
  isHidden: boolean
}
```

Turbo format (auto-converted):
```typescript
{
  id: string,
  input: string,
  expected_output: string
}
```

### Example Test

```typescript
const testCases = [
  {
    id: "test1",
    input: "2 3",
    expectedOutput: "5",
    isHidden: false
  }
];

const result = await executeTestcases({
  language: "python",
  version: "3.10",
  files: [{ content: "a, b = map(int, input().split())\nprint(a + b)" }],
  testcases: testCases
});

console.log(result.testcases[0].passed); // true or false
```

## Migration from Piston

The Turbo integration **completely replaces** Piston. Key differences:

| Feature | Piston | Turbo |
|---------|--------|-------|
| API Format | Custom | Standardized |
| Test Cases | Separate endpoint | Integrated |
| Compilation | Combined | Separate stage |
| Resource Tracking | Basic | Detailed |
| Error Messages | Generic | Specific |

### Breaking Changes

None for frontend components - the adapter layer maintains compatibility.

### Benefits

- ✅ Better error messages and debugging
- ✅ Detailed resource usage metrics
- ✅ Separate compilation and execution phases
- ✅ Native test case support
- ✅ More reliable execution
- ✅ Better language support

## Usage Examples

### Basic Code Execution

```typescript
import { executeCode } from "@/actions/code-execution";

const result = await executeCode({
  language: "python",
  version: "3.10",
  files: [{ content: "print('Hello, World!')" }],
  stdin: ""
});

console.log(result.run.stdout); // "Hello, World!\n"
```

### Test Case Execution

```typescript
import { executeTestcases } from "@/actions/code-execution";

const result = await executeTestcases({
  language: "java",
  version: "17",
  files: [{ content: javaCode }],
  testcases: [
    { id: "1", input: "5", expectedOutput: "120" }
  ]
});

console.log(result.testcases[0].passed); // true/false
```

### Exam Submission with Grading

```typescript
import { submitQuestion } from "@/lib/exam/submit-actions";

const result = await submitQuestion({
  assignmentId: "assign-123",
  questionId: "q-456",
  code: userCode,
  language: "python",
  version: "3.10"
});

if (result.success) {
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Score: ${result.score}`);
  console.log(`Passed: ${result.testCasesPassed}/${result.totalTestCases}`);
}
```

## Troubleshooting

### "Turbo API Error: 500"

- Check that Turbo engine is running
- Verify `TURBO_API_BASE_URL` is correct
- Check Turbo engine logs for details

### "No test cases found for grading"

- Ensure questions have test cases in `question_test_cases` table
- Check that test cases are properly linked to questions

### Compilation Errors Not Showing

- Check `result.compile.stderr` for compilation output
- Verify language version is installed in Turbo

### Partial Grading Not Working

- Ensure `questionScores` is passed to `calculateGradingScore()`
- Verify test cases are being tracked in submissions
- Check that `enablePartialPoints` is not explicitly set to `false`

## Future Enhancements

Potential improvements for the system:

- [ ] Caching of compilation results for identical code
- [ ] Real-time execution progress streaming
- [ ] Custom judge support for complex problems
- [ ] Performance benchmarking across submissions
- [ ] Code similarity detection for plagiarism
- [ ] Language-specific linting integration
- [ ] Memory profiling and optimization hints

## Support

For issues related to:
- **Turbo Engine**: Check Turbo documentation and logs
- **Grading Logic**: Review `src/lib/grading.ts`
- **Exam Flow**: Check `src/lib/exam/submit-actions.ts`
- **Frontend Integration**: Review `src/actions/code-execution.ts`
