import { inArray } from "drizzle-orm";
import db from "@/db";
import {
  collections,
  exams,
  problems as problemsSchema, // renamed to avoid conflict
  testCases,
  user,
} from "@/db/schema";
import { problems as seedProblems } from "./problems"; // Import the seed problems

// Types derived from schema or usage
type ExamConfig =
  | { strategy: "fixed"; problemIds: string[] }
  | { strategy: "random_pool"; collectionId: string; count: number };

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

async function seedData() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Fetch a creator user (Admin or Instructor)
    // We try to find 'admin' or 'instructor' seeded by users.ts
    const creator = await db.query.user.findFirst({
      where: inArray(user.role, ["admin", "instructor"]),
    });

    if (!creator) {
      console.error(
        "❌ No admin or instructor found. Please run 'npm run seed:users' first.",
      );
      process.exit(1);
    }
    console.log(`👤 Using creator: ${creator.username} (${creator.id})`);

    // 2. Clean existing data
    // Order matters for FK constraints:
    // testCases -> problems -> (collections)
    // Note: examAssignments and assignmentSubmissions are handled separately
    console.log("🧹 Cleaning existing data...");
    await db.delete(testCases);
    await db.delete(problemsSchema);
    await db.delete(collections);
    console.log("✅ Data cleaned.");

    // 3. Create Collections
    console.log("📚 Creating collections...");
    const collectionData = [
      {
        name: "Standard Library",
        description: "Classic algorithmic problems.",
      },
      {
        name: "Data Structures",
        description: "Arrays, Linked Lists, Trees, and Graphs.",
      },
      {
        name: "Algorithms",
        description: "Sorting, Searching, and Dynamic Programming.",
      },
    ];

    const insertedCollections = [];
    for (const c of collectionData) {
      const [inserted] = await db
        .insert(collections)
        .values({
          name: c.name,
          description: c.description,
          public: true,
          createdBy: creator.id,
        })
        .returning();
      insertedCollections.push(inserted);
    }
    console.log(`✅ Created ${insertedCollections.length} collections.`);

    // 4. Create Problems & TestCases
    console.log("🧩 Creating problems and testcases...");
    const allProblemIds: string[] = [];

    let problemIndex = 0;
    for (const prob of seedProblems) {
      // Assign to collections round-robin
      const col =
        insertedCollections[problemIndex % insertedCollections.length];

      // Create Problem
      const [insertedProblem] = await db
        .insert(problemsSchema)
        .values({
          collectionId: col.id,
          type: prob.type,
          difficulty: prob.difficulty,
          title: prob.title,
          slug: prob.slug,
          description: prob.description,
          content: SAMPLE_CONTENT,
          driverCode: prob.driverCode,
          gradingMetadata: SAMPLE_METADATA,
          public: true,
          createdBy: creator.id,
        })
        .returning();

      allProblemIds.push(insertedProblem.id);

      // Create TestCases
      const testCaseData = prob.testCases.map((tc) => ({
        problemId: insertedProblem.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));

      await db.insert(testCases).values(testCaseData);
      problemIndex++;
    }

    console.log(`✅ Created ${allProblemIds.length} problems with testcases.`);

    // 5. Create Exams
    console.log("📝 Creating exams...");
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Adjust scenarios for 5 problems
    // Collections: 0 (Standard), 1 (DS), 2 (Algo)
    // Distribution:
    // P0 -> Col 0
    // P1 -> Col 1
    // P2 -> Col 2
    // P3 -> Col 0
    // P4 -> Col 1

    const examScenarios = [
      // 2 Upcoming
      {
        title: "Midterm Exam (Upcoming 1)",
        startOffset: oneDay, // starts tomorrow
        endOffset: oneDay * 2,
        duration: 60,
        config: {
          strategy: "random_pool",
          collectionId: insertedCollections[0].id,
          count: 1, // Standard lib has 2 problems (0, 3)
        },
      },
      {
        title: "Final Exam (Upcoming 2)",
        startOffset: oneDay * 5,
        endOffset: oneDay * 6,
        duration: 120,
        config: { strategy: "fixed", problemIds: allProblemIds.slice(0, 3) },
      },
      // 2 Completed
      {
        title: "Quiz 1 (Completed 1)",
        startOffset: -oneDay * 5,
        endOffset: -oneDay * 4,
        duration: 30,
        config: {
          strategy: "random_pool",
          collectionId: insertedCollections[1].id,
          count: 2, // DS has 2 problems (1, 4)
        },
      },
      {
        title: "Quiz 2 (Completed 2)",
        startOffset: -oneDay * 2,
        endOffset: -oneDay * 1,
        duration: 45,
        config: { strategy: "fixed", problemIds: allProblemIds.slice(3, 5) },
      },
      // 3 Ongoing
      {
        title: "Weekly Contest (Ongoing 1)",
        startOffset: -oneDay, // started yesterday
        endOffset: oneDay, // ends tomorrow
        duration: 180,
        config: {
          strategy: "random_pool",
          collectionId: insertedCollections[2].id,
          count: 1, // Algo has 1 problem (2)
        },
      },
      {
        title: "Pop Quiz (Ongoing 2)",
        startOffset: -1000 * 60 * 30, // started 30 mins ago
        endOffset: 1000 * 60 * 60, // ends in 1 hour
        duration: 45,
        config: { strategy: "fixed", problemIds: [allProblemIds[0]] },
      },
      {
        title: "Entrance Exam (Ongoing 3)",
        startOffset: -1000 * 60 * 60 * 2, // started 2 hours ago
        endOffset: 1000 * 60 * 60 * 24, // ends tomorrow
        duration: 90,
        config: {
          strategy: "random_pool",
          collectionId: insertedCollections[0].id,
          count: 2,
        },
      },
    ];

    for (const s of examScenarios) {
      await db.insert(exams).values({
        title: s.title,
        startTime: new Date(now.getTime() + s.startOffset),
        endTime: new Date(now.getTime() + s.endOffset),
        durationMinutes: s.duration,
        config: s.config as any, // Cast to any if type mismatch occurs with jsonb, but usually fine
        createdBy: creator.id,
      });
    }
    console.log(`✅ Created ${examScenarios.length} exams.`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
