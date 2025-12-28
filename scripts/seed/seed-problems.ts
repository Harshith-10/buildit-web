import { inArray } from "drizzle-orm";
import db from "@/db";
import {
    collections,
    problems as problemsSchema,
    testCases,
    user,
} from "@/db/schema";
import problemData from "./combined_problem_data.json";

// Type for the JSON data structure
interface JsonTestCase {
    input: string;
    expected_output: string;
    is_visible: boolean;
}

interface JsonProblem {
    title: string;
    description: string;
    starter_code: string;
    testcases: JsonTestCase[];
}

// Helper function to generate a slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
}

// All problems are easy difficulty (coding type)
function getDifficulty(): "easy" | "medium" | "hard" {
    return "easy";
}

// Helper function to format plain text description into markdown
function formatDescriptionToMarkdown(title: string, description: string): string {
    // Remove the problem number prefix from title for the heading (e.g., "1.1 Sum of..." -> "Sum of...")
    const cleanTitle = title.replace(/^\d+\.?\d*\s*/, "").trim();

    // Start with the title as a heading
    let markdown = `# ${cleanTitle}\n\n`;

    // Find the first "Input:" to separate main description from examples
    const firstInputIndex = description.indexOf("Input:");

    let mainDescription: string;
    let examplesSection: string;

    if (firstInputIndex > 0) {
        mainDescription = description.substring(0, firstInputIndex).trim();
        examplesSection = description.substring(firstInputIndex).trim();
    } else {
        mainDescription = description;
        examplesSection = "";
    }

    // Add the main description
    markdown += `${mainDescription}\n\n`;

    // Parse examples section
    if (examplesSection) {
        // Split by "Input:" to get individual examples
        const parts = examplesSection.split(/(?=Input:)/i).filter(p => p.trim());

        parts.forEach((part, index) => {
            // Each part looks like: "Input: ... Output: ..."
            const outputIndex = part.indexOf("Output:");

            if (outputIndex > 0) {
                const inputPart = part.substring(part.indexOf(":") + 1, outputIndex).trim();
                const outputPart = part.substring(outputIndex + 7).trim(); // 7 = "Output:".length

                markdown += `## Example ${index + 1}:\n\n`;
                markdown += "```\n";
                markdown += `Input: ${inputPart}\n`;
                markdown += `Output: ${outputPart}\n`;
                markdown += "```\n\n";
            }
        });
    }

    return markdown.trim();
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

async function seedProblemsFromJson() {
    console.log("🌱 Starting problem seed from JSON...");
    console.log(`📊 Found ${problemData.length} problems in JSON file`);

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

        // 2. Create or find a collection for these problems
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
                    description:
                        "Java programming practice problems imported from combined_problem_data.json",
                    public: true,
                    createdBy: creator.id,
                })
                .returning();
            collection = newCollection;
        }
        console.log(`✅ Using collection: ${collection.name} (${collection.id})`);

        // 3. Track statistics
        let created = 0;
        let skipped = 0;
        let failed = 0;

        // 4. Process each problem
        for (let i = 0; i < problemData.length; i++) {
            const problem = problemData[i] as JsonProblem;
            const slug = generateSlug(problem.title);
            const difficulty = getDifficulty();

            try {
                // Check if problem with this slug already exists
                const existing = await db.query.problems.findFirst({
                    where: (prob, { eq }) => eq(prob.slug, slug),
                });

                if (existing) {
                    console.log(`⏭️  Skipping (exists): ${problem.title}`);
                    skipped++;
                    continue;
                }

                // Create driver code from starter_code (assuming Java)
                const driverCode = problem.starter_code
                    ? { java: problem.starter_code }
                    : undefined;

                // Format the description to proper markdown
                const formattedDescription = formatDescriptionToMarkdown(problem.title, problem.description);

                // Insert problem
                const [insertedProblem] = await db
                    .insert(problemsSchema)
                    .values({
                        collectionId: collection.id,
                        type: "coding",
                        difficulty,
                        title: problem.title,
                        slug,
                        description: formattedDescription,
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
                        isHidden: !tc.is_visible,
                    }));

                    await db.insert(testCases).values(testCaseData);
                }

                created++;
                console.log(
                    `✅ Created: ${problem.title} (${difficulty}) with ${problem.testcases?.length || 0} test cases`,
                );
            } catch (error) {
                console.error(`❌ Failed to create: ${problem.title}`, error);
                failed++;
            }
        }

        // 5. Print summary
        console.log("\n📊 Seed Summary:");
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total: ${problemData.length}`);

        console.log("\n🎉 Problem seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding problems:", error);
        process.exit(1);
    }
}

seedProblemsFromJson();
