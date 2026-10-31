# Agent integrations

- **Ownership:** This repository owns packaging and reusable workflows; API owns MCP behavior, authentication, quotas, and account isolation.
- **Sources:** Edit `skills/moneybruh/` and `adapters/`; `packages/` contains generated distributions.
- **Commands:** Node 24 with npm; run format, build, format-check, type-check, test, validate, and check-generated before delivery.
- **Versions:** Root package version drives every adapter; keep lockfile consistent.
- **Catalogs:** Root `.agents/plugins/`, `.claude-plugin/`, and `.github/plugin/` catalogs target Codex, Claude Code, and Copilot respectively; keep versions aligned and validate paths before release.
- **Secrets:** Ship only supported secret references; use synthetic credentials in native client checks; never inspect customer credentials for package tests.
- **Auth:** Codex native config uses `bearer_token_env_var`; Claude uses `${MONEYBRUH_API_KEY}`; OpenCode uses `{env:MONEYBRUH_API_KEY}` with OAuth disabled.
- **Copilot:** Native user HTTP headers support env expansion; remote plugin configuration may keep placeholders literal; keep connection separate from skill plugin.
- **VS Code:** Masked `input` variables apply only to Local harness; Copilot harness uses native config/env auth.
- **Tools:** Match supported tool name suffixes across namespaces; expose no financial writes.
- **Coverage:** Transaction cap is 200; no pagination/completeness metadata; capped or locally filtered results never prove full-period totals.
- **Money:** Use decimal-safe aggregation; separate currencies, pending records, and credits; state sign assumptions.
- **Balances:** Null means unknown; no sync timestamp; separate assets and credit liabilities.
- **Validation:** Native load, static checks, offline agent evaluations, and authenticated calls prove different things; report them separately.
- **Isolation:** Test clients with temporary config/data directories where supported; preserve live client config and unrelated files.
- **Docs:** Keep specs/plans/evidence in this module; keep generated install guides self-contained.
