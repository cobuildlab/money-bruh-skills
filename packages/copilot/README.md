# Money Bruh for GitHub Copilot

## CLI skill plugin

For a local session, mount package without changing installed plugins:

```sh
copilot --plugin-dir /absolute/path/to/money-bruh-skills/packages/copilot
```

- **Repository install:** After maintainer publishes repository changes, compatible clients can use `copilot plugin install OWNER/money-bruh-skills:packages/copilot`; replace owner with actual repo owner.
- **Version:** Package 0.1.0; Agent Plugins manifest with shared skills.

## CLI and VS Code Copilot harness connection

- **Prerequisites:** Follow [connection setup](SETUP.md); launch host with `MONEYBRUH_API_KEY` set.
- **Config:** Merge only `mcpServers.moneybruh` from [native config example](mcp-config.example.json) into personal `~/.copilot/mcp-config.json`, or equivalent configured personal path.
- **Endpoint:** Replace placeholder URL with full URL copied from Money Bruh `/api`.
- **Secret:** Keep `${MONEYBRUH_API_KEY}` reference in native user config; native HTTP headers support expansion.
- **Plugin boundary:** Remote plugin-bundled header placeholders are literal in documented Agent Plugins behavior; native connection remains separate.
- **VS Code host:** Copilot harness reads native Copilot MCP config; restart VS Code from configured environment if needed.
- **VS Code skill:** Copy package `skills/moneybruh/` into target project's `.github/skills/moneybruh/`, preserving all contents and unrelated skills; alternatively install compatible plugin through available plugin UI.
- **Verify:** Inspect Money Bruh tools and request stored balances; record actual tool result.

## VS Code Local harness alternative

- **Config:** Merge `servers.moneybruh` and Money Bruh `inputs` entry from [Local harness example](vscode-mcp.example.json) into workspace `.vscode/mcp.json` or user-profile MCP config.
- **Endpoint:** Replace placeholder URL; keep `${input:moneybruh-api-key}` reference.
- **Secret prompt:** Start server and enter key in masked native prompt; no key in JSON.
- **Harness limit:** Input variables are for Local harness; they do not forward to Copilot harness.
- **Removal:** Remove Money Bruh plugin/skill and native server/input entries; preserve unrelated config; revoke unused key.

## References

- **Plugins:** [Copilot plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference).
- **Native auth:** [Copilot MCP command/config reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference).
- **Harness differences:** [VS Code MCP formats and authentication](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).
