# Money Bruh for Claude Code

## Install and connect

- **Prerequisites:** Follow [connection setup](SETUP.md); set both `MONEYBRUH_MCP_URL` and `MONEYBRUH_API_KEY` in launch shell.
- **Package:** Load local plugin from absolute path; hidden `.claude-plugin/` and `.mcp.json` must remain in copied package.

```sh
claude --plugin-dir /absolute/path/to/money-bruh-skills/packages/claude-code
```

- **Discovery:** Open `/mcp`; inspect Money Bruh server and both tools; run balance request from setup guide.
- **Skill:** Invoke `/moneybruh:moneybruh` explicitly if automatic skill selection does not occur.
- **Environment:** `.mcp.json` uses environment references; no edit or literal key required in distributed package.
- **Version:** Package 0.1.0; native plugin validation supported by installed Claude Code.
- **Duplicate connections:** Disable pre-existing manual Money Bruh connection if it points to same endpoint; preserve unrelated servers.
- **Removal:** Omit `--plugin-dir`, remove unused environment values, and revoke unused key in Money Bruh.

## References

- **Plugin:** [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference).
- **Auth:** [MCP environment expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson).
