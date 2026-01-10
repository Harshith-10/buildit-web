import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import db from "@/db";
import {
  collections,
  problems as problemsSchema,
  testCases,
  user,
} from "@/db/schema";

const DATA_FILE = path.join(process.cwd(), "data/leetcode/refined_problem_data.json");
const COLLECTION_NAME = "Java Practice Problems";

// Type for refined_problem_data.json structure
interface RefinedProblem {
  title: string;
  description: string;
  driver_code: string;
  testcases: {
    input: string;
    expected_output: string;
    is_hidden: boolean;
  }[];
  slug: string;
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

async function seed() {
  console.log("🌱 Starting LeetCode seeding process...");

  // 1. Check if data file exists
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  // 2. Read and parse the data file
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  const problemsData: RefinedProblem[] = JSON.parse(content);
  console.log(`📊 Found ${problemsData.length} problems in data file`);

  // 3. Get a creator user (admin or instructor)
  const creators = await db.query.user.findMany({
    where: (u, { inArray }) => inArray(u.role, ["admin", "instructor"]),
  });

  if (creators.length === 0) {
    console.error(
      "❌ No admin or instructor found. Please run 'pnpm db:seed:users' first.",
    );
    process.exit(1);
  }
  const creator = creators[0];
  console.log(`👤 Using creator: ${creator.username} (${creator.id})`);

  // 4. Create or find collection
  let collection = await db.query.collections.findFirst({
    where: (col, { eq }) => eq(col.name, COLLECTION_NAME),
  });

  if (!collection) {
    console.log(`📚 Creating collection: "${COLLECTION_NAME}"...`);
    const [newCollection] = await db
      .insert(collections)
      .values({
        name: COLLECTION_NAME,
        description: "Collection of Java practice problems from LeetCode",
        public: true,
        createdBy: creator.id,
      })
      .returning();
    collection = newCollection;
  } else {
    console.log(
      `Using existing collection: "${COLLECTION_NAME}" (ID: ${collection.id})`,
    );
  }

  let totalProblemsProcessed = 0;
  let totalProblemsInserted = 0;
  let totalProblemsSkipped = 0;
  let totalFailed = 0;

  // 5. Process each problem
  for (const problemData of problemsData) {
    totalProblemsProcessed++;
    try {
      // Check if problem exists by slug
      const existingProblem = await db.query.problems.findFirst({
        where: eq(problemsSchema.slug, problemData.slug),
      });

      if (existingProblem) {
        totalProblemsSkipped++;
        continue;
      }

      // Insert Problem
      const driverCode = problemData.driver_code
        ? { java: problemData.driver_code }
        : undefined;

      const [newProblem] = await db
        .insert(problemsSchema)
        .values({
          collectionId: collection.id,
          type: "coding",
          difficulty: "easy",
          title: problemData.title,
          slug: problemData.slug,
          description: problemData.description,
          content: SAMPLE_CONTENT,
          driverCode,
          gradingMetadata: SAMPLE_METADATA,
          public: true,
          createdBy: creator.id,
        })
        .returning();

      // Insert Test Cases
      if (problemData.testcases && problemData.testcases.length > 0) {
        const testCaseData = problemData.testcases.map((tc) => ({
          problemId: newProblem.id,
          input: tc.input,
          expectedOutput: tc.expected_output,
          isHidden: tc.is_hidden,
        }));
        await db.insert(testCases).values(testCaseData);
      }

      console.log(
        `✅ Created: ${problemData.title} with ${problemData.testcases?.length || 0} test cases`,
      );
      totalProblemsInserted++;
    } catch (error) {
      console.error(`❌ Error processing problem "${problemData.title}":`, error);
      totalFailed++;
    }
  }

  console.log(`\n✅ LeetCode seeding complete!`);
  console.log(`Total Processed: ${totalProblemsProcessed}`);
  console.log(`New Problems Inserted: ${totalProblemsInserted}`);
  console.log(`Skipped (already exist): ${totalProblemsSkipped}`);
  console.log(`Failed: ${totalFailed}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
