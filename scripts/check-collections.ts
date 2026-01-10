import db from "@/db";
import { questions, collectionQuestions, questionCollections } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkCollections() {
  // Check all questions
  const allQuestions = await db
    .select({ id: questions.id, title: questions.title })
    .from(questions);
  
  console.log(`\n📊 Total questions in database: ${allQuestions.length}`);
  allQuestions.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.title} (ID: ${q.id})`);
  });
  
  // Check collections
  const collections = await db
    .select()
    .from(questionCollections);
  
  console.log(`\n📚 Total collections: ${collections.length}`);
  collections.forEach((c) => {
    console.log(`  - ${c.title} (ID: ${c.id})`);
  });
  
  // Check collection-question links
  const links = await db
    .select({
      collectionId: collectionQuestions.collectionId,
      questionId: collectionQuestions.questionId,
      collectionTitle: questionCollections.title,
      questionTitle: questions.title,
    })
    .from(collectionQuestions)
    .leftJoin(questionCollections, eq(collectionQuestions.collectionId, questionCollections.id))
    .leftJoin(questions, eq(collectionQuestions.questionId, questions.id));
  
  console.log(`\n🔗 Collection-Question links: ${links.length}`);
  links.forEach((link) => {
    console.log(`  - Collection: "${link.collectionTitle}" → Question: "${link.questionTitle}"`);
  });
  
  process.exit(0);
}

checkCollections().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
