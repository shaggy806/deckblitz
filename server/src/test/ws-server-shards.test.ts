/**
 * Rooms on worker threads, end to end over a real WebSocket: a
 * `WorkerRoomHost` over two shards, each run in this thread behind a
 * loopback channel (`loopback-channel.ts`) that structured-clones every
 * message both ways as a worker's port would. What a test sees here is what
 * a browser gets from `--shards 2`.
 */

import type { AddressInfo, Socket } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import type { ClientMessage, ServerMessage } from "protocol";
import { ALICE, BOB } from "../decks.js";
import { loopbackChannel } from "../loopback-channel.js";
import type { LoopbackChannel } from "../loopback-channel.js";
import { assembleStatus, renderStatus } from "../status-server.js";
import { COMPRESSION, attachTransport } from "../transport.js";
import { WorkerRoomHost } from "../worker-host.js";
import type { ShardSettings } from "../worker-host.js";

type StateMessage = Extract<ServerMessage, { type: "state" }>;
const isState = (m: ServerMessage): m is StateMessage => m.type === "state";

interface Client {
  readonly ws: WebSocket;
  send(message: ClientMessage | Record<string, unknown>): void;
  next(match?: (m: ServerMessage) => boolean): Promise<ServerMessage>;
  /** Everything received and not yet taken. */
  pending(): ServerMessage[];
  /** Whether any message arrived as a binary frame. */
  sawBinary(): boolean;
  /** Bytes of message payload received, after any decompression. */
  received(): number;
  closed: Promise<number>;
}

function client(ws: WebSocket): Client {
  const buffer: ServerMessage[] = [];
  const waiters: { match: (m: ServerMessage) => boolean; resolve: (m: ServerMessage) => void }[] = [];
  let binary = false;
  let bytes = 0;
  ws.on("message", (raw: Buffer, isBinary: boolean) => {
    if (isBinary) binary = true;
    bytes += raw.length;
    const message = JSON.parse(raw.toString()) as ServerMessage;
    const i = waiters.findIndex((w) => w.match(message));
    if (i >= 0) waiters.splice(i, 1)[0].resolve(message);
    else buffer.push(message);
  });
  const closed = new Promise<number>((resolve) => ws.once("close", (code) => resolve(code)));
  return {
    ws,
    send: (message) => ws.send(JSON.stringify(message)),
    next: (match = () => true) =>
      new Promise((resolve) => {
        const i = buffer.findIndex(match);
        if (i >= 0) resolve(buffer.splice(i, 1)[0]);
        else waiters.push({ match, resolve });
      }),
    pending: () => buffer.splice(0),
    sawBinary: () => binary,
    received: () => bytes,
    closed,
  };
}

/** The next `state`, failing on an `error` first. */
async function nextState(c: Client, match: (m: StateMessage) => boolean = () => true): Promise<StateMessage> {
  const m = await c.next((x) => x.type === "error" || (isState(x) && match(x)));
  if (m.type === "error") throw new Error(m.message);
  if (!isState(m)) throw new Error("unreachable");
  return m;
}

const settle = (ms = 50): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("rooms on two shards (loopback)", () => {
  let wss: WebSocketServer | null = null;
  let host: WorkerRoomHost | null = null;
  let channels: LoopbackChannel[] = [];
  let port = 0;
  const sockets: WebSocket[] = [];

  async function serve(config: Partial<ShardSettings> = {}): Promise<WorkerRoomHost> {
    channels = [];
    host = new WorkerRoomHost({
      shards: 2,
      config: { builder: true, capture: null, loadReportMs: 1_000, ...config },
      spawn: (shardConfig) => {
        const channel = loopbackChannel(shardConfig);
        channels.push(channel);
        return channel;
      },
    });
    await host.start();
    const server = new WebSocketServer({ port: 0, perMessageDeflate: COMPRESSION });
    wss = server;
    attachTransport(server, host);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    port = (server.address() as AddressInfo).port;
    return host;
  }

  afterEach(async () => {
    for (const ws of sockets.splice(0)) ws.close();
    const server = wss;
    wss = null;
    if (server !== null) await new Promise<void>((resolve) => server.close(() => resolve()));
    await host?.stop();
    host = null;
  });

  async function connect(): Promise<Client> {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    sockets.push(ws);
    return client(ws);
  }

  async function create(c: Client, message: ClientMessage | Record<string, unknown> = { type: "create-room" }): Promise<string> {
    c.send(message);
    const created = await c.next((m) => m.type === "room-created" || m.type === "error");
    if (created.type !== "room-created") throw new Error(`got ${JSON.stringify(created)}`);
    return created.roomId;
  }

  /** A two-seat room with `c` hosting from Alice's seat and a bot in Bob's,
   * started; resolves on the opening frame. */
  async function startWithBot(c: Client, hostToken = "host"): Promise<{ roomId: string; first: StateMessage }> {
    const roomId = await create(c, { type: "create-room", hostToken });
    c.send({ type: "join-room", roomId, hostToken });
    c.send({ type: "claim-seat", roomId, seat: ALICE, clientToken: `${hostToken}-alice`, ready: true });
    c.send({ type: "add-bot", roomId, seat: BOB });
    c.send({ type: "start-game", roomId });
    return { roomId, first: await nextState(c) };
  }

  it("places rooms across the shards, and routes each room's messages to its own", async () => {
    const h = await serve();
    const c = await connect();
    const codes: string[] = [];
    for (let i = 0; i < 4; i += 1) codes.push(await create(c));
    expect(codes.map((code) => h.shardOf(code))).toEqual([0, 1, 0, 1]);
    for (const roomId of codes) {
      c.send({ type: "join-room", roomId });
      const joined = await c.next();
      expect(joined).toMatchObject({ type: "room-joined", roomId, pending: true });
    }
  });

  it("plays a game: frames arrive as text, and acks release the bots", async () => {
    await serve();
    const c = await connect();
    const { roomId, first } = await startWithBot(c);
    c.send({ type: "set-bot-speed", roomId, speed: "fast" });
    // Both seats played by the bot, as the load test does.
    c.send({ type: "bot-takeover", roomId, on: true });
    let last = first;
    for (let i = 0; i < 6; i += 1) {
      c.send({ type: "ack", roomId, seq: last.seq });
      last = await nextState(c, (m) => m.seq > last.seq);
    }
    expect(last.seq).toBeGreaterThan(first.seq + 3);
    expect(last.roomId).toBe(roomId);
    expect(c.sawBinary()).toBe(false);
  }, 30_000);

  it("answers a code it has no room under itself, as a shard would", async () => {
    await serve();
    const c = await connect();
    c.send({ type: "join-room", roomId: "ZZZZZ" });
    expect(await c.next()).toEqual({ type: "error", message: "no such room: ZZZZZ" });
    c.send({ type: "ack", roomId: "ZZZZZ", seq: 3 });
    c.send({ type: "resync", roomId: "ZZZZZ" });
    c.send({ type: "no-such-message", roomId: "ZZZZZ" });
    c.send({ type: "builder-update", roomId: "ZZZZZ", spec: {} });
    expect(await c.next()).toEqual({ type: "error", message: "room ZZZZZ isn't a scenario builder" });
    c.send({ type: "tutorial-retry", roomId: "ZZZZZ" });
    expect(await c.next()).toEqual({ type: "error", message: "room ZZZZZ isn't a tutorial" });
    c.send({ type: "leave-room" });
    expect(await c.next()).toEqual({ type: "error", message: "no such room: undefined" });
    await settle();
    expect(c.pending()).toEqual([]);
  });

  it("lets a refused create's code go", async () => {
    const h = await serve();
    const c = await connect();
    c.send({ type: "tutorial-create", lesson: "no-such-lesson" });
    const refused = await c.next();
    expect(refused.type === "error" && refused.message).toMatch(/no lesson "no-such-lesson"/);
    await settle();
    expect((await h.status()).rooms).toEqual([]);
    // Placement counts no leftover route: the next room goes to shard 0.
    expect(h.shardOf(await create(c))).toBe(0);
  });

  it("spectates across shards, one room at a time", async () => {
    const h = await serve();
    const a = await connect();
    const b = await connect();
    const s = await connect();
    const roomA = await create(a, { type: "create-room", hostToken: "a" });
    const roomB = await create(b, { type: "create-room", hostToken: "b" });
    expect([h.shardOf(roomA), h.shardOf(roomB)]).toEqual([0, 1]);
    a.send({ type: "join-room", roomId: roomA, hostToken: "a" });
    b.send({ type: "join-room", roomId: roomB, hostToken: "b" });
    await a.next();
    await b.next();

    s.send({ type: "spectate-room", roomId: roomA });
    expect(await s.next()).toMatchObject({ type: "room-joined", roomId: roomA, spectating: true });
    s.send({ type: "spectate-room", roomId: roomB });
    expect(await s.next()).toMatchObject({ type: "room-joined", roomId: roomB, spectating: true });

    // Room A changes: its spectator has moved on, so nothing reaches it.
    a.send({ type: "set-bot-speed", roomId: roomA, speed: "slow" });
    expect(await a.next()).toMatchObject({ type: "room-joined", roomId: roomA, botSpeed: "slow" });
    b.send({ type: "set-bot-speed", roomId: roomB, speed: "slow" });
    expect(await s.next()).toMatchObject({ type: "room-joined", roomId: roomB, botSpeed: "slow", spectating: true });
    await settle();
    expect(s.pending()).toEqual([]);
  });

  it("keeps a rematch on its room's shard, the game and frames numbered on, the log whole again", async () => {
    const h = await serve({ pacing: "immediate" });
    await create(await connect()); // shard 0 taken, so this room goes to shard 1
    const c = await connect();
    c.send({ type: "event-deltas" });
    const { roomId, first } = await startWithBot(c);
    expect(h.shardOf(roomId)).toBe(1);
    expect(first.game).toBe(1);
    c.send({ type: "dispatch", roomId, action: { type: "mulligan", player: ALICE, keep: true } });
    const kept = await nextState(c);
    expect(kept.eventsFrom).toBeGreaterThan(0);
    c.send({ type: "concede", roomId });
    const over = await nextState(c, (m) => m.seq > kept.seq);
    c.send({ type: "rematch", roomId });
    const second = await nextState(c, (m) => m.game === 2);
    expect(second.roomId).toBe(roomId);
    expect(second.seq).toBeGreaterThan(over.seq);
    expect(second.eventsFrom).toBe(0);
    expect(h.shardOf(roomId)).toBe(1);
  }, 30_000);

  it("keeps a tutorial's retry and a builder's rebuild on their shard, frames numbered on", async () => {
    const h = await serve();
    const t = await connect();
    t.send({ type: "tutorial-create", lesson: "basics-proof", hostToken: "t" });
    const created = await t.next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    const tutorial = created.roomId;
    t.send({ type: "join-room", roomId: tutorial, hostToken: "t" });
    t.send({ type: "claim-seat", roomId: tutorial, seat: created.seat, clientToken: "tt" });
    const lesson = await nextState(t);
    t.send({ type: "tutorial-retry", roomId: tutorial });
    const retried = await nextState(t, (m) => m.seq > lesson.seq);
    expect(retried.tutorial?.step).toBeDefined();

    const d = await connect();
    const builder = await create(d, { type: "builder-create", hostToken: "d" });
    expect([h.shardOf(tutorial), h.shardOf(builder)]).toEqual([0, 1]);
    d.send({ type: "join-room", roomId: builder, hostToken: "d" });
    d.send({ type: "claim-seat", roomId: builder, seat: ALICE, clientToken: "dd" });
    const board = await nextState(d);
    d.send({ type: "builder-start", roomId: builder });
    const playing = await nextState(d, (m) => m.seq > board.seq);
    expect(playing.builder?.mode).toBe("play");
    expect([h.shardOf(tutorial), h.shardOf(builder)]).toEqual([0, 1]);
  }, 30_000);

  it("hands the host role on when the host's socket closes, and binds it by token", async () => {
    await serve();
    const host1 = await connect();
    const other = await connect();
    const roomId = await create(host1, { type: "create-room", hostToken: "secret" });
    host1.send({ type: "join-room", roomId, hostToken: "secret" });
    expect(await host1.next()).toMatchObject({ type: "room-joined", isHost: true });
    host1.send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "a" });
    other.send({ type: "join-room", roomId });
    expect(await other.next()).toMatchObject({ type: "room-joined", isHost: false });
    other.send({ type: "claim-seat", roomId, seat: BOB, clientToken: "b" });
    await other.next((m) => m.type === "room-joined" && m.seat === BOB);
    host1.ws.close();
    expect(await other.next((m) => m.type === "room-joined" && m.isHost)).toMatchObject({ isHost: true });

    // The host's token, from a new socket, takes the role back.
    const again = await connect();
    again.send({ type: "join-room", roomId, hostToken: "secret" });
    expect(await again.next()).toMatchObject({ type: "room-joined", isHost: true });
  });

  it("lets a dropped player reclaim their seat by token from a new socket", async () => {
    await serve();
    const first = await connect();
    const { roomId } = await startWithBot(first, "p");
    first.ws.close();
    await first.closed;
    const back = await connect();
    back.send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "p-alice" });
    const state = await nextState(back);
    expect(state.seat).toBe(ALICE);
    expect(state.eventsFrom).toBe(0);
    expect(state.artManifest?.length).toBeGreaterThan(0);
  });

  it("carries event slices to a shard the connection reaches after asking", async () => {
    await serve({ pacing: "immediate" });
    const c = await connect();
    c.send({ type: "event-deltas" }); // before any shard has heard of it
    const { roomId, first } = await startWithBot(c);
    expect(first.eventsFrom).toBe(0);
    c.send({ type: "dispatch", roomId, action: { type: "mulligan", player: ALICE, keep: true } });
    expect((await nextState(c)).eventsFrom).toBeGreaterThan(0);
  });

  it("gathers /status from every shard", async () => {
    const h = await serve();
    const c = await connect();
    const codes = [await create(c), await create(c), await create(c)];
    const parts = await h.status();
    expect(parts.rooms.map((r) => r.id).sort()).toEqual([...codes].sort());
    expect(parts.roomsCreated).toBe(3);
    expect(parts.shards?.map((s) => [s.index, s.up, s.responsive, s.counts.waiting])).toEqual([
      [0, true, true, 2],
      [1, true, true, 1],
    ]);
    expect(parts.shards?.[0].load?.heapUsedMb).toBeGreaterThan(0);
    expect(renderStatus(assembleStatus(parts))).toMatch(/SHARD/);
  });

  it("runs /import-deck on shard 0", async () => {
    const h = await serve();
    const lines: { type: string }[] = [];
    await new Promise<void>((resolve, reject) => {
      h.importDeck("1 Sol Ring\n1 Forest", {
        line: (value) => lines.push(value as { type: string }),
        reject: (message) => reject(new Error(message)),
        end: () => resolve(),
      });
    });
    expect(lines[0]).toEqual({ type: "progress", done: 0, total: 2, name: null });
    expect(lines.at(-1)?.type).toBe("result");
  });

  it("compresses frames, sent from a shard's bytes as text", async () => {
    await serve();
    const c = await connect();
    expect(c.ws.extensions).toMatch(/permessage-deflate/);
    await startWithBot(c);
    const socket = (c.ws as unknown as { _socket: Socket })._socket;
    c.ws.close();
    await c.closed;
    expect(c.sawBinary()).toBe(false);
    expect(c.received()).toBeGreaterThan(10_000);
    expect(socket.bytesRead).toBeLessThan(c.received() / 2);
  });

  it("drops a shard that ends: its rooms' sockets are closed, its codes unknown", async () => {
    const h = await serve();
    const a = await connect();
    const b = await connect();
    const roomA = await create(a);
    const roomB = await create(b);
    expect([h.shardOf(roomA), h.shardOf(roomB)]).toEqual([0, 1]);
    channels[1].crash(1);
    expect(await b.closed).toBe(1011);
    expect(h.shardOf(roomB)).toBeUndefined();
    a.send({ type: "join-room", roomId: roomB });
    expect(await a.next()).toEqual({ type: "error", message: `no such room: ${roomB}` });
    // New rooms go to the shard still up.
    expect(h.shardOf(await create(a))).toBe(0);
    const parts = await h.status();
    expect(parts.shards?.[1]).toMatchObject({ up: false, responsive: false });
  });
});
