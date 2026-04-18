import ora from "ora";
import open from "open";
import { readConfig, writeConfig, getApiUrl } from "../config.js";
import { ui } from "../ui.js";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function loginCommand(): Promise<void> {
  const apiUrl = getApiUrl();

  ui.banner();
  console.log(ui.info("  Starting device authentication...\n"));

  let deviceCode: string;
  let userCode: string;

  // Step 1: Initialize device auth
  const spinner = ora({
    text: ui.muted("  Contacting the server..."),
    spinner: "dots",
  }).start();

  try {
    const res = await fetch(`${apiUrl}/api/cli/device-auth/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      spinner.fail();
      ui.error_msg(`Server error: ${res.statusText}`);
      process.exit(1);
    }

    const data = (await res.json()) as {
      deviceCode: string;
      userCode: string;
      verificationUrl: string;
    };

    deviceCode = data.deviceCode;
    userCode = data.userCode;
    spinner.succeed(ui.success("  Device code created."));

    console.log("");
    console.log(
      ui.primary("  Opening your browser. If it doesn't open, visit:")
    );
    console.log(
      "  " + ui.bold(data.verificationUrl) + "\n"
    );
    console.log(
      ui.muted("  Your code: ") + ui.primary(ui.bold(userCode)) + "\n"
    );

    await open(data.verificationUrl);
  } catch (err) {
    spinner.fail();
    ui.error_msg(
      `Could not reach ${apiUrl}. Is the server running?\n  ${err}`
    );
    process.exit(1);
  }

  // Step 2: Poll for confirmation
  const pollSpinner = ora({
    text: ui.muted("  Waiting for you to confirm in the browser..."),
    spinner: "moon",
  }).start();

  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    try {
      const res = await fetch(
        `${apiUrl}/api/cli/device-auth/poll?deviceCode=${deviceCode}`
      );

      if (res.status === 200) {
        const { token, username } = (await res.json()) as {
          token: string;
          username: string;
        };

        pollSpinner.succeed(ui.success("  Authenticated!"));

        const existing = readConfig();
        writeConfig({ ...existing, token, username, apiUrl });

        console.log("");
        ui.success_msg(`Signed in as ${ui.primary(ui.bold(username))}`);
        console.log("");
        ui.info_msg("Run " + ui.primary("`funcode fetch <quest-id>`") + " to grab your first quest.");
        console.log("");
        return;
      }

      if (res.status === 400) {
        pollSpinner.fail(ui.error("  Login expired or denied."));
        process.exit(1);
      }

      // 202 Pending — keep polling
    } catch {
      // Network hiccup — keep trying
    }
  }

  pollSpinner.fail(ui.error("  Timed out waiting for browser confirmation."));
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
