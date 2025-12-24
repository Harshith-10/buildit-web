import "dotenv/config";
import { sql } from "drizzle-orm";
import db from "@/db";

async function resetDb() {
  console.log("🧨 Resetting database schema...");

  try {
    // Drop the entire public schema and all its contents
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);

    // Recreate the public schema
    await db.execute(sql`CREATE SCHEMA public`);

    // Grant necessary permissions (optional, but good for local dev)
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);
    await db.execute(sql`COMMENT ON SCHEMA public IS 'standard public schema'`);

    console.log("✅ Database schema reset successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDb();
