import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { summarizeTransactions } from "./skills/moneybruh/scripts/summarize.mjs";

test("spending sums decimals exactly and separates currencies, credits and pending", () => {
  const result = summarizeTransactions([
    { amount: 0.1, currencyCode: "USD", pending: false },
    { amount: 0.2, currencyCode: "USD", pending: false },
    { amount: -0.05, currencyCode: "USD", pending: false },
    { amount: 4, currencyCode: "USD", pending: true },
    { amount: -1, currencyCode: "USD", pending: true },
    { amount: 3.5, currencyCode: "EUR", pending: false },
    { amount: 8, currencyCode: null, pending: false },
  ]);
  assert.deepEqual(result, [
    {
      currencyCode: "EUR",
      postedOutflows: "3.5",
      postedCredits: "0",
      pendingOutflows: "0",
      pendingCredits: "0",
      observedNetOutflow: "3.5",
      count: 1,
    },
    {
      currencyCode: "USD",
      postedOutflows: "0.3",
      postedCredits: "0.05",
      pendingOutflows: "4",
      pendingCredits: "1",
      observedNetOutflow: "0.25",
      count: 5,
    },
    {
      currencyCode: null,
      postedOutflows: "8",
      postedCredits: "0",
      pendingOutflows: "0",
      pendingCredits: "0",
      observedNetOutflow: "8",
      count: 1,
    },
  ]);
});

test("spending supports exponent notation, tiny values and zero without rounding", () => {
  assert.equal(
    summarizeTransactions([
      { amount: 1e-7, currencyCode: "USD", pending: false },
      { amount: 2e-7, currencyCode: "USD", pending: false },
      { amount: -0, currencyCode: "USD", pending: false },
    ])[0]?.observedNetOutflow,
    "0.0000003",
  );
  assert.deepEqual(summarizeTransactions([]), []);
});

test("spending rejects malformed data instead of silently excluding financial records", () => {
  for (const record of [
    null,
    {},
    { amount: "1", pending: false },
    { amount: NaN, pending: false },
    { amount: Infinity, pending: false },
    { amount: 1 },
    { amount: 1, pending: false, currencyCode: 42 },
  ]) {
    assert.throws(() => summarizeTransactions([record]), /Invalid transaction/);
  }
  assert.throws(() => summarizeTransactions({}), /Expected a transaction array/);
});

test("spending CLI accepts only stdin JSON and reports safe errors", () => {
  const path = new URL("./skills/moneybruh/scripts/summarize.mjs", import.meta.url);
  const success = spawnSync(process.execPath, [path.pathname], {
    input: JSON.stringify({
      transactions: [{ amount: 1.25, currencyCode: "USD", pending: false }],
    }),
    encoding: "utf8",
  });
  assert.equal(success.status, 0, success.stderr);
  assert.equal(JSON.parse(success.stdout)[0].postedOutflows, "1.25");
  const invalid = spawnSync(process.execPath, [path.pathname], {
    input: "private-invalid-payload",
    encoding: "utf8",
  });
  assert.equal(invalid.status, 1);
  assert.doesNotMatch(invalid.stderr, /private-invalid-payload/);
});
