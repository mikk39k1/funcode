import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";
import { confirm } from "@inquirer/prompts";
import ora from "ora";
import { getApiUrl, requireAuth } from "../config.js";
import { ui } from "../ui.js";

export async function fetchCommand(questId: string): Promise<void> {
  const apiUrl = getApiUrl();
  const token = requireAuth();

  ui.banner();
  console.log(ui.info(`  Fetching quest ${ui.primary(ui.bold(questId))}...\n`));

  const spinner = ora({
    text: ui.muted("  Contacting the server..."),
    spinner: "dots",
  }).start();

  let questMeta: {
    id: string;
    slug: string;
    title: string;
    downloadUrl: string;
    xpReward: number;
    estimatedMinutes: number;
    difficulty: string;
  };

  try {
    const res = await fetch(`${apiUrl}/api/cli/quests/${questId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      spinner.fail();
      ui.error_msg("Session expired. Run `funcode login` again.");
      process.exit(1);
    }

    if (res.status === 404) {
      spinner.fail();
      ui.error_msg(`Quest "${questId}" not found.`);
      process.exit(1);
    }

    if (!res.ok) {
      spinner.fail();
      ui.error_msg(`Server error: ${res.statusText}`);
      process.exit(1);
    }

    questMeta = await res.json() as typeof questMeta;
    spinner.succeed(ui.success("  Quest details loaded."));
  } catch (err) {
    spinner.fail();
    ui.error_msg(`Could not reach ${apiUrl}.\n  ${err}`);
    process.exit(1);
  }

  const folderName = `quest-${questMeta.id}-${questMeta.slug}`;
  const destPath = path.resolve(process.cwd(), folderName);

  if (fs.existsSync(destPath)) {
    ui.error_msg(`Folder "${folderName}" already exists. Remove it first.`);
    process.exit(1);
  }

  // Show quest summary
  console.log("");
  console.log("  " + ui.primary(ui.bold("⚔  " + questMeta.title)));
  console.log(
    "  " +
      ui.muted("Difficulty: ") +
      ui.info(questMeta.difficulty) +
      "  " +
      ui.muted("Time: ~") +
      ui.info(String(questMeta.estimatedMinutes) + "m") +
      "  " +
      ui.muted("Reward: ") +
      ui.success("+" + questMeta.xpReward + " XP")
  );
  console.log("");

  // Honor-system pledge
  const proceed = await confirm({
    message:
      "Ready to start? (Please disable your AI assistants to get the true experience)",
    default: true,
  });

  if (!proceed) {
    ui.info_msg("No worries — come back when you're ready. 🏡");
    process.exit(0);
  }

  console.log("");

  // Download zip
  const dlSpinner = ora({
    text: ui.muted("  Downloading quest template..."),
    spinner: "dots",
  }).start();

  let zipBuffer: Buffer;

  try {
    const res = await fetch(questMeta.downloadUrl);
    if (!res.ok) throw new Error(res.statusText);
    const arrayBuf = await res.arrayBuffer();
    zipBuffer = Buffer.from(arrayBuf);
    dlSpinner.succeed(ui.success("  Template downloaded."));
  } catch (err) {
    dlSpinner.fail();
    ui.error_msg(`Download failed: ${err}`);
    process.exit(1);
  }

  // Unzip
  const unzipSpinner = ora({
    text: ui.muted("  Unpacking quest files..."),
    spinner: "dots",
  }).start();

  try {
    const zip = new AdmZip(zipBuffer);
    zip.extractAllTo(destPath, true);
    unzipSpinner.succeed(ui.success("  Files extracted."));
  } catch (err) {
    unzipSpinner.fail();
    ui.error_msg(`Extraction failed: ${err}`);
    fs.rmSync(destPath, { recursive: true, force: true });
    process.exit(1);
  }

  // npm install
  const installSpinner = ora({
    text: ui.muted("  Installing dependencies..."),
    spinner: "dots",
  }).start();

  try {
    execSync("npm install", { cwd: destPath, stdio: "pipe" });
    installSpinner.succeed(ui.success("  Dependencies installed."));
  } catch (err) {
    installSpinner.fail();
    ui.error_msg(`npm install failed: ${err}`);
    process.exit(1);
  }

  console.log("");
  ui.success_msg("Quest ready! " + ui.primary(ui.bold(`cd ${folderName}`)));
  console.log("");
  ui.info_msg("Run tests:  " + ui.primary("`funcode test`"));
  ui.info_msg("Submit:     " + ui.primary("`funcode submit`"));
  console.log("");
}
