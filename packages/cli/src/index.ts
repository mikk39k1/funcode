#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { fetchCommand } from "./commands/fetch.js";
import { testCommand } from "./commands/test.js";
import { submitCommand } from "./commands/submit.js";

const program = new Command();

program
  .name("funcode")
  .description("FunCode CLI — The Hearthside Terminal")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate with your FunCode account via browser")
  .action(async () => {
    await loginCommand();
  });

program
  .command("fetch <quest-id>")
  .description(
    "Download a quest template locally and prepare it for development"
  )
  .action(async (questId: string) => {
    await fetchCommand(questId);
  });

program
  .command("test")
  .description("Run the quest test suite with cozy output formatting")
  .action(async () => {
    const result = await testCommand();
    process.exit(result.failed > 0 ? 1 : 0);
  });

program
  .command("submit")
  .description(
    "Run a final test pass and submit your solution to earn XP and a mentor report"
  )
  .action(async () => {
    await submitCommand();
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
