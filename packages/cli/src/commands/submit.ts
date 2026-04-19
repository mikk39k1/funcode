import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import ora from "ora";
import { getApiUrl, requireAuth } from "../config.js";
import { testCommand } from "./test.js";
import { ui } from "../ui.js";

export async function submitCommand(): Promise<void> {
  const cwd = process.cwd();
  const apiUrl = getApiUrl();
  const token = requireAuth();

  // Verify we're in a quest directory
  const casesPath = path.join(cwd, "tests", "cases.json");
  if (!fs.existsSync(casesPath)) {
    ui.error_msg(
      'No "tests/cases.json" found. Run `funcode submit` from inside a quest directory.'
    );
    process.exit(1);
  }

  // Derive quest id from the directory name (quest-{id}-{slug})
  // The id itself contains a dash (e.g. "quest-001"), so capture two segments.
  const dirName = path.basename(cwd);
  const match = dirName.match(/^quest-([a-z]+-\d+)/);
  if (!match) {
    ui.error_msg(
      `Could not parse quest id from directory name "${dirName}".`
    );
    process.exit(1);
  }
  const questId = match[1];

  ui.banner();
  console.log(ui.info("  Running final test pass before submission...\n"));

  // Run tests first
  const result = await testCommand();

  if (result.failed > 0) {
    ui.error_msg(
      `${result.failed} test${result.failed !== 1 ? "s" : ""} still failing. Fix them before submitting!`
    );
    process.exit(1);
  }

  console.log("\n" + ui.success("  All tests green! Preparing submission...\n"));

  // Bundle src/ into a zip
  const bundleSpinner = ora({
    text: ui.muted("  Bundling your solution..."),
    spinner: "dots",
  }).start();

  let zipBase64: string;

  try {
    const zip = new AdmZip();
    const srcDir = path.join(cwd, "src");

    if (!fs.existsSync(srcDir)) {
      bundleSpinner.fail();
      ui.error_msg('No "src/" directory found.');
      process.exit(1);
    }

    addFolderToZip(zip, srcDir, "src");
    zipBase64 = zip.toBuffer().toString("base64");
    bundleSpinner.succeed(ui.success("  Solution bundled."));
  } catch (err) {
    bundleSpinner.fail();
    ui.error_msg(`Bundling failed: ${err}`);
    process.exit(1);
  }

  // POST to backend
  const submitSpinner = ora({
    text: ui.muted("  Submitting to the server..."),
    spinner: "moon",
  }).start();

  try {
    const res = await fetch(`${apiUrl}/api/cli/quests/${questId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codeBundle: zipBase64,
        testResults: result,
      }),
    });

    if (res.status === 401) {
      submitSpinner.fail();
      ui.error_msg("Session expired. Run `funcode login` again.");
      process.exit(1);
    }

    if (!res.ok) {
      submitSpinner.fail();
      const body = await res.text();
      ui.error_msg(`Server error: ${res.statusText}\n  ${body}`);
      process.exit(1);
    }

    const data = (await res.json()) as {
      xpAwarded: number;
      totalXp: number;
      newLevel?: number;
      message?: string;
    };

    submitSpinner.succeed(ui.success("  Submission accepted!"));

    console.log("");
    console.log(ui.primary(ui.bold("  ✨ Quest Complete!")));
    console.log("");
    ui.success_msg(
      `You earned ${ui.primary(ui.bold("+" + data.xpAwarded + " XP"))} — Total: ${ui.primary(String(data.totalXp) + " XP")}`
    );

    if (data.newLevel) {
      console.log("");
      console.log(ui.primary(ui.bold(`  🎉 Level Up! You are now Level ${data.newLevel}!`)));
    }

    if (data.message) {
      console.log("");
      ui.info_msg(data.message);
    }

    console.log("");
    ui.info_msg(
      "Your " +
        ui.primary("Post-Quest Mentor Report") +
        " is being generated..."
    );
    ui.info_msg(
      "View it on your profile: " + ui.primary(`${apiUrl}/profile`)
    );
    console.log("");
  } catch (err) {
    submitSpinner.fail();
    ui.error_msg(`Could not reach ${apiUrl}.\n  ${err}`);
    process.exit(1);
  }
}

function addFolderToZip(zip: AdmZip, folderPath: string, zipPath: string): void {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    const entryZipPath = path.join(zipPath, entry.name);
    if (entry.isDirectory()) {
      addFolderToZip(zip, fullPath, entryZipPath);
    } else {
      zip.addFile(entryZipPath, fs.readFileSync(fullPath));
    }
  }
}
