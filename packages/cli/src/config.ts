import os from "os";
import path from "path";
import fs from "fs";

const CONFIG_DIR = path.join(os.homedir(), ".funcode");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface Config {
  token?: string;
  apiUrl?: string;
  username?: string;
}

export function readConfig(): Config {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as Config;
  } catch {
    return {};
  }
}

export function writeConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function getApiUrl(): string {
  const config = readConfig();
  return config.apiUrl ?? process.env.FUNCODE_API_URL ?? "https://funcode.dev";
}

export function requireAuth(): string {
  const { token } = readConfig();
  if (!token) {
    throw new Error(
      "Not logged in. Run `funcode login` first."
    );
  }
  return token;
}
