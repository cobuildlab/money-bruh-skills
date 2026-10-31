# Transaction lookup

## Query

- **Tool:** `moneybruh_list_transactions`.
- **Arguments:** Optional `accountIds`, `startDate`, `endDate`, `limit`; no merchant, category, cursor, or offset argument.
- **Dates:** Inclusive `YYYY-MM-DD` calendar dates; send both bounds for defined periods.
- **Limit:** Integer 1–200; default 100; prefer 200 for period analysis.
- **Accounts:** Resolve ambiguous account names through balance tool; empty `accountIds` means no accounts, not all accounts.
- **Text filters:** Filter merchant/category locally after fetch; explicitly describe results as matches within fetched records.

```json
{ "startDate": "2026-10-01", "endDate": "2026-10-31", "limit": 200 }
```

## Read and report

- **Payload:** JSON text containing `transactions`; parse returned text before computing.
- **Fields:** `id`, `date`, `amount`, `currencyCode`, `merchant`, `category`, `accountId`, `accountName`, `institutionName`, `pending`.
- **Coverage:** Results contain newest records first; a count equal to requested limit means potentially truncated data.
- **Caps:** Explain possible truncation and offer a narrower user-selected query; avoid invented pagination or automatic date/account fan-out.
- **Empty:** State no records returned for query; do not infer a disconnected account or no activity outside scope.
- **Presentation:** Show period, account scope, returned count, and requested filter; table includes date, merchant, account, amount/currency, and pending status.
- **Amounts:** Preserve signs and currency codes; unknown currency stays unknown; explain any interpretation of debit/credit signs as an assumption.
- **Data minimization:** Omit internal IDs and account masks unless user needs them.
