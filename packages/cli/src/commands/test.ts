import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { ui } from "../ui.js";

interface TestResult {
  passed: number;
  failed: number;
  total: number;
}

export async function testCommand(): Promise<TestResult> {
  const cwd = process.cwd();

  // Verify we're inside a quest directory
  if (!fs.existsSync(path.join(cwd, "tests", "cases.json"))) {
    ui.error_msg(
      'No "tests/cases.json" found. Run `funcode test` from inside a quest directory.'
    );
    process.exit(1);
  }

  ui.banner();
  console.log(ui.info("  Running quest tests...\n"));

  return new Promise((resolve) => {
    const vitestBin = path.join(cwd, "node_modules", ".bin", "vitest");
    const bin = fs.existsSync(vitestBin) ? vitestBin : "npx vitest";

    const proc = spawn(bin, ["run", "--reporter=verbose"], {
      cwd,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    const result: TestResult = { passed: 0, failed: 0, total: 0 };

    proc.stdout.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Reformat Vitest verbose output into cozy UI
        if (trimmed.match(/✓|√|PASS/)) {
          const testName = trimmed.replace(/^[✓√]\s*/, "").replace(/\s+\d+ms$/, "");
          if (testName && !testName.includes("Quest")) {
            result.passed++;
            ui.pass(testName);
          }
        } else if (trimmed.match(/✗|×|✕|FAIL/)) {
          const testName = trimmed.replace(/^[✗×✕]\s*/, "").replace(/\s+\d+ms$/, "");
          if (testName && !testName.includes("Quest")) {
            result.failed++;
            ui.fail(testName);
          }
        } else if (trimmed.match(/Test Files|Tests\s+\d/)) {
          // Summary line — show it muted
          ui.info_msg(ui.muted(trimmed));
        }
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          process.stderr.write(ui.muted("  ") + line + "\n");
        }
      }
    });

    proc.on("close", (code) => {
      result.total = result.passed + result.failed;
      console.log("");

      if (code === 0) {
        console.log(
          ui.success(
            ui.bold(
              `  ✨ All ${result.total} test${result.total !== 1 ? "s" : ""} passed!`
            )
          )
        );
        console.log(
          ui.muted("  When you're satisfied, run ") +
            ui.primary("`funcode submit`") +
            ui.muted(" to submit and earn your XP.")
        );
      } else {
        console.log(
          ui.error(
            ui.bold(
              `  💥 ${result.failed} test${result.failed !== 1 ? "s" : ""} failed.`
            )
          )
        );
        console.log(
          ui.muted("  Keep going — you're close! 🏡")
        );
      }

      console.log("");
      resolve(result);
    });
  });
}
