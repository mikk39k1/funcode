import { notFound } from "next/navigation";
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

interface QuestPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestPage({ params }: QuestPageProps) {
  const { id } = await params;

  const quest = await db.quest.findUnique({
    where: { id },
    include: {
      skill: true,
      _count: { select: { userQuests: true } },
    },
  });

  if (!quest) notFound();

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={quest.category.toLowerCase() === "react" ? "react" : "typescript"}>
            {quest.category}
          </Badge>
          <Badge variant={`difficulty-${quest.difficulty.toLowerCase()}` as "difficulty-cozy" | "difficulty-standard" | "difficulty-challenging"}>
            {difficultyLabel(quest.difficulty)}
          </Badge>
          {quest.skill && (
            <Badge variant="default">{quest.skill.icon ?? "⚗️"} {quest.skill.name}</Badge>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">
          {quest.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="text-primary font-bold">+{quest.xpReward} XP</span>
          </span>
          <span>~{quest.estimatedMinutes}m</span>
          <span>{quest._count.userQuests} adventurers attempted</span>
        </div>
      </div>

      {/* Lore card */}
      <Card variant="default" glow="tertiary">
        <h2 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-3">
          The Tale
        </h2>
        <p className="text-on-surface leading-relaxed text-lg">{quest.lore}</p>
      </Card>

      {/* Get started */}
      <Card variant="high">
        <h2 className="text-base font-bold text-on-surface mb-4">
          Begin this Quest
        </h2>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
          Run the command below in your terminal. The CLI will download the quest template,
          install dependencies, and ask you to disable your AI assistants — the true FunCode experience.
        </p>

        <CodeBlock code={`funcode fetch ${quest.id}`} color="tertiary" />

        <div className="mt-6 flex gap-3">
          <a
            href={`funcode://fetch/${quest.id}`}
            className="inline-flex"
          >
            <Button variant="primary" size="md">
              Open in CLI
            </Button>
          </a>
          <Button variant="secondary" size="md" disabled>
            Already started
          </Button>
        </div>
      </Card>

      {/* Rules */}
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
            Stay within the provided boilerplate in <code className="text-tertiary font-mono text-xs">src/index.ts</code>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✦</span>
            Do not modify <code className="text-tertiary font-mono text-xs">tests/</code> or <code className="text-tertiary font-mono text-xs">cases.json</code>
          </li>
        </ul>
      </Card>
    </div>
  );
}
