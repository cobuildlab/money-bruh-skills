import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { validateCatalogs } from "./catalogs.ts";

test("marketplace catalogs resolve correct packaged plugins with matching release versions", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "moneybruh-catalogs-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repo = new URL("../../", import.meta.url);
  for (const path of [".agents", ".claude-plugin", ".github", "packages", "package.json"]) {
    await cp(new URL(path, repo), join(root, path), { recursive: true });
  }
  await validateCatalogs(root);
  const catalog = join(root, ".github/plugin/marketplace.json");
  const original = await readFile(catalog, "utf8");
  await writeFile(catalog, original.replace("./packages/copilot", "./packages/claude-code"));
  await assert.rejects(validateCatalogs(root), /Invalid marketplace source/);
  await writeFile(catalog, original.replace("0.1.0", "0.2.0"));
  await assert.rejects(validateCatalogs(root), /Marketplace version mismatch/);
  await writeFile(catalog, original);
  await rm(join(root, "packages/copilot/plugin.json"));
  await assert.rejects(validateCatalogs(root), /ENOENT/);
});
