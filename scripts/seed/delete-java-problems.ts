import { eq, like, or } from "drizzle-orm";
import db from "@/db";
import {
    problems as problemsSchema,
} from "@/db/schema";

// Script to delete ALL problems from the Java Practice Problems collection
// This deletes by matching titles that start with number patterns like "1.1", "1.2", etc.
async function deleteJavaProblems() {
    console.log("🗑️  Deleting Java Practice Problems for re-seeding...");

    try {
        // Find all problems that match titles starting with number patterns
        const problemsToDelete = await db.query.problems.findMany({
            where: (prob, { or, like }) => or(
                like(prob.title, "1.%"),
                like(prob.title, "2.%"),
                like(prob.title, "3.%"),
                like(prob.title, "4.%"),
                like(prob.title, "5.%"),
                like(prob.title, "6.%"),
                like(prob.title, "7.%"),
                like(prob.title, "8.%"),
                like(prob.title, "9.%"),
                like(prob.title, "10.%"),
                like(prob.title, "11.%"),
                like(prob.title, "12.%"),
                like(prob.title, "13.%"),
            ),
        });

        console.log(`📊 Found ${problemsToDelete.length} problems to delete`);

        // Delete problems by IDs using eq (not like)
        for (const problem of problemsToDelete) {
            await db.delete(problemsSchema).where(eq(problemsSchema.id, problem.id));
            console.log(`🗑️  Deleted: ${problem.title}`);
        }

        console.log("\n✅ Deletion completed!");
        console.log("Now run 'pnpm run db:seed:problems' to re-seed with formatted descriptions");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting problems:", error);
        process.exit(1);
    }
}

deleteJavaProblems();
