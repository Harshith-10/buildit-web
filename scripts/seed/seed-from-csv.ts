import { eq } from "drizzle-orm";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { parse } from "csv-parse/sync";
import db from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

interface StudentCSVRow {
  email: string;
  name: string;
  username: string;
  displayUsername?: string;
  image?: string;
  rollNumber: string;
  dateOfBirth?: string;
  semester?: string;
  section?: string;
  branch?: string;
}

interface InstructorCSVRow {
  email: string;
  name: string;
  username: string;
  displayUsername?: string;
  image?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  semester?: string;
  section?: string;
  branch?: string;
}

const DEFAULT_PASSWORD = "password1234";
const CSV_DIRECTORY = join(process.cwd(), "data", "csv");

async function generateAvatar(seed: string): Promise<string> {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
}

async function processStudentsCSV(filePath: string) {
  console.log(`\nProcessing students CSV: ${filePath}`);
  
  const fileContent = await readFile(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as StudentCSVRow[];

  let successCount = 0;
  let skipCount = 0;

  for (const record of records) {
    if (!record.email || !record.name || !record.username) {
      console.log(`⚠️  Skipping invalid row: ${JSON.stringify(record)}`);
      skipCount++;
      continue;
    }

    try {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, record.email),
      });

      if (existingUser) {
        console.log(`  User ${record.username} already exists, updating data...`);
        await db
          .update(user)
          .set({ 
            role: "student",
            rollNumber: record.rollNumber || existingUser.rollNumber,
            dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : existingUser.dateOfBirth,
            semester: record.semester || existingUser.semester,
            section: record.section || existingUser.section,
            branch: record.branch || existingUser.branch,
          })
          .where(eq(user.id, existingUser.id));
        skipCount++;
        continue;
      }

      const displayUsername = record.displayUsername || record.name.split(" ")[0];
      const image = record.image || await generateAvatar(record.username);

      await auth.api.signUpEmail({
        body: {
          email: record.email,
          name: record.name,
          password: DEFAULT_PASSWORD,
          username: record.username,
          displayUsername: displayUsername,
          image: image,
        },
      });

      // Update role and additional fields after creation
      await db
        .update(user)
        .set({ 
          role: "student",
          rollNumber: record.rollNumber,
          dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
          semester: record.semester,
          section: record.section,
          branch: record.branch,
        })
        .where(eq(user.email, record.email));

      console.log(`✓ Student ${record.username} created successfully`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error creating student ${record.username}:`, error);
    }
  }

  console.log(`\nStudents Summary: ${successCount} created, ${skipCount} skipped`);
}

async function processInstructorsCSV(filePath: string) {
  console.log(`\nProcessing instructors CSV: ${filePath}`);
  
  const fileContent = await readFile(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as InstructorCSVRow[];

  let successCount = 0;
  let skipCount = 0;

  for (const record of records) {
    if (!record.email || !record.name || !record.username) {
      console.log(`⚠️  Skipping invalid row: ${JSON.stringify(record)}`);
      skipCount++;
      continue;
    }

    try {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, record.email),
      });

      if (existingUser) {
        console.log(`  User ${record.username} already exists, updating data...`);
        await db
          .update(user)
          .set({ 
            role: "instructor",
            rollNumber: record.rollNumber || existingUser.rollNumber,
            dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : existingUser.dateOfBirth,
            semester: record.semester || existingUser.semester,
            section: record.section || existingUser.section,
            branch: record.branch || existingUser.branch,
          })
          .where(eq(user.id, existingUser.id));
        skipCount++;
        continue;
      }

      const displayUsername = record.displayUsername || record.name.split(" ")[0];
      const image = record.image || await generateAvatar(record.username);

      await auth.api.signUpEmail({
        body: {
          email: record.email,
          name: record.name,
          password: DEFAULT_PASSWORD,
          username: record.username,
          displayUsername: displayUsername,
          image: image,
        },
      });

      // Update role and additional fields after creation
      await db
        .update(user)
        .set({ 
          role: "instructor",
          rollNumber: record.rollNumber,
          dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
          semester: record.semester,
          section: record.section,
          branch: record.branch,
        })
        .where(eq(user.email, record.email));

      console.log(`✓ Instructor ${record.username} created successfully`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error creating instructor ${record.username}:`, error);
    }
  }

  console.log(`\nInstructors Summary: ${successCount} created, ${skipCount} skipped`);
}

async function seedFromCSV() {
  console.log("=".repeat(60));
  console.log("Starting CSV User Seeding");
  console.log("=".repeat(60));
  console.log(`CSV Directory: ${CSV_DIRECTORY}`);
  console.log(`Default Password: ${DEFAULT_PASSWORD}`);
  console.log("=".repeat(60));

  try {
    const files = await readdir(CSV_DIRECTORY);
    const csvFiles = files.filter(file => file.toLowerCase().endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.log(`\n⚠️  No CSV files found in ${CSV_DIRECTORY}`);
      console.log("\nExpected files:");
      console.log("  - students.csv (email, name, username, rollNumber, dateOfBirth, semester, section, branch)");
      console.log("  - instructors.csv (email, name, username, rollNumber?, dateOfBirth?, branch?)");
      return;
    }

    console.log(`\nFound ${csvFiles.length} CSV file(s):\n${csvFiles.map(f => `  - ${f}`).join("\n")}`);

    for (const file of csvFiles) {
      const filePath = join(CSV_DIRECTORY, file);
      const fileName = file.toLowerCase();

      if (fileName.includes("student")) {
        await processStudentsCSV(filePath);
      } else if (fileName.includes("instructor")) {
        await processInstructorsCSV(filePath);
      } else {
        console.log(`\n⚠️  Skipping ${file} - filename should contain 'student' or 'instructor'`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("CSV Seeding completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error during CSV seeding:", error);
    throw error;
  }
}

async function main() {
  await seedFromCSV();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
