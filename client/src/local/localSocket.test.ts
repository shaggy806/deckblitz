import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RoomSocket } from './localSocket.ts'

/** A room server connection the test drives by hand. */
class FakeServer implements RoomSocket {
  onopen: (() => void) | null = null
  onmessage: ((event: { readonly data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  readonly sent: string[] = []
  closed = false
  send(data: string): void {
    this.sent.push(data)
  }
  close(): void {
    this.closed = true
  }
  drop(): void {
    this.onerror?.()
    this.onclose?.()
  }
}

/** The tab's room worker: answers a create with a room. */
class FakeWorker {
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((event: { message: string }) => void) | null = null
  postMessage(message: { kind: string; data?: string }): void {
    if (message.kind === 'send' && message.data?.includes('"create-room"')) {
      queueMicrotask(() =>
        this.onmessage?.({ data: { kind: 'message', data: JSON.stringify({ type: 'room-created', roomId: 'LOCAL' }) } }),
      )
    }
  }
  terminate(): void {}
}

describe('HybridSocket', () => {
  let servers: FakeServer[]
  let room: string | null
  let page: { opens: number; closes: number; errors: number }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('Worker', FakeWorker)
    // Where the worker's numbers are put for the console.
    vi.stubGlobal('window', {})
    vi.resetModules()
    servers = []
    room = null
    page = { opens: 0, closes: 0, errors: 0 }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  /** A hybrid socket as the page holds one, its server open. */
  async function open() {
    const { HybridSocket } = await import('./localSocket.ts')
    const ws = new HybridSocket(
      () => {
        const server = new FakeServer()
        servers.push(server)
        return server
      },
      () => room === 'LOCAL',
    )
    ws.onopen = () => (page.opens += 1)
    ws.onclose = () => (page.closes += 1)
    ws.onerror = () => (page.errors += 1)
    servers[0].onopen?.()
    return ws
  }

  /** The same, playing a blitz in the worker. */
  async function playingHere() {
    const ws = await open()
    ws.sendLocal(JSON.stringify({ type: 'create-room' }))
    // The worker answers with its room.
    await Promise.resolve()
    room = 'LOCAL'
    return ws
  }

  it('rides out the server dropping under a game played here', async () => {
    const ws = await playingHere()
    servers[0].drop()
    // The page sees nothing: no "Reconnecting", no error.
    expect(page).toEqual({ opens: 1, closes: 0, errors: 0 })
    // The game goes on in the worker meanwhile.
    ws.send(JSON.stringify({ type: 'ack', roomId: 'LOCAL', seq: 3 }))
    expect(page.closes).toBe(0)
    // The server's side is opened again on its own, and told what the page
    // would tell a new connection.
    vi.advanceTimersByTime(1000)
    expect(servers).toHaveLength(2)
    servers[1].onopen?.()
    expect(servers[1].sent).toEqual([JSON.stringify({ type: 'event-deltas' })])
    expect(page.opens).toBe(1)
    // And the server's back for whatever the page wants of it next.
    ws.send(JSON.stringify({ type: 'create-room' }))
    expect(servers[1].sent).toHaveLength(2)
  })

  it('keeps trying, backing off, while the server stays down', async () => {
    await playingHere()
    servers[0].drop()
    vi.advanceTimersByTime(1000)
    servers[1].drop()
    vi.advanceTimersByTime(1999)
    expect(servers).toHaveLength(2)
    vi.advanceTimersByTime(1)
    expect(servers).toHaveLength(3)
    expect(page).toEqual({ opens: 1, closes: 0, errors: 0 })
  })

  it('tells the page once it wants the server that is still down', async () => {
    const ws = await playingHere()
    servers[0].drop()
    // Back on the landing page, making a lobby.
    room = null
    ws.send(JSON.stringify({ type: 'create-room' }))
    expect(page.closes).toBe(1)
    expect(servers[0].sent.some((m) => m.includes('create-room'))).toBe(false)
    // No reopening of its own now: the page reconnects as ever.
    vi.advanceTimersByTime(10000)
    expect(servers).toHaveLength(1)
  })

  it('picks a game here up on a reload with the server down', async () => {
    // The tab remembers its worker's room across the reload.
    const stored = new Map([['mtg.localRooms', JSON.stringify(['LOCAL'])]])
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => stored.get(k) ?? null, setItem: () => {} })
    const { HybridSocket } = await import('./localSocket.ts')
    const ws = new HybridSocket(
      () => {
        const server = new FakeServer()
        servers.push(server)
        return server
      },
      () => room === 'LOCAL',
      true,
    )
    ws.onopen = () => {
      page.opens += 1
      // What the page does on opening: rejoin the URL's room.
      room = 'LOCAL'
      ws.send(JSON.stringify({ type: 'event-deltas' }))
      ws.send(JSON.stringify({ type: 'join-room', roomId: 'LOCAL' }))
    }
    ws.onclose = () => (page.closes += 1)
    // Open before the server says anything.
    await Promise.resolve()
    expect(page.opens).toBe(1)
    expect(servers[0].sent).toEqual([])
    // The server never answers: the page carries on, and the server's side
    // is tried again behind it.
    servers[0].drop()
    expect(page).toEqual({ opens: 1, closes: 0, errors: 0 })
    vi.advanceTimersByTime(1000)
    servers[1].onopen?.()
    expect(servers[1].sent).toEqual([JSON.stringify({ type: 'event-deltas' })])
    expect(page.opens).toBe(1)
  })

  it('passes a drop straight on when no game here needs the socket', async () => {
    await open()
    servers[0].drop()
    expect(page).toEqual({ opens: 1, closes: 1, errors: 1 })
    vi.advanceTimersByTime(10000)
    expect(servers).toHaveLength(1)
  })
})
