import { createHash } from "node:crypto";

/**
 * Hash a PIN using SHA-256.
 * For production, consider using bcrypt or argon2.
 */
export function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

/**
 * Verify a PIN against a stored hash.
 */
export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}
