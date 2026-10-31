import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("CLI rejects missing, unknown, and inherited commands without claiming success", () => {
  const cli = fileURLToPath(new URL("./cli.ts", import.meta.url));
  for (const command of [undefined, "unknown", "toString", "constructor", "__proto__"]) {
    const result = spawnSync(process.execPath, [cli, ...(command ? [command] : [])], {
      encoding: "utf8",
    });
    assert.equal(result.status, 1, `command: ${command}; stdout: ${result.stdout}`);
    assert.match(result.stderr, /Usage: cli.ts build\|validate\|check-generated/);
    assert.equal(result.stdout, "");
  }
});
