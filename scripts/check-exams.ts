import db from "@/db";
import { exams } from "@/db/schema";

async function checkExams() {
  const result = await db
    .select({ id: exams.id, title: exams.title })
    .from(exams);
  
  console.log(`Total exams: ${result.length}\n`);
  result.forEach((e, i) => {
    console.log(`${i + 1}. ${e.title}`);
    console.log(`   ID: ${e.id}`);
    console.log(`   URL: http://localhost:3000/${e.id}`);
    console.log(`   Onboarding: http://localhost:3000/${e.id}/onboarding\n`);
  });
  
  process.exit(0);
}

checkExams().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
