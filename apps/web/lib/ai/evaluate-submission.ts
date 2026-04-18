import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import AdmZip from "adm-zip";
import { db } from "@/lib/db";

const ReportSchema = z.object({
  complexityAnalysis: z
    .string()
    .describe(
      "Analysis of the time and space complexity of the solution. Be specific (e.g. O(n log n)) and explain why."
    ),
  refactoringTips: z
    .string()
    .describe(
      "Concrete suggestions to improve naming, readability, DRY principles, or code structure. Be encouraging and specific."
    ),
  edgeCaseAnalysis: z
    .string()
    .describe(
      "Edge cases the solution may not handle, even if the tests pass. Think about null/undefined, empty inputs, large inputs, unicode, etc."
    ),
  mentorGrade: z
    .enum(["Apprentice", "Craftsman", "Artisan", "Master"])
    .describe(
      "Overall craft rating based on code quality, not just correctness. Apprentice = functional but rough. Craftsman = clean and idiomatic. Artisan = elegant and efficient. Master = exemplary."
    ),
});

export type MentorReport = z.infer<typeof ReportSchema>;

interface EvaluateSubmissionInput {
  userQuestId: string;
  questTitle: string;
  questLore: string;
  codeBundle: string; // base64 zip of src/
}

export async function evaluateSubmission(
  input: EvaluateSubmissionInput
): Promise<void> {
  // Decode the zip and extract source code
  let sourceCode = "";

  try {
    const buffer = Buffer.from(input.codeBundle, "base64");
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const parts: string[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory && entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
        parts.push(`// File: ${entry.entryName}\n${entry.getData().toString("utf-8")}`);
      }
    }
    sourceCode = parts.join("\n\n---\n\n");
  } catch {
    sourceCode = "(could not decode submission bundle)";
  }

  const systemPrompt = `You are a senior software engineering mentor reviewing a completed coding quest submission.
You are warm, encouraging, and craft-focused. This is NOT about pass/fail (tests already passed).
Your goal is to help the developer grow and take pride in their code.

Quest: "${input.questTitle}"
Context: ${input.questLore}`;

  const userPrompt = `Here is the developer's solution:

\`\`\`typescript
${sourceCode.slice(0, 8000)}
\`\`\`

Please provide your mentor analysis as structured JSON.`;

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ReportSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    await db.postQuestReport.upsert({
      where: { userQuestId: input.userQuestId },
      create: {
        userQuestId: input.userQuestId,
        complexityAnalysis: object.complexityAnalysis,
        refactoringTips: object.refactoringTips,
        edgeCaseAnalysis: object.edgeCaseAnalysis,
        mentorGrade: object.mentorGrade,
        fullReportJson: object,
      },
      update: {
        complexityAnalysis: object.complexityAnalysis,
        refactoringTips: object.refactoringTips,
        edgeCaseAnalysis: object.edgeCaseAnalysis,
        mentorGrade: object.mentorGrade,
        fullReportJson: object,
      },
    });
  } catch (err) {
    console.error("[AI Evaluation] Failed to generate report:", err);
    // Store a fallback so the UI doesn't show nothing
    await db.postQuestReport.upsert({
      where: { userQuestId: input.userQuestId },
      create: {
        userQuestId: input.userQuestId,
        mentorGrade: "Craftsman",
        complexityAnalysis: "Analysis unavailable at this time.",
        refactoringTips: "Keep crafting — the hearth will have more to say soon.",
        edgeCaseAnalysis: null,
        fullReportJson: undefined,
      },
      update: {},
    });
  }
}
