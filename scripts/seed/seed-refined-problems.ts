import { eq, like } from "drizzle-orm";
import db from "@/db";
import {
    collections,
    problems as problemsSchema,
    testCases,
    user,
} from "@/db/schema";

// Import the refined problem data
import refinedProblems from "./refined_problem_data.json";

// Type for refined_problem_data.json structure
interface RefinedProblem {
    title: string;
    description: string;  // Already markdown formatted
    driver_code: string;
    testcases: {
        input: string;
        expected_output: string;
        is_hidden: boolean;
    }[];
    slug: string;
}

// All problems are easy difficulty
function getDifficulty(): "easy" | "medium" | "hard" {
    return "easy";
}

const SAMPLE_CONTENT = {
    type: "doc",
    content: [
        {
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: "See description for details.",
                },
            ],
        },
    ],
};

const SAMPLE_METADATA = {
    timeLimit: 1000,
    memoryLimit: 256,
};

async function seedRefinedProblems() {
    console.log("🌱 Starting refined problem seed...");
    console.log(`📊 Found ${refinedProblems.length} problems in refined_problem_data.json`);

    try {
        // 1. Fetch a creator user (Admin or Instructor)
        const creators = await db.query.user.findMany({
            where: (u, { inArray }) => inArray(u.role, ["admin", "instructor"]),
        });

        if (creators.length === 0) {
            console.error(
                "❌ No admin or instructor found. Please run 'npm run db:seed:users' first.",
            );
            process.exit(1);
        }
        const creator = creators[0];
        console.log(`👤 Using creator: ${creator.username} (${creator.id})`);

        // 2. Delete existing Java Practice Problems
        console.log("🗑️  Deleting existing Java Practice Problems...");
        const existingProblems = await db.query.problems.findMany({
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

        for (const problem of existingProblems) {
            await db.delete(problemsSchema).where(eq(problemsSchema.id, problem.id));
        }
        console.log(`✅ Deleted ${existingProblems.length} existing problems`);

        // 3. Create or find a collection for these problems
        const collectionName = "Java Practice Problems";
        let collection = await db.query.collections.findFirst({
            where: (col, { eq }) => eq(col.name, collectionName),
        });

        if (!collection) {
            console.log(`📚 Creating collection: ${collectionName}`);
            const [newCollection] = await db
                .insert(collections)
                .values({
                    name: collectionName,
                    description: "Java programming practice problems - Refined Edition",
                    public: true,
                    createdBy: creator.id,
                })
                .returning();
            collection = newCollection;
        }
        console.log(`✅ Using collection: ${collection.name} (${collection.id})`);

        // 4. Track statistics
        let created = 0;
        let skipped = 0;
        let failed = 0;

        // 5. Process each problem
        for (const problem of refinedProblems as RefinedProblem[]) {
            const difficulty = getDifficulty();

            try {
                // Check if problem with this slug already exists
                const existing = await db.query.problems.findFirst({
                    where: (prob, { eq }) => eq(prob.slug, problem.slug),
                });

                if (existing) {
                    console.log(`⏭️  Skipping (exists): ${problem.title}`);
                    skipped++;
                    continue;
                }

                // Use driver code from JSON
                const driverCode = problem.driver_code
                    ? { java: problem.driver_code }
                    : undefined;

                // Insert problem
                const [insertedProblem] = await db
                    .insert(problemsSchema)
                    .values({
                        collectionId: collection.id,
                        type: "coding",
                        difficulty,
                        title: problem.title,
                        slug: problem.slug,
                        description: problem.description,
                        content: SAMPLE_CONTENT,
                        driverCode,
                        gradingMetadata: SAMPLE_METADATA,
                        public: true,
                        createdBy: creator.id,
                    })
                    .returning();

                // Insert test cases
                if (problem.testcases && problem.testcases.length > 0) {
                    const testCaseData = problem.testcases.map((tc) => ({
                        problemId: insertedProblem.id,
                        input: tc.input,
                        expectedOutput: tc.expected_output,
                        isHidden: tc.is_hidden,
                    }));

                    await db.insert(testCases).values(testCaseData);
                }

                console.log(
                    `✅ Created: ${problem.title} (${difficulty}) with ${problem.testcases?.length || 0} test cases`,
                );
                created++;
            } catch (error) {
                console.error(`❌ Failed to create: ${problem.title}`, error);
                failed++;
            }
        }

        // 6. Print summary
        console.log("\n📊 Seed Summary:");
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total: ${refinedProblems.length}`);

        console.log("\n🎉 Refined problem seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding problems:", error);
        process.exit(1);
    }
}

seedRefinedProblems();
