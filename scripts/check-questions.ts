import db from "@/db";
import { questions } from "@/db/schema";

async function checkQuestions() {
  const result = await db
    .select({ id: questions.id, title: questions.title })
    .from(questions);
  
  console.log(`Total questions: ${result.length}`);
  result.forEach((q, i) => {
    console.log(`${i + 1}. ${q.title}`);
  });
  
  process.exit(0);
}

checkQuestions().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
