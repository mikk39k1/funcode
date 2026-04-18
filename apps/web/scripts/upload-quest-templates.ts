/**
 * Creates quest template zip files and uploads them to Supabase Storage.
 *
 * Run from apps/web:
 *   npx tsx scripts/upload-quest-templates.ts
 */
import AdmZip from "adm-zip";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// ---------------------------------------------------------------------------
// Quest template definitions
// Each quest needs: id, slug, title, description, inputType, outputType,
// and the test cases that go in cases.json
// ---------------------------------------------------------------------------
const QUESTS = [
  {
    id: "quest-001",
    slug: "the-string-alchemist",
    title: "The String Alchemist",
    description: "Convert a camelCase or PascalCase string into a human-readable sentence.",
    inputDescription: "A camelCase or PascalCase string",
    outputDescription: "A lowercase sentence with spaces between words",
    functionSignature: "export function solution(input: string): string",
    stub: `export function solution(input: string): string {
  // ✨ Your implementation goes here
  throw new Error("Not yet implemented");
}`,
    cases: [
      { description: "camelCase → sentence", input: "helloWorld", expectedOutput: "hello world", points: 10 },
      { description: "PascalCase → sentence", input: "HelloWorld", expectedOutput: "hello world", points: 10 },
      { description: "single word", input: "hello", expectedOutput: "hello", points: 5 },
      { description: "multiple words", input: "theStringAlchemist", expectedOutput: "the string alchemist", points: 10 },
      { description: "acronym-like word", input: "parseHTMLString", expectedOutput: "parse h t m l string", points: 15 },
    ],
  },
  {
    id: "quest-004",
    slug: "the-cartographers-dilemma",
    title: "The Cartographer's Dilemma",
    description: "Flatten nested arrays of visited regions per adventurer into a single sorted, deduplicated list.",
    inputDescription: "An array of objects, each with a `regions: string[]` property",
    outputDescription: "A sorted array of unique region names",
    functionSignature: "export function solution(input: Array<{ regions: string[] }>): string[]",
    stub: `export function solution(input: Array<{ regions: string[] }>): string[] {
  // ✨ Your implementation goes here
  throw new Error("Not yet implemented");
}`,
    cases: [
      {
        description: "basic deduplication",
        input: [{ regions: ["Moors", "Forest"] }, { regions: ["Forest", "Coast"] }],
        expectedOutput: ["Coast", "Forest", "Moors"],
        points: 10,
      },
      {
        description: "empty adventurer list",
        input: [],
        expectedOutput: [],
        points: 5,
      },
      {
        description: "adventurer with no regions",
        input: [{ regions: [] }, { regions: ["Coast"] }],
        expectedOutput: ["Coast"],
        points: 5,
      },
      {
        description: "all duplicates",
        input: [{ regions: ["Forest"] }, { regions: ["Forest"] }],
        expectedOutput: ["Forest"],
        points: 10,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build zip buffer for a quest
// ---------------------------------------------------------------------------
function buildQuestZip(quest: typeof QUESTS[0]): Buffer {
  const zip = new AdmZip();

  const readme = `# 🏡 Quest: ${quest.title}

> *The hearth glows warmly as you open the scroll...*

---

## The Mission

${quest.description}

## Rules of the Realm

1. **No AI assistants** — Your own ingenuity is the most powerful tool.
2. **Stay in \`src/index.ts\`** — That is your canvas.
3. **Do not modify \`tests/\`** — The test oracle is sacred.

## Starting the Quest

\`\`\`bash
funcode fetch ${quest.id}
cd quest-${quest.id}-${quest.slug}
npm install
\`\`\`

## Running Tests

\`\`\`bash
funcode test
\`\`\`

## Submitting

\`\`\`bash
funcode submit
\`\`\`
`;

  const packageJson = JSON.stringify({
    name: `quest-${quest.id}-${quest.slug}`,
    version: "0.1.0",
    private: true,
    scripts: { test: "vitest run", "test:watch": "vitest" },
    devDependencies: { vitest: "^2", typescript: "^5", "@types/node": "^20" },
  }, null, 2);

  const tsconfig = JSON.stringify({
    compilerOptions: {
      target: "ES2020", module: "ESNext", moduleResolution: "bundler",
      strict: true, esModuleInterop: true, skipLibCheck: true,
      resolveJsonModule: true, noEmit: true,
    },
    include: ["src/**/*", "tests/**/*"],
  }, null, 2);

  const vitestConfig = `import { defineConfig } from "vitest/config";
export default defineConfig({ test: { globals: true, environment: "node" } });
`;

  const runner = `import { describe, it, expect } from "vitest";
import cases from "./cases.json";
import { solution } from "../src/index";

describe("Quest", () => {
  cases.forEach(({ description, input, expectedOutput }) => {
    it(description, () => {
      expect(solution(input as any)).toEqual(expectedOutput);
    });
  });
});
`;

  zip.addFile("README.md", Buffer.from(readme));
  zip.addFile("package.json", Buffer.from(packageJson));
  zip.addFile("tsconfig.json", Buffer.from(tsconfig));
  zip.addFile("vitest.config.ts", Buffer.from(vitestConfig));
  zip.addFile("src/index.ts", Buffer.from(quest.stub));
  zip.addFile("tests/runner.test.ts", Buffer.from(runner));
  zip.addFile("tests/cases.json", Buffer.from(JSON.stringify(quest.cases, null, 2)));

  return zip.toBuffer();
}

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------
async function uploadQuest(quest: typeof QUESTS[0]) {
  const fileName = `${quest.id}-${quest.slug}.zip`;
  const buffer = buildQuestZip(quest);

  const { error } = await supabase.storage
    .from("quest-templates")
    .upload(fileName, buffer, {
      contentType: "application/zip",
      upsert: true,
    });

  if (error) {
    console.error(`  ✗ ${fileName}: ${error.message}`);
  } else {
    console.log(`  ✓ Uploaded ${fileName}`);
  }
}

async function main() {
  console.log("🗂️  Uploading quest templates to Supabase Storage...\n");

  // Check the bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketNames = buckets?.map((b) => b.name) ?? [];

  if (!bucketNames.includes("quest-templates")) {
    console.error(
      "✗ Bucket 'quest-templates' not found.\n" +
      "  Create it in Supabase Dashboard → Storage → New Bucket\n" +
      "  Name: quest-templates | Public: false"
    );
    process.exit(1);
  }

  if (!bucketNames.includes("submissions")) {
    console.log(
      "⚠ Bucket 'submissions' not found — skipping (create it for submit to work)."
    );
  }

  for (const quest of QUESTS) {
    await uploadQuest(quest);
  }

  console.log("\n✨ Done! Run `npm run db:seed` next to populate quest records.");
}

main().catch((e) => { console.error(e); process.exit(1); });
