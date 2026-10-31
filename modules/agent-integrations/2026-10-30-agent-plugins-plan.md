# Money Bruh Agent Integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution or superpowers:subagent-driven-development if user selects delegation. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship shared Money Bruh finance skill with installable client adapters and explicit compatibility evidence.

**Architecture:** Canonical skill sources and adapter templates live in one module. Deterministic build copies self-contained packages into `packages/`; validation checks content, configuration, paths, and generation drift.

**Tech Stack:** Node 24, npm, TypeScript, Node test runner, Prettier; no running proxy or backend changes.

**Spec:** [Approved design](./2026-10-30-agent-plugins-design.md).

## Global Constraints

- **Ownership:** All new files stay in `money-bruh-skills`.
- **Runtime:** Node 24 and npm for build/validation; no long-running service or MCP proxy.
- **Clients:** Codex desktop/CLI, Claude Code, OpenCode, Copilot CLI, and Copilot in VS Code.
- **Updates:** One shared release version; regenerate every adapter together.
- **License:** Leave license unspecified until owner chooses; do not invent a license grant.
- **Secrets:** Keep keys outside repository files, generated artifacts, logs, fixtures, and chat prompts.
- **Delivery:** No public publication or remote push authorized by design approval alone.

## Review Focus

- **Installed paths:** Copied packages resolve every skill reference without source checkout access; Task 2 isolation tests.
- **Credentials:** Copilot remote placeholders remain literal; use native setup; Task 3 adapter assertions.
- **Amounts:** Mixed currencies, refunds, null currencies, and pending records retain separate buckets; Task 1 arithmetic tests.
- **Coverage:** Exactly 200 results imply possible truncation; local filtering never proves full-period totals; Task 1 behavior cases.
- **Config preservation:** Setup examples merge only named Money Bruh entries; Task 3 guides and fixture review.

## File map

| Files                                                                                    | Responsibility                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Root `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, Prettier config | Toolchain and scripts                                          |
| Module `skills/moneybruh/SKILL.md`, `references/*.md`                                    | Canonical triggers and workflows                               |
| Module `skills/moneybruh/scripts/summarize.mjs`                                          | Dependency-free decimal aggregation over returned transactions |
| Module `types.ts`, `services.ts`, `validation.ts`, `cli.ts`                              | Adapter types, packaging, checks, CLI dispatch                 |
| Module `adapters/{codex,claude-code,opencode,copilot}/`                                  | Versioned config and install-guide templates                   |
| Module `fixtures/`, `*.test.ts`, `evals.md`                                              | Synthetic data, regression tests, behavior evaluation cases    |
| Root `README.md`, module `AGENTS.md`, `compatibility.md`                                 | Install entry point, maintenance rules, evidence               |
| `packages/{codex,claude-code,opencode,copilot}/`                                         | Generated distributions                                        |

## Task 1: Canonical workflow skill

**Interfaces:**

- **Consumes:** Existing two MCP tools and documented response fields.
- **Produces:** Portable `moneybruh` skill plus `summarizeTransactions(transactions)` export in `scripts/summarize.mjs`.
- **Result:** Array of currency buckets with decimal-string posted outflows, posted credits, pending outflows, pending credits, and observed net outflow.

- [x] **Toolchain:** Configure strict TypeScript, formatting, Node 24 test runner, and npm scripts `build`, `test`, `type-check`, `format`, `format-check`, `validate`, `check-generated`.
- [x] **Tests:** Add synthetic arithmetic fixtures and `spending.test.ts`; verify USD `0.10 + 0.20 = 0.30`, separate EUR/unknown currencies, separate pending totals, and preserve negative credits.
- [x] **Red:** Run `npm test`; confirm missing arithmetic implementation failure.
- [x] **Implement:** Add deterministic decimal arithmetic helper; accept finite numeric amounts and reject invalid amounts rather than silently dropping records.
- [x] **Skill:** Write concise model-invoked description and reference routing for transaction, spending, and balance intents.
- [x] **Guidance:** Include cap disclosure, inclusive dates, local-filter scope, namespace suffix matching, unknown balances, freshness, account types, and safe error handling.
- [x] **Execution:** Helper accepts JSON through stdin; reads no credential/config files; prints only requested aggregate output; instructions offer client decimal calculator when Node unavailable.
- [x] **Evaluations:** Add positive/negative trigger prompts and expected response criteria for capped results, refunds, mixed currencies, embedded merchant instructions, and missing auth.
- [x] **Green:** Run arithmetic tests and Agent Skills validation; inspect all referenced files and trigger conflicts.
- [x] **Review:** Apply skill-creator-primer self-review and one fresh read-only skill review; resolve blocking findings.

## Task 2: Reproducible package generation

**Interfaces:**

- **Consumes:** Canonical skill tree and module adapter templates.
- **Produces:** `buildPackages(root: string): Promise<void>` in `services.ts` and `validatePackages(root: string): Promise<void>` in `validation.ts`.
- **CLI:** `cli.ts` accepts `build`, `validate`, or `check-generated`; resolves repo root independently of calling directory.

- [x] **Tests:** Add temporary-directory cases for two identical builds, stale output removal, installed-package isolation, missing references, and parent-directory/symlink escapes.
- [x] **Red:** Run generator/validation tests; confirm missing exports fail.
- [x] **Implement:** Copy canonical sources byte-for-byte; substitute release version only in template metadata; keep builds timestamp-free.
- [x] **Validation:** Check skill frontmatter, package-specific file structure, internal links/resources, allowed secret references, and shared version consistency.
- [x] **Drift:** Compare a temporary fresh build with checked-in packages; report mismatched/missing/extra files without mutating tracked outputs.
- [x] **Green:** Run generator/validation tests; verify output remains identical across two builds.

## Task 3: Native client adapters and onboarding

**Interfaces:**

- **Consumes:** Task 2 adapter source model and build/validate interfaces.
- **Produces:** Four distributions, Copilot CLI/VS Code setup variants, and top-level install navigation.

- [x] **Docs check:** Confirm current primary docs and installed-client help for config syntax, local install commands, endpoint configuration, and supported secret storage before finalizing templates.
- [x] **Tests:** Assert Codex `bearer_token_env_var`, Claude `${MONEYBRUH_API_KEY}`, OpenCode `{env:MONEYBRUH_API_KEY}` plus `oauth: false`, and absence of Copilot plugin HTTP credential placeholders.
- [x] **Red:** Run adapter tests against absent templates; confirm failure.
- [x] **Codex:** Add Agent Plugins manifest, companion native MCP config example, local install/marketplace instructions, and reload/discovery steps.
- [x] **Claude:** Add `.claude-plugin/plugin.json`, `.mcp.json`, and local installation guide with endpoint substitution and API-key env reference.
- [x] **OpenCode:** Add `.opencode/skills/` output and remote config merge example with OAuth disabled.
- [x] **Copilot:** Add skill package plus native auth setup; distinguish CLI/Copilot harness from VS Code Local harness secret-input support.
- [x] **Guides:** Preserve unrelated config; use complete URL copied from Money Bruh; cover HTTPS, key rotation/removal, verification/subscription denial, 429 handling, and one user-requested balance call.
- [x] **Green:** Generate packages; run adapter tests and package validation; review config merge examples against unrelated-server fixture.

## Task 4: Verification and delivery evidence

**Interfaces:**

- **Consumes:** Built packages, checks, fixtures, and client setup guides.
- **Produces:** `compatibility.md`, reviewed artifacts, and completion report with explicit unverified checks.

- [x] **Governance:** Create module `AGENTS.md` covering canonical sources, generated-output policy, tool/credential differences, arithmetic, and partial-data rules.
- [x] **Client checks:** Record installed versions; run supported native manifest validators or isolated loading checks without editing live client config.
- [x] **Isolation:** Use client-supported temporary config directories; mark unsupported isolated checks unavailable instead of changing normal user setup.
- [x] **Live evidence:** Use only explicitly configured credentials and endpoint; otherwise record authenticated discovery/tool calls as unverified.
- [x] **Behavior:** Execute available skill evaluations; retain prompt, expected criteria, observed result, and evaluator; mark cases not run.
- [x] **Review:** Run whole-change review against approved spec; fix correctness and packaging findings.
- [x] **Checks:** Run `npm run format-check`, `npm run type-check`, `npm test`, `npm run validate`, and `npm run check-generated`; require successful exit codes.
- [x] **Handoff:** Link install README and compatibility report; distinguish package validation from live account access; suggest module/repo `AGENTS.md` adjustments.
- [x] **Git:** Leave changes reviewable locally; create no commit, push, release, or public submission without further delivery instruction.

## Acceptance checks

```gherkin
Scenario: Reviewable release candidate
  Given all implementation tasks pass configured checks
  When the user reviews the release candidate
  Then four generated distributions contain the same canonical skill
  And installation instructions identify each client's connection setup
  And compatibility evidence distinguishes static, native, behavioral, and live checks
```

## Plan review

- **Coverage:** Tasks cover every approved design section and acceptance scenario.
- **Consistency:** Generator and validator interfaces remain identical across tasks.
- **Builder calls:** Add a packaged decimal helper for reproducible arithmetic; preserve calculator fallback when Node unavailable.
- **Recommendation:** Native execution; tightly coupled packaging and validation need one implementation context.
