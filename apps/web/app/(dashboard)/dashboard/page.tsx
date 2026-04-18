import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import type { Difficulty } from "@prisma/client";

const FILTER_TABS = [
  { label: "All Quests", value: "" },
  { label: "Coffee Break – 30m", value: "30" },
  { label: "Deep Focus – 2h", value: "120" },
  { label: "Boss Fights – 4h+", value: "240" },
];

function categoryVariant(cat: string) {
  const lower = cat.toLowerCase();
  if (lower === "typescript" || lower === "ts") return "typescript" as const;
  if (lower === "react") return "react" as const;
  if (lower === "node" || lower === "nodejs") return "node" as const;
  return "default" as const;
}

function difficultyVariant(d: Difficulty) {
  if (d === "COZY") return "difficulty-cozy" as const;
  if (d === "CHALLENGING") return "difficulty-challenging" as const;
  return "difficulty-standard" as const;
}

interface DashboardPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.user.findUnique({
    where: { authId: user.id },
    select: { username: true, totalXp: true, streakCount: true },
  });
  if (!profile) redirect("/login");

  const params = await searchParams;
  const maxMinutes = params.filter ? parseInt(params.filter) : undefined;

  const quests = await db.quest.findMany({
    where: maxMinutes ? { estimatedMinutes: { lte: maxMinutes } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { skill: { select: { name: true } } },
    take: 20,
  });

  const streakWeeks = Math.floor(profile.streakCount / 7);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
            Available Quests
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            The glowing embers reveal new paths. Choose your challenge for the day.
          </p>
        </div>

        {/* Streak card */}
        <div className="bg-surface-container-low rounded-lg p-4 flex items-center gap-4 shadow-ambient-sm">
          <div className="bg-secondary/20 p-3 rounded-full">
            <span className="material-symbols-outlined text-secondary text-xl">
              local_fire_department
            </span>
          </div>
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Current Streak
            </div>
            <div className="text-2xl font-bold text-secondary">
              {streakWeeks > 0 ? `${streakWeeks} Weeks` : `${profile.streakCount} Days`}
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="flex flex-wrap gap-3">
        {FILTER_TABS.map((tab) => {
          const active = (params.filter ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `?filter=${tab.value}` : "/dashboard"}
              className={`
                px-6 py-2.5 rounded-full text-sm font-medium transition-colors
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
      </section>

      {/* Quest grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quests.length === 0 && (
          <p className="text-on-surface-variant col-span-2 text-center py-12">
            No quests found. More are brewing...
          </p>
        )}

        {quests.map((quest) => (
          <Link key={quest.id} href={`/dashboard/quests/${quest.id}`}>
            <Card variant="default" glow="primary" className="h-full cursor-pointer hover:bg-surface-container transition-colors duration-200">
              {/* Meta row */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3">
                  <Badge variant={categoryVariant(quest.category)}>
                    {quest.category}
                  </Badge>
                  <Badge variant="default">
                    {quest.estimatedMinutes}m Est.
                  </Badge>
                </div>
                <Badge variant="xp">
                  <span className="text-primary text-xs">✦</span>
                  +{quest.xpReward} XP
                </Badge>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-on-surface mb-2">
                  {quest.title}
                </h2>
                <p className="text-on-surface-variant leading-relaxed line-clamp-3">
                  {quest.lore}
                </p>
              </div>

              {/* Fetch command */}
              <div className="mt-auto">
                <CodeBlock
                  code={`funcode fetch ${quest.id}`}
                  color={categoryVariant(quest.category) === "react" ? "secondary" : "tertiary"}
                />
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
