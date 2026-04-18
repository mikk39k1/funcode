import chalk from "chalk";

export const ui = {
  /** Amber — primary actions, highlights */
  primary: (s: string) => chalk.hex("#f0bd8b")(s),
  /** Forest green — success, pass */
  success: (s: string) => chalk.hex("#b8cdaa")(s),
  /** Lavender — info, secondary */
  info: (s: string) => chalk.hex("#e1cfff")(s),
  /** Coral — error, fail */
  error: (s: string) => chalk.hex("#f97758")(s),
  /** Muted — secondary text */
  muted: (s: string) => chalk.hex("#b0a8b2")(s),
  /** Bold */
  bold: (s: string) => chalk.bold(s),

  // Structured messages
  pass: (msg: string) =>
    console.log(chalk.hex("#b8cdaa").bold("  ✨ [Pass] ") + chalk.hex("#ece3ed")(msg)),

  fail: (msg: string) =>
    console.log(chalk.hex("#f97758").bold("  💥 [Fail] ") + chalk.hex("#ece3ed")(msg)),

  info_msg: (msg: string) =>
    console.log(chalk.hex("#e1cfff")("  ◈  ") + chalk.hex("#ece3ed")(msg)),

  error_msg: (msg: string) =>
    console.log(chalk.hex("#f97758").bold("  ✖  ") + chalk.hex("#f97758")(msg)),

  success_msg: (msg: string) =>
    console.log(chalk.hex("#b8cdaa").bold("  ✓  ") + chalk.hex("#ece3ed")(msg)),

  banner: () => {
    console.log("");
    console.log(
      chalk.hex("#f0bd8b").bold("  ╔══════════════════════════════╗")
    );
    console.log(
      chalk.hex("#f0bd8b").bold("  ║  ") +
        chalk.hex("#ece3ed").bold("FunCode — The Hearthside Terminal") +
        chalk.hex("#f0bd8b").bold("  ║")
    );
    console.log(
      chalk.hex("#f0bd8b").bold("  ╚══════════════════════════════╝")
    );
    console.log("");
  },
};
