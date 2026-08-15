/**
 * dsh-pet-evolve host plugin: starts the local pet server bound to the
 * active profile and disposes it on teardown.
 *
 * Prebuilt artifact - no build step required to install (see #1965 lesson:
 * committed lib beats source-checkout installs).
 *
 * @module dsh-pet-evolve
 */

import { createPetServer } from '../scripts/server.mjs'

export const name = 'dsh-pet-evolve'

export function apply(ctx, config = {}) {
  const port = Number(config.port ?? 4173)
  const server = createPetServer(ctx.baseDir ?? '')
  const handle = server.listen(port, '127.0.0.1')
  ctx.logger?.info?.(`dsh-pet-evolve: pet ready at http://127.0.0.1:${port}`)
  return () => {
    handle.close()
  }
}
