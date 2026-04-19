import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { QuestStatus } from "@prisma/client";

const LEVEL_TITLES = [
  "Apprentice",
  "Craftsman",
  "Artisan",
  "Master",
  "Grand Master",
];

const GRADE_COLORS: Record<string, string> = {
  Master: "text-primary",
  Artisan: "text-secondary",
  Craftsman: "text-tertiary",
  Apprentice: "text-on-surface-variant",
};

const STATUS_LABEL: Record<QuestStatus, string> = {
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
};

function getLevelTitle(level: number) {
  return LEVEL_TITLES[Math.min(Math.floor(level / 10), LEVEL_TITLES.length - 1)];
}

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.user.findUnique({
    where: { authId: user.id },
    include: {
      userQuests: {
        include: {
          quest: { select: { id: true, title: true, category: true, xpReward: true, difficulty: true } },
          postQuestReport: {
            select: {
              mentorGrade: true,
              complexityAnalysis: true,
              refactoringTips: true,
              edgeCaseAnalysis: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
      },
      userSkills: {
        include: { skill: { select: { name: true, icon: true } } },
        orderBy: { xp: "desc" },
      },
    },
  });
  if (!profile) redirect("/login");

  const level = Math.floor(profile.totalXp / 500) + 1;
  const xpInCurrentLevel = profile.totalXp % 500;
  const xpToNextLevel = 500 - xpInCurrentLevel;
  const xpProgress = (xpInCurrentLevel / 500) * 100;
  const title = getLevelTitle(level);

  const completedQuests = profile.userQuests.filter(
    (uq) => uq.status === "COMPLETED"
  );
  const inProgressQuests = profile.userQuests.filter(
    (uq) => uq.status === "IN_PROGRESS"
  );

  const totalXpFromQuests = completedQuests.reduce(
    (sum, uq) => sum + uq.quest.xpReward,
    0
  );

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <section>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
          Your Progress
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Track your journey through the realm, {profile.username}.
        </p>
      </section>

      {/* Level & XP hero card */}
      <Card variant="high" glow="primary">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar + level */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-3xl border-2 border-primary/40">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
              {level}
            </div>
          </div>

          {/* XP progress */}
          <div className="flex-1 w-full">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl font-extrabold text-on-surface">
                {profile.username}
              </span>
              <span className="text-sm font-medium text-primary">
                Level {level} {title}
              </span>
            </div>
            <div className="text-sm text-on-surface-variant mb-3">
              {profile.totalXp.toLocaleString()} total XP
            </div>

            {/* XP bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-xs text-on-surface-variant shrink-0 font-mono">
                {xpInCurrentLevel} / 500 XP
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5">
              {xpToNextLevel} XP to reach Level {level + 1}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5 shadow-ambient-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Quests Completed
          </div>
          <div className="text-3xl font-extrabold text-secondary">
            {completedQuests.length}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-ambient-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-primary">
            {inProgressQuests.length}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-ambient-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Total XP
          </div>
          <div className="text-3xl font-extrabold text-on-surface">
            {profile.totalXp.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-ambient-sm">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Day Streak
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-extrabold text-error">
              {profile.streakCount}
            </div>
            <span className="text-sm text-on-surface-variant">days</span>
          </div>
        </div>
      </section>

      {/* Skills */}
      {profile.userSkills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-on-surface mb-4">
            Skill Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.userSkills.map((us) => {
              const skillXpProgress = Math.min((us.xp % 200) / 2, 100);
              return (
                <Card key={us.id} variant="default" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{us.skill.icon ?? "⚗️"}</span>
                    <div>
                      <div className="font-semibold text-on-surface text-sm">
                        {us.skill.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        Level {us.level} · {us.xp} XP
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary transition-all duration-500"
                      style={{ width: `${skillXpProgress}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Quest history */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">Quest History</h2>
          <Link
            href="/quests"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Find new quest
          </Link>
        </div>

        {profile.userQuests.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <p className="text-on-surface-variant mb-4">
              No quests started yet. The adventure awaits!
            </p>
            <Link
              href="/quests"
              className="text-primary font-semibold hover:underline"
            >
              Browse the Quest Board →
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.userQuests.map((uq) => (
              <Card key={uq.id} variant="default">
                {/* Quest header */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <Link
                      href={`/quests/${uq.quest.id}`}
                      className="font-bold text-on-surface hover:text-primary transition-colors"
                    >
                      {uq.quest.title}
                    </Link>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Started {uq.startedAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      {uq.completedAt &&
                        ` · Completed ${uq.completedAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {uq.status === "COMPLETED" && (
                      <span className="text-xs font-bold text-secondary">
                        +{uq.quest.xpReward} XP
                      </span>
                    )}
                    <Badge
                      variant={
                        uq.status === "COMPLETED"
                          ? "difficulty-cozy"
                          : uq.status === "IN_PROGRESS"
                          ? "xp"
                          : "default"
                      }
                    >
                      {STATUS_LABEL[uq.status]}
                    </Badge>
                  </div>
                </div>

                {/* Mentor report */}
                {uq.postQuestReport && (
                  <div className="mt-4 border-t border-outline-variant/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">
                        Mentor Report
                      </span>
                      {uq.postQuestReport.mentorGrade && (
                        <span
                          className={`text-sm font-bold ${
                            GRADE_COLORS[uq.postQuestReport.mentorGrade] ??
                            "text-on-surface"
                          }`}
                        >
                          {uq.postQuestReport.mentorGrade}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {uq.postQuestReport.complexityAnalysis && (
                        <div>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1 font-semibold">
                            Complexity
                          </p>
                          <p className="text-sm text-on-surface leading-relaxed">
                            {uq.postQuestReport.complexityAnalysis}
                          </p>
                        </div>
                      )}
                      {uq.postQuestReport.refactoringTips && (
                        <div>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1 font-semibold">
                            Refactoring Tips
                          </p>
                          <p className="text-sm text-on-surface leading-relaxed">
                            {uq.postQuestReport.refactoringTips}
                          </p>
                        </div>
                      )}
                      {uq.postQuestReport.edgeCaseAnalysis && (
                        <div>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1 font-semibold">
                            Edge Cases
                          </p>
                          <p className="text-sm text-on-surface leading-relaxed">
                            {uq.postQuestReport.edgeCaseAnalysis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Generating notice */}
                {uq.status === "COMPLETED" && !uq.postQuestReport && (
                  <div className="mt-4 border-t border-outline-variant/10 pt-4 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm animate-pulse">
                      auto_awesome
                    </span>
                    Mentor report is being generated…
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* XP summary note */}
      {completedQuests.length > 0 && (
        <div className="text-center text-sm text-on-surface-variant pb-4">
          You&apos;ve earned{" "}
          <span className="text-primary font-bold">
            {totalXpFromQuests.toLocaleString()} XP
          </span>{" "}
          across {completedQuests.length} completed quest
          {completedQuests.length !== 1 ? "s" : ""}.
        </div>
      )}
    </div>
  );
}
