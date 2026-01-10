import db from "@/db";
import { user, userGroupMembers, examGroups } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkUserAndGroups() {
  // Find John Doe - try by email or name
  const johnDoe = await db.query.user.findFirst({
    where: (u, { or, like }) => or(
      eq(u.username, "johndoe"),
      like(u.name, "%John%"),
      like(u.email, "%john%")
    ),
  });
  
  if (!johnDoe) {
    console.log("❌ John Doe not found");
    return;
  }
  
  console.log("✅ John Doe found:", johnDoe.id, johnDoe.name);
  
  // Check group memberships
  const memberships = await db.query.userGroupMembers.findMany({
    where: eq(userGroupMembers.userId, johnDoe.id),
  });
  
  console.log("\n📊 Group memberships:", memberships.length);
  memberships.forEach((m, i) => {
    console.log(`  ${i + 1}. Group ID: ${m.groupId}`);
  });
  
  // Check exam groups
  const examId = "149ba209-c31b-4f46-bc2b-c2f81f28b3e2";
  const examGroupsData = await db.query.examGroups.findMany({
    where: eq(examGroups.examId, examId),
  });
  
  console.log("\n📝 Exam groups for this exam:", examGroupsData.length);
  examGroupsData.forEach((eg, i) => {
    console.log(`  ${i + 1}. Group ID: ${eg.groupId}`);
    console.log(`     Start: ${eg.startTime || "null (uses exam start)"}`);
    console.log(`     End: ${eg.endTime || "null (uses exam end)"}`);
  });
  
  process.exit(0);
}

checkUserAndGroups().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
