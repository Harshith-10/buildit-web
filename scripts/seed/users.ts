import { eq } from "drizzle-orm";
import db from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

await auth.api.signUpEmail({
  body: {
    email: "harshu@buildit.com",
    name: "Harshith Doddipalli",
    password: "password1234",
    username: "harshu",
    displayUsername: "Harshith",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=harshu",
  },
});

await auth.api.signUpEmail({
  body: {
    email: "admin@buildit.com",
    name: "Admin",
    password: "password1234",
    username: "admin",
    displayUsername: "Admin",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=admin",
  },
});

await db
  .update(user)
  .set({
    role: "admin",
  })
  .where(eq(user.username, "admin"));
