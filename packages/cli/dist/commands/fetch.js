"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCommand = fetchCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const adm_zip_1 = __importDefault(require("adm-zip"));
const prompts_1 = require("@inquirer/prompts");
const ora_1 = __importDefault(require("ora"));
const config_js_1 = require("../config.js");
const ui_js_1 = require("../ui.js");
async function fetchCommand(questId) {
    const apiUrl = (0, config_js_1.getApiUrl)();
    const token = (0, config_js_1.requireAuth)();
    ui_js_1.ui.banner();
    console.log(ui_js_1.ui.info(`  Fetching quest ${ui_js_1.ui.primary(ui_js_1.ui.bold(questId))}...\n`));
    const spinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Contacting the server..."),
        spinner: "dots",
    }).start();
    let questMeta;
    try {
        const res = await fetch(`${apiUrl}/api/cli/quests/${questId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
            spinner.fail();
            ui_js_1.ui.error_msg("Session expired. Run `funcode login` again.");
            process.exit(1);
        }
        if (res.status === 404) {
            spinner.fail();
            ui_js_1.ui.error_msg(`Quest "${questId}" not found.`);
            process.exit(1);
        }
        if (!res.ok) {
            spinner.fail();
            ui_js_1.ui.error_msg(`Server error: ${res.statusText}`);
            process.exit(1);
        }
        questMeta = await res.json();
        spinner.succeed(ui_js_1.ui.success("  Quest details loaded."));
    }
    catch (err) {
        spinner.fail();
        ui_js_1.ui.error_msg(`Could not reach ${apiUrl}.\n  ${err}`);
        process.exit(1);
    }
    const folderName = `quest-${questMeta.id}-${questMeta.slug}`;
    const destPath = path_1.default.resolve(process.cwd(), folderName);
    if (fs_1.default.existsSync(destPath)) {
        ui_js_1.ui.error_msg(`Folder "${folderName}" already exists. Remove it first.`);
        process.exit(1);
    }
    // Show quest summary
    console.log("");
    console.log("  " + ui_js_1.ui.primary(ui_js_1.ui.bold("⚔  " + questMeta.title)));
    console.log("  " +
        ui_js_1.ui.muted("Difficulty: ") +
        ui_js_1.ui.info(questMeta.difficulty) +
        "  " +
        ui_js_1.ui.muted("Time: ~") +
        ui_js_1.ui.info(String(questMeta.estimatedMinutes) + "m") +
        "  " +
        ui_js_1.ui.muted("Reward: ") +
        ui_js_1.ui.success("+" + questMeta.xpReward + " XP"));
    console.log("");
    // Honor-system pledge
    const proceed = await (0, prompts_1.confirm)({
        message: "Ready to start? (Please disable your AI assistants to get the true experience)",
        default: true,
    });
    if (!proceed) {
        ui_js_1.ui.info_msg("No worries — come back when you're ready. 🏡");
        process.exit(0);
    }
    console.log("");
    // Download zip
    const dlSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Downloading quest template..."),
        spinner: "dots",
    }).start();
    let zipBuffer;
    try {
        const res = await fetch(questMeta.downloadUrl);
        if (!res.ok)
            throw new Error(res.statusText);
        const arrayBuf = await res.arrayBuffer();
        zipBuffer = Buffer.from(arrayBuf);
        dlSpinner.succeed(ui_js_1.ui.success("  Template downloaded."));
    }
    catch (err) {
        dlSpinner.fail();
        ui_js_1.ui.error_msg(`Download failed: ${err}`);
        process.exit(1);
    }
    // Unzip
    const unzipSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Unpacking quest files..."),
        spinner: "dots",
    }).start();
    try {
        const zip = new adm_zip_1.default(zipBuffer);
        zip.extractAllTo(destPath, true);
        unzipSpinner.succeed(ui_js_1.ui.success("  Files extracted."));
    }
    catch (err) {
        unzipSpinner.fail();
        ui_js_1.ui.error_msg(`Extraction failed: ${err}`);
        fs_1.default.rmSync(destPath, { recursive: true, force: true });
        process.exit(1);
    }
    // npm install
    const installSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Installing dependencies..."),
        spinner: "dots",
    }).start();
    try {
        (0, child_process_1.execSync)("npm install", { cwd: destPath, stdio: "pipe" });
        installSpinner.succeed(ui_js_1.ui.success("  Dependencies installed."));
    }
    catch (err) {
        installSpinner.fail();
        ui_js_1.ui.error_msg(`npm install failed: ${err}`);
        process.exit(1);
    }
    console.log("");
    ui_js_1.ui.success_msg("Quest ready! " + ui_js_1.ui.primary(ui_js_1.ui.bold(`cd ${folderName}`)));
    console.log("");
    ui_js_1.ui.info_msg("Run tests:  " + ui_js_1.ui.primary("`funcode test`"));
    ui_js_1.ui.info_msg("Submit:     " + ui_js_1.ui.primary("`funcode submit`"));
    console.log("");
}
//# sourceMappingURL=fetch.js.map