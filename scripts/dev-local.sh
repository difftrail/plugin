#!/usr/bin/env bash
# dev-local.sh — point the difftrail plugin at a local app, or restore production.
#
#   ./scripts/dev-local.sh on      # swap MCP url + OAuth metadata -> localhost:3000, print the launch command
#   ./scripts/dev-local.sh off     # restore the production endpoints
#   ./scripts/dev-local.sh status  # show the current targets
#
# Swaps the two prod URLs in the committed manifests to localhost for local dev,
# surgically (only the URL strings change) so you don't hand-edit them or
# accidentally commit a localhost URL. Both files MUST keep STATIC urls in git:
# `.mcp.json` is consumed by every MCP client, and the ${VAR:-default} substitution
# only works in Claude Code — other clients (e.g. codex) choke on the literal string.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_JSON="$ROOT/.mcp.json"
PLUGIN_JSON="$ROOT/.claude-plugin/plugin.json"
APP_DIR="$(dirname "$ROOT")/app"   # the app repo, sibling of the plugin (…/difftrail/app)
LOCAL_BASE="http://localhost:3000"
PROD_MCP="https://difftrail.haldunanil.com/api/mcp"
LOCAL_MCP="$LOCAL_BASE/api/mcp"
PROD_META="https://difftrail.haldunanil.com/.well-known/oauth-protected-resource/api/mcp"
LOCAL_META="$LOCAL_BASE/.well-known/oauth-protected-resource/api/mcp"

swap() { # swap(file, from, to) — surgical literal replace: only the URL string changes
  node -e 'const fs=require("fs");const[f,a,b]=process.argv.slice(1);fs.writeFileSync(f,fs.readFileSync(f,"utf8").split(a).join(b))' "$1" "$2" "$3"
}
mcp_url()  { node -e 'console.log(require(process.argv[1]).mcpServers.difftrail.url)' "$MCP_JSON"; }
meta_url() { node -e 'console.log(require(process.argv[1]).auth.resourceMetadataUrl)' "$PLUGIN_JSON"; }

case "${1:-}" in
  on)
    swap "$MCP_JSON" "$PROD_MCP" "$LOCAL_MCP"
    swap "$PLUGIN_JSON" "$PROD_META" "$LOCAL_META"
    echo "✓ local mode ON"
    echo "  mcp url             → $(mcp_url)"
    echo "  resourceMetadataUrl → $(meta_url)"
    echo
    echo "1) app (separate terminal):  (cd \"$APP_DIR\" && npm run dev)"
    echo "2) Claude Code, from the repo you want to review:"
    echo
    echo "   claude --plugin-dir \"$ROOT\""
    echo
    echo "3) in session: /mcp → authenticate, then /pr-walkthrough"
    echo "   (after plugin edits: /reload-plugins --force)"
    ;;
  off)
    swap "$MCP_JSON" "$LOCAL_MCP" "$PROD_MCP"
    swap "$PLUGIN_JSON" "$LOCAL_META" "$PROD_META"
    echo "✓ local mode OFF (restored production)"
    echo "  mcp url             → $(mcp_url)"
    echo "  resourceMetadataUrl → $(meta_url)"
    echo "  if Claude Code is open: /reload-plugins --force"
    ;;
  status)
    echo "mcp url             → $(mcp_url)"
    echo "resourceMetadataUrl → $(meta_url)"
    ;;
  *)
    echo "usage: $(basename "$0") on|off|status" >&2; exit 1 ;;
esac
