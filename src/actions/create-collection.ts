"use server";

import { headers } from "next/headers";
import { z } from "zod";
import db from "@/db";
import { collections, problems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";

const createCollectionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    isPublic: z.boolean().default(false),
    problemIds: z.array(z.string().uuid()).optional().default([]),
});

export async function createCollection(data: z.infer<typeof createCollectionSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const validatedData = createCollectionSchema.parse(data);

    // 1. Create the collection
    const [newCollection] = await db
        .insert(collections)
        .values({
            name: validatedData.name,
            description: validatedData.description,
            public: validatedData.isPublic,
            createdBy: session.user.id,
        })
        .returning();

    // 2. If there are problems to add, update them
    if (validatedData.problemIds.length > 0) {
        await db
            .update(problems)
            .set({ collectionId: newCollection.id })
            .where(inArray(problems.id, validatedData.problemIds));
    }

    return newCollection;
}
