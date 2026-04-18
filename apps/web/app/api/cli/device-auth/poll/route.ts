import { NextRequest, NextResponse } from "next/server";
import { deviceCodeStore } from "../init/route";

export async function GET(request: NextRequest) {
  const deviceCode = request.nextUrl.searchParams.get("deviceCode");

  if (!deviceCode) {
    return NextResponse.json({ error: "Missing deviceCode" }, { status: 400 });
  }

  const entry = deviceCodeStore.get(deviceCode);

  if (!entry) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // Code not yet confirmed
  if (!entry.token) {
    return NextResponse.json({ status: "pending" }, { status: 202 });
  }

  // Confirmed — return token and clean up
  const { token, username } = entry;
  deviceCodeStore.delete(deviceCode);

  return NextResponse.json({ token, username });
}
