/// <reference lib="webworker" />
/**
 * The room server, for one player, in a Web Worker: a solo game played in this
 * browser (`docs/plans/local-rooms.md`). It loads the card pool from its
 * shards, hands the registry to the room code (`provideCardRegistry`) and runs
 * the server's own `RoomService` through a `LocalRoomHost`, which answers the
 * page's messages exactly as the server would. The page talks to it through
 * `HybridSocket` (`localSocket.ts`), as it talks to the server through a
 * WebSocket.
 *
 * Its games outlive a reload: they're kept in IndexedDB (`savedRooms.ts`) as
 * they're played — at most once a second, whenever there's a new frame — and
 * seated again before the first message is handled, for the page to rejoin
 * by its room code and seat token.
 *
 * The one place the client runs a game, so the one place it imports
 * `engine/local` rather than `engine/client`: Vite resolves the engine's
 * fallback registry to a stub here (`engineLocalPlugin`, `vite.config.ts`), so
 * no card definition is bundled up front — they come in the shards.
 */

import { CARD_SHARD_COUNT, loadCardShard, registryFrom } from 'engine/local'
import type { ClientMessage, ServerMessage } from 'protocol'
import { provideCardRegistry } from 'server/dist/card-registry.js'
import { LocalRoomHost } from 'server/dist/local-host.js'
import type { FromRoomWorker, ToRoomWorker } from './localSocket.ts'
import { loadSavedRooms, saveRooms } from './savedRooms.ts'

declare const self: DedicatedWorkerGlobalScope

const post = (message: FromRoomWorker): void => self.postMessage(message)

/** How often, at most, the games are saved while they're played. */
const SAVE_EVERY_MS = 1000

let host: LocalRoomHost | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
/** The rooms last written, so a game that's ended has its save deleted. */
let saved = new Set<string>()

function save(): void {
  saveTimer = null
  if (host === null) return
  const rooms = host.save()
  const now = new Set(rooms.map((r) => r.id))
  const ended = [...saved].filter((id) => !now.has(id))
  saved = now
  void saveRooms(rooms, ended)
}

function deliver(message: ServerMessage): void {
  post({ kind: 'message', data: JSON.stringify(message) })
  if (message.type === 'state' && saveTimer === null) saveTimer = setTimeout(save, SAVE_EVERY_MS)
}

/** The pool in, the saved games back, the rooms up: once, before the first
 * message is handled. */
const ready: Promise<void> = (async () => {
  const [shards, rooms] = await Promise.all([
    Promise.all(Array.from({ length: CARD_SHARD_COUNT }, (_, i) => loadCardShard(i))),
    loadSavedRooms(),
  ])
  provideCardRegistry(registryFrom(shards.flatMap((shard) => [...shard.pool, ...shard.tokens])))
  host = new LocalRoomHost(deliver)
  saved = new Set(host.restore(rooms))
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
