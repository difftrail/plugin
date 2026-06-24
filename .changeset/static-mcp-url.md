---
"difftrail": patch
---

Use a static URL in `.mcp.json`. The `${DIFFTRAIL_MCP_URL:-…}` substitution added for local dev only works in Claude Code — other MCP clients (e.g. codex) pass the literal string to the URL parser and fail with "relative URL without a base". `.mcp.json` is consumed by every client, so its URL must be static. Local dev now swaps the URL via `scripts/dev-local.sh` instead of an env var.
