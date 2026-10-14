/**
 * Solo games in this tab (`docs/plans/local-rooms.md`): the local room worker
 * (`room-worker.ts`) behind a WebSocket's worth of surface.
 *
 * In local mode (`localMode.ts`) `useNetworkGame` holds a `HybridSocket`: its
 * connection to the room server as ever, plus the tab's room worker, opened the
 * first time a blitz or a lesson creates a room there (`sendLocal`). Every
 * message for a room the worker made goes to the worker, everything else to
 * the server, and both answer through the one `onmessage` — the same JSON text
 * either way, so the game screen, playback, acks and event slices run
 * unchanged. Lobbies, joining by code and spectating stay on the server:
 * another person may join those.
 */

/** What the page sends the worker. */
export type ToRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'send'; readonly data: string }
  | { readonly kind: 'close' }

/** What the worker sends the page. */
export type FromRoomWorker =
  | { readonly kind: 'open' }
  | { readonly kind: 'message'; readonly data: string }
  | { readonly kind: 'failed'; readonly message: string }

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

  constructor() {
    this.worker = new Worker(new URL('./room-worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<FromRoomWorker>) => {
      const message = event.data
      if (message.kind === 'open') this.onopen?.()
      else if (message.kind === 'message') this.onmessage?.({ data: message.data })
      else this.fail(message.message)
    }
    this.worker.onerror = (event) => this.fail(event.message)
    this.post({ kind: 'open' })
  }

  send(data: string): void {
    this.post({ kind: 'send', data })
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

/** The tab's one room worker, shared by every `HybridSocket` the page opens,
 * so a reconnect to the server doesn't end a game played here. */
let tabWorker: LocalSocket | null = null

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
  private readonly server: RoomSocket
  private local: LocalSocket | null = null
  private closed = false

  constructor(server: RoomSocket) {
    this.server = server
    server.onopen = () => this.onopen?.()
    server.onmessage = (event) => this.onmessage?.(event)
    server.onclose = () => this.onclose?.()
    server.onerror = () => this.onerror?.()
  }

  /** To the worker when it's for a room the worker made, else to the server. */
  send(data: string): void {
    const roomId = roomIdOf(data)
    if (roomId !== null && localRooms.has(roomId)) this.worker().send(data)
    else this.server.send(data)
  }

  /** To the worker, whatever it is: a blitz's or a lesson's create. */
  sendLocal(data: string): void {
    this.worker().send(data)
  }

  close(): void {
    this.closed = true
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
    if (tabWorker === null || tabWorker.dead) tabWorker = new LocalSocket()
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
        }
      }
      this.onmessage?.(event)
    }
    // The worker failing ends its games: what a dropped socket does, and the
    // page reconnects with its usual backoff.
    local.onclose = () => {
      if (this.closed) return
      localRooms.clear()
      remember(localRooms)
      this.server.close()
    }
    local.send(JSON.stringify({ type: 'event-deltas' }))
    return local
  }
}
