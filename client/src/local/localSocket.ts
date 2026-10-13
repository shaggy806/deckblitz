/**
 * A WebSocket's worth of surface over the local room worker (`room-worker.ts`):
 * what `useNetworkGame` holds in local mode (`localMode.ts`) instead of a
 * socket to the server. The same JSON text both ways, so everything above it —
 * the game screen, playback, acks, the event slices — runs unchanged.
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
