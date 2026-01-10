import db from "@/db";
import { problems } from "@/db/schema";

async function checkProblems() {
  const result = await db
    .select({ id: problems.id, title: problems.title })
    .from(problems);
  
  console.log(`Total problems: ${result.length}`);
  console.log("\nFirst 10 problems:");
  result.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
  });
  
  process.exit(0);
}

checkProblems().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
