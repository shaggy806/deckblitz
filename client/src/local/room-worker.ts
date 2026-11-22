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
 * (the server's `game-record.ts`) and posted to the room server: a solo game
 * runs in this tab, so the server has nothing of it otherwise, and a bot's
 * play someone reports can then be looked at. No name, address or id goes
 * with it; the About page says games are kept.
 *
 * **A few inputs at a time**, so that a tab closed without a word has lost
 * almost nothing: only the inputs the server doesn't hold yet go (every
 * `HAND_OVER_EVERY`, as the game ends, and whenever the page says its tab is
 * hidden: `records`), and the server answers how many it now holds, which
 * the next part starts from (`GameRecorder.acked`). A tab that closes takes
 * this worker with it before it can send, so the page is kept the unsent
 * inputs (`tails`, about once a second) and sends those itself. A text
 * body, so no preflight. `keepalive` lets a small post outlive the tab that
 * made it (a browser allows about 64 KB of those at once; a part is a few).
 * A failure is tried twice more, then left: the next part carries the same
 * inputs again.
 */
const gamesUrl = (): string =>
  `${((import.meta.env.VITE_SERVER_URL as string | undefined) ?? `ws://${self.location.hostname}:4000`).replace(/^ws/, 'http')}/games`
recordGamesTo({
  build: __PAGE_COMMIT__,
  where: 'browser',
  asItGoes: HAND_OVER_EVERY,
  deliver: async (part) => {
    const body = JSON.stringify(part)
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const answer = await fetch(gamesUrl(), { method: 'POST', body, keepalive: body.length < KEEPALIVE_MOST })
        // 204: the server kept nothing (records off, too many posts).
        if (answer.status !== 200) return null
        const said = (await answer.json()) as { have?: unknown }
        return typeof said.have === 'number' ? said.have : null
      } catch {
        // The connection, most likely: wait, and try again.
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
      }
    }
    return null
  },
})

/** The largest body sent with `keepalive` (the browsers' quota is 64 KiB for
 * all such requests in flight; a larger one is sent plainly). */
const KEEPALIVE_MOST = 48_000

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
  // And what the room server hasn't of each game's record, for the page to
  // send itself if its tab closes: this worker goes with the tab, before it
  // could send anything (`localSocket.ts`, `sendTailsNow`).
  post({ kind: 'tails', tails: host.recordTails().map((tail) => JSON.stringify(tail)) })
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
    case 'records':
      // The tab is hidden or closing: what hasn't been sent of each game goes now.
      host?.handOverRecords()
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
