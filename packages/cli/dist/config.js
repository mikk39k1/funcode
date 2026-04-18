"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = readConfig;
exports.writeConfig = writeConfig;
exports.getApiUrl = getApiUrl;
exports.requireAuth = requireAuth;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), ".funcode");
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, "config.json");
function readConfig() {
    try {
        if (!fs_1.default.existsSync(CONFIG_FILE))
            return {};
        const raw = fs_1.default.readFileSync(CONFIG_FILE, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeConfig(config) {
    if (!fs_1.default.existsSync(CONFIG_DIR)) {
        fs_1.default.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
function getApiUrl() {
    const config = readConfig();
    return config.apiUrl ?? process.env.FUNCODE_API_URL ?? "https://funcode.dev";
}
function requireAuth() {
    const { token } = readConfig();
    if (!token) {
        throw new Error("Not logged in. Run `funcode login` first.");
    }
    return token;
}
//# sourceMappingURL=config.js.map