# Account balances

## Read

- **Tool:** `moneybruh_account_balances`; optional `accountIds` filter.
- **Payload:** JSON text containing `accounts`.
- **Fields:** `id`, `name`, `officialName`, `institutionName`, `institutionId`, `mask`, `type`, `subtype`, `currencyCode`, `currentBalance`, `availableBalance`.
- **Selection:** Use returned account IDs for later transaction queries; resolve ambiguous names with user.

## Report

- **Table:** Institution, account name/type, currency, current balance, and available balance.
- **Unknowns:** Null balance means unknown, never zero; missing currency stays unknown.
- **Freshness:** These are stored Money Bruh balances; payload has no sync timestamp; never claim refreshed or real-time bank data.
- **Totals:** Separate currencies and asset/liability types; do not add credit balances to cash or label results net worth.
- **Privacy:** Omit full IDs and masks unless needed to distinguish accounts.
- **Empty:** State no accounts returned for filter; avoid inventing account existence or ownership.
