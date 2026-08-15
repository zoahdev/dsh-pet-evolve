import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const required = [
  'web/pet.html',
  'web/pet.js',
  'web/pet.css',
  'engine/evolution.js',
  'adapter/dsh-state.js',
  'scripts/pet.mjs',
]

for (const rel of required) {
  const full = resolve(ROOT, rel)
  if (!existsSync(full)) throw new Error(`missing required file: ${rel}`)
}

const html = readFileSync(resolve(ROOT, 'web/pet.html'), 'utf8')
for (const ref of ['./pet.css', './pet.js']) {
  if (!html.includes(ref)) throw new Error(`pet.html does not reference ${ref}`)
}

console.log(`build-check OK: ${required.length} files present`)
