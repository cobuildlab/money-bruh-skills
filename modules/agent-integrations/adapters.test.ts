import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildPackages } from "./services.ts";
import { validatePackages } from "./validation.ts";

const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), "moneybruh-adapters-test-"));
  await cp(new URL("./skills", import.meta.url), join(root, "modules/agent-integrations/skills"), {
    recursive: true,
  });
  await cp(
    new URL("./adapters", import.meta.url),
    join(root, "modules/agent-integrations/adapters"),
    { recursive: true },
  );
  await writeFile(join(root, "package.json"), '{"version":"0.1.0"}');
  await buildPackages(root);
  return root;
};

test("adapters generate native auth configs without bundling duplicate Codex or Copilot servers", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await validatePackages(root);
  const load = async (path: string) =>
    JSON.parse(await readFile(join(root, "packages", path), "utf8"));
  assert.match(
    await readFile(join(root, "packages/codex/config.example.toml"), "utf8"),
    /bearer_token_env_var = "MONEYBRUH_API_KEY"/,
  );
  assert.equal(
    (await load("claude-code/.mcp.json")).mcpServers.moneybruh.headers.Authorization,
    "Bearer ${MONEYBRUH_API_KEY}",
  );
  const opencode = (await load("opencode/opencode.example.json")).mcp.moneybruh;
  assert.equal(opencode.oauth, false);
  assert.equal(opencode.headers.Authorization, "Bearer {env:MONEYBRUH_API_KEY}");
  const copilot = (await load("copilot/mcp-config.example.json")).mcpServers.moneybruh;
  assert.equal(copilot.headers.Authorization, "Bearer ${MONEYBRUH_API_KEY}");
  const vscode = await load("copilot/vscode-mcp.example.json");
  assert.equal(vscode.inputs[0].password, true);
  assert.equal(vscode.servers.moneybruh.headers.Authorization, "Bearer ${input:moneybruh-api-key}");
  for (const client of ["codex", "copilot"])
    await assert.rejects(readFile(join(root, `packages/${client}/mcp.json`)));
});

test("adapters reject literal credentials, wrong transports, insecure endpoints and version drift", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const config = join(root, "packages/claude-code/.mcp.json");
  const original = await readFile(config, "utf8");
  for (const [from, to] of [
    ["Bearer ${MONEYBRUH_API_KEY}", "Bearer literal-test-credential"],
    ['"http"', '"sse"'],
    ["${MONEYBRUH_MCP_URL}", "http://remote.example/mcp"],
  ]) {
    await writeFile(config, original.replace(from!, to!));
    await assert.rejects(validatePackages(root), /Invalid adapter/);
  }
  await writeFile(config, original);
  const manifest = join(root, "packages/copilot/plugin.json");
  await writeFile(manifest, (await readFile(manifest, "utf8")).replace("0.1.0", "0.2.0"));
  await assert.rejects(validatePackages(root), /version/);
});
