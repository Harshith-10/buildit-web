import { eq } from "drizzle-orm";
import db from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

async function seedUsers() {
  try {
    const users = [
      {
        email: "harshu@buildit.com",
        name: "Harshith Doddipalli",
        password: "password1234",
        username: "harshu",
        displayUsername: "Harshith",
        image: "https://api.dicebear.com/9.x/glass/svg?seed=harshu",
        role: "student",
      },
      {
        email: "admin@buildit.com",
        name: "Admin",
        password: "password1234",
        username: "admin",
        displayUsername: "Admin",
        image: "https://api.dicebear.com/9.x/glass/svg?seed=admin",
        role: "admin",
      },
      {
        email: "instructor@buildit.com",
        name: "Instructor",
        password: "password1234",
        username: "instructor",
        displayUsername: "Instructor",
        image: "https://api.dicebear.com/9.x/glass/svg?seed=instructor",
        role: "instructor",
      },
    ];

    for (const u of users) {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, u.email),
      });

      if (existingUser) {
        console.log(`User ${u.username} already exists, updating role...`);
        await db
          .update(user)
          .set({ role: u.role as any })
          .where(eq(user.id, existingUser.id));
        continue;
      }

      await auth.api.signUpEmail({
        body: {
          email: u.email,
          name: u.name,
          password: u.password,
          username: u.username,
          displayUsername: u.displayUsername,
          image: u.image,
        },
      });

      // Update role after creation since signUpEmail uses default role
      await db
        .update(user)
        .set({ role: u.role as "student" | "instructor" | "admin" })
        .where(eq(user.email, u.email));

      console.log(`User ${u.username} created with role ${u.role}`);
    }
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

await seedUsers();
