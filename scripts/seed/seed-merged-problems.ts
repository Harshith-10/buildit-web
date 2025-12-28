import { eq, inArray, like } from "drizzle-orm";
import db from "@/db";
import {
    collections,
    problems as problemsSchema,
    testCases,
    user,
} from "@/db/schema";

// Import both data sources
import databaseJson from "./database.json";
import combinedJson from "./combined_problem_data.json";

// Type for database.json structure (better descriptions)
interface DatabaseProblem {
    problem_id: string;
    title: string;
    description: string;  // Already markdown formatted
    boilerplate_code: string;
    test_cases: {
        input: string;
        output: string;
        is_hidden: boolean;
    }[];
}

// Type for combined_problem_data.json structure (better test cases)
interface CombinedProblem {
    title: string;
    description: string;
    starter_code: string;
    testcases: {
        input: string;
        expected_output: string;
        is_visible: boolean;
    }[];
}

// Helper function to generate a slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
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

// Match problems by title prefix (e.g., "1.1", "2.3")
function extractProblemId(title: string): string {
    const match = title.match(/^(\d+\.\d+)/);
    return match ? match[1] : title;
}

async function seedMergedProblems() {
    console.log("🌱 Starting merged problem seed...");
    console.log(`📊 database.json: ${databaseJson.length} problems`);
    console.log(`📊 combined_problem_data.json: ${combinedJson.length} problems`);

    // Create a map from problem ID to combined problem (for test cases)
    const testCaseMap = new Map<string, CombinedProblem>();
    for (const problem of combinedJson as CombinedProblem[]) {
        const problemId = extractProblemId(problem.title);
        testCaseMap.set(problemId, problem);
    }

    try {
        // 1. Fetch a creator user (Admin or Instructor)
        const creator = await db.query.user.findFirst({
            where: inArray(user.role, ["admin", "instructor"]),
        });

        if (!creator) {
            console.error(
                "❌ No admin or instructor found. Please run 'npm run db:seed:users' first.",
            );
            process.exit(1);
        }
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
                    description: "Java programming practice problems with merged data",
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
        let mergedTestCases = 0;
        let fallbackTestCases = 0;

        // 5. Process each problem from database.json (uses better descriptions)
        const processedIds = new Set<string>();

        for (const dbProblem of databaseJson as DatabaseProblem[]) {
            const problemId = extractProblemId(dbProblem.title);

            // Skip duplicates within database.json
            if (processedIds.has(problemId)) {
                continue;
            }
            processedIds.add(problemId);

            const slug = generateSlug(dbProblem.title);
            const difficulty = getDifficulty();

            try {
                // Check if problem with this slug already exists
                const existing = await db.query.problems.findFirst({
                    where: (prob, { eq }) => eq(prob.slug, slug),
                });

                if (existing) {
                    console.log(`⏭️  Skipping (exists): ${dbProblem.title}`);
                    skipped++;
                    continue;
                }

                // Get test cases from combined_problem_data.json if available
                const combinedProblem = testCaseMap.get(problemId);

                // Use description from database.json (already markdown)
                const description = dbProblem.description;

                // Use boilerplate code from database.json
                const driverCode = dbProblem.boilerplate_code
                    ? { java: dbProblem.boilerplate_code }
                    : undefined;

                // Insert problem
                const [insertedProblem] = await db
                    .insert(problemsSchema)
                    .values({
                        collectionId: collection.id,
                        type: "coding",
                        difficulty,
                        title: dbProblem.title,
                        slug,
                        description,
                        content: SAMPLE_CONTENT,
                        driverCode,
                        gradingMetadata: SAMPLE_METADATA,
                        public: true,
                        createdBy: creator.id,
                    })
                    .returning();

                // Insert test cases - prefer combined_problem_data.json (executable format)
                if (combinedProblem && combinedProblem.testcases && combinedProblem.testcases.length > 0) {
                    const testCaseData = combinedProblem.testcases.map((tc) => ({
                        problemId: insertedProblem.id,
                        input: tc.input,
                        expectedOutput: tc.expected_output,
                        isHidden: !tc.is_visible,
                    }));

                    await db.insert(testCases).values(testCaseData);
                    mergedTestCases++;
                    console.log(
                        `✅ Created: ${dbProblem.title} (merged test cases: ${combinedProblem.testcases.length})`,
                    );
                } else if (dbProblem.test_cases && dbProblem.test_cases.length > 0) {
                    // Fallback to database.json test cases (may not be executable)
                    const testCaseData = dbProblem.test_cases.map((tc) => ({
                        problemId: insertedProblem.id,
                        input: tc.input,
                        expectedOutput: tc.output,
                        isHidden: tc.is_hidden,
                    }));

                    await db.insert(testCases).values(testCaseData);
                    fallbackTestCases++;
                    console.log(
                        `⚠️  Created: ${dbProblem.title} (fallback test cases: ${dbProblem.test_cases.length})`,
                    );
                } else {
                    console.log(`✅ Created: ${dbProblem.title} (no test cases)`);
                }

                created++;
            } catch (error) {
                console.error(`❌ Failed to create: ${dbProblem.title}`, error);
                failed++;
            }
        }

        // 6. Print summary
        console.log("\n📊 Seed Summary:");
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   🔗 Merged test cases: ${mergedTestCases}`);
        console.log(`   ⚠️  Fallback test cases: ${fallbackTestCases}`);

        console.log("\n🎉 Merged problem seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding problems:", error);
        process.exit(1);
    }
}

seedMergedProblems();
