# Money Bruh connection

## Before connecting

- **Account:** Open signed-in Money Bruh `/api`; copy full MCP URL and create an API key.
- **Eligibility:** Verify email and phone; use eligible subscription.
- **Transport:** Streamable HTTP with Bearer API key; server has no OAuth flow; GET `/mcp` returning 405 is expected.
- **Endpoint:** Use copied HTTPS URL; explicit localhost HTTP is for development only; never include key in URL.
- **Credentials:** Keep key in password manager or client-supported secret storage/session environment; enter it outside agent chat.
- **Config:** Merge only Money Bruh entry into existing config; preserve other servers and inputs; do not replace whole config file.

## Session environment

Start Bash for this example, including on systems whose default shell is Zsh:

```sh
bash
```

Then run in that Bash session:

```bash
read -r -p 'MCP URL from Money Bruh /api: ' MONEYBRUH_MCP_URL
export MONEYBRUH_MCP_URL
read -r -s -p 'Money Bruh API key: ' MONEYBRUH_API_KEY
export MONEYBRUH_API_KEY
printf '\n'
```

- **Launch:** Start client from same shell so it inherits variables; desktop launches may require environment configuration through approved launcher.
- **Lifetime:** Environment values remain in that shell and child processes; close shell or unset after use.
- **Storage:** Avoid literal keys in shell commands, history, config, repository, screenshots, logs, or chat.
- **VS Code Local:** Masked native input in supplied example avoids environment setup for key.

## Verify

- **Discovery:** Reload client and inspect MCP tools; expect `moneybruh_list_transactions` and `moneybruh_account_balances`, possibly prefixed by client.
- **Request:** Ask “Use Money Bruh to show my stored account balances.”
- **Evidence:** Inspect actual tool call and returned account data; a plausible model answer alone does not establish connection.
- **Usage:** Initialization, discovery, and admitted calls consume shared REST/MCP quota.
- **Freshness:** Returned balances reflect stored data; current tool has no synchronization timestamp.

## Troubleshooting and removal

| Symptom                 | Action                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| No tools                | Check installation, endpoint, environment inheritance, client reload, and tool enablement                                                   |
| 401                     | Replace invalid/revoked key in secret source; restart client; avoid retry loop                                                              |
| Access denied           | Check email/phone verification and subscription in Money Bruh                                                                               |
| 429 rate limit          | Wait exposed `Retry-After`; stop if client hides retry timing                                                                               |
| Monthly quota exhausted | Wait reset or change plan; stop automatic retries                                                                                           |
| Network/service error   | Report data unavailable; retry only after connection recovers                                                                               |
| Key rotation            | Rotate in Money Bruh, replace secret source, and restart client                                                                             |
| Removal                 | Remove Money Bruh plugin/skill and only its MCP config entry; remove secret input/env reference; revoke key in Money Bruh if no longer used |

- **Private output:** Keep finance records and temporary aggregation files outside source control; show only requested account details.
- **Writes:** Current tools cannot move money, categorize transactions, change budgets, or refresh banks.
