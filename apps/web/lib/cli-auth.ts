import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.CLI_AUTH_SECRET ?? "dev-secret"
);

export interface CliJwtPayload {
  sub: string;      // Prisma User.id
  authId: string;   // Supabase auth user id
  username: string;
}

export async function verifyCliToken(
  request: NextRequest
): Promise<CliJwtPayload | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as CliJwtPayload;
  } catch {
    return null;
  }
}
