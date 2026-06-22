import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { syncVersions } from './sync-versions.mjs'

async function fixture(market) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-'))
  const p = (n) => path.join(dir, n)
  await fs.writeFile(p('package.json'), JSON.stringify({ name: 'difftrail', version: '1.2.3' }))
  await fs.writeFile(p('plugin.json'), JSON.stringify({ name: 'difftrail', version: '0.0.0' }))
  await fs.writeFile(p('marketplace.json'), JSON.stringify(market))
  return { pkgPath: p('package.json'), pluginPath: p('plugin.json'), marketPath: p('marketplace.json') }
}

test('propagates package.json version to plugin.json and the matching marketplace entry', async () => {
  const f = await fixture({ plugins: [{ name: 'difftrail', version: '0.0.0' }, { name: 'other', version: '9.9.9' }] })
  const v = await syncVersions(f)
  assert.equal(v, '1.2.3')
  assert.equal(JSON.parse(await fs.readFile(f.pluginPath, 'utf8')).version, '1.2.3')
  const market = JSON.parse(await fs.readFile(f.marketPath, 'utf8'))
  assert.equal(market.plugins.find((p) => p.name === 'difftrail').version, '1.2.3')
  assert.equal(market.plugins.find((p) => p.name === 'other').version, '9.9.9') // other entries untouched
})

test('throws when marketplace.json has no entry for the plugin name', async () => {
  const f = await fixture({ plugins: [{ name: 'nope', version: '0.0.0' }] })
  await assert.rejects(() => syncVersions(f), /no plugin entry named 'difftrail'/)
})
