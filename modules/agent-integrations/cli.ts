import { fileURLToPath } from "node:url";
import { buildPackages, checkGenerated } from "./services.ts";
import { validatePackages } from "./validation.ts";
import { validateCatalogs } from "./catalogs.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const actions = {
  build: buildPackages,
  validate: async (root: string) => {
    await validatePackages(root);
    await validateCatalogs(root);
  },
  "check-generated": checkGenerated,
};
const command = process.argv[2];
try {
  if (!command || !Object.hasOwn(actions, command))
    throw new Error("Usage: cli.ts build|validate|check-generated");
  await actions[command as keyof typeof actions](root);
  console.log(`${command}: passed`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Command failed.");
  process.exitCode = 1;
}
