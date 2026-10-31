import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildPackages, checkGenerated } from "./services.ts";
import { validatePackages } from "./validation.ts";

const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), "moneybruh-packages-test-"));
  const module = join(root, "modules/agent-integrations");
  await cp(new URL("./skills", import.meta.url), join(module, "skills"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ version: "0.1.0" }));
  await cp(new URL("./adapters", import.meta.url), join(module, "adapters"), { recursive: true });
  return root;
};

test("packages regenerate deterministically and detect stale, edited and missing output", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await buildPackages(root);
  await checkGenerated(root);
  const skill = join(root, "packages/codex/skills/moneybruh/SKILL.md");
  const before = await readFile(skill, "utf8");
  assert.equal(
    before,
    await readFile(join(root, "modules/agent-integrations/skills/moneybruh/SKILL.md"), "utf8"),
  );
  assert.equal(
    JSON.parse(await readFile(join(root, "packages/codex/plugin.json"), "utf8")).version,
    "0.1.0",
  );
  await writeFile(join(root, "packages/codex/stale.txt"), "stale");
  await assert.rejects(checkGenerated(root), /Generated packages differ/);
  await buildPackages(root);
  assert.equal(await readFile(skill, "utf8"), before);
  await checkGenerated(root);
  await writeFile(skill, "edited");
  await assert.rejects(checkGenerated(root), /Generated packages differ/);
  await buildPackages(root);
  await rm(skill);
  await assert.rejects(checkGenerated(root), /Generated packages differ/);
});

test("packages validate reference closure after source checkout disappears", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await buildPackages(root);
  await rm(join(root, "modules"), { recursive: true });
  await validatePackages(root);
  await rm(join(root, "packages/codex/skills/moneybruh/references/spending.md"));
  await assert.rejects(validatePackages(root), /Missing package reference/);
});

test("packages reject links escaping installed boundary and malformed frontmatter", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await buildPackages(root);
  const path = join(root, "packages/codex/skills/moneybruh/SKILL.md");
  await writeFile(path, (await readFile(path, "utf8")) + "\n[escape](../../../../outside.md)\n");
  await assert.rejects(validatePackages(root), /Reference escapes package/);
  await buildPackages(root);
  await writeFile(path, "# Missing frontmatter");
  await assert.rejects(validatePackages(root), /Invalid skill frontmatter/);
});

test("packages reject symlink sources and outputs without modifying link targets", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const outside = join(root, "outside");
  await mkdir(outside);
  const marker = join(outside, "marker");
  await writeFile(marker, "preserve");
  await symlink(outside, join(root, "modules/agent-integrations/skills/escape"));
  await assert.rejects(buildPackages(root), /Symbolic links are not supported/);
  await rm(join(root, "modules/agent-integrations/skills/escape"));
  await symlink(outside, join(root, "packages"));
  await assert.rejects(buildPackages(root), /Symbolic links are not supported/);
  assert.equal(await readFile(marker, "utf8"), "preserve");
});
