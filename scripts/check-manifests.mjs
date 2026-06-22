#!/usr/bin/env node
import fs from 'node:fs/promises'

export async function checkManifests({
  pkgPath = 'package.json',
  pluginPath = '.claude-plugin/plugin.json',
  marketPath = '.claude-plugin/marketplace.json',
} = {}) {
  const problems = []
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
  const plugin = JSON.parse(await fs.readFile(pluginPath, 'utf8'))
  const market = JSON.parse(await fs.readFile(marketPath, 'utf8'))
  const entry = (market.plugins ?? []).find((p) => p.name === pkg.name)

  if (plugin.name !== pkg.name) problems.push(`plugin.json name '${plugin.name}' != package.json name '${pkg.name}'`)
  if (!entry) problems.push(`marketplace.json has no plugin entry named '${pkg.name}'`)
  if (plugin.version !== pkg.version) problems.push(`plugin.json version '${plugin.version}' != package.json version '${pkg.version}'`)
  if (entry && entry.version !== pkg.version) problems.push(`marketplace.json version '${entry.version}' != package.json version '${pkg.version}'`)
  return problems
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const problems = await checkManifests()
  if (problems.length) {
    console.error('Manifest inconsistencies:\n  - ' + problems.join('\n  - '))
    process.exit(1)
  }
  console.log('Manifests consistent.')
}
