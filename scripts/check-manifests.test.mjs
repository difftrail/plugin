import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { checkManifests } from './check-manifests.mjs'

async function fixture({ pkg, plugin, market }) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'chk-'))
  const p = (n) => path.join(dir, n)
  await fs.writeFile(p('package.json'), JSON.stringify(pkg))
  await fs.writeFile(p('plugin.json'), JSON.stringify(plugin))
  await fs.writeFile(p('marketplace.json'), JSON.stringify(market))
  return { pkgPath: p('package.json'), pluginPath: p('plugin.json'), marketPath: p('marketplace.json') }
}

test('no problems when name + version are consistent', async () => {
  const f = await fixture({
    pkg: { name: 'difftrail', version: '0.1.0' },
    plugin: { name: 'difftrail', version: '0.1.0' },
    market: { plugins: [{ name: 'difftrail', version: '0.1.0' }] },
  })
  assert.deepEqual(await checkManifests(f), [])
})

test('reports a version mismatch', async () => {
  const f = await fixture({
    pkg: { name: 'difftrail', version: '0.2.0' },
    plugin: { name: 'difftrail', version: '0.1.0' },
    market: { plugins: [{ name: 'difftrail', version: '0.2.0' }] },
  })
  const problems = await checkManifests(f)
  assert.equal(problems.length, 1)
  assert.match(problems[0], /plugin\.json version/)
})
