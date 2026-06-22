#!/usr/bin/env node
// Propagate package.json#version to .claude-plugin/plugin.json and the matching
// marketplace.json plugin entry. `npm run version` invokes this after `changeset version`.
import fs from 'node:fs/promises'

export async function syncVersions({
  pkgPath = 'package.json',
  pluginPath = '.claude-plugin/plugin.json',
  marketPath = '.claude-plugin/marketplace.json',
} = {}) {
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
  const { version, name } = pkg
  if (!version) throw new Error('package.json has no version field')
  if (!name) throw new Error('package.json has no name field')

  const plugin = JSON.parse(await fs.readFile(pluginPath, 'utf8'))
  plugin.version = version
  await fs.writeFile(pluginPath, JSON.stringify(plugin, null, 2) + '\n')

  const market = JSON.parse(await fs.readFile(marketPath, 'utf8'))
  if (!Array.isArray(market.plugins)) throw new Error('marketplace.json has no plugins array')
  if (!market.plugins.some((p) => p.name === name)) {
    throw new Error(`marketplace.json has no plugin entry named '${name}'`)
  }
  market.plugins = market.plugins.map((p) => (p.name === name ? { ...p, version } : p))
  await fs.writeFile(marketPath, JSON.stringify(market, null, 2) + '\n')

  return version
}

// CLI entry: run against the real repo files.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  syncVersions()
    .then((v) => console.log(`Synced version ${v} to plugin.json and marketplace.json`))
    .catch((e) => {
      console.error('ERROR:', e.message)
      process.exit(1)
    })
}
