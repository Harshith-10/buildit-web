"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db";
import { account, device, session } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hashPin, verifyPin as verifyPinHash } from "@/lib/exam/pin-hash";

export interface PinStatusResult {
  pinEnabled: boolean;
  pinRequired: boolean;
  pinVerified: boolean;
  isFirstLogin: boolean;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Check the PIN status for the current user
 */
export async function checkPinStatus(
  fingerprint: string,
): Promise<PinStatusResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return {
      pinEnabled: false,
      pinRequired: false,
      pinVerified: false,
      isFirstLogin: false,
    };
  }

  // Get user's account with PIN settings
  const userAccount = await db.query.account.findFirst({
    where: eq(account.userId, sessionData.user.id),
  });

  // Get current session to check pinVerified status
  const currentSession = await db.query.session.findFirst({
    where: eq(session.id, sessionData.session.id),
  });

  const pinEnabled = userAccount?.pinEnabled ?? false;
  const pinVerified = currentSession?.pinVerified ?? false;
  const pinStrategy = userAccount?.pinStrategy ?? "new_device";

  // If PIN not enabled, never require
  if (!pinEnabled) {
    return {
      pinEnabled: false,
      pinRequired: false,
      pinVerified: false,
      isFirstLogin: !userAccount?.pinEnabled && !userAccount?.pin,
    };
  }

  // If already verified in this session, don't require again
  if (pinVerified) {
    return {
      pinEnabled: true,
      pinRequired: false,
      pinVerified: true,
      isFirstLogin: false,
    };
  }

  // Determine if PIN is required based on strategy
  let pinRequired = false;

  switch (pinStrategy) {
    case "always":
      pinRequired = true;
      break;

    case "new_device":
      // Check if device is registered
      if (fingerprint) {
        const existingDevice = await db.query.device.findFirst({
          where: and(
            eq(device.fingerprint, fingerprint),
            eq(device.userId, sessionData.user.id),
          ),
        });
        pinRequired = !existingDevice;
      } else {
        // No fingerprint provided, require PIN
        pinRequired = true;
      }
      break;

    case "random":
      // 10% chance to require PIN
      pinRequired = Math.random() < 0.1;
      break;
  }

  return {
    pinEnabled: true,
    pinRequired,
    pinVerified: false,
    isFirstLogin: false,
  };
}

/**
 * Set up a PIN for the current user
 */
export async function setupPin(
  pin: string,
  strategy: string,
): Promise<ActionResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate PIN
  if (
    !pin ||
    typeof pin !== "string" ||
    pin.length !== 4 ||
    !/^\d{4}$/.test(pin)
  ) {
    return { success: false, error: "PIN must be exactly 4 digits" };
  }

  // Validate strategy
  const validStrategies = ["always", "new_device", "random"];
  if (!strategy || !validStrategies.includes(strategy)) {
    return {
      success: false,
      error: "Invalid strategy. Must be one of: always, new_device, random",
    };
  }

  // Hash the PIN
  const hashedPin = hashPin(pin);

  // Update the user's account with PIN settings
  await db
    .update(account)
    .set({
      pin: hashedPin,
      pinEnabled: true,
      pinStrategy: strategy as "always" | "new_device" | "random",
    })
    .where(eq(account.userId, sessionData.user.id));

  return { success: true };
}

/**
 * Verify a PIN for the current user
 */
export async function verifyPin(
  pin: string,
  fingerprint: string,
  deviceName?: string,
): Promise<ActionResult> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate PIN
  if (
    !pin ||
    typeof pin !== "string" ||
    pin.length !== 4 ||
    !/^\d{4}$/.test(pin)
  ) {
    return { success: false, error: "PIN must be exactly 4 digits" };
  }

  // Get user's account with PIN
  const userAccount = await db.query.account.findFirst({
    where: eq(account.userId, sessionData.user.id),
  });

  if (!userAccount?.pin) {
    return { success: false, error: "PIN not set up" };
  }

  // Verify PIN
  const isValid = verifyPinHash(pin, userAccount.pin);
  if (!isValid) {
    return { success: false, error: "Invalid PIN" };
  }

  // Mark session as PIN verified
  await db
    .update(session)
    .set({ pinVerified: true })
    .where(eq(session.id, sessionData.session.id));

  // Register new device if fingerprint provided and not already registered
  if (fingerprint) {
    const existingDevice = await db.query.device.findFirst({
      where: and(
        eq(device.fingerprint, fingerprint),
        eq(device.userId, sessionData.user.id),
      ),
    });

    if (!existingDevice) {
      await db.insert(device).values({
        fingerprint,
        userId: sessionData.user.id,
        name: deviceName || "Unknown Device",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return { success: true };
}
