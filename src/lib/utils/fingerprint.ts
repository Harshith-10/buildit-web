"use client";

import FingerprintJS, { type Agent } from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<Agent> | null = null;

/**
 * Get the device fingerprint using FingerprintJS.
 * The fingerprint is cached to avoid multiple API calls.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}

/**
 * Get device name from user agent for display purposes.
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") return "Unknown Device";

  const ua = navigator.userAgent;
  let deviceName = "Unknown Device";

  // Detect OS
  if (ua.includes("Windows")) {
    deviceName = "Windows PC";
  } else if (ua.includes("Mac")) {
    deviceName = "Mac";
  } else if (ua.includes("Linux")) {
    deviceName = "Linux PC";
  } else if (ua.includes("Android")) {
    deviceName = "Android Device";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    deviceName = ua.includes("iPad") ? "iPad" : "iPhone";
  }

  // Append browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    deviceName += " (Chrome)";
  } else if (ua.includes("Firefox")) {
    deviceName += " (Firefox)";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    deviceName += " (Safari)";
  } else if (ua.includes("Edg")) {
    deviceName += " (Edge)";
  }

  return deviceName;
}
