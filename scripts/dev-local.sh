#!/usr/bin/env bash
# dev-local.sh — point the difftrail plugin at a local app, or restore production.
#
#   ./scripts/dev-local.sh on      # OAuth metadata -> localhost:3000, print the launch command
#   ./scripts/dev-local.sh off     # restore the production endpoint
#   ./scripts/dev-local.sh status  # show the current target
#
# .mcp.json's URL is already env-driven (DIFFTRAIL_MCP_URL); this flips the one
# piece that isn't — plugin.json's auth.resourceMetadataUrl — so you don't hand-edit
# it (and don't accidentally commit a localhost URL).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_JSON="$ROOT/.claude-plugin/plugin.json"
APP_DIR="$(dirname "$ROOT")/app"   # the app repo, sibling of the plugin (…/difftrail/app)
LOCAL_BASE="http://localhost:3000"
PROD_META="https://difftrail.haldunanil.com/.well-known/oauth-protected-resource/api/mcp"
LOCAL_META="$LOCAL_BASE/.well-known/oauth-protected-resource/api/mcp"

swap() { # surgical literal replace: only the URL string changes
  node -e 'const fs=require("fs");const[f,a,b]=process.argv.slice(1);fs.writeFileSync(f,fs.readFileSync(f,"utf8").split(a).join(b))' "$PLUGIN_JSON" "$1" "$2"
}
current() { node -e 'console.log(require(process.argv[1]).auth.resourceMetadataUrl)' "$PLUGIN_JSON"; }

case "${1:-}" in
  on)
    swap "$PROD_META" "$LOCAL_META"
    echo "✓ local mode ON — resourceMetadataUrl → $(current)"
    echo
    echo "1) app (separate terminal):  (cd \"$APP_DIR\" && npm run dev)"
    echo "2) Claude Code, from the repo you want to review:"
    echo
    echo "   DIFFTRAIL_MCP_URL=$LOCAL_BASE/api/mcp claude --plugin-dir \"$ROOT\""
    echo
    echo "3) in session: /mcp → authenticate, then /pr-walkthrough"
    echo "   (after plugin edits: /reload-plugins --force)"
    ;;
  off)
    swap "$LOCAL_META" "$PROD_META"
    echo "✓ local mode OFF — resourceMetadataUrl → $(current)"
    echo "  if Claude Code is open: /reload-plugins --force"
    ;;
  status)
    echo "resourceMetadataUrl → $(current)"
    ;;
  *)
    echo "usage: $(basename "$0") on|off|status" >&2; exit 1 ;;
esac
