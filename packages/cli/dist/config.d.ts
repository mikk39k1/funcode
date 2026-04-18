export interface Config {
    token?: string;
    apiUrl?: string;
    username?: string;
}
export declare function readConfig(): Config;
export declare function writeConfig(config: Config): void;
export declare function getApiUrl(): string;
export declare function requireAuth(): string;
//# sourceMappingURL=config.d.ts.map