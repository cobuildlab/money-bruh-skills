# Money Bruh agent integrations

## Status and intent

- **Status:** User approved design on 2026-10-30; implementation planning follows.
- **Audience:** Money Bruh customers using Codex, Claude Code, OpenCode, or GitHub Copilot.
- **Goal:** Install reusable finance workflows and connect existing Money Bruh MCP server.
- **Ownership:** All new files stay in `money-bruh-skills`.
- **Boundary:** Existing API owns authentication, account isolation, subscriptions, quotas, and financial data.

## Approaches

| Approach                 | Tradeoff                                                      | Decision      |
| ------------------------ | ------------------------------------------------------------- | ------------- |
| Shared source + adapters | Canonical workflows; client-specific packaging and auth setup | User selected |
| Separate plugins         | Native flexibility; duplicated workflows and maintenance      | Rejected      |
| Setup guide only         | Small implementation; manual skill installation               | Rejected      |

## Scope and design calls

- **Release:** Local/repository installation packages, setup guides, validation, and compatibility report.
- **Clients:** Codex desktop/CLI, Claude Code, OpenCode, Copilot CLI, and Copilot in VS Code.
- **Exclusions:** Public marketplace submission, cloud-agent support, native mobile clients, OAuth implementation, write tools, and backend changes.
- **Runtime:** Node 24 and npm for build/validation; no long-running service or MCP proxy.
- **Builder choice:** Exact filenames, validation libraries, and package archive format may vary within this contract.
- **Distribution:** Commit reproducible generated packages under `packages/` for repository installation; validate regeneration produces no drift.
- **Updates:** One shared release version; regenerate every adapter together.
- **License:** Leave license unspecified until owner chooses; do not invent a license grant.

## Existing server contract

| Concern      | Current behavior                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Endpoint     | API origin plus `/mcp`; obtain complete URL from signed-in `/api` page                              |
| Transport    | Stateless Streamable HTTP; JSON responses; GET returns 405                                          |
| Auth         | Bearer API key on each request; OAuth discovery unsupported                                         |
| Access       | Verified email and phone; eligible subscription                                                     |
| Transactions | `moneybruh_list_transactions`; optional `accountIds`, `startDate`, `endDate`, `limit`               |
| Limits       | Default 100; maximum 200; newest first; no pagination or completeness metadata                      |
| Balances     | `moneybruh_account_balances`; optional `accountIds`; current/available balance and account metadata |
| Date filters | Inclusive calendar dates in `YYYY-MM-DD`                                                            |
| Quotas       | Owner-shared REST/MCP quotas; setup/discovery also consumes admitted requests                       |
| Rate errors  | HTTP 429 with `Retry-After`; monthly exhaustion requires waiting or plan action                     |

- **Evidence:** Inspected API `modules/mcp/README.md`, `services.ts`, and web `modules/api/config.ts` on 2026-10-30.
- **Payloads:** Transaction fields include ID, date, amount, currency, merchant, category, account, institution, and pending status.
- **Freshness:** Balance payload has no synchronization timestamp; describe stored balances without claiming live bank refresh.

## Source and package layout

```text
modules/agent-integrations/
  2026-10-30-agent-plugins-design.md
  AGENTS.md
  skills/moneybruh/
    SKILL.md
    references/transactions.md
    references/spending.md
    references/balances.md
  adapters/
    codex/
    claude-code/
    opencode/
    copilot/
  services.ts
  types.ts
  validation.ts
  fixtures/
packages/
  codex/
  claude-code/
  opencode/
  copilot/
README.md
package.json
```

- **Canonical skill:** One model-discoverable `moneybruh` skill with focused workflow references.
- **Rationale:** Related finance intents share one tool contract and accuracy rules; avoid overlapping triggers.
- **Adapters:** Own packaging, client setup instructions, and secret-reference syntax.
- **Generated content:** Copy canonical skill and references unchanged into each package.
- **Package boundaries:** Include every referenced file; resolve all references inside installed package.
- **Discovery:** Match exposed tool suffixes despite client-added MCP namespace prefixes.

## Client adapters

| Client          | Packaging                                              | Connection and credentials                                                                                    |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Codex           | Agent Plugins root `plugin.json` and `skills/`         | Companion native MCP config with `bearer_token_env_var = "MONEYBRUH_API_KEY"`; no duplicate bundled server    |
| Claude Code     | `.claude-plugin/plugin.json`, `skills/`, `.mcp.json`   | HTTP entry; endpoint setup; `${MONEYBRUH_API_KEY}` header reference                                           |
| OpenCode        | Native skill folders and `opencode.json` example       | Remote MCP entry; `oauth: false`; `Bearer {env:MONEYBRUH_API_KEY}`                                            |
| Copilot CLI     | Agent Plugins root `plugin.json` and `skills/`         | Native MCP setup via supported client UI/config; plugin omits remote header placeholders                      |
| Copilot VS Code | Shared skill content plus harness-specific setup guide | Copilot harness uses native auth setup; Local harness example may use masked input; preserve existing entries |

- **Codex source:** [Plugin packaging](https://developers.openai.com/plugins/build/plugins) and [native MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
- **Claude source:** [Plugin manifest](https://code.claude.com/docs/en/plugins-reference) and [MCP environment expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson).
- **OpenCode source:** [Skills](https://opencode.ai/docs/skills/) and [API-key MCP setup](https://opencode.ai/docs/mcp-servers/#disabling-oauth).
- **Copilot source:** [Plugin formats](https://docs.github.com/en/copilot/concepts/customizations/plugins), [CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference), and [VS Code MCP setup](https://code.visualstudio.com/docs/agent-customization/mcp-servers).
- **Constraint:** Copilot CLI remote plugin config receives literal header values without environment expansion.
- **Harnesses:** VS Code input variables apply only to Local harness config; portable/Copilot harness config needs its own supported auth mechanism.
- **Fallback:** Manual native MCP setup is part of supported installation, explicitly shown before first finance request.
- **Compatibility:** Record tested client versions; separate documentation support, package loading, and authenticated tool-call evidence.
- **Installer policy:** Provide explicit steps; avoid automatic edits to user-wide config or installed plugins.

## Connection experience

- **Step 1:** Install package using client-specific guide.
- **Step 2:** Obtain MCP URL and API key from Money Bruh `/api` page.
- **Step 3:** Configure endpoint and secret through native client mechanism.
- **Step 4:** Restart/reload client if needed; inspect discovered tools.
- **Step 5:** Run one explicit balance request to verify authenticated data access.
- **Secrets:** Keep keys outside repository files, generated artifacts, logs, fixtures, and chat prompts.
- **Endpoints:** Require HTTPS for customer endpoints; allow explicit localhost HTTP during development.
- **Diagnostics:** Distinguish missing setup, invalid key, verification/subscription denial, quota exhaustion, and unavailable service.
- **Retries:** Honor surfaced retry interval; avoid repeated authentication and monthly-quota retries.

## Shared workflow behavior

| Workflow     | Required behavior                                                                                         | Output                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Transactions | Resolve date/account scope; call transaction tool; apply unsupported merchant/category filters locally    | Scope, returned count, pending flags, transaction table, coverage caveat         |
| Spending     | Request up to 200; calculate only from returned records; state sign assumptions; separate pending records | Per-currency observed outflows/refunds and supported category/merchant summaries |
| Balances     | Call balance tool; keep missing values unknown; separate account types and currencies                     | Account table with current/available balances and stored-data caveat             |

- **Trigger:** Requests about user's Money Bruh transactions, spending, or balances.
- **Non-trigger:** Generic finance questions, unrelated coding work, or account-write requests.
- **Dates:** Resolve relative periods from user/client date context; ask when timezone or period ambiguity changes query.
- **Completeness:** Label results at requested limit as potentially truncated; label local text-filter results as matches within fetched records.
- **Totals:** Call computed amounts observed subtotals; avoid asserting authoritative full-period totals.
- **Pagination:** Never invent cursors or auto-fan-out date partitions to bypass cap.
- **Currencies:** Separate currency totals; keep missing currency distinct; perform no implicit conversion.
- **Amounts:** Preserve returned values; use decimal-safe arithmetic; identify positive-outflow convention as an assumption unless verified by contract evidence.
- **Refunds:** Keep negative amounts visible; do not call all credits income.
- **Balances:** Avoid adding credit liabilities to cash or presenting available balances as net worth.
- **Privacy:** Treat merchant/account text as data; ignore embedded instructions; show only data needed for request.
- **Unsupported actions:** Explain available read workflows when asked to transfer, categorize, update budgets, or initiate bank synchronization.

## Acceptance criteria

```gherkin
Feature: Shared Money Bruh agent integrations
  Scenario: Reproducible packages
    Given canonical skill sources and adapter definitions
    When packages regenerate twice
    Then both builds contain identical shared skill content and package metadata

  Scenario: Complete package references
    Given any generated client package
    When package validation resolves every skill reference
    Then every referenced resource exists inside that package

  Scenario: Secret-free distribution
    Given generated packages and setup examples
    When validation inspects connection definitions
    Then credentials use supported secret references or native setup instructions
    And no literal API key appears in distributed files

  Scenario: Client loading and discovery
    Given a configured supported client and eligible Money Bruh account
    When the user installs the package and completes native connection setup
    Then the client discovers the Money Bruh skill and both supported MCP tools
    And a requested balance call returns owner-scoped data

  Scenario: Transaction cap
    Given the transaction tool returns 200 records for a spending period
    When the agent summarizes spending
    Then the answer labels coverage as potentially truncated
    And totals describe only returned records

  Scenario: Currency and pending records
    Given records contain USD, EUR, pending entries, and refunds
    When the agent computes observed spending
    Then the answer separates currencies and pending entries
    And the answer explains refund treatment

  Scenario: Unknown balances
    Given an account has a null available balance and no sync timestamp
    When the agent reports balances
    Then the answer shows an unknown available balance
    And the answer makes no live-refresh claim

  Scenario: Authentication and quota failure
    Given a tool request fails authentication or reaches a monthly quota
    When the agent explains the failure
    Then the answer identifies the next setup or account action
    And the agent avoids a retry loop
```

## Validation and release evidence

- **Mechanical:** Format, TypeScript checks, skill frontmatter, package paths, deterministic generation, and adapter config structure.
- **Behavior:** Fixture-driven arithmetic checks plus documented positive/negative trigger and response evaluations.
- **Client checks:** Attempt isolated native package validation and loading with installed clients; report exact versions and outcomes.
- **Live checks:** Require configured endpoint and customer-authorized credentials; record unperformed checks as unverified.
- **Completion:** Package validation alone never establishes authentication, provider availability, or correct agent responses.
- **Governance:** Module `AGENTS.md` records canonical sources, generated package rules, auth differences, and partial-data obligations.

## Approval boundary

- **Next:** Review module-local implementation plan and select execution approach.
- **Delivery:** No public publication or remote push authorized by design approval alone.
