import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCliToken } from "@/lib/cli-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const user = await verifyCliToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quest = await db.quest.findUnique({ where: { id } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  let downloadUrl = quest.templateUrl;

  // If the templateUrl is a Supabase Storage path (not a full URL), create a signed URL
  if (downloadUrl && !downloadUrl.startsWith("http")) {
    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from("quest-templates")
      .createSignedUrl(downloadUrl, 60 * 5); // 5 minute expiry

    if (error || !data) {
      return NextResponse.json(
        { error: "Could not generate download URL" },
        { status: 500 }
      );
    }
    downloadUrl = data.signedUrl;
  }

  // Upsert the UserQuest record to mark it as started
  await db.userQuest.upsert({
    where: { userId_questId: { userId: user.sub, questId: id } },
    create: { userId: user.sub, questId: id, status: "IN_PROGRESS" },
    update: {},
  });

  const slug = quest.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return NextResponse.json({
    id: quest.id,
    slug,
    title: quest.title,
    downloadUrl: downloadUrl ?? "",
    xpReward: quest.xpReward,
    estimatedMinutes: quest.estimatedMinutes,
    difficulty: quest.difficulty,
  });
}
