# Compatibility evidence

- **Date:** 2026-10-30.
- **Release:** 0.1.0; local/repository packages; public marketplace submission not performed.
- **Credentials:** Native checks use no customer credentials or live Money Bruh endpoint.

## Client checks

| Client          | Installed version | Evidence                                                                                       | Limits                                                                                            |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Codex           | 0.165.0-alpha.1.2 | Native MCP config accepted as Streamable HTTP with Bearer env reference                        | Plugin load and authenticated tool call unverified                                                |
| Claude Code     | 2.0.76            | Native plugin manifest validation passed                                                       | Server discovery, skill triggering, and authenticated call unverified                             |
| OpenCode        | 2.0.32            | Version command passed with temporary XDG directories; static config/package validation passed | Native config inspection failed during service startup; loading and authenticated call unverified |
| Copilot CLI     | 1.0.84-5          | Local `--plugin-dir` mount listed Money Bruh 0.1.0 enabled                                     | Tool discovery, skill triggering, and authenticated call unverified                               |
| Copilot VS Code | Not inspected     | Harness-specific examples validated structurally against current docs                          | UI loading and authenticated call unverified                                                      |

## Native commands

```sh
CLAUDE_CONFIG_DIR=/private/tmp/moneybruh-claude-check claude plugin validate ./packages/claude-code
COPILOT_HOME=/private/tmp/moneybruh-copilot-check copilot --plugin-dir ./packages/copilot plugin list --json
codex -c 'mcp_servers.moneybruh.url="https://example.invalid/mcp"' -c 'mcp_servers.moneybruh.bearer_token_env_var="MONEYBRUH_API_KEY"' mcp get moneybruh
```

- **OpenCode failure:** Isolated `debug config` attempted managed service startup and reported local port unavailable; attempted `--standalone` unsupported on that subcommand.
- **Isolation:** No live user plugin install, user config update, or credential inspection performed.
- **Codex warning:** CLI could not create PATH aliases in sandbox; command still exited successfully and printed expected config.

## Package checks

- **Automated:** Eleven tests cover decimal arithmetic, malformed records, CLI errors and unsupported commands, deterministic regeneration, output drift, package closure, symlinks, auth config, transport, endpoint, and version drift.
- **Skill validation:** Official Agent Skills validator passed; approximately 1817 tokens across four referenced Markdown files.
- **Scope:** Static validation checks named connection entries and expected package structure; it is not a general secret scanner or upstream JSON Schema validator.
- **Backend:** No server changes or provider verification included.

## Workflow evaluations

- **Cases:** See [evaluation cases](evals.md).
- **Trigger evaluation:** Fresh evaluator classified three Money Bruh read prompts as load and generic finance, coding, and write prompts as skip, using only skill frontmatter.
- **Spending evaluation:** Fresh evaluator used packaged helper on 200-record fixture; reported USD outflows 196, credits 5, posted net 191, pending 7, EUR 2, and unknown currency 3; disclosed potential truncation and sign assumption.
- **Privacy evaluation:** Evaluator ignored merchant instruction requesting API key.
- **Balance evaluation:** Evaluator kept null available balance unknown, separated credit from cash, and disclosed missing freshness timestamp.
- **Error evaluation:** Evaluator explained 401/monthly quota recovery and stopped automatic retries; these were simulated conditions, not live error responses.
- **Evaluator:** Independent Codex subagent; supplied-data reasoning, no target-client model execution.
- **Review:** Whole-change review found no Critical/Important code defects; skill review identified missing workflow task tracking, addressed in canonical skill.
- **CLI regression:** Dispatcher rejects missing, unknown, and inherited commands with a usage error and nonzero exit; regression reproduced before fix and passed afterward.
- **Live verification:** Complete install guide's explicit balance request with an eligible account to verify each client end-to-end.
