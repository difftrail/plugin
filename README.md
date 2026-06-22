# Difftrail

The Difftrail agent plugin for Claude Code — generates a structured PR walkthrough and publishes it to the hosted [Difftrail app](https://difftrail.haldunanil.com), returning a shareable URL.

**What it bundles:**

- The `pr-walkthrough` skill — dispatches an agent to produce a pointer JSON document describing the PR's narrative structure, then uploads it to the hosted Difftrail app.
- A remote MCP server connection to the Difftrail app (`/api/mcp`) that exposes the `upload_walkthrough` tool the skill calls.

## Prerequisites

- Claude Code CLI installed and up to date
- A GitHub account (used to sign in via Clerk OAuth — no manual token required)
- A working local `gh` CLI (authenticated via `gh auth login`) — the skill uses `gh` to read PR metadata. This is your local GitHub CLI auth, NOT a token you paste anywhere; the Difftrail app itself authenticates via Clerk OAuth in the browser.

## Installation

### 1. Add the marketplace

In Claude Code:

```
/plugin marketplace add difftrail/plugin
```

### 2. Install the plugin

```
/plugin install difftrail@difftrail
```

### 3. Reload plugins

```
/reload-plugins
```

### 4. Verify

```
/mcp
/plugin list
```

The `difftrail` server should appear as **connected** in `/mcp`, and `pr-walkthrough` should appear in `/plugin list`.

## Authentication

The first time the `upload_walkthrough` tool is called (e.g. when you run `/pr-walkthrough`), Claude Code opens a browser window. Sign in with GitHub via SSO and click **Allow**. Claude Code stores the OAuth token automatically — you won't be prompted again unless it expires or you revoke access.

**Authenticate manually (optional).** You don't have to wait for the first tool call. Run `/mcp`, select the **difftrail** server, and choose **Authenticate** — Claude Code opens the same browser sign-in flow on demand.

**Grant repository access.** Difftrail reads your PR's diff from GitHub _as you_, so when you connect GitHub you must grant **repository access** (the `repo` scope) — this is required for **private** repos.

## Usage

Inside a git repo with an open (or merged) PR, run:

```
/pr-walkthrough
```

Or pass a PR number directly:

```
/pr-walkthrough 42
```

The skill resolves the PR, dispatches an agent to generate the walkthrough JSON, uploads it to the Difftrail app, and prints the published URL.

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets):

1. With your change, add a changeset describing it:
   ```
   npm run changeset
   ```
   Pick a bump (`patch`/`minor`/`major`) and write a short summary. Commit the generated `.changeset/*.md` file alongside your change.
2. Merge to `main`. The **Release** workflow then bumps `package.json`, syncs the new version into `plugin.json` + `marketplace.json`, updates `CHANGELOG.md`, commits, tags `vX.Y.Z`, and publishes a GitHub Release.

No manual version edits — the workflow owns versioning. PRs without a changeset merge fine; they just don't trigger a release.

## License

MIT
