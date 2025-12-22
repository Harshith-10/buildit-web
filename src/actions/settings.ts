"use server";

import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "@/db";
import { device, session, user } from "@/db/schema";
import { auth } from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(data: {
  username?: string;
  displayUsername?: string;
  image?: string;
}): Promise<ActionResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if username is taken if changing it
    if (data.username && data.username !== sessionData.user.username) {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.username, data.username),
      });
      if (existingUser) {
        return { success: false, error: "Username already taken" };
      }
    }

    await db
      .update(user)
      .set({
        ...(data.username ? { username: data.username } : {}),
        ...(data.displayUsername
          ? { displayUsername: data.displayUsername }
          : {}),
        ...(data.image ? { image: data.image } : {}),
      })
      .where(eq(user.id, sessionData.user.id));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getSessions() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return [];
  }

  const sessions = await db.query.session.findMany({
    where: eq(session.userId, sessionData.user.id),
    orderBy: (session, { desc }) => [desc(session.createdAt)],
  });

  return sessions.map((s) => ({
    ...s,
    isCurrent: s.id === sessionData.session.id,
  }));
}

export async function revokeSession(sessionId: string): Promise<ActionResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(session).where(
      and(
        eq(session.id, sessionId),
        eq(session.userId, sessionData.user.id), // Ensure user owns session
      ),
    );
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to revoke session" };
  }
}

export async function getDevices() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return [];
  }

  const devices = await db.query.device.findMany({
    where: eq(device.userId, sessionData.user.id),
    orderBy: (device, { desc }) => [desc(device.updatedAt)],
  });

  return devices;
}

export async function removeDevice(fingerprint: string): Promise<ActionResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(device)
      .where(
        and(
          eq(device.fingerprint, fingerprint),
          eq(device.userId, sessionData.user.id),
        ),
      );
    // Also potentially revoke sessions associated with this fingerprint?
    // Based on schema, sessions store deviceFingerprint.
    // Ideally we should disconnect them, but for now just removing the trusted device record is sufficient per task.

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove device" };
  }
}
