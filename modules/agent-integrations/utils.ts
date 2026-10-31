import { lstat, readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import type { FileTree } from "./types.ts";

export const assertContained = (root: string, path: string): void => {
  const delta = relative(resolve(root), resolve(path));
  if (delta === ".." || delta.startsWith(`..${sep}`) || resolve(path) === resolve(root)) {
    throw new Error(`Reference escapes package: ${path}`);
  }
};

export const readTree = async (root: string): Promise<FileTree> => {
  const files = new Map<string, Buffer>();
  const walk = async (directory: string): Promise<void> => {
    const stat = await lstat(directory);
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${directory}`);
    if (!stat.isDirectory()) throw new Error(`Expected directory: ${directory}`);
    for (const name of (await readdir(directory)).sort()) {
      const path = join(directory, name);
      const entry = await lstat(path);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${path}`);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile())
        files.set(relative(root, path).split(sep).join("/"), await readFile(path));
      else throw new Error(`Unsupported file type: ${path}`);
    }
  };
  await walk(root);
  return files;
};

export const exists = async (path: string): Promise<boolean> => {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
};
