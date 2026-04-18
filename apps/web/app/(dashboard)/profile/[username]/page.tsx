import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { QuestStatus } from "@prisma/client";

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

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username },
    include: {
      userQuests: {
        include: {
          quest: true,
          postQuestReport: true,
        },
        orderBy: { startedAt: "desc" },
      },
      userSkills: {
        include: { skill: true },
        orderBy: { xp: "desc" },
      },
    },
  });

  if (!user) notFound();

  const level = Math.floor(user.totalXp / 500) + 1;
  const xpToNextLevel = 500 - (user.totalXp % 500);
  const xpProgress = ((user.totalXp % 500) / 500) * 100;

  const completedQuests = user.userQuests.filter(
    (uq) => uq.status === "COMPLETED"
  );

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
      {/* Profile header */}
      <section className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
            {username}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Level {level} • {user.totalXp.toLocaleString()} XP •{" "}
            {completedQuests.length} quests completed
          </p>

          {/* XP progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-secondary-container/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs text-on-surface-variant shrink-0">
              {xpToNextLevel} XP to Level {level + 1}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-surface-container-low rounded-lg p-4 flex items-center gap-3 shadow-ambient-sm">
          <span className="material-symbols-outlined text-secondary text-xl">
            local_fire_department
          </span>
          <div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider">
              Streak
            </div>
            <div className="text-lg font-bold text-secondary">
              {user.streakCount} days
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      {user.userSkills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-4">
            Skill Tree
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.userSkills.map((us) => (
              <Card key={us.id} variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{us.skill.icon ?? "⚗️"}</span>
                  <span className="text-sm font-semibold text-on-surface">
                    {us.skill.name}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant mb-2">
                  Level {us.level} • {us.xp} XP
                </div>
                <div className="h-1.5 rounded-full bg-secondary-container/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{ width: `${Math.min((us.xp % 200) / 2, 100)}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quest history */}
      <section>
        <h2 className="text-lg font-bold text-on-surface mb-4">
          Quest History
        </h2>
        <div className="flex flex-col gap-4">
          {user.userQuests.length === 0 && (
            <p className="text-on-surface-variant text-sm">
              No quests started yet.
            </p>
          )}

          {user.userQuests.map((uq) => (
            <Card key={uq.id} variant="default" className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-on-surface">{uq.quest.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {uq.startedAt.toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    uq.status === "COMPLETED"
                      ? "difficulty-cozy"
                      : uq.status === "IN_PROGRESS"
                      ? "default"
                      : "xp"
                  }
                >
                  {STATUS_LABEL[uq.status]}
                </Badge>
              </div>

              {/* Post-quest mentor report */}
              {uq.postQuestReport && (
                <div className="mt-4 border-t border-outline-variant/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
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

                  {uq.postQuestReport.complexityAnalysis && (
                    <div className="mb-3">
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Complexity
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {uq.postQuestReport.complexityAnalysis}
                      </p>
                    </div>
                  )}

                  {uq.postQuestReport.refactoringTips && (
                    <div className="mb-3">
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Refactoring Tips
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {uq.postQuestReport.refactoringTips}
                      </p>
                    </div>
                  )}

                  {uq.postQuestReport.edgeCaseAnalysis && (
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">
                        Edge Cases
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {uq.postQuestReport.edgeCaseAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
