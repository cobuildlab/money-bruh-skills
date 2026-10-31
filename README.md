# Money Bruh agent integrations

- **Purpose:** Connect coding agents to Money Bruh and reuse transaction, spending, and balance workflows.
- **Version:** 0.1.0; repository-hosted marketplaces and downloadable release packages; official directory submission not performed.
- **Access:** Money Bruh account with verified email/phone, eligible subscription, MCP URL, and API key from signed-in `/api` page.

## Install

Register repository marketplace, then install skill plugin for your client:

```sh
# Codex
codex plugin marketplace add cobuildlab/money-bruh-skills
codex plugin add moneybruh@moneybruh

# Claude Code
claude plugin marketplace add cobuildlab/money-bruh-skills
claude plugin install moneybruh@moneybruh

# GitHub Copilot CLI
copilot plugin marketplace add cobuildlab/money-bruh-skills
copilot plugin install moneybruh@moneybruh
```

- **Authentication:** Complete matching setup guide below after plugin installation.
- **Downloads:** [v0.1.0 GitHub release](https://github.com/cobuildlab/money-bruh-skills/releases/tag/v0.1.0) includes four package ZIPs and SHA-256 checksums.

| Client                       | Guide                                          | Package                 |
| ---------------------------- | ---------------------------------------------- | ----------------------- |
| Codex desktop / CLI          | [Codex setup](packages/codex/README.md)        | `packages/codex/`       |
| Claude Code                  | [Claude setup](packages/claude-code/README.md) | `packages/claude-code/` |
| OpenCode                     | [OpenCode setup](packages/opencode/README.md)  | `packages/opencode/`    |
| GitHub Copilot CLI / VS Code | [Copilot setup](packages/copilot/README.md)    | `packages/copilot/`     |

- **Connection:** Follow client guide; installation and authentication are separate steps on some clients.
- **Keys:** Enter credentials outside chat; packages contain only secret references.
- **Examples:** “Show my Money Bruh balances”; “Find transactions from October 1–15”; “Summarize observed grocery spending this month.”
- **Limits:** Transaction results cap at 200 without pagination; summaries describe observed records, not guaranteed complete period totals.
- **Read-only:** No transfers, categorization writes, budget changes, or forced bank refresh.
- **Evidence:** See [compatibility report](modules/agent-integrations/compatibility.md) for tested versions and remaining live checks.

## Develop

```sh
nvm use 24
npm ci
npm run format
npm run build
npm run format-check
npm run type-check
npm test
npm run validate
npm run check-generated
```

- **Canonical skill:** Edit `modules/agent-integrations/skills/moneybruh/`.
- **Adapters:** Edit `modules/agent-integrations/adapters/`; shared onboarding lives under `adapters/common/`.
- **Generated files:** Regenerate `packages/`; preserve generated files in repository for installation without build tools.
- **Client runtime:** Node 24 runs optional decimal summarizer; client calculator fallback supports environments without Node.
- **Release version:** Change root `package.json`, lockfile, and three root marketplace catalogs consistently, then regenerate all adapters.
- **Tests:** Synthetic fixtures; no production endpoint or credentials required.
- **Maintenance:** Read [module instructions](modules/agent-integrations/AGENTS.md) before changes.
- **License:** No license grant declared; owner must choose before public release.
