# Observed spending

## Fetch

Use [transaction lookup](transactions.md) with explicit period, account scope when relevant, and limit 200. For comparisons, query only requested periods; disclose coverage separately for each.

## Calculate

- **Sign assumption:** Treat positive amounts as outflows and negative amounts as credits unless verified tool guidance says otherwise; disclose this assumption.
- **Credits:** Credits may be refunds or other inflows; label observed credits, not income or confirmed refunds without evidence.
- **Pending:** Separate pending outflows/credits; exclude them from posted net outflow.
- **Currencies:** Separate each returned currency; null/missing currency forms an unknown bucket; no implicit conversion.
- **Arithmetic:** Use packaged [decimal summarizer](../scripts/summarize.mjs) when Node 24 is available; pass only transaction JSON through stdin.

```sh
node /absolute/path/to/installed/moneybruh/scripts/summarize.mjs < /path/to/temporary-transactions.json
```

- **Private inputs:** Use a local temporary file outside repository; delete after use; avoid financial records in shell arguments or logs.
- **Fallback:** If execution unavailable, use client's decimal-safe calculator; if unavailable, show records without guessed totals.
- **Helper output:** Decimal strings for posted outflows, posted credits, pending outflows/credits, and observed net outflow; net = posted outflows minus posted credits.
- **Groups:** Use returned merchant/category values for requested breakdowns; retain unknown groups; apply identical currency/pending rules within each group.

## Report

- **Scope:** State requested period, account scope, returned count, and local filters.
- **Coverage:** Call amounts observed subtotals from returned records; at cap, explicitly say potentially truncated and avoid full-period totals.
- **Filters:** A merchant/category subtotal covers only matching fetched records; a zero match cannot prove no activity in full period.
- **Comparisons:** Label differences between observed subsets; avoid claims that spending rose/fell overall when either subset may be capped.
- **Output:** Separate currencies and pending status; state sign assumption and credit treatment; include requested breakdown only.
