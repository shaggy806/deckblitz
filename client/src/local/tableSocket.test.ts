import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RoomSocket } from './localSocket.ts'

// `HybridSocket` at a table (`docs/plans/replicated-rooms.md`, step 4): what
// goes to the tab's worker, what to the server, and what the page is shown,
// when a room's game is played on its players' own devices.

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
  /** One message from the server. */
  say(message: object): void {
    this.onmessage?.({ data: JSON.stringify(message) })
  }
  /** The types of what it was sent, in order. */
  get types(): string[] {
    return this.sent.map((data) => (JSON.parse(data) as { type: string }).type)
  }
  last<T = Record<string, unknown>>(type: string): T | undefined {
    return this.sent.map((data) => JSON.parse(data) as { type: string }).filter((m) => m.type === type).at(-1) as T | undefined
  }
}

interface Posted {
  readonly kind: string
  readonly data?: string
  readonly token?: string | null
  readonly join?: string | null
  readonly roomId?: string
}

/** The tab's room worker: keeps what it is posted, says what it is told to. */
class FakeWorker {
  static made: FakeWorker[] = []
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((event: { message: string }) => void) | null = null
  readonly posted: Posted[] = []
  constructor() {
    FakeWorker.made.push(this)
  }
  postMessage(message: Posted): void {
    this.posted.push(message)
  }
  terminate(): void {}
  /** The worker's own word to the page. */
  say(message: object): void {
    this.onmessage?.({ data: message })
  }
  of(kind: string): Posted[] {
    return this.posted.filter((m) => m.kind === kind)
  }
}

const ROOM = 'TABLE'
const start = { type: 'table-start', roomId: ROOM, recipe: {}, seat: 'alice', host: 'alice', from: 0, log: [] }
const seatBoard = { type: 'room-joined', roomId: ROOM, seats: [], isHost: true, botSpeed: 'normal', seat: 'alice', pending: true }

describe('HybridSocket at a table', () => {
  let servers: FakeServer[]
  let shown: { type: string; code?: string }[]

  beforeEach(() => {
    vi.stubGlobal('Worker', FakeWorker)
    vi.stubGlobal('window', {})
    vi.resetModules()
    FakeWorker.made = []
    servers = []
    shown = []
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /** A hybrid socket as the page holds one, its server open; `token` is the
   * seat token the page has for the room, `tables` whether it plays them. */
  async function open(options: { readonly token?: string | null; readonly tables?: boolean; readonly atTable?: boolean } = {}) {
    const { HybridSocket } = await import('./localSocket.ts')
    const ws = new HybridSocket(
      () => {
        const server = new FakeServer()
        servers.push(server)
        return server
      },
      () => options.atTable === true,
      false,
      options.tables === false ? null : { seatToken: () => options.token ?? null },
    )
    ws.onmessage = (event) => shown.push(JSON.parse(event.data as string) as { type: string })
    servers[0].onopen?.()
    return ws
  }
  const worker = (): FakeWorker => FakeWorker.made[0]

  it("says it can hold a copy once its worker is up: started by a waiting room, not before", async () => {
    await open()
    // No waiting room yet: no worker, no pool loaded for nothing.
    expect(FakeWorker.made).toHaveLength(0)
    expect(servers[0].types).not.toContain('table-capable')

    servers[0].say(seatBoard)
    expect(shown.map((m) => m.type)).toEqual(['room-joined'])
    expect(FakeWorker.made).toHaveLength(1)
    // Started, not up: the card pool is still loading. The server is told it
    // is on its way, so a game started meanwhile waits for this page.
    expect(servers[0].last('table-capable')).toMatchObject({ build: expect.stringMatching(/.+/), soon: true })
    worker().say({ kind: 'open' })
    expect(servers[0].last<{ soon?: boolean }>('table-capable')?.soon).toBeUndefined()
    expect(servers[0].last('table-capable')).toMatchObject({ build: expect.stringMatching(/.+/) })
    // Each once a connection.
    servers[0].say(seatBoard)
    expect(servers[0].types.filter((type) => type === 'table-capable')).toHaveLength(2)
  })

  it('says nothing to the server of a solo game, the worker being up or not', async () => {
    const ws = await open()
    // A blitz: its room is made in the worker, and the page never sits in a
    // waiting room on the server.
    ws.sendLocal(JSON.stringify({ type: 'create-room', players: 4 }))
    expect(FakeWorker.made).toHaveLength(1)
    worker().say({ kind: 'open' })
    worker().say({ kind: 'message', data: JSON.stringify({ type: 'room-joined', roomId: 'LOCAL', pending: true, seats: [] }) })
    expect(servers[0].types).not.toContain('table-capable')
  })

  it('hands the worker the table when the room starts as one, and the room is the worker\'s from then', async () => {
    const ws = await open({ token: 'my-token' })
    servers[0].say(seatBoard)
    worker().say({ kind: 'open' })
    servers[0].say(start)
    // The page is told nothing by the server: its frames come from the copy.
    expect(shown.map((m) => m.type)).toEqual(['room-joined'])
    expect(worker().of('table')).toEqual([{ kind: 'table', data: JSON.stringify(start), token: 'my-token', join: null }])

    // What the page plays goes to the copy, never to the server.
    const before = servers[0].sent.length
    ws.send(JSON.stringify({ type: 'dispatch', roomId: ROOM, action: { type: 'pass-priority', player: 'alice' } }))
    ws.send(JSON.stringify({ type: 'ack', roomId: ROOM, seq: 3 }))
    expect(worker().of('send').map((m) => (JSON.parse(m.data as string) as { type: string }).type)).toEqual([
      'event-deltas',
      'dispatch',
      'ack',
    ])
    expect(servers[0].sent).toHaveLength(before)

    // What the copy makes goes to the server; the server's order to the copy.
    const input = JSON.stringify({ type: 'table-input', roomId: ROOM, game: 1, after: 0, mine: 0, input: { kind: 'concede', player: 'alice' } })
    worker().say({ kind: 'server', data: input })
    expect(servers[0].sent.at(-1)).toBe(input)
    for (const type of ['table-input', 'table-refused', 'table-host', 'table-seats']) servers[0].say({ type, roomId: ROOM })
    expect(worker().of('table-message').map((m) => (JSON.parse(m.data as string) as { type: string }).type)).toEqual([
      'table-input',
      'table-refused',
      'table-host',
      'table-seats',
    ])
    // And the copy's frames are the page's.
    worker().say({ kind: 'message', data: JSON.stringify({ type: 'state', roomId: ROOM }) })
    expect(shown.map((m) => m.type)).toEqual(['room-joined', 'state'])
  })

  it('asks for the table when the room it joined by code turns out to be one, and the worker answers the join', async () => {
    const ws = await open({ token: 'my-token' })
    const join = JSON.stringify({ type: 'join-room', roomId: ROOM })
    ws.send(join)
    expect(servers[0].sent.at(-1)).toBe(join)
    servers[0].say({ type: 'error', code: 'table', roomId: ROOM, message: 'played on its players\' own devices' })
    // Not the page's to see: the seat comes back by its token.
    expect(shown).toEqual([])
    expect(servers[0].last('table-join')).toEqual({ type: 'table-join', roomId: ROOM, clientToken: 'my-token' })
    servers[0].say(start)
    expect(worker().of('table')).toEqual([{ kind: 'table', data: JSON.stringify(start), token: 'my-token', join }])

    // A join the server answered itself is over: a table started later in
    // that room finds the page already in it.
    servers[0].say({ ...seatBoard, roomId: 'OTHER' })
    ws.send(JSON.stringify({ type: 'join-room', roomId: 'LOBBY' }))
    servers[0].say({ ...seatBoard, roomId: 'LOBBY' })
    servers[0].say({ ...start, roomId: 'LOBBY' })
    expect(worker().of('table').at(-1)).toMatchObject({ join: null })
  })

  it('watches a table without a seat: no token is given, and the copy answers the page', async () => {
    const ws = await open({ token: 'my-token' })
    const spectate = JSON.stringify({ type: 'spectate-room', roomId: ROOM })
    ws.send(spectate)
    servers[0].say({ type: 'error', code: 'table', roomId: ROOM, message: 'a table' })
    expect(servers[0].last('table-join')).toEqual({ type: 'table-join', roomId: ROOM })
    servers[0].say({ ...start, seat: null })
    expect(worker().of('table')).toEqual([{ kind: 'table', data: JSON.stringify({ ...start, seat: null }), token: null, join: spectate }])
    // At the table already, a "Spectate" from its seat picker is the copy's.
    ws.send(spectate)
    expect(worker().of('send').at(-1)?.data).toBe(spectate)
    expect(servers[0].types.filter((type) => type === 'table-join')).toHaveLength(1)
  })

  it('sends a rematch to the table, and leaves both the table and the copy', async () => {
    const ws = await open()
    servers[0].say(start)
    ws.send(JSON.stringify({ type: 'rematch', roomId: ROOM }))
    expect(servers[0].sent.at(-1)).toBe(JSON.stringify({ type: 'table-rematch', roomId: ROOM }))
    expect(worker().of('send').some((m) => m.data?.includes('"rematch"'))).toBe(false)

    const leave = JSON.stringify({ type: 'leave-room', roomId: ROOM })
    ws.send(leave)
    expect(servers[0].sent.at(-1)).toBe(leave)
    expect(worker().of('table-leave')).toEqual([{ kind: 'table-leave', roomId: ROOM }])
    // The room is the server's again as far as this tab knows.
    ws.send(JSON.stringify({ type: 'join-room', roomId: ROOM }))
    expect(servers[0].types.at(-1)).toBe('join-room')
  })

  it('joins the table again after a reconnect, the copy dealt afresh from what the server sends', async () => {
    const first = await open({ token: 'my-token' })
    servers[0].say(start)
    first.close()
    // The page's next socket, the same tab: the room is known to be a table.
    const { HybridSocket } = await import('./localSocket.ts')
    const ws = new HybridSocket(
      () => {
        const server = new FakeServer()
        servers.push(server)
        return server
      },
      () => false,
      false,
      { seatToken: () => 'my-token' },
    )
    servers[1].onopen?.()
    const join = JSON.stringify({ type: 'join-room', roomId: ROOM })
    ws.send(join)
    // Asked of the table at once, not as a room first.
    expect(servers[1].types).toEqual(['table-join'])
    expect(servers[1].last('table-join')).toEqual({ type: 'table-join', roomId: ROOM, clientToken: 'my-token' })
    servers[1].say(start)
    expect(worker().of('table').at(-1)).toEqual({ kind: 'table', data: JSON.stringify(start), token: 'my-token', join })
  })

  it('keeps a table through a dropped connection: the page hears nothing, the worker is told, and asks again when it is back', async () => {
    vi.useFakeTimers()
    try {
      const ws = await open({ token: 'my-token', atTable: true })
      const closes: number[] = []
      const links: boolean[] = []
      ws.onclose = () => closes.push(1)
      ws.onlink = (up) => links.push(up)
      servers[0].say(start)
      servers[0].onclose?.()
      // No dropped socket for the page: its board stays live.
      expect(closes).toEqual([])
      expect(links).toEqual([false])
      expect(worker().of('server-down')).toHaveLength(1)
      // What the copy makes meanwhile has nowhere to go.
      worker().say({ kind: 'server', data: JSON.stringify({ type: 'table-input', roomId: ROOM }) })
      expect(servers).toHaveLength(1)

      // Opened again behind the page's back, with its usual backoff.
      vi.advanceTimersByTime(1000)
      expect(servers).toHaveLength(2)
      servers[1].onopen?.()
      expect(servers[1].types).toEqual(['event-deltas'])
      expect(worker().of('server-up')).toHaveLength(1)
      // The worker asks for the table from where its copy stands.
      const again = JSON.stringify({ type: 'table-join', roomId: ROOM, clientToken: 'my-token', from: 7 })
      worker().say({ kind: 'server', data: again })
      expect(servers[1].sent.at(-1)).toBe(again)
      expect(links).toEqual([false])
      const tail = { ...start, from: 7 }
      servers[1].say(tail)
      expect(links).toEqual([false, true])
      expect(worker().of('table').at(-1)).toEqual({ kind: 'table', data: JSON.stringify(tail), token: 'my-token', join: null })
      expect(closes).toEqual([])
      expect(shown).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })

  it('tells the page of the drop after all when the table is gone by the time the server is back', async () => {
    vi.useFakeTimers()
    try {
      const ws = await open({ token: 'my-token', atTable: true })
      const closes: number[] = []
      ws.onclose = () => closes.push(1)
      servers[0].say(start)
      servers[0].onclose?.()
      vi.advanceTimersByTime(1000)
      servers[1].onopen?.()
      // The server restarted: it knows no such table.
      servers[1].say({ type: 'error', message: 'no room TABLE' })
      expect(closes).toEqual([1])
      expect(servers[1].closed).toBe(true)
      expect(shown).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })

  it("shows a page that doesn't play tables the server's refusal, and one it didn't ask for", async () => {
    const off = await open({ tables: false })
    off.send(JSON.stringify({ type: 'join-room', roomId: ROOM }))
    servers[0].say({ type: 'error', code: 'table', roomId: ROOM, message: 'a table' })
    expect(shown).toMatchObject([{ type: 'error', code: 'table' }])
    expect(servers[0].types).not.toContain('table-join')

    vi.resetModules()
    FakeWorker.made = []
    servers = []
    shown = []
    await open()
    servers[0].say({ type: 'error', code: 'table', roomId: 'ELSEWHERE', message: 'a table' })
    expect(shown).toMatchObject([{ type: 'error', code: 'table' }])
  })

  it('takes its word back when the worker fails, so the next game starts on the server', async () => {
    await open()
    servers[0].say(seatBoard)
    worker().say({ kind: 'open' })
    expect(servers[0].last('table-capable')).toMatchObject({ build: expect.stringMatching(/.+/) })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    worker().say({ kind: 'failed', message: 'the card pool would not load' })
    expect(servers[0].last('table-capable')).toEqual({ type: 'table-capable', build: '' })
    vi.restoreAllMocks()
  })
})
