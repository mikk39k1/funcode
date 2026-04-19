import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Button } from "@/components/ui/Button";
import type { Difficulty } from "@prisma/client";

function difficultyLabel(d: Difficulty) {
  if (d === "COZY") return "Cozy";
  if (d === "STANDARD") return "Standard";
  return "Challenging";
}

function categoryVariant(cat: string) {
  const lower = cat.toLowerCase();
  if (lower === "typescript" || lower === "ts") return "typescript" as const;
  if (lower === "react") return "react" as const;
  if (lower === "node" || lower === "nodejs") return "node" as const;
  return "default" as const;
}

interface QuestPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestPage({ params }: QuestPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const quest = await db.quest.findUnique({
    where: { id },
    include: {
      skill: true,
      _count: { select: { userQuests: true } },
    },
  });

  if (!quest) notFound();

  // Load user's quest record if logged in
  let userQuest: {
    status: string;
    completedAt: Date | null;
    postQuestReport: {
      mentorGrade: string | null;
      complexityAnalysis: string | null;
      refactoringTips: string | null;
      edgeCaseAnalysis: string | null;
    } | null;
  } | null = null;

  if (user) {
    const profile = await db.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });
    if (profile) {
      userQuest = await db.userQuest.findUnique({
        where: { userId_questId: { userId: profile.id, questId: id } },
        select: {
          status: true,
          completedAt: true,
          postQuestReport: {
            select: {
              mentorGrade: true,
              complexityAnalysis: true,
              refactoringTips: true,
              edgeCaseAnalysis: true,
            },
          },
        },
      });
    }
  }

  const isCompleted = userQuest?.status === "COMPLETED";
  const isInProgress = userQuest?.status === "IN_PROGRESS";

  const GRADE_COLORS: Record<string, string> = {
    Master: "text-primary",
    Artisan: "text-secondary",
    Craftsman: "text-tertiary",
    Apprentice: "text-on-surface-variant",
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
      {/* Back */}
      <Link
        href="/quests"
        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors w-fit"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Quest Board
      </Link>

      {/* Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={categoryVariant(quest.category)}>
            {quest.category}
          </Badge>
          <Badge
            variant={
              `difficulty-${quest.difficulty.toLowerCase()}` as
                | "difficulty-cozy"
                | "difficulty-standard"
                | "difficulty-challenging"
            }
          >
            {difficultyLabel(quest.difficulty)}
          </Badge>
          {quest.skill && (
            <Badge variant="default">
              {quest.skill.icon ?? "⚗️"} {quest.skill.name}
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="difficulty-cozy">✓ Completed</Badge>
          )}
          {isInProgress && (
            <Badge variant="xp">In Progress</Badge>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">
          {quest.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-on-surface-variant">
          <span className="text-primary font-bold">+{quest.xpReward} XP</span>
          <span>~{quest.estimatedMinutes}m</span>
          <span>{quest._count.userQuests} adventurers attempted</span>
        </div>
      </div>

      {/* Completed banner */}
      {isCompleted && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-secondary/20 p-2.5 rounded-full shrink-0">
            <span
              className="material-symbols-outlined text-secondary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div>
            <p className="font-bold text-secondary">Quest Completed!</p>
            <p className="text-sm text-on-surface-variant">
              {userQuest?.completedAt
                ? `Completed on ${userQuest.completedAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                : "You have already completed this quest."}
              {" · "}
              <Link
                href={`/progress`}
                className="text-primary hover:underline"
              >
                View your progress
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Lore card */}
      <Card variant="default" glow="tertiary">
        <h2 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-3">
          The Tale
        </h2>
        <p className="text-on-surface leading-relaxed text-lg">{quest.lore}</p>
      </Card>

      {/* Get started / status card */}
      <Card variant="high">
        {isCompleted ? (
          <>
            <h2 className="text-base font-bold text-on-surface mb-2">
              You&apos;ve conquered this quest
            </h2>
            <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
              This quest is in your archive. You can re-attempt it for fun, but XP
              has already been awarded.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/quests">
                <Button variant="primary" size="md">
                  Find Next Quest
                </Button>
              </Link>
              <Link href="/progress">
                <Button variant="secondary" size="md">
                  View Progress
                </Button>
              </Link>
            </div>
          </>
        ) : isInProgress ? (
          <>
            <h2 className="text-base font-bold text-on-surface mb-2">
              Quest in progress
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              You&apos;ve already fetched this quest. Open your terminal and run
              your tests to continue.
            </p>
            <CodeBlock code={`cd quest-${quest.id}-* && funcode test`} color="tertiary" />
          </>
        ) : (
          <>
            <h2 className="text-base font-bold text-on-surface mb-4">
              Begin this Quest
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Run the command below in your terminal. The CLI will download the
              quest template, install dependencies, and ask you to disable your
              AI assistants — the true FunCode experience.
            </p>
            <CodeBlock code={`funcode fetch ${quest.id}`} color="tertiary" />
            <div className="mt-6">
              <a href={`funcode://fetch/${quest.id}`} className="inline-flex">
                <Button variant="primary" size="md">
                  Open in CLI
                </Button>
              </a>
            </div>
          </>
        )}
      </Card>

      {/* Post-quest mentor report */}
      {isCompleted && userQuest?.postQuestReport && (
        <Card variant="default" glow="tertiary">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-tertiary uppercase tracking-wider">
              Post-Quest Mentor Report
            </h2>
            {userQuest.postQuestReport.mentorGrade && (
              <span
                className={`text-sm font-bold ${
                  GRADE_COLORS[userQuest.postQuestReport.mentorGrade] ??
                  "text-on-surface"
                }`}
              >
                {userQuest.postQuestReport.mentorGrade}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {userQuest.postQuestReport.complexityAnalysis && (
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2 font-semibold">
                  Complexity Analysis
                </p>
                <p className="text-sm text-on-surface leading-relaxed">
                  {userQuest.postQuestReport.complexityAnalysis}
                </p>
              </div>
            )}
            {userQuest.postQuestReport.refactoringTips && (
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2 font-semibold">
                  Refactoring Tips
                </p>
                <p className="text-sm text-on-surface leading-relaxed">
                  {userQuest.postQuestReport.refactoringTips}
                </p>
              </div>
            )}
            {userQuest.postQuestReport.edgeCaseAnalysis && (
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2 font-semibold">
                  Edge Cases to Consider
                </p>
                <p className="text-sm text-on-surface leading-relaxed">
                  {userQuest.postQuestReport.edgeCaseAnalysis}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Mentor report generating notice */}
      {isCompleted && !userQuest?.postQuestReport && (
        <Card variant="default">
          <div className="flex items-center gap-3 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-primary text-xl animate-pulse">
              auto_awesome
            </span>
            <p>
              Your Post-Quest Mentor Report is being generated by the AI mentor.
              Check back shortly or{" "}
              <Link href="/progress" className="text-primary hover:underline">
                view your progress page
              </Link>
              .
            </p>
          </div>
        </Card>
      )}

      {/* Rules */}
      {!isCompleted && (
        <Card variant="default">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
            Rules of the Realm
          </h2>
          <ul className="flex flex-col gap-2 text-on-surface-variant text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-primary">✦</span>
              No AI assistants — your craft, your mind
            </li>
            <li className="flex gap-2">
              <span className="text-primary">✦</span>
              Stay within the provided boilerplate in{" "}
              <code className="text-tertiary font-mono text-xs">
                src/index.ts
              </code>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">✦</span>
              Do not modify{" "}
              <code className="text-tertiary font-mono text-xs">tests/</code>{" "}
              or{" "}
              <code className="text-tertiary font-mono text-xs">
                cases.json
              </code>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
