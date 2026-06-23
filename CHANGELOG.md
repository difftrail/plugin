# difftrail

## 0.1.2

### Patch Changes

- [#4](https://github.com/difftrail/plugin/pull/4) [`f21df48`](https://github.com/difftrail/plugin/commit/f21df48971eb10a7fa74e3ed330d8063696dd765) Thanks [@haldunanil](https://github.com/haldunanil)! - The MCP server URL in `.mcp.json` now honors a `DIFFTRAIL_MCP_URL` environment variable, defaulting to the production endpoint. Set `DIFFTRAIL_MCP_URL=http://localhost:3000/api/mcp` (e.g. `DIFFTRAIL_MCP_URL=... claude --plugin-dir .`) to point the plugin at a local dev server.

## 0.1.1

### Patch Changes

- [#2](https://github.com/difftrail/plugin/pull/2) [`cfdfb21`](https://github.com/difftrail/plugin/commit/cfdfb21071e7ba038781d28047f118ec12cd7b25) Thanks [@haldunanil](https://github.com/haldunanil)! - Set up automated releases via Changesets (version sync to plugin + marketplace manifests, release workflow).
