import db from "@/db";
import { examAssignments, assignmentSubmissions } from "@/db/schema";

async function checkSubmissions() {
  console.log("Checking exam data...\n");

  // Check exam assignments
  const assignments = await db.query.examAssignments.findMany({
    columns: {
      id: true,
      userId: true,
      examId: true,
      status: true,
      score: true,
      startedAt: true,
      completedAt: true,
    },
    limit: 10,
  });

  console.log(`Found ${assignments.length} exam assignments:`);
  assignments.forEach((a) => {
    console.log(
      `  - ${a.id.substring(0, 8)}... | User: ${a.userId} | Status: ${a.status} | Score: ${a.score}`,
    );
  });

  // Check submissions
  const submissions = await db.query.assignmentSubmissions.findMany({
    columns: {
      id: true,
      assignmentId: true,
      questionId: true,
      verdict: true,
      testCasesPassed: true,
      totalTestCases: true,
      createdAt: true,
    },
    limit: 10,
  });

  console.log(`\nFound ${submissions.length} assignment submissions:`);
  submissions.forEach((s) => {
    console.log(
      `  - ${s.id.substring(0, 8)}... | Assignment: ${s.assignmentId.substring(0, 8)}... | Verdict: ${s.verdict} | Passed: ${s.testCasesPassed}/${s.totalTestCases}`,
    );
  });

  if (assignments.length > 0 && submissions.length === 0) {
    console.log("\n⚠️  WARNING: Students have assignments but NO submissions!");
    console.log(
      "This means the submission code might not be executing properly.",
    );
  }

  process.exit(0);
}

checkSubmissions().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
