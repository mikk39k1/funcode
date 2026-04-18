"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommand = testCommand;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ui_js_1 = require("../ui.js");
async function testCommand() {
    const cwd = process.cwd();
    // Verify we're inside a quest directory
    if (!fs_1.default.existsSync(path_1.default.join(cwd, "tests", "cases.json"))) {
        ui_js_1.ui.error_msg('No "tests/cases.json" found. Run `funcode test` from inside a quest directory.');
        process.exit(1);
    }
    ui_js_1.ui.banner();
    console.log(ui_js_1.ui.info("  Running quest tests...\n"));
    return new Promise((resolve) => {
        const vitestBin = path_1.default.join(cwd, "node_modules", ".bin", "vitest");
        const bin = fs_1.default.existsSync(vitestBin) ? vitestBin : "npx vitest";
        const proc = (0, child_process_1.spawn)(bin, ["run", "--reporter=verbose"], {
            cwd,
            shell: true,
            env: { ...process.env, FORCE_COLOR: "1" },
        });
        const result = { passed: 0, failed: 0, total: 0 };
        proc.stdout.on("data", (chunk) => {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                // Reformat Vitest verbose output into cozy UI
                if (trimmed.match(/✓|√|PASS/)) {
                    const testName = trimmed.replace(/^[✓√]\s*/, "").replace(/\s+\d+ms$/, "");
                    if (testName && !testName.includes("Quest")) {
                        result.passed++;
                        ui_js_1.ui.pass(testName);
                    }
                }
                else if (trimmed.match(/✗|×|✕|FAIL/)) {
                    const testName = trimmed.replace(/^[✗×✕]\s*/, "").replace(/\s+\d+ms$/, "");
                    if (testName && !testName.includes("Quest")) {
                        result.failed++;
                        ui_js_1.ui.fail(testName);
                    }
                }
                else if (trimmed.match(/Test Files|Tests\s+\d/)) {
                    // Summary line — show it muted
                    ui_js_1.ui.info_msg(ui_js_1.ui.muted(trimmed));
                }
            }
        });
        proc.stderr.on("data", (chunk) => {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
                if (line.trim()) {
                    process.stderr.write(ui_js_1.ui.muted("  ") + line + "\n");
                }
            }
        });
        proc.on("close", (code) => {
            result.total = result.passed + result.failed;
            console.log("");
            if (code === 0) {
                console.log(ui_js_1.ui.success(ui_js_1.ui.bold(`  ✨ All ${result.total} test${result.total !== 1 ? "s" : ""} passed!`)));
                console.log(ui_js_1.ui.muted("  When you're satisfied, run ") +
                    ui_js_1.ui.primary("`funcode submit`") +
                    ui_js_1.ui.muted(" to submit and earn your XP."));
            }
            else {
                console.log(ui_js_1.ui.error(ui_js_1.ui.bold(`  💥 ${result.failed} test${result.failed !== 1 ? "s" : ""} failed.`)));
                console.log(ui_js_1.ui.muted("  Keep going — you're close! 🏡"));
            }
            console.log("");
            resolve(result);
        });
    });
}
//# sourceMappingURL=test.js.map