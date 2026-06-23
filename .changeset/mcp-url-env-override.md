---
"difftrail": patch
---

The MCP server URL in `.mcp.json` now honors a `DIFFTRAIL_MCP_URL` environment variable, defaulting to the production endpoint. Set `DIFFTRAIL_MCP_URL=http://localhost:3000/api/mcp` (e.g. `DIFFTRAIL_MCP_URL=... claude --plugin-dir .`) to point the plugin at a local dev server.
