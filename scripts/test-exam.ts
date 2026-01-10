import db from "@/db";
import { exams } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testExam() {
  const examId = "149ba209-c31b-4f46-bc2b-c2f81f28b3e2";
  
  const result = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
  });
  
  console.log("Exam found:", result ? "Yes" : "No");
  if (result) {
    console.log("Title:", result.title);
    console.log("Start time:", result.startTime);
    console.log("End time:", result.endTime);
  }
  
  process.exit(0);
}

testExam().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
