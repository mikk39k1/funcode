import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------------------------------------------------------
  // Skills
  // ---------------------------------------------------------------------------
  const skillTS = await db.skill.upsert({
    where: { id: "skill-typescript" },
    update: {},
    create: {
      id: "skill-typescript",
      name: "TypeScript Mastery",
      description: "Type-safe code, generics, utility types, and idiomatic TS patterns.",
      icon: "🔷",
    },
  });

  const skillReact = await db.skill.upsert({
    where: { id: "skill-react" },
    update: {},
    create: {
      id: "skill-react",
      name: "React Craft",
      description: "Component design, hooks, performance, and accessibility.",
      icon: "⚛️",
    },
  });

  const skillDataWrangling = await db.skill.upsert({
    where: { id: "skill-data" },
    update: {},
    create: {
      id: "skill-data",
      name: "Data Wrangling",
      description: "Transforming, filtering, and shaping data structures with elegance.",
      icon: "🗂️",
    },
  });

  const skillNodeCraft = await db.skill.upsert({
    where: { id: "skill-node" },
    update: {},
    create: {
      id: "skill-node",
      name: "Node.js Craft",
      description: "File I/O, streams, async patterns, and CLI tooling.",
      icon: "🟩",
    },
  });

  console.log("  ✓ Skills created");

  // ---------------------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------------------
  await db.quest.upsert({
    where: { id: "quest-001" },
    update: {},
    create: {
      id: "quest-001",
      title: "The String Alchemist",
      lore: "Deep in the Archives of the Hearthside, the ancient scribes have left behind a series of string transformations. The enchantment requires you to implement a function that converts any camelCase or PascalCase string into a human-readable sentence. The kingdom's documentation system depends on it.",
      category: "TypeScript",
      skillId: skillTS.id,
      xpReward: 150,
      difficulty: "COZY",
      estimatedMinutes: 30,
      templateUrl: "quest-001-the-string-alchemist.zip",
    },
  });

  await db.quest.upsert({
    where: { id: "quest-002" },
    update: {},
    create: {
      id: "quest-002",
      title: "The Legacy Form Refactor",
      lore: "The ancient validation scrolls have grown fragile and convoluted. Delve into the legacy user forms and rewrite them using the modern Zod enchantments to restore stability to the kingdom. Each field must be validated with care — the realm's adventurers depend on clean data.",
      category: "TypeScript",
      skillId: skillTS.id,
      xpReward: 250,
      difficulty: "STANDARD",
      estimatedMinutes: 60,
      templateUrl: "quest-002-the-legacy-form-refactor.zip",
    },
  });

  await db.quest.upsert({
    where: { id: "quest-003" },
    update: {},
    create: {
      id: "quest-003",
      title: "Memory Leak Mystery",
      lore: "A dark energy is draining the performance of the Dashboard realm. Equip your profiler tools, track down the rogue useEffect hooks, and banish the memory leaks. The court's alchemists believe the culprit lies in a subscription that is never cleaned up.",
      category: "React",
      skillId: skillReact.id,
      xpReward: 200,
      difficulty: "STANDARD",
      estimatedMinutes: 45,
      templateUrl: "quest-003-memory-leak-mystery.zip",
    },
  });

  await db.quest.upsert({
    where: { id: "quest-004" },
    update: {},
    create: {
      id: "quest-004",
      title: "The Cartographer's Dilemma",
      lore: "The Royal Cartographer has a list of adventurers, each with a list of visited regions. She needs a single function that flattens the nested data into a deduplicated list of all unique regions, sorted alphabetically. Speed is of the essence — the census must be filed by dawn.",
      category: "TypeScript",
      skillId: skillDataWrangling.id,
      xpReward: 175,
      difficulty: "COZY",
      estimatedMinutes: 30,
      templateUrl: "quest-004-the-cartographers-dilemma.zip",
    },
  });

  await db.quest.upsert({
    where: { id: "quest-005" },
    update: {},
    create: {
      id: "quest-005",
      title: "The Pipeline Builder",
      lore: "The order of enchanters has a long tradition: every piece of data must pass through a series of transformations before it reaches the Grand Registry. Your task is to implement a compose function that chains an arbitrary number of single-argument functions from right to left, fully type-safe.",
      category: "TypeScript",
      skillId: skillTS.id,
      xpReward: 300,
      difficulty: "CHALLENGING",
      estimatedMinutes: 90,
      templateUrl: "quest-005-the-pipeline-builder.zip",
    },
  });

  await db.quest.upsert({
    where: { id: "quest-006" },
    update: {},
    create: {
      id: "quest-006",
      title: "The File Watcher",
      lore: "The Hall of Records requires a guardian — a small Node.js process that watches a directory for changes and logs every new, modified, or deleted file with a human-readable timestamp. The scribes have left you a stub; the enchantment must be completed.",
      category: "Node.js",
      skillId: skillNodeCraft.id,
      xpReward: 200,
      difficulty: "STANDARD",
      estimatedMinutes: 45,
      templateUrl: "quest-006-the-file-watcher.zip",
    },
  });

  console.log("  ✓ Quests created");
  console.log("\n✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
