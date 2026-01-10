import db from "@/db";
import { examGroups, userGroups, user } from "@/db/schema";

async function assignGroupToExam() {
  const examId = "149ba209-c31b-4f46-bc2b-c2f81f28b3e2";
  
  // Get all groups
  const groups = await db.query.userGroups.findMany();
  
  console.log(`📊 Found ${groups.length} groups`);
  
  if (groups.length === 0) {
    console.log("\n❌ No groups found. Creating a default group...");
    
    // Get admin user
    const admin = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.role, "admin"),
    });
    
    if (!admin) {
      console.log("❌ No admin found");
      return;
    }
    
    // Create a default group
    const [newGroup] = await db
      .insert(userGroups)
      .values({
        name: "All Students",
        description: "Default group for all students",
      })
      .returning();
    
    console.log(`✅ Created group: ${newGroup.name} (${newGroup.id})`);
    
    groups.push(newGroup);
  }
  
  // Use the first group
  const groupToAssign = groups[0];
  
  console.log(`\n🔗 Assigning group "${groupToAssign.name}" to exam...`);
  
  // Check if already assigned
  const existing = await db.query.examGroups.findFirst({
    where: (eg, { and, eq }) => and(
      eq(eg.examId, examId),
      eq(eg.groupId, groupToAssign.id)
    ),
  });
  
  if (existing) {
    console.log("✅ Group already assigned to this exam");
  } else {
    await db.insert(examGroups).values({
      examId,
      groupId: groupToAssign.id,
      // startTime and endTime are null, will use exam's default times
    });
    
    console.log("✅ Group assigned to exam successfully!");
  }
  
  console.log("\n📝 Summary:");
  console.log(`   Exam ID: ${examId}`);
  console.log(`   Group: ${groupToAssign.name}`);
  console.log(`   Group ID: ${groupToAssign.id}`);
  
  process.exit(0);
}

assignGroupToExam().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
