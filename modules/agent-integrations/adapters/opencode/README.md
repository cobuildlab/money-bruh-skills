# Money Bruh for OpenCode

## Install and connect

- **Prerequisites:** Follow [connection setup](SETUP.md); set `MONEYBRUH_MCP_URL` and `MONEYBRUH_API_KEY` before launching OpenCode.
- **Skills:** Copy packaged `.opencode/skills/moneybruh/` into target project's `.opencode/skills/moneybruh/`; preserve references and script.
- **Existing skill:** Review existing Money Bruh folder before replacement; leave unrelated skills untouched.
- **Config:** Merge only `mcp.moneybruh` from [config example](opencode.example.json) into target project's `opencode.json` or `opencode.jsonc`.
- **Auth:** Preserve `oauth: false`; API-key server does not offer OAuth; config uses OpenCode-specific environment syntax.
- **Run:** Launch `opencode` from configured shell in target project.
- **Verify:** Inspect MCP connection and request stored balances; ask agent to load `moneybruh` skill if not selected automatically.
- **Version:** Package {{VERSION}}; native skill/config integration, no JavaScript OpenCode extension required.
- **Removal:** Remove only Money Bruh skill folder and `mcp.moneybruh`; remove unused environment values/key.

## References

- **Skills:** [OpenCode skill discovery](https://opencode.ai/docs/skills/).
- **Connection:** [OpenCode remote MCP configuration](https://opencode.ai/docs/mcp-servers/).
