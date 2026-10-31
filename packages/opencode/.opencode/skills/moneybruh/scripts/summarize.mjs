import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @param {number} value */
const decimal = (value) => {
  const [mantissa = "0", exponent = "0"] = String(value).toLowerCase().split("e");
  const [whole = "0", fraction = ""] = mantissa.split(".");
  const scale = fraction.length - Number(exponent);
  const coefficient = BigInt(whole + fraction);
  return scale < 0
    ? { coefficient: coefficient * 10n ** BigInt(-scale), scale: 0 }
    : { coefficient, scale };
};

/** @param {bigint} value @param {number} scale */
const format = (value, scale) => {
  const sign = value < 0n ? "-" : "";
  const digits = (value < 0n ? -value : value).toString().padStart(scale + 1, "0");
  if (scale === 0) return sign + digits;
  return (sign + digits.slice(0, -scale) + "." + digits.slice(-scale)).replace(/\.?0+$/, "");
};

/**
 * Sum the decimal representations supplied by the API, without binary-float addition.
 * Positive amounts are assumed outflows; negative amounts are credits, not necessarily income.
 * @param {unknown} transactions
 */
export const summarizeTransactions = (transactions) => {
  if (!Array.isArray(transactions)) throw new Error("Expected a transaction array.");
  const records = transactions.map((record) => {
    if (
      !record ||
      typeof record !== "object" ||
      typeof record.amount !== "number" ||
      !Number.isFinite(record.amount) ||
      typeof record.pending !== "boolean" ||
      (record.currencyCode != null &&
        (typeof record.currencyCode !== "string" || !record.currencyCode.trim()))
    )
      throw new Error("Invalid transaction.");
    return {
      ...decimal(record.amount),
      pending: record.pending,
      currencyCode: /** @type {string | null} */ (record.currencyCode ?? null),
    };
  });
  const scale = records.reduce((max, record) => Math.max(max, record.scale), 0);
  /** @type {Map<string | null, { postedOutflows: bigint, postedCredits: bigint, pendingOutflows: bigint, pendingCredits: bigint, count: number }>} */
  const buckets = new Map();
  for (const record of records) {
    const bucket = buckets.get(record.currencyCode) ?? {
      postedOutflows: 0n,
      postedCredits: 0n,
      pendingOutflows: 0n,
      pendingCredits: 0n,
      count: 0,
    };
    const amount = record.coefficient * 10n ** BigInt(scale - record.scale);
    const key = record.pending
      ? amount < 0n
        ? "pendingCredits"
        : "pendingOutflows"
      : amount < 0n
        ? "postedCredits"
        : "postedOutflows";
    bucket[key] += amount < 0n ? -amount : amount;
    bucket.count++;
    buckets.set(record.currencyCode, bucket);
  }
  return [...buckets]
    .sort(([a], [b]) => (a === b ? 0 : a === null ? 1 : b === null ? -1 : a < b ? -1 : 1))
    .map(([currencyCode, bucket]) => ({
      currencyCode,
      postedOutflows: format(bucket.postedOutflows, scale),
      postedCredits: format(bucket.postedCredits, scale),
      pendingOutflows: format(bucket.pendingOutflows, scale),
      pendingCredits: format(bucket.pendingCredits, scale),
      observedNetOutflow: format(bucket.postedOutflows - bucket.postedCredits, scale),
      count: bucket.count,
    }));
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let input = "";
    for await (const chunk of process.stdin) {
      input += chunk;
      if (Buffer.byteLength(input) > 4 * 1024 * 1024) throw new Error("Input too large.");
    }
    const payload = JSON.parse(input);
    console.log(
      JSON.stringify(
        summarizeTransactions(Array.isArray(payload) ? payload : payload?.transactions),
        null,
        2,
      ),
    );
  } catch {
    console.error("Cannot summarize: provide valid transaction JSON on stdin (maximum 4 MiB).");
    process.exitCode = 1;
  }
}
