# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code **plugin** (no build/test/lint — it's JSON config + markdown). It bundles one skill, `pr-walkthrough`, and a remote MCP server connection. The skill produces a structured tour of a GitHub PR and publishes it to the hosted Difftrail app at `https://difftrail.haldunanil.com` (source: the private `difftrail/app` repo), returning a shareable URL.

There is no compile step. "Testing" a change means installing the plugin in Claude Code (`/plugin marketplace add difftrail/plugin` → `/plugin install difftrail@difftrail` → `/reload-plugins`) and running `/pr-walkthrough` against a real PR.

## Layout

- `.claude-plugin/plugin.json` — plugin manifest (name `difftrail`, OAuth2.1 auth config)
- `.claude-plugin/marketplace.json` — marketplace manifest (`difftrail`) pointing at this repo
- `.mcp.json` — declares the remote `difftrail` HTTP MCP server that exposes `upload_walkthrough`
- `skills/pr-walkthrough/SKILL.md` — the **controller** (orchestration steps, run by the main loop)
- `skills/pr-walkthrough/walkthrough-prompt.md` — the **agent prompt template** (filled and dispatched to a subagent)

## Architecture

**Controller / agent split.** `SKILL.md` is a controller that runs in the main loop: it resolves the PR number, fetches metadata via `gh`/`git`, fills the `walkthrough-prompt.md` template with `{PLACEHOLDER}` values, dispatches a `general-purpose` subagent, then uploads the agent's result via the MCP tool. The agent itself only reads diffs and emits JSON — it never uploads. Keep the substitution placeholders in the two files in sync (e.g. `{PR_NUMBER}`, `{HEAD_SHA}`, `{OWNER_REPO}`, `{COMMITS_LIST}`, `{FILES_LIST}`).

**Pointer JSON, not diffs.** The single most important design constraint: the agent emits a JSON document of *pointers* (`file` + optional `lines`) plus narrative prose — it never copies diff or source text into the JSON. The server resolves the real code from git using those pointers. This keeps agent output small and lets it scale to arbitrarily large PRs. Any change to the prompt must preserve this — "transcribe the diff into the JSON" is an anti-goal.

**`upload_walkthrough` contract.** The controller calls `mcp__plugin_difftrail_difftrail__upload_walkthrough` with `{ pointerJson, repo, prNumber, sha }`. On an `isError` response, re-dispatch the agent **once** with the errors appended, then retry the upload once more; if it still errors, stop and report. The JSON shape the server validates is the full spec in `walkthrough-prompt.md` §6 — that file is the source of truth for the schema.

**Read-only.** Both the skill and the agent are strictly read-only with respect to the repo and the PR: no source edits, no writing JSON to disk, no PR comments/labels/merges, only read-only `gh`/`git`. This is enforced by the prompt, not by subagent capabilities (which is why the agent is `general-purpose`, not `Explore` — it needs Bash to read diffs).

**Exploration, not review.** `pr-walkthrough` explains *what changed and why*; it does not score severity or recommend fixes. Review is a separate concern (`comprehensive-review` skill). Don't blur the two.

## Gotcha: app host appears in two files

The deployed Difftrail app host (`difftrail.haldunanil.com`) is hardcoded in two places that must stay in sync if it ever changes: `.mcp.json` (`/api/mcp`) and `.claude-plugin/plugin.json` (`resourceMetadataUrl` → `/.well-known/oauth-protected-resource/api/mcp`). Update both together.

## Auth

Two independent auths, easy to conflate:

- **Local `gh` CLI** (`gh auth login`) — used by the controller to read PR metadata. Not pasted anywhere.
- **Clerk OAuth (browser)** — the Difftrail app's own auth, triggered on first `upload_walkthrough` call. Claude Code stores the token automatically.
