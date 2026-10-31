import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { clients, skillDirectory } from "./types.ts";
import type { Client, FileTree } from "./types.ts";
import { assertContained, readTree } from "./utils.ts";

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid adapter object.");
  return value as Record<string, unknown>;
};

const endpoint = (value: unknown, variable?: string): void => {
  if (variable && value === variable) return;
  if (typeof value !== "string") throw new Error("Invalid adapter endpoint.");
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !url.pathname.endsWith("/mcp")
  )
    throw new Error("Invalid adapter endpoint.");
};

const validateAdapter = (client: Client, files: FileTree, version: unknown): void => {
  const json = (path: string) => {
    const content = files.get(path);
    if (!content) throw new Error(`Invalid adapter: missing ${client}/${path}`);
    return object(JSON.parse(content.toString("utf8")));
  };
  // Parse every JSON file, including metadata and config companions.
  for (const name of files.keys()) if (name.endsWith(".json")) json(name);
  const manifest = json(
    client === "claude-code"
      ? ".claude-plugin/plugin.json"
      : client === "opencode"
        ? "release.json"
        : "plugin.json",
  );
  if (manifest.name !== "moneybruh" || manifest.version !== version)
    throw new Error(`Invalid adapter name/version: ${client}`);
  if (client === "codex" || client === "copilot") {
    if (manifest.$schema !== "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json")
      throw new Error(`Invalid adapter schema: ${client}`);
    if (files.has("mcp.json") || files.has(".mcp.json") || manifest.mcpServers)
      throw new Error(`Invalid adapter: duplicate bundled server in ${client}`);
  }
  const server = (path: string, key: string) => object(object(json(path)[key]).moneybruh);
  const remote = (
    value: Record<string, unknown>,
    type: string,
    auth: string,
    variable?: string,
  ) => {
    if (value.type !== type || object(value.headers).Authorization !== auth)
      throw new Error(`Invalid adapter transport/auth: ${client}`);
    endpoint(value.url, variable);
  };
  if (client === "codex") {
    const config = files.get("config.example.toml")?.toString("utf8") ?? "";
    if (
      !config.includes("[mcp_servers.moneybruh]") ||
      !config.includes('bearer_token_env_var = "MONEYBRUH_API_KEY"') ||
      /http_headers|Authorization/.test(config)
    )
      throw new Error("Invalid adapter Codex auth.");
    endpoint(config.match(/^url = "([^"]+)"$/m)?.[1]);
    if (json(".codex-plugin/plugin.json").version !== version)
      throw new Error("Invalid adapter compatibility version.");
    const market = json(".agents/plugins/marketplace.json");
    if (
      market.name !== "moneybruh-local" ||
      !Array.isArray(market.plugins) ||
      object(object(market.plugins[0]).source).path !== "./"
    )
      throw new Error("Invalid adapter marketplace.");
  } else if (client === "claude-code") {
    remote(
      server(".mcp.json", "mcpServers"),
      "http",
      "Bearer ${MONEYBRUH_API_KEY}",
      "${MONEYBRUH_MCP_URL}",
    );
    if (manifest.skills !== "./skills/" || manifest.mcpServers !== "./.mcp.json")
      throw new Error("Invalid adapter Claude component paths.");
  } else if (client === "opencode") {
    const config = server("opencode.example.json", "mcp");
    remote(config, "remote", "Bearer {env:MONEYBRUH_API_KEY}", "{env:MONEYBRUH_MCP_URL}");
    if (config.oauth !== false || config.enabled !== true)
      throw new Error("Invalid adapter OpenCode API-key setup.");
  } else {
    const config = server("mcp-config.example.json", "mcpServers");
    remote(config, "http", "Bearer ${MONEYBRUH_API_KEY}");
    if (
      JSON.stringify(config.tools) !==
      JSON.stringify(["moneybruh_list_transactions", "moneybruh_account_balances"])
    )
      throw new Error("Invalid adapter Copilot tools.");
    remote(
      server("vscode-mcp.example.json", "servers"),
      "http",
      "Bearer ${input:moneybruh-api-key}",
    );
    const inputs = json("vscode-mcp.example.json").inputs;
    if (
      !Array.isArray(inputs) ||
      object(inputs[0]).password !== true ||
      object(inputs[0]).id !== "moneybruh-api-key"
    )
      throw new Error("Invalid adapter VS Code secret input.");
  }
};

export const validatePackages = async (root: string): Promise<void> => {
  await readTree(join(root, "packages"));
  const version = object(JSON.parse(await readFile(join(root, "package.json"), "utf8"))).version;
  for (const client of clients) {
    const directory = join(root, "packages", client);
    const files = await readTree(directory);
    validateAdapter(client, files, version);
    const skill = files.get(`${skillDirectory(client)}/SKILL.md`)?.toString("utf8") ?? "";
    if (!/^---\r?\nname: moneybruh\r?\ndescription: .+\r?\n---\r?\n/.test(skill))
      throw new Error(`Invalid skill frontmatter: ${client}`);
    for (const [name, content] of files) {
      if (!name.endsWith(".md")) continue;
      const text = content.toString("utf8");
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const href = match[1]?.split("#")[0] ?? "";
        if (!href || /^https?:\/\//.test(href)) continue;
        const path = resolve(directory, dirname(name), decodeURIComponent(href));
        assertContained(directory, path);
        const relative = path.slice(resolve(directory).length + 1).replaceAll("\\", "/");
        if (!files.has(relative))
          throw new Error(`Missing package reference: ${client}/${name}: ${href}`);
      }
    }
  }
};
