#!/usr/bin/env node
/**
 * dsh-pet-evolve CLI.
 *
 *   dsh-pet-evolve                     open the pet on http://127.0.0.1:4173
 *   dsh-pet-evolve --profile <dir>     bind real DSH session/rule signals
 *   dsh-pet-evolve --report            print the growth report as JSON and exit
 *
 * Zero runtime dependencies: a tiny static server over node:http.
 *
 * @module dsh-pet-evolve/cli
 */

import { createPetServer, growthReport } from './server.mjs'

function parseArgs(argv) {
  const args = { profile: null, report: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--profile') args.profile = argv[i + 1]
    if (argv[i] === '--report') args.report = true
  }
  return args
}

const args = parseArgs(process.argv.slice(2))

if (args.report) {
  const report = growthReport(args.profile ?? process.env.DSH_HOME ?? '')
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const PORT = 4173
const server = createPetServer(args.profile ?? '')
server.listen(PORT, '127.0.0.1', () => {
  console.log(`dsh-pet-evolve: http://127.0.0.1:${PORT}${args.profile ? ` (bound to ${args.profile})` : ''}`)
})
