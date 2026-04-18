"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { deviceCodeStore } from "@/app/api/cli/device-auth/init/route";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.CLI_AUTH_SECRET ?? "dev-secret"
);

export async function confirmDeviceCode(formData: FormData) {
  const userCode = formData.get("userCode") as string;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/device?code=${userCode}`);
  }

  const profile = await db.user.findUnique({ where: { authId: user.id } });
  if (!profile) redirect("/login");

  // Find the matching device code entry by userCode
  let deviceCodeKey: string | undefined;
  for (const [key, val] of deviceCodeStore.entries()) {
    if (val.userCode === userCode.toUpperCase()) {
      deviceCodeKey = key;
      break;
    }
  }

  if (!deviceCodeKey) {
    redirect(`/device?code=${userCode}&error=invalid`);
  }

  // Generate a signed JWT for the CLI
  const token = await new SignJWT({
    sub: profile.id,
    authId: user.id,
    username: profile.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);

  // Write the token into the device code store so the CLI poll picks it up
  const entry = deviceCodeStore.get(deviceCodeKey)!;
  deviceCodeStore.set(deviceCodeKey, {
    ...entry,
    token,
    username: profile.username,
  });

  redirect(`/device?code=${userCode}&success=true`);
}
