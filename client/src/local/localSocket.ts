/**
 * Solo games in this tab (`docs/plans/local-rooms.md`): the local room worker
 * (`room-worker.ts`) behind a WebSocket's worth of surface.
 *
 * In local mode (`localMode.ts`, the site's default) `useNetworkGame` holds a
 * `HybridSocket`: its connection to the room server as ever, plus the tab's
 * room worker, opened the first time a blitz or a lesson creates a room there
 * (`sendLocal`) — or the server, if the worker has failed in this tab. Every
 * message for a room the worker made goes to the worker, everything else to
 * the server, and both answer through the one `onmessage` — the same JSON text
 * either way, so the game screen, playback, acks and event slices run
 * unchanged. Lobbies, joining by code and spectating stay on the server:
 * another person may join those.
 *
 * **Tables** (`docs/plans/replicated-rooms.md`, step 4; `tablesMode.ts`): a
 * game with other people in it can be played on its players' own devices,
 * each tab's worker holding a copy, the server only putting their inputs in
 * order. With that on, the socket tells the server so once the worker is up
 * (`table-capable`); when the server says a room's game is a table
 * (`table-start`) the worker deals this tab's copy and the page is seated at
 * it, and from then on the page's messages for that room go to the worker,
 * what the copy makes goes to the server, and the server's order comes back
 * to the copy. The page sees frames from a room, as ever.
 */

import { PAGE_BUILD } from './tablesMode.ts'


/** What the page sends the worker. */
export type ToRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'stats'; readonly id: number }
  | { readonly kind: 'send'; readonly data: string }
  | { readonly kind: 'close' }
  /** The server's `table-start` (`data`): deal this tab's copy of the table
   * and seat the page at it, by the `token` it holds its seat with; `join` is
   * the page's own `join-room` or `spectate-room`, when that is how it came
   * (`LocalRoomHost.table`). */
  | { readonly kind: 'table'; readonly data: string; readonly token: string | null; readonly join: string | null }
  /** Anything else the server says about a table held here: an input in its
   * place, a refusal, who hosts, who is connected. */
  | { readonly kind: 'table-message'; readonly data: string }
  /** The page left the table: the copy goes. */
  | { readonly kind: 'table-leave'; readonly roomId: string }
  /** A dev build's test hook: this tab's copy of the table is made to hold a
   * game the table doesn't (`LocalRoomHost.corruptTable`), to see the copies
   * notice and this one put right. Ignored by a production worker. */
  | { readonly kind: 'table-corrupt'; readonly roomId: string }

/** What the worker sends the page. */
export type FromRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'message'; readonly data: string }
  /** For the room server, on the page's connection: what a table's copy
   * makes (`table-input`), or its asking for the table again. */
  | { readonly kind: 'server'; readonly data: string }
  | { readonly kind: 'failed'; readonly message: string }
  | { readonly kind: 'stats'; readonly id: number; readonly stats: LocalStats }

/** The worker's numbers, for measuring local games on a slower machine
 * (`docs/plans/local-rooms.md`, step 6): `deckblitzLocal.stats()` in the
 * browser console prints them. */
export interface LocalStats {
  /** From the worker starting to its rooms being up: the card pool loaded
   * and any saved games seated. */
  readonly readyMs: number | null
  readonly decisions: number
  readonly decisionP50Ms: number | null
  readonly decisionP90Ms: number | null
  readonly decisionP99Ms: number | null
  readonly decisionMaxMs: number | null
  /** Running games the worker holds. */
  readonly games: number
  /** The worker's JS heap, where the browser says (Chrome). */
  readonly workerHeapMb: number | null
}

/** The part of a WebSocket `useNetworkGame` uses. */
export interface RoomSocket {
  send(data: string): void
  close(): void
  onopen: (() => void) | null
  onmessage: ((event: { readonly data: unknown }) => void) | null
  onclose: (() => void) | null
  onerror: (() => void) | null
}

export class LocalSocket implements RoomSocket {
  onopen: (() => void) | null = null
  onmessage: ((event: { readonly data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  /** A message of the worker's for the room server (a table's copy). */
  onserver: ((data: string) => void) | null = null
  /** Whether the worker has said it is up: the card pool in, its rooms
   * ready. A table's copy can be dealt from then. */
  opened = false
  private worker: Worker | null
  private nextStats = 0
  private readonly waitingStats = new Map<number, (stats: LocalStats) => void>()

  constructor() {
    this.worker = new Worker(new URL('./room-worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<FromRoomWorker>) => {
      const message = event.data
      if (message.kind === 'open') {
        this.opened = true
        this.onopen?.()
      } else if (message.kind === 'message') this.onmessage?.({ data: message.data })
      else if (message.kind === 'server') this.onserver?.(message.data)
      else if (message.kind === 'stats') {
        this.waitingStats.get(message.id)?.(message.stats)
        this.waitingStats.delete(message.id)
      } else this.fail(message.message)
    }
    this.worker.onerror = (event) => this.fail(event.message)
    this.post({ kind: 'open' })
  }

  send(data: string): void {
    this.post({ kind: 'send', data })
  }

  /** The server's `table-start`: the worker deals this tab's copy. */
  table(data: string, token: string | null, join: string | null): void {
    this.post({ kind: 'table', data, token, join })
  }

  /** The server's word about a table the worker holds a copy of. */
  tableMessage(data: string): void {
    this.post({ kind: 'table-message', data })
  }

  /** The page left the table under `roomId`. */
  tableLeave(roomId: string): void {
    this.post({ kind: 'table-leave', roomId })
  }

  /** A dev build's test hook: see `ToRoomWorker`'s `table-corrupt`. */
  tableCorrupt(roomId: string): void {
    this.post({ kind: 'table-corrupt', roomId })
  }

  /** The worker's numbers (`LocalStats`). */
  stats(): Promise<LocalStats> {
    const id = (this.nextStats += 1)
    return new Promise((resolve) => {
      this.waitingStats.set(id, resolve)
      this.post({ kind: 'stats', id })
    })
  }

  /** Whether the worker is gone (closed, or failed). */
  get dead(): boolean {
    return this.worker === null
  }

  /** The page's connection to the worker's rooms ends, as a closed socket's
   * does; the worker and its rooms stay, for the page to rejoin. */
  detach(): void {
    this.post({ kind: 'close' })
  }

  /** Ends the worker, and with it every room it ran. */
  close(): void {
    if (this.worker === null) return
    this.post({ kind: 'close' })
    this.worker.terminate()
    this.worker = null
  }

  private post(message: ToRoomWorker): void {
    this.worker?.postMessage(message)
  }

  /** The worker couldn't start or crashed: what a dropped socket does. */
  private fail(reason: string): void {
    console.error(`local rooms: ${reason}`)
    this.worker?.terminate()
    this.worker = null
    this.onerror?.()
    this.onclose?.()
  }
}

/** Where the tab remembers its local rooms' codes, so that after a reload
 * rejoining one (the page's `?room=`) goes to the worker, which has picked
 * the game up again from IndexedDB (`room-worker.ts`). */
const ROOMS_KEY = 'mtg.localRooms'

function rememberedRooms(): Set<string> {
  try {
    const raw = sessionStorage.getItem(ROOMS_KEY)
    return new Set(raw === null ? [] : (JSON.parse(raw) as string[]))
  } catch {
    return new Set()
  }
}

function remember(rooms: ReadonlySet<string>): void {
  try {
    sessionStorage.setItem(ROOMS_KEY, JSON.stringify([...rooms]))
  } catch {
    // No storage: a reload ends the game, as before.
  }
}

/** The codes of the rooms this tab's worker made — what `HybridSocket` routes by. */
const localRooms = rememberedRooms()

/** Whether `roomId` is one of this tab's worker's rooms. */
export function isLocalRoom(roomId: string | null): boolean {
  return roomId !== null && localRooms.has(roomId)
}

/** The rooms this tab knows to be tables: the server said so (`table-start`,
 * or its answer to a join by the code). Not kept across a reload: the page
 * joins by the code again and is told again. */
const tableRooms = new Set<string>()

/** Whether `roomId`'s game is a table this tab holds a copy of. */
export function isTableRoom(roomId: string | null): boolean {
  return roomId !== null && tableRooms.has(roomId)
}

/** What a `HybridSocket` needs to play tables (`tablesMode.ts`). */
export interface TableOptions {
  /** The token this tab holds its seat in `roomId` by, if it has one: what
   * gives it the seat back at the table, and what the page claims the
   * copy's seat with. */
  readonly seatToken: (roomId: string) => string | null
}

/** The longest wait between attempts to reopen the server's connection under
 * a game here: the page's own (`useNetworkGame`'s `MAX_RECONNECT_DELAY_MS`). */
const MAX_REOPEN_DELAY_MS = 8000

/** Where a `HybridSocket` that has given its server connection up sends. */
const NO_SERVER: RoomSocket = { send: () => {}, close: () => {}, onopen: null, onmessage: null, onclose: null, onerror: null }

/** The tab's one room worker, shared by every `HybridSocket` the page opens,
 * so a reconnect to the server doesn't end a game played here. */
let tabWorker: LocalSocket | null = null

/** Set once the tab's worker has failed (its card pool wouldn't load, say):
 * every solo game after that is played on the server. */
let workerFailed = false

function roomIdOf(data: string): string | null {
  try {
    const roomId = (JSON.parse(data) as { roomId?: unknown }).roomId
    return typeof roomId === 'string' ? roomId : null
  } catch {
    return null
  }
}

export class HybridSocket implements RoomSocket {
  onopen: (() => void) | null = null
  onmessage: ((event: { readonly data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  private server: RoomSocket
  private local: LocalSocket | null = null
  private closed = false
  /** Creates sent to the worker that it hasn't answered with a room yet:
   * what goes to the server instead if it fails first. */
  private unanswered: string[] = []
  /** Set while the server's connection is down under a game played here,
   * which needs nothing of it: it's opened again quietly meanwhile. */
  private serverDown = false
  private reopenAttempt = 0
  private reopenTimer: ReturnType<typeof setTimeout> | null = null
  /** Set when this tab plays tables (`TableOptions`). */
  private readonly tables: TableOptions | null
  /** Whether the server's connection is open: `table-capable` waits for it. */
  private serverOpen = false
  /** Whether this connection has been told the tab can hold a copy. */
  private saidCapable = false
  /** The page's `join-room` or `spectate-room` for a table, kept while the
   * server is asked for the table: answered by the worker once its copy is
   * dealt. By room. */
  private readonly joining = new Map<string, string>()
  /** The tables this connection is at: the server has sent it their start. */
  private readonly seated = new Set<string>()

  /**
   * `openServer` opens a connection to the room server; `playingHere` says
   * whether the page is in one of the worker's rooms. A drop of the server's
   * connection mid-game here isn't the page's to see (a bug report,
   * 2026-10-20: a local blitz went to "Reconnecting" with the wifi): only
   * the server's side is opened again, with the page's own backoff, and
   * the page hears of the drop only if it sends the server something before
   * that's done — then as a dropped socket, and reconnects as ever.
   *
   * `startsHere` says the page is loading into one of the worker's rooms (a
   * reload mid-game): the socket opens from the worker at once, not when the
   * server answers, and the server's side opens behind it as a reopened one
   * would — so a game played here is picked up with the server down.
   */
  constructor(
    openServer: () => RoomSocket,
    playingHere: () => boolean = () => false,
    startsHere = false,
    tables: TableOptions | null = null,
  ) {
    this.openServer = openServer
    this.playingHere = playingHere
    this.tables = tables
    const here = startsHere && !workerFailed
    this.server = this.attachServer(openServer(), here)
    if (here) {
      this.serverDown = true
      this.worker()
      queueMicrotask(() => {
        if (!this.closed) this.onopen?.()
      })
    }
  }

  private readonly openServer: () => RoomSocket
  private readonly playingHere: () => boolean

  /** Whether a game here (or one being made) needs this socket and not the
   * server: the worker's up and the page is in one of its rooms. */
  private holdingGame(): boolean {
    return this.local !== null && !this.local.dead && (this.playingHere() || this.unanswered.length > 0)
  }

  /** Wires `server` to this socket. A reopened one (`quiet`) isn't news to
   * the page: it's told it wants event slices, as the page tells a new one. */
  private attachServer(server: RoomSocket, quiet: boolean): RoomSocket {
    const current = () => this.server === server && !this.closed
    server.onopen = () => {
      if (!current()) return
      this.serverOpen = true
      this.saidCapable = false
      if (!quiet) {
        this.onopen?.()
        this.sayCapable()
        return
      }
      this.serverDown = false
      this.reopenAttempt = 0
      server.send(JSON.stringify({ type: 'event-deltas' }))
      this.sayCapable()
    }
    server.onmessage = (event) => {
      if (!current()) return
      if (this.tables !== null && typeof event.data === 'string' && this.fromServerForTable(event.data)) return
      this.onmessage?.(event)
    }
    server.onclose = () => {
      if (!current()) return
      this.serverOpen = false
      this.seated.clear()
      this.joining.clear()
      if (this.holdingGame()) {
        this.serverDown = true
        const delay = Math.min(1000 * 2 ** this.reopenAttempt, MAX_REOPEN_DELAY_MS)
        this.reopenAttempt += 1
        this.reopenTimer = setTimeout(() => {
          this.reopenTimer = null
          if (!this.closed) this.server = this.attachServer(this.openServer(), true)
        }, delay)
        return
      }
      this.onclose?.()
    }
    server.onerror = () => {
      if (current() && !this.holdingGame()) this.onerror?.()
    }
    return server
  }

  /** To the worker when it's for a room the worker made, else to the server
   * — which, if it's down under a game here, the page now hears of. */
  send(data: string): void {
    const roomId = roomIdOf(data)
    if (roomId !== null && localRooms.has(roomId)) this.worker().send(data)
    else if (roomId !== null && this.tables !== null && tableRooms.has(roomId)) this.toTable(roomId, data)
    else if (this.serverDown) {
      // A new connection's first word: the server's side says it itself
      // when it opens again (`attachServer`), the worker already has.
      if (!data.includes('"event-deltas"')) this.dropServer()
    } else {
      // A join by the room's code, which may turn out to be a table's: kept
      // until the server says which (`fromServerForTable`).
      if (this.tables !== null && roomId !== null && (data.includes('"type":"join-room"') || data.includes('"type":"spectate-room"'))) {
        this.joining.set(roomId, data)
      }
      this.server.send(data)
    }
  }

  /** The server's connection went down under a game here and is still down
   * when the page wants it: the page hears of it now, as a dropped socket. */
  private dropServer(): void {
    if (this.reopenTimer !== null) clearTimeout(this.reopenTimer)
    this.reopenTimer = null
    this.serverDown = false
    const server = this.server
    // No longer this socket's: whatever it does next is nobody's news.
    this.server = NO_SERVER
    server.close()
    this.onclose?.()
  }

  /** To the worker, whatever it is: a blitz's or a lesson's create — or, once
   * the worker has failed in this tab, to the server. */
  sendLocal(data: string): void {
    if (workerFailed) {
      this.server.send(data)
      return
    }
    this.unanswered.push(data)
    this.worker().send(data)
  }

  close(): void {
    this.closed = true
    if (this.reopenTimer !== null) clearTimeout(this.reopenTimer)
    this.reopenTimer = null
    this.server.close()
    if (this.local !== null) {
      this.local.onmessage = null
      this.local.onclose = null
      this.local.detach()
    }
  }

  /**
   * Tells the server this tab can hold a copy of a game, once: when it plays
   * tables, its worker is up (the card pool loaded, which is what a copy
   * needs) and the connection is open. The worker is started by the first
   * waiting room the page is in (`fromServerForTable`), not before: a page
   * that never sits down with anyone loads no pool for it.
   */
  private sayCapable(): void {
    if (this.tables === null || this.saidCapable || !this.serverOpen || this.closed || workerFailed) return
    if (this.local === null || this.local.dead || !this.local.opened) return
    this.saidCapable = true
    this.server.send(JSON.stringify({ type: 'table-capable', build: PAGE_BUILD }))
  }

  /**
   * One message from the server, when this tab plays tables: whether it was
   * for the worker's copy of a table and not for the page.
   *
   * - `table-start`: the room's game is a table (the waiting room started as
   *   one, a rematch was dealt, or this tab asked for it). The worker deals
   *   the copy and seats the page.
   * - the rest of a table's messages go to the copy.
   * - an `error` coded `table` answers the page's own `join-room` or
   *   `spectate-room`: the room is a table, so the server is asked for it
   *   (`table-join`) and the page's message waits for the copy.
   * - a waiting room's seat board (`room-joined`, `pending`) starts the
   *   worker, so the tab can say it holds copies before the game starts; the
   *   page still gets the message.
   */
  private fromServerForTable(data: string): boolean {
    if (data.includes('"type":"room-joined"')) {
      // The room is the server's own: the page's join is answered.
      const joined = /"roomId":"([^"]+)"/.exec(data)?.[1]
      if (joined !== undefined) this.joining.delete(joined)
      if (data.includes('"pending":true') && !workerFailed) {
        this.worker()
        this.sayCapable()
      }
      return false
    }
    const tableMessage = data.includes('"type":"table-')
    if (!tableMessage && !data.includes('"code":"table"')) return false
    let message: { type?: string; roomId?: string; code?: string }
    try {
      message = JSON.parse(data) as typeof message
    } catch {
      return false
    }
    const roomId = message.roomId
    if (typeof roomId !== 'string') return false
    if (message.type === 'error' && message.code === 'table') {
      const asked = this.joining.get(roomId)
      // Not something this socket asked: the page's to show.
      if (asked === undefined || workerFailed) return false
      tableRooms.add(roomId)
      // A seat is taken back by its token; to watch, none is given.
      const token = asked.includes('"spectate-room"') ? null : this.tables?.seatToken(roomId) ?? null
      this.server.send(JSON.stringify({ type: 'table-join', roomId, ...(token !== null ? { clientToken: token } : {}) }))
      return true
    }
    if (!tableMessage || typeof message.type !== 'string' || !message.type.startsWith('table-')) return false
    if (workerFailed) return true
    if (message.type === 'table-start') {
      tableRooms.add(roomId)
      this.seated.add(roomId)
      const join = this.joining.get(roomId) ?? null
      this.joining.delete(roomId)
      const token = join !== null && join.includes('"spectate-room"') ? null : this.tables?.seatToken(roomId) ?? null
      this.worker().table(data, token, join)
    } else {
      this.worker().tableMessage(data)
    }
    return true
  }

  /**
   * One message from the page for a table's room. Its copy is a room in the
   * worker, which takes whatever a room takes; but the table itself is the
   * server's, so:
   *
   * - joining or watching (a reload, a reconnect, a link) asks the server for
   *   the table first, and the worker answers the page once its copy is
   *   dealt from what comes back;
   * - a rematch is the table's to deal (`table-rematch`): every device is
   *   sent the new game;
   * - leaving leaves both.
   */
  private toTable(roomId: string, data: string): void {
    const type = (JSON.parse(data) as { type?: string }).type
    if (type === 'join-room' || (type === 'spectate-room' && !this.seated.has(roomId))) {
      this.joining.set(roomId, data)
      const token = type === 'join-room' ? this.tables?.seatToken(roomId) ?? null : null
      if (this.serverOpen) {
        this.server.send(JSON.stringify({ type: 'table-join', roomId, ...(token !== null ? { clientToken: token } : {}) }))
      }
      return
    }
    if (type === 'rematch') {
      if (this.serverOpen) this.server.send(JSON.stringify({ type: 'table-rematch', roomId }))
      return
    }
    if (type === 'leave-room') {
      tableRooms.delete(roomId)
      this.seated.delete(roomId)
      if (this.serverOpen) this.server.send(data)
      this.worker().tableLeave(roomId)
      return
    }
    this.worker().send(data)
  }

  /** The tab's worker, attached to this socket: its messages come out of
   * `onmessage`, and it's told the page wants event slices, as the server is
   * when the socket opens. */
  private worker(): LocalSocket {
    if (this.local !== null && !this.local.dead) return this.local
    if (tabWorker === null || tabWorker.dead) {
      tabWorker = new LocalSocket()
      exposeStats()
    }
    const local = tabWorker
    this.local = local
    // What a table's copy makes goes to the server on this connection; with
    // it down there is nowhere for it to go, and the page, told of the drop,
    // joins the table again when it is back.
    local.onserver = (data) => {
      if (!this.closed && this.serverOpen) this.server.send(data)
    }
    local.onopen = () => {
      if (!this.closed) this.sayCapable()
    }
    local.onmessage = (event) => {
      if (this.closed) return
      const data = event.data as string
      if (data.includes('"room-created"')) {
        const message = JSON.parse(data) as { type?: string; roomId?: string }
        if (message.type === 'room-created' && typeof message.roomId === 'string') {
          localRooms.add(message.roomId)
          remember(localRooms)
          this.unanswered = []
        }
      }
      this.onmessage?.(event)
    }
    // The worker failed. If it was making a game (it couldn't start: the
    // card pool wouldn't load), that create goes to the server instead, and so
    // does every solo game after (`workerFailed`) — the player never knows.
    // Otherwise it ends the games it held: what a dropped socket does, and
    // the page reconnects with its usual backoff.
    local.onclose = () => {
      if (this.closed) return
      workerFailed = true
      localRooms.clear()
      remember(localRooms)
      // No copies here any more: the server is told, so the next waiting room
      // starts as a game it holds itself.
      tableRooms.clear()
      if (this.saidCapable && this.serverOpen) this.server.send(JSON.stringify({ type: 'table-capable', build: '' }))
      const unanswered = this.unanswered
      this.unanswered = []
      if (unanswered.length > 0) for (const data of unanswered) this.server.send(data)
      else this.server.close()
    }
    local.send(JSON.stringify({ type: 'event-deltas' }))
    return local
  }
}

/** The page's main-thread freezes since local games started (long tasks,
 * Chrome): what a slow machine's bot search must not cause. */
const longTasks: number[] = []

/** `deckblitzLocal.stats()` in the console: the worker's numbers and the
 * page's freezes, as a table — for checking local games on a slower machine
 * (`docs/plans/local-rooms.md`, step 6). */
function exposeStats(): void {
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) longTasks.push(entry.duration)
    }).observe({ type: 'longtask', buffered: true })
  } catch {
    // No long-task timing in this browser: the freezes read as none.
  }
  const target = window as Window & {
    deckblitzLocal?: { stats: () => Promise<unknown>; corrupt?: (roomId: string) => void }
  }
  target.deckblitzLocal = {
    // A dev build only (the e2e suite's): makes this tab's copy of a table
    // differ from everyone's, to check it is noticed and put right.
    ...(import.meta.env.DEV ? { corrupt: (roomId: string) => tabWorker?.tableCorrupt(roomId) } : {}),
    stats: async () => {
      const worker = tabWorker
      if (worker === null || worker.dead) return 'no local game in this tab'
      const stats = await worker.stats()
      const sorted = [...longTasks].sort((a, b) => a - b)
      const report = {
        ...stats,
        pageFreezes: sorted.length,
        pageFreezeMaxMs: sorted.length === 0 ? 0 : Math.round(sorted[sorted.length - 1]),
        cores: navigator.hardwareConcurrency,
      }
      console.table(report)
      return report
    },
  }
}
