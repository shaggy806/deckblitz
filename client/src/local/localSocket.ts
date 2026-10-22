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
 */

/** What the page sends the worker. */
export type ToRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'stats'; readonly id: number }
  | { readonly kind: 'send'; readonly data: string }
  | { readonly kind: 'close' }

/** What the worker sends the page. */
export type FromRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'message'; readonly data: string }
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
  private worker: Worker | null
  private nextStats = 0
  private readonly waitingStats = new Map<number, (stats: LocalStats) => void>()

  constructor() {
    this.worker = new Worker(new URL('./room-worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<FromRoomWorker>) => {
      const message = event.data
      if (message.kind === 'open') this.onopen?.()
      else if (message.kind === 'message') this.onmessage?.({ data: message.data })
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
  constructor(openServer: () => RoomSocket, playingHere: () => boolean = () => false, startsHere = false) {
    this.openServer = openServer
    this.playingHere = playingHere
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
      if (!quiet) {
        this.onopen?.()
        return
      }
      this.serverDown = false
      this.reopenAttempt = 0
      server.send(JSON.stringify({ type: 'event-deltas' }))
    }
    server.onmessage = (event) => {
      if (current()) this.onmessage?.(event)
    }
    server.onclose = () => {
      if (!current()) return
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
    else if (this.serverDown) {
      // A new connection's first word: the server's side says it itself
      // when it opens again (`attachServer`), the worker already has.
      if (!data.includes('"event-deltas"')) this.dropServer()
    } else this.server.send(data)
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
  const target = window as Window & { deckblitzLocal?: { stats: () => Promise<unknown> } }
  target.deckblitzLocal = {
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
