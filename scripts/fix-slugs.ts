import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import db from "../src/db";
import { problems } from "../src/db/schema";

async function fixSlugs() {
  console.log("Checking for problems without slugs...");

  try {
    // Check if slug column exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'problems' AND column_name = 'slug'
    `);

    if (result.rows.length === 0) {
      console.log("Adding slug column...");
      await db.execute(sql`ALTER TABLE problems ADD COLUMN slug text`);
    }

    // Get problems without slugs
    const problemsWithoutSlugs = await db
      .select()
      .from(problems)
      .where(sql`slug IS NULL OR slug = ''`);

    console.log(`Found ${problemsWithoutSlugs.length} problems without slugs`);

    // Update each problem with a slug
    for (const problem of problemsWithoutSlugs) {
      const slug =
        problem.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        problem.id.substring(0, 8);

      await db
        .update(problems)
        .set({ slug })
        .where(eq(problems.id, problem.id));

      console.log(`Updated problem "${problem.title}" with slug: ${slug}`);
    }

    // Add unique constraint if it doesn't exist
    console.log("Adding unique constraint to slug column...");
    await db
      .execute(sql`
      ALTER TABLE problems 
      ADD CONSTRAINT problems_slug_unique UNIQUE (slug)
    `)
      .catch(() => {
        console.log("Constraint already exists or failed to add");
      });

    // Make slug NOT NULL
    console.log("Making slug column NOT NULL...");
    await db
      .execute(sql`
      ALTER TABLE problems 
      ALTER COLUMN slug SET NOT NULL
    `)
      .catch(() => {
        console.log("Column already NOT NULL or failed to update");
      });

    console.log("✅ All slugs fixed successfully!");
  } catch (error) {
    console.error("Error fixing slugs:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixSlugs();
