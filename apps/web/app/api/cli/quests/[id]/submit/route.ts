import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCliToken } from "@/lib/cli-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { evaluateSubmission } from "@/lib/ai/evaluate-submission";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: questId } = await params;

  const claimedUser = await verifyCliToken(request);
  if (!claimedUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quest = await db.quest.findUnique({ where: { id: questId } });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    codeBundle: string; // base64 zip
    testResults: { passed: number; failed: number; total: number };
  };

  if (body.testResults.failed > 0) {
    return NextResponse.json(
      { error: "Submission rejected: tests are not all passing" },
      { status: 422 }
    );
  }

  // Upload code bundle to Supabase Storage
  const supabase = await createSupabaseAdminClient();
  const bundleBuffer = Buffer.from(body.codeBundle, "base64");
  const storagePath = `submissions/${claimedUser.sub}/${questId}-${Date.now()}.zip`;

  const { error: uploadError } = await supabase.storage
    .from("submissions")
    .upload(storagePath, bundleBuffer, { contentType: "application/zip" });

  const submittedCodeUrl = uploadError ? undefined : storagePath;

  // Update UserQuest to COMPLETED
  const userQuest = await db.userQuest.upsert({
    where: {
      userId_questId: { userId: claimedUser.sub, questId },
    },
    create: {
      userId: claimedUser.sub,
      questId,
      status: "COMPLETED",
      completedAt: new Date(),
      submittedCodeUrl,
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
      submittedCodeUrl,
    },
  });

  // Award XP
  const updatedUser = await db.user.update({
    where: { id: claimedUser.sub },
    data: { totalXp: { increment: quest.xpReward } },
    select: { totalXp: true },
  });

  const prevLevel = Math.floor((updatedUser.totalXp - quest.xpReward) / 500) + 1;
  const newLevel = Math.floor(updatedUser.totalXp / 500) + 1;

  // Trigger AI evaluation asynchronously (fire-and-forget)
  evaluateSubmission({
    userQuestId: userQuest.id,
    questTitle: quest.title,
    questLore: quest.lore,
    codeBundle: body.codeBundle,
  }).catch(console.error);

  return NextResponse.json({
    xpAwarded: quest.xpReward,
    totalXp: updatedUser.totalXp,
    newLevel: newLevel > prevLevel ? newLevel : undefined,
    message: "Your Post-Quest Mentor Report is being generated. Check your profile shortly.",
  });
}
