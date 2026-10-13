/// <reference lib="webworker" />
/**
 * The room server, for one player, in a Web Worker: a solo game played in this
 * browser (`docs/plans/local-rooms.md`). It loads the card pool from its
 * shards, hands the registry to the room code (`provideCardRegistry`) and runs
 * the server's own `RoomService` through a `LocalRoomHost`, which answers the
 * page's messages exactly as the server would. The page talks to it through
 * `LocalSocket`, as it talks to the server through a WebSocket.
 *
 * The one place the client runs a game, so the one place it imports
 * `engine/local` rather than `engine/client`: Vite resolves the engine's
 * fallback registry to a stub here (`engineLocalPlugin`, `vite.config.ts`), so
 * no card definition is bundled up front — they come in the shards.
 */

import { CARD_SHARD_COUNT, loadCardShard, registryFrom } from 'engine/local'
import type { ClientMessage } from 'protocol'
import { provideCardRegistry } from 'server/dist/card-registry.js'
import { LocalRoomHost } from 'server/dist/local-host.js'
import type { FromRoomWorker, ToRoomWorker } from './localSocket.ts'

declare const self: DedicatedWorkerGlobalScope

const post = (message: FromRoomWorker): void => self.postMessage(message)

let host: LocalRoomHost | null = null

/** The pool in, the rooms up: once, before the first message is handled. */
const ready: Promise<void> = (async () => {
  const shards = await Promise.all(Array.from({ length: CARD_SHARD_COUNT }, (_, i) => loadCardShard(i)))
  provideCardRegistry(registryFrom(shards.flatMap((shard) => [...shard.pool, ...shard.tokens])))
  host = new LocalRoomHost((message) => post({ kind: 'message', data: JSON.stringify(message) }))
})()

self.onmessage = async (event: MessageEvent<ToRoomWorker>) => {
  const message = event.data
  try {
    // Every message waits on the same promise, so they're handled in the
    // order they came, as a socket's are.
    await ready
  } catch (error) {
    post({ kind: 'failed', message: error instanceof Error ? error.message : String(error) })
    return
  }
  switch (message.kind) {
    case 'open':
      post({ kind: 'open' })
      return
    case 'send':
      host?.message(JSON.parse(message.data) as ClientMessage)
      return
    case 'close':
      host?.close()
      return
  }
}
