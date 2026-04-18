"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
const ora_1 = __importDefault(require("ora"));
const open_1 = __importDefault(require("open"));
const config_js_1 = require("../config.js");
const ui_js_1 = require("../ui.js");
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
async function loginCommand() {
    const apiUrl = (0, config_js_1.getApiUrl)();
    ui_js_1.ui.banner();
    console.log(ui_js_1.ui.info("  Starting device authentication...\n"));
    let deviceCode;
    let userCode;
    // Step 1: Initialize device auth
    const spinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Contacting the server..."),
        spinner: "dots",
    }).start();
    try {
        const res = await fetch(`${apiUrl}/api/cli/device-auth/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
            spinner.fail();
            ui_js_1.ui.error_msg(`Server error: ${res.statusText}`);
            process.exit(1);
        }
        const data = (await res.json());
        deviceCode = data.deviceCode;
        userCode = data.userCode;
        spinner.succeed(ui_js_1.ui.success("  Device code created."));
        console.log("");
        console.log(ui_js_1.ui.primary("  Opening your browser. If it doesn't open, visit:"));
        console.log("  " + ui_js_1.ui.bold(data.verificationUrl) + "\n");
        console.log(ui_js_1.ui.muted("  Your code: ") + ui_js_1.ui.primary(ui_js_1.ui.bold(userCode)) + "\n");
        await (0, open_1.default)(data.verificationUrl);
    }
    catch (err) {
        spinner.fail();
        ui_js_1.ui.error_msg(`Could not reach ${apiUrl}. Is the server running?\n  ${err}`);
        process.exit(1);
    }
    // Step 2: Poll for confirmation
    const pollSpinner = (0, ora_1.default)({
        text: ui_js_1.ui.muted("  Waiting for you to confirm in the browser..."),
        spinner: "moon",
    }).start();
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);
        try {
            const res = await fetch(`${apiUrl}/api/cli/device-auth/poll?deviceCode=${deviceCode}`);
            if (res.status === 200) {
                const { token, username } = (await res.json());
                pollSpinner.succeed(ui_js_1.ui.success("  Authenticated!"));
                const existing = (0, config_js_1.readConfig)();
                (0, config_js_1.writeConfig)({ ...existing, token, username, apiUrl });
                console.log("");
                ui_js_1.ui.success_msg(`Signed in as ${ui_js_1.ui.primary(ui_js_1.ui.bold(username))}`);
                console.log("");
                ui_js_1.ui.info_msg("Run " + ui_js_1.ui.primary("`funcode fetch <quest-id>`") + " to grab your first quest.");
                console.log("");
                return;
            }
            if (res.status === 400) {
                pollSpinner.fail(ui_js_1.ui.error("  Login expired or denied."));
                process.exit(1);
            }
            // 202 Pending — keep polling
        }
        catch {
            // Network hiccup — keep trying
        }
    }
    pollSpinner.fail(ui_js_1.ui.error("  Timed out waiting for browser confirmation."));
    process.exit(1);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=login.js.map