/**
 * Shared pet server: static file serving + /api/state for both the CLI and
 * the DSH plugin wrapper. Zero runtime dependencies.
 *
 * @module dsh-pet-evolve/server
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSignals, defaultPaths } from '../adapter/dsh-state.js'
import { applyEvent, initialState, summarize } from '../engine/evolution.js'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

export function growthReport(profileDir, evolutionOverride) {
  const paths = defaultPaths(profileDir)
  if (evolutionOverride) paths.evolutionFile = evolutionOverride
  const signals = collectSignals(profileDir, paths)
  let state = initialState()
  for (const event of signals.xpEvents) {
    const count = Math.min(event.count ?? 1, 1000)
    for (let i = 0; i < count; i += 1) state = applyEvent(state, { type: event.type })
  }
  return { ...signals, summary: summarize(state) }
}

export function createPetServer(profileDir = '', evolutionOverride) {
  return createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    if (url.pathname === '/api/state') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(growthReport(profileDir, evolutionOverride)))
      return
    }
    const pathname = url.pathname === '/' ? '/web/pet.html' : url.pathname
    const file = resolve(ROOT, `.${pathname}`)
    if (!file.startsWith(ROOT + sep) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    createReadStream(file).pipe(res)
  })
}
