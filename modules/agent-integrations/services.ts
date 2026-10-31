import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { clients, skillDirectory } from "./types.ts";
import type { FileTree } from "./types.ts";
import { exists, readTree } from "./utils.ts";

const expectedPackages = async (root: string): Promise<FileTree> => {
  const module = join(root, "modules/agent-integrations");
  const metadata: unknown = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  if (
    !metadata ||
    typeof metadata !== "object" ||
    !("version" in metadata) ||
    typeof metadata.version !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(metadata.version)
  )
    throw new Error("Expected semantic release version.");
  const version = metadata.version;
  const skill = await readTree(join(module, "skills"));
  const common = await readTree(join(module, "adapters/common"));
  const files = new Map<string, Buffer>();
  for (const client of clients) {
    for (const [name, content] of common) files.set(`${client}/${name}`, content);
    for (const [name, content] of await readTree(join(module, "adapters", client))) {
      files.set(
        `${client}/${name}`,
        Buffer.from(content.toString("utf8").replaceAll("{{VERSION}}", version)),
      );
    }
    for (const [name, content] of skill) {
      if (!name.startsWith("moneybruh/")) throw new Error(`Unexpected canonical skill: ${name}`);
      const target = `${client}/${skillDirectory(client)}/${name.slice("moneybruh/".length)}`;
      if (files.has(target)) throw new Error(`Adapter overrides canonical skill: ${target}`);
      files.set(target, content);
    }
  }
  return files;
};

export const buildPackages = async (root: string): Promise<void> => {
  const expected = await expectedPackages(root);
  const output = join(root, "packages");
  // Inspect before deleting anything: never follow an output symlink.
  if (await exists(output)) await readTree(output);
  await rm(output, { recursive: true, force: true });
  for (const [name, content] of expected) {
    const path = join(output, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }
};

export const checkGenerated = async (root: string): Promise<void> => {
  const expected = await expectedPackages(root);
  const output = join(root, "packages");
  const actual = (await exists(output)) ? await readTree(output) : new Map<string, Buffer>();
  const names = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  const different = names.filter(
    (name) => !expected.get(name)?.equals(actual.get(name) ?? Buffer.alloc(0)) || !actual.has(name),
  );
  if (different.length) throw new Error(`Generated packages differ: ${different.join(", ")}`);
};
