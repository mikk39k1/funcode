"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCommand = submitCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const ora_1 = __importDefault(require("ora"));
const config_js_1 = require("../config.js");
const test_js_1 = require("./test.js");
const ui_js_1 = require("../ui.js");
async function submitCommand() {
    const cwd = process.cwd();
    const apiUrl = (0, config_js_1.getApiUrl)();
    const token = (0, config_js_1.requireAuth)();
    // Verify we're in a quest directory
    const casesPath = path_1.default.join(cwd, "tests", "cases.json");
    if (!fs_1.default.existsSync(casesPath)) {
        ui_js_1.ui.error_msg('No "tests/cases.json" found. Run `funcode submit` from inside a quest directory.');
        process.exit(1);
    }
    // Derive quest id from the directory name (quest-{id}-{slug})
    // The id itself contains a dash (e.g. "quest-001"), so capture two segments.
    const dirName = path_1.default.basename(cwd);
    const match = dirName.match(/^quest-([a-z]+-\d+)/);
    if (!match) {
        ui_js_1.ui.error_msg(`Could not parse quest id from directory name "${dirName}".`);
        process.exit(1);
    }
    const questId = match[1];
    ui_js_1.ui.banner();
    console.log(ui_js_1.ui.info("  Running final test pass before submission...\n"));
    // Run tests first
    const result = await (0, test_js_1.testCommand)();
    if (result.failed > 0) {
        ui_js_1.ui.error_msg(`${result.failed} test${result.failed !== 1 ? "s" : ""} still failing. Fix them before submitting!`);
        process.exit(1);
    }
    console.log("\n" + ui_js_1.ui.success("  All tests green! Preparing submission...\n"));
    // Bundle src/ into a zip
    const bundleSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Bundling your solution..."),
        spinner: "dots",
    }).start();
    let zipBase64;
    try {
        const zip = new adm_zip_1.default();
        const srcDir = path_1.default.join(cwd, "src");
        if (!fs_1.default.existsSync(srcDir)) {
            bundleSpinner.fail();
            ui_js_1.ui.error_msg('No "src/" directory found.');
            process.exit(1);
        }
        addFolderToZip(zip, srcDir, "src");
        zipBase64 = zip.toBuffer().toString("base64");
        bundleSpinner.succeed(ui_js_1.ui.success("  Solution bundled."));
    }
    catch (err) {
        bundleSpinner.fail();
        ui_js_1.ui.error_msg(`Bundling failed: ${err}`);
        process.exit(1);
    }
    // POST to backend
    const submitSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Submitting to the server..."),
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
            ui_js_1.ui.error_msg("Session expired. Run `funcode login` again.");
            process.exit(1);
        }
        if (!res.ok) {
            submitSpinner.fail();
            const body = await res.text();
            ui_js_1.ui.error_msg(`Server error: ${res.statusText}\n  ${body}`);
            process.exit(1);
        }
        const data = (await res.json());
        submitSpinner.succeed(ui_js_1.ui.success("  Submission accepted!"));
        console.log("");
        console.log(ui_js_1.ui.primary(ui_js_1.ui.bold("  ✨ Quest Complete!")));
        console.log("");
        ui_js_1.ui.success_msg(`You earned ${ui_js_1.ui.primary(ui_js_1.ui.bold("+" + data.xpAwarded + " XP"))} — Total: ${ui_js_1.ui.primary(String(data.totalXp) + " XP")}`);
        if (data.newLevel) {
            console.log("");
            console.log(ui_js_1.ui.primary(ui_js_1.ui.bold(`  🎉 Level Up! You are now Level ${data.newLevel}!`)));
        }
        if (data.message) {
            console.log("");
            ui_js_1.ui.info_msg(data.message);
        }
        console.log("");
        ui_js_1.ui.info_msg("Your " +
            ui_js_1.ui.primary("Post-Quest Mentor Report") +
            " is being generated...");
        ui_js_1.ui.info_msg("View it on your profile: " + ui_js_1.ui.primary(`${apiUrl}/profile`));
        console.log("");
    }
    catch (err) {
        submitSpinner.fail();
        ui_js_1.ui.error_msg(`Could not reach ${apiUrl}.\n  ${err}`);
        process.exit(1);
    }
}
function addFolderToZip(zip, folderPath, zipPath) {
    const entries = fs_1.default.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path_1.default.join(folderPath, entry.name);
        const entryZipPath = path_1.default.join(zipPath, entry.name);
        if (entry.isDirectory()) {
            addFolderToZip(zip, fullPath, entryZipPath);
        }
        else {
            zip.addFile(entryZipPath, fs_1.default.readFileSync(fullPath));
        }
    }
}
//# sourceMappingURL=submit.js.map