import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import db from "@/db";
import { user, collectionQuestions, questions, userGroups } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCollections } from "@/actions/collections-list";
import { getProblems } from "@/actions/problems-list";
import { getQuestionCollections } from "@/actions/question-collections-list";
import CreateExamClient from "@/components/layouts/create-exam/create-exam-client";

export default async function CreateExamPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch collections, question collections, problems/questions, users, and groups for the exam creation form
    const [collectionsResult, questionCollectionsResult, problemsResult, questionsResult, usersResult, groupsResult] = await Promise.all([
        getCollections({ perPage: 100 }),
        getQuestionCollections({ perPage: 100 }),
        getProblems({ perPage: 200 }),
        db.select({
            id: questions.id,
            title: questions.title,
            problemStatement: questions.problemStatement,
            difficulty: questions.difficulty,
            allowedLanguages: questions.allowedLanguages,
            collectionId: collectionQuestions.collectionId,
        })
        .from(questions)
        .leftJoin(collectionQuestions, eq(questions.id, collectionQuestions.questionId)),
        db.select().from(user).orderBy(user.createdAt),
        db.select().from(userGroups).orderBy(userGroups.name),
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

    // Combine both old problems and new questions into a unified list
    const allProblems = [
        ...problemsResult.data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            collectionId: p.collectionId,
            type: 'old' as const,
        })),
        ...questionsResult.map(q => ({
            id: q.id,
            title: q.title,
            description: q.problemStatement || "",
            difficulty: q.difficulty,
            collectionId: q.collectionId,
            type: 'new' as const,
        })),
    ];

    // Combine both old collections and new question collections
    const allCollections = [
        ...collectionsResult.data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            type: 'old' as const,
        })),
        ...questionCollectionsResult.data.map(c => ({
            id: c.id,
            name: c.title,
            description: c.description,
            type: 'new' as const,
        })),
    ];

    return (
        <CreateExamClient
            collections={allCollections}
            problems={allProblems}
            groups={groupsResult}
            users={users}
        />
    );
}
