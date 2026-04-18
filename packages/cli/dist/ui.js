"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.ui = {
    /** Amber — primary actions, highlights */
    primary: (s) => chalk_1.default.hex("#f0bd8b")(s),
    /** Forest green — success, pass */
    success: (s) => chalk_1.default.hex("#b8cdaa")(s),
    /** Lavender — info, secondary */
    info: (s) => chalk_1.default.hex("#e1cfff")(s),
    /** Coral — error, fail */
    error: (s) => chalk_1.default.hex("#f97758")(s),
    /** Muted — secondary text */
    muted: (s) => chalk_1.default.hex("#b0a8b2")(s),
    /** Bold */
    bold: (s) => chalk_1.default.bold(s),
    // Structured messages
    pass: (msg) => console.log(chalk_1.default.hex("#b8cdaa").bold("  ✨ [Pass] ") + chalk_1.default.hex("#ece3ed")(msg)),
    fail: (msg) => console.log(chalk_1.default.hex("#f97758").bold("  💥 [Fail] ") + chalk_1.default.hex("#ece3ed")(msg)),
    info_msg: (msg) => console.log(chalk_1.default.hex("#e1cfff")("  ◈  ") + chalk_1.default.hex("#ece3ed")(msg)),
    error_msg: (msg) => console.log(chalk_1.default.hex("#f97758").bold("  ✖  ") + chalk_1.default.hex("#f97758")(msg)),
    success_msg: (msg) => console.log(chalk_1.default.hex("#b8cdaa").bold("  ✓  ") + chalk_1.default.hex("#ece3ed")(msg)),
    banner: () => {
        console.log("");
        console.log(chalk_1.default.hex("#f0bd8b").bold("  ╔══════════════════════════════╗"));
        console.log(chalk_1.default.hex("#f0bd8b").bold("  ║  ") +
            chalk_1.default.hex("#ece3ed").bold("FunCode — The Hearthside Terminal") +
            chalk_1.default.hex("#f0bd8b").bold("  ║"));
        console.log(chalk_1.default.hex("#f0bd8b").bold("  ╚══════════════════════════════╝"));
        console.log("");
    },
};
//# sourceMappingURL=ui.js.map