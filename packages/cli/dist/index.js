#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const login_js_1 = require("./commands/login.js");
const fetch_js_1 = require("./commands/fetch.js");
const test_js_1 = require("./commands/test.js");
const submit_js_1 = require("./commands/submit.js");
const program = new commander_1.Command();
program
    .name("funcode")
    .description("FunCode CLI — The Hearthside Terminal")
    .version("0.1.0");
program
    .command("login")
    .description("Authenticate with your FunCode account via browser")
    .action(async () => {
    await (0, login_js_1.loginCommand)();
});
program
    .command("fetch <quest-id>")
    .description("Download a quest template locally and prepare it for development")
    .action(async (questId) => {
    await (0, fetch_js_1.fetchCommand)(questId);
});
program
    .command("test")
    .description("Run the quest test suite with cozy output formatting")
    .action(async () => {
    const result = await (0, test_js_1.testCommand)();
    process.exit(result.failed > 0 ? 1 : 0);
});
program
    .command("submit")
    .description("Run a final test pass and submit your solution to earn XP and a mentor report")
    .action(async () => {
    await (0, submit_js_1.submitCommand)();
});
program.parseAsync(process.argv).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map