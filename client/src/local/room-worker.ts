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
 * It also holds this tab's copies of **tables** (`docs/plans/replicated-rooms.md`,
 * step 4): a game with other people in it, played on every player's device.
 * A copy is a room here like any other, which the page plays through the
 * same messages; what the copy makes goes back to the page to send the
 * server (`server`), and the server's order comes in from the page
 * (`table`, `table-message`). A copy isn't saved: after a reload it is dealt
 * again from the table's log.
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
import { HAND_OVER_EVERY } from 'server/dist/game-record.js'
import { LocalRoomHost } from 'server/dist/local-host.js'
import { tableCosts } from 'server/dist/table-copy.js'
import type { TableStart } from 'server/dist/table-copy.js'
import { recordBotDecisionsTo, recordGamesTo } from 'server/dist/room.js'
import type { FromRoomWorker, LocalStats, ToRoomWorker } from './localSocket.ts'
import { loadSavedRooms, saveRooms } from './savedRooms.ts'

declare const self: DedicatedWorkerGlobalScope

const post = (message: FromRoomWorker): void => self.postMessage(message)

/** How often, at most, the games are saved while they're played. */
const SAVE_EVERY_MS = 1000

let host: LocalRoomHost | null = null

/** What `stats` reports, for measuring a slower machine (the plan's step 6):
 * every bot decision's time, and how long the pool and saved games took. */
const started = performance.now()
let readyMs: number | null = null
const decisionsMs: number[] = []
recordBotDecisionsTo({
  record: (micros) => {
    decisionsMs.push(micros / 1000)
    if (decisionsMs.length > 5000) decisionsMs.shift()
  },
})

/**
 * Each game played here is kept as how it was dealt and what was done to it
 * (the server's `game-record.ts`) and posted to the room server as it ends,
 * or as its room goes: a solo game runs in this tab, so the server has
 * nothing of it otherwise, and a bot's play someone reports can then be
 * looked at. Sent blind, like a usage event (`usage.ts`): a text body, so no
 * preflight, nothing read back, a failure nobody's problem. No name, address
 * or id goes with it; the About page says games are kept.
 */
const gamesUrl = (): string =>
  `${((import.meta.env.VITE_SERVER_URL as string | undefined) ?? `ws://${self.location.hostname}:4000`).replace(/^ws/, 'http')}/games`
recordGamesTo({
  build: __PAGE_COMMIT__,
  where: 'browser',
  asItGoes: HAND_OVER_EVERY,
  deliver: (record) => {
    try {
      void fetch(gamesUrl(), { method: 'POST', body: JSON.stringify(record), mode: 'no-cors' }).catch(() => {})
    } catch {
      // Not worth a player's notice.
    }
  },
})

/** How long each of the page's own moves took the worker (`LocalStats`). */
const movesMs: number[] = []

function stats(): LocalStats {
  const sorted = [...decisionsMs].sort((a, b) => a - b)
  const at = (q: number): number | null => (sorted.length === 0 ? null : Math.round(sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]))
  const moves = [...movesMs].sort((a, b) => a - b)
  const moveAt = (q: number): number | null =>
    moves.length === 0 ? null : Math.round(moves[Math.min(moves.length - 1, Math.floor(q * moves.length))] * 10) / 10
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
  return {
    readyMs,
    decisions: sorted.length,
    decisionP50Ms: at(0.5),
    decisionP90Ms: at(0.9),
    decisionP99Ms: at(0.99),
    decisionMaxMs: sorted.length === 0 ? null : Math.round(sorted[sorted.length - 1]),
    games: host?.save().length ?? 0,
    workerHeapMb: memory === undefined ? null : Math.round(memory.usedJSHeapSize / 1048576),
    moves: moves.length,
    moveP50Ms: moveAt(0.5),
    moveP90Ms: moveAt(0.9),
    moveMaxMs: moves.length === 0 ? null : Math.round(moves[moves.length - 1] * 10) / 10,
    table: { ...tableCosts() },
  }
}
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
  host = new LocalRoomHost(deliver, { toServer: (message) => post({ kind: 'server', data: JSON.stringify(message) }) })
  saved = new Set(host.restore(rooms))
  readyMs = Math.round(performance.now() - started)
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
    case 'stats':
      post({ kind: 'stats', id: message.id, stats: stats() })
      return
    case 'open':
      post({ kind: 'open' })
      return
    case 'send': {
      const sent = JSON.parse(message.data) as ClientMessage
      if (sent.type !== 'dispatch') {
        host?.message(sent)
        return
      }
      // A move of the page's own: timed, for `stats`.
      const from = performance.now()
      host?.message(sent)
      movesMs.push(performance.now() - from)
      if (movesMs.length > 5000) movesMs.shift()
      return
    }
    case 'table':
      try {
        host?.table(JSON.parse(message.data) as TableStart, {
          token: message.token,
          join: message.join === null ? null : (JSON.parse(message.join) as ClientMessage),
        })
      } catch (error) {
        // The copy couldn't be dealt (a recipe this build can't read): the
        // page is told, as it is of anything a room refuses.
        deliver({ type: 'error', message: `couldn't deal this game here: ${error instanceof Error ? error.message : String(error)}` })
      }
      return
    case 'table-message':
      host?.tableMessage(JSON.parse(message.data) as ServerMessage)
      return
    case 'table-leave':
      host?.leaveTable(message.roomId)
      return
    case 'server-down':
      host?.serverDown()
      return
    case 'server-up':
      host?.serverUp()
      return
    case 'table-corrupt':
      // A test's hook, in a dev build only.
      if (import.meta.env.DEV) host?.corruptTable(message.roomId)
      return
    case 'close':
      host?.close()
      return
  }
}
