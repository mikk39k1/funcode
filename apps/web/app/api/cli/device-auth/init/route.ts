import { NextResponse } from "next/server";
import crypto from "crypto";

// In-memory store for device codes (use Redis/DB in production)
declare global {
  // eslint-disable-next-line no-var
  var deviceCodes: Map<
    string,
    { userCode: string; token?: string; username?: string; createdAt: number }
  > | undefined;
}

export const deviceCodeStore =
  globalThis.deviceCodes ?? new Map<string, { userCode: string; token?: string; username?: string; createdAt: number }>();

if (!globalThis.deviceCodes) globalThis.deviceCodes = deviceCodeStore;

function generateCode(length: number): string {
  return crypto
    .randomBytes(length)
    .toString("base64url")
    .slice(0, length)
    .toUpperCase();
}

export async function POST() {
  const deviceCode = crypto.randomUUID();
  const userCode = `${generateCode(4)}-${generateCode(4)}`;

  deviceCodeStore.set(deviceCode, {
    userCode,
    createdAt: Date.now(),
  });

  // Clean up codes older than 10 minutes
  const tenMinutes = 10 * 60 * 1000;
  for (const [key, val] of deviceCodeStore.entries()) {
    if (Date.now() - val.createdAt > tenMinutes) {
      deviceCodeStore.delete(key);
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  return NextResponse.json({
    deviceCode,
    userCode,
    verificationUrl: `${baseUrl}/device?code=${userCode}`,
  });
}
