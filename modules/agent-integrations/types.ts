export const clients = ["codex", "claude-code", "opencode", "copilot"] as const;
export type Client = (typeof clients)[number];
export type FileTree = ReadonlyMap<string, Buffer>;
export const skillDirectory = (client: Client): string =>
  client === "opencode" ? ".opencode/skills/moneybruh" : "skills/moneybruh";
