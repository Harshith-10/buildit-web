import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.username, "johndoe"));
  
  console.log("John Doe user:", JSON.stringify(users[0], null, 2));
  
  process.exit(0);
}

checkUser().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
