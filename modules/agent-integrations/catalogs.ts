import { readFile } from "node:fs/promises";
import { join } from "node:path";

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid marketplace object.");
  return value as Record<string, unknown>;
};

export const validateCatalogs = async (root: string): Promise<void> => {
  const load = async (path: string) => record(JSON.parse(await readFile(join(root, path), "utf8")));
  const version = (await load("package.json")).version;
  const catalogs = [
    [".agents/plugins/marketplace.json", "codex", "plugin.json"],
    [".claude-plugin/marketplace.json", "claude-code", ".claude-plugin/plugin.json"],
    [".github/plugin/marketplace.json", "copilot", "plugin.json"],
  ] as const;
  for (const [path, client, manifestPath] of catalogs) {
    const catalog = await load(path);
    if (
      catalog.name !== "moneybruh" ||
      !Array.isArray(catalog.plugins) ||
      catalog.plugins.length !== 1
    )
      throw new Error(`Invalid marketplace catalog: ${path}`);
    const plugin = record(catalog.plugins[0]);
    const source = client === "codex" ? record(plugin.source).path : plugin.source;
    if (
      plugin.name !== "moneybruh" ||
      source !== `./packages/${client}` ||
      (client === "codex" && record(plugin.source).source !== "local")
    )
      throw new Error(`Invalid marketplace source: ${path}`);
    const manifest = await load(`packages/${client}/${manifestPath}`);
    if (plugin.version !== version || manifest.version !== version || manifest.name !== plugin.name)
      throw new Error(`Marketplace version mismatch: ${path}`);
  }
};
