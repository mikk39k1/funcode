import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import type { Difficulty, QuestStatus } from "@prisma/client";

type StatusFilter = "" | "not_started" | "IN_PROGRESS" | "COMPLETED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All Quests", value: "" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const DIFFICULTY_TABS: { label: string; value: "" | Difficulty }[] = [
  { label: "Any Difficulty", value: "" },
  { label: "Cozy", value: "COZY" },
  { label: "Standard", value: "STANDARD" },
  { label: "Challenging", value: "CHALLENGING" },
];

function categoryVariant(cat: string) {
  const lower = cat.toLowerCase();
  if (lower === "typescript" || lower === "ts") return "typescript" as const;
  if (lower === "react") return "react" as const;
  if (lower === "node" || lower === "nodejs") return "node" as const;
  return "default" as const;
}

function statusBadge(status: QuestStatus | undefined) {
  if (!status) return null;
  if (status === "COMPLETED")
    return <Badge variant="difficulty-cozy">✓ Completed</Badge>;
  if (status === "IN_PROGRESS")
    return <Badge variant="xp">In Progress</Badge>;
  return null;
}

interface QuestsPageProps {
  searchParams: Promise<{ status?: string; difficulty?: string }>;
}

export default async function QuestsPage({ searchParams }: QuestsPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.user.findUnique({
    where: { authId: user.id },
    select: { id: true, username: true },
  });
  if (!profile) redirect("/login");

  const params = await searchParams;
  const statusFilter = (params.status ?? "") as StatusFilter;
  const difficultyFilter = (params.difficulty ?? "") as "" | Difficulty;

  // Fetch all quests with optional difficulty filter
  const quests = await db.quest.findMany({
    where: difficultyFilter ? { difficulty: difficultyFilter } : undefined,
    orderBy: { createdAt: "asc" },
    include: { skill: { select: { name: true } } },
  });

  // Fetch user's quest statuses
  const userQuestRows = await db.userQuest.findMany({
    where: { userId: profile.id },
    select: { questId: true, status: true },
  });
  const userQuestMap = new Map(
    userQuestRows.map((uq) => [uq.questId, uq.status])
  );

  // Filter by status
  const filteredQuests = quests.filter((q) => {
    const userStatus = userQuestMap.get(q.id);
    if (statusFilter === "not_started") return !userStatus;
    if (statusFilter === "IN_PROGRESS") return userStatus === "IN_PROGRESS";
    if (statusFilter === "COMPLETED") return userStatus === "COMPLETED";
    return true;
  });

  const completedCount = userQuestRows.filter(
    (uq) => uq.status === "COMPLETED"
  ).length;
  const inProgressCount = userQuestRows.filter(
    (uq) => uq.status === "IN_PROGRESS"
  ).length;

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (difficultyFilter) p.set("difficulty", difficultyFilter);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    const str = p.toString();
    return str ? `/quests?${str}` : "/quests";
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
            Quest Board
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Every challenge is a step closer to mastery. Choose your next
            expedition.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          <div className="bg-surface-container-low rounded-lg px-4 py-3 text-center shadow-ambient-sm">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-bold text-secondary">
              {completedCount}
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg px-4 py-3 text-center shadow-ambient-sm">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl font-bold text-primary">
              {inProgressCount}
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg px-4 py-3 text-center shadow-ambient-sm">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Available
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {quests.length}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-3">
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildHref({ status: tab.value })}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-surface-container-high text-primary border-b-2 border-primary font-semibold"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_TABS.map((tab) => {
            const active = difficultyFilter === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildHref({ difficulty: tab.value })}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${
                    active
                      ? "bg-tertiary/20 text-tertiary border border-tertiary/30"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quest grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuests.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <p className="text-on-surface-variant text-lg">
              No quests match your filters.
            </p>
            <Link
              href="/quests"
              className="text-primary text-sm mt-2 inline-block hover:underline"
            >
              Clear filters
            </Link>
          </div>
        )}

        {filteredQuests.map((quest) => {
          const userStatus = userQuestMap.get(quest.id);
          const isCompleted = userStatus === "COMPLETED";

          return (
            <Link key={quest.id} href={`/quests/${quest.id}`}>
              <Card
                variant="default"
                glow={isCompleted ? "secondary" : "primary"}
                className={`h-full cursor-pointer transition-colors duration-200 ${
                  isCompleted
                    ? "hover:bg-surface-container opacity-80"
                    : "hover:bg-surface-container"
                }`}
              >
                {/* Meta row */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={categoryVariant(quest.category)}>
                      {quest.category}
                    </Badge>
                    <Badge
                      variant={
                        quest.difficulty === "COZY"
                          ? "difficulty-cozy"
                          : quest.difficulty === "CHALLENGING"
                          ? "difficulty-challenging"
                          : "difficulty-standard"
                      }
                    >
                      {quest.difficulty.charAt(0) +
                        quest.difficulty.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(userStatus)}
                    <Badge variant="xp">
                      <span className="text-primary text-xs">✦</span>+
                      {quest.xpReward} XP
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-on-surface mb-2 flex items-center gap-2">
                    {isCompleted && (
                      <span className="text-secondary text-base">✓</span>
                    )}
                    {quest.title}
                  </h2>
                  <p className="text-on-surface-variant leading-relaxed line-clamp-3">
                    {quest.lore}
                  </p>
                </div>

                {/* Fetch command or completed indicator */}
                <div className="mt-auto">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-sm text-secondary bg-secondary/10 rounded-lg px-4 py-2.5">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      Quest completed · {quest.estimatedMinutes}m est.
                    </div>
                  ) : (
                    <CodeBlock
                      code={`funcode fetch ${quest.id}`}
                      color={
                        categoryVariant(quest.category) === "react"
                          ? "secondary"
                          : "tertiary"
                      }
                    />
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
