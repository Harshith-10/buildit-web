import { headers } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCollections } from "@/actions/collections-list";
import { getProblems } from "@/actions/problems-list";
import CreateExamClient from "@/components/layouts/create-exam/create-exam-client";

export default async function CreateExamPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch collections, problems, and users for the exam creation form
    const [collectionsResult, problemsResult, usersResult] = await Promise.all([
        getCollections({ perPage: 100 }),
        getProblems({ perPage: 200 }),
        db.select().from(user).orderBy(user.createdAt),
    ]);

    // Map users to expected format (simplifying for now as per user-management)
    const users = usersResult.map((u) => ({
        id: u.id,
        rollNo: u.username || u.id.slice(0, 10).toUpperCase(),
        name: u.name,
        email: u.email,
        // Add other fields as optional or placeholders if needed by the client type
        role: u.role as "student" | "instructor" | "admin",
        branch: "CSE", // Placeholder
        semester: "5", // Placeholder
    }));

    return (
        <CreateExamClient
            collections={collectionsResult.data}
            problems={problemsResult.data}
            users={users}
        />
    );
}
