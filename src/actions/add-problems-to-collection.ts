"use server";

import { headers } from "next/headers";
import { z } from "zod";
import db from "@/db";
import { problems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const addProblemsToCollectionSchema = z.object({
    collectionId: z.string().uuid(),
    problemIds: z.array(z.string().uuid()),
});

export async function addProblemsToCollection(data: z.infer<typeof addProblemsToCollectionSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const { collectionId, problemIds } = addProblemsToCollectionSchema.parse(data);

    if (problemIds.length === 0) return;

    await db
        .update(problems)
        .set({ collectionId })
        .where(inArray(problems.id, problemIds));

    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
}
