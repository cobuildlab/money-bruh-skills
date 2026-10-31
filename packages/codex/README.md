# Money Bruh for Codex

## Install skill plugin

Run from repository root; replace path with absolute checkout path:

```sh
codex plugin marketplace add /absolute/path/to/money-bruh-skills/packages/codex
codex plugin add moneybruh@moneybruh-local
```

- **Desktop:** Restart Codex if needed; select Money Bruh marketplace in plugin directory and enable Money Bruh.
- **Version:** Package 0.1.0; includes portable manifest and Codex compatibility manifest.
- **Scope:** This plugin supplies skill; native MCP connection configured separately below.

## Connect

- **Prerequisites:** Follow [connection setup](SETUP.md), including session environment.
- **Config:** Merge [native MCP example](config.example.toml) into your Codex config; replace URL with value copied from `/api`.
- **Secret:** Keep `bearer_token_env_var` pointing to `MONEYBRUH_API_KEY`; no literal header or key in TOML.
- **Launch:** Start `codex` from configured shell; ensure desktop process inherits same variable if using desktop.
- **Check:** Follow discovery and balance request in setup guide.
- **Remove:** Uninstall `moneybruh@moneybruh-local`, remove only native Money Bruh config section, and remove unused secret.

## References

- **Packaging:** [Official plugin documentation](https://developers.openai.com/plugins/build/plugins).
- **Connection:** [Official native MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
