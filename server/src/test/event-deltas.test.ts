/**
 * Frames carry only the events a connection hasn't had (`event-deltas`, the
 * `state` message's `eventsFrom`), end to end over the transport: the whole
 * log on a connection's first frame of a game, then only what's new; the
 * whole log again after a rematch, a reconnect, a spectator arriving or a
 * `resync`; each connection its own slice; and the whole log every time for
 * a connection that never asked.
 */

import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import type { GameEvent } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";
import { RoomManager } from "../room-manager.js";
import { Room } from "../room.js";
import { attachRoomServer } from "../ws-server.js";
import { ALICE, BOB } from "../decks.js";

type StateMessage = Extract<ServerMessage, { type: "state" }>;

interface Client {
  readonly ws: WebSocket;
  send(message: ClientMessage): void;
  next(match: (m: ServerMessage) => boolean): Promise<ServerMessage>;
  drain(): ServerMessage[];
}

function client(ws: WebSocket): Client {
  let buffer: ServerMessage[] = [];
  const waiters: { match: (m: ServerMessage) => boolean; resolve: (m: ServerMessage) => void }[] = [];
  ws.on("message", (raw) => {
    const message = JSON.parse(raw.toString()) as ServerMessage;
    const i = waiters.findIndex((w) => w.match(message));
    if (i >= 0) waiters.splice(i, 1)[0].resolve(message);
    else buffer.push(message);
  });
  return {
    ws,
    send: (message) => ws.send(JSON.stringify(message)),
    next: (match) =>
      new Promise((resolve) => {
        const i = buffer.findIndex(match);
        if (i >= 0) resolve(buffer.splice(i, 1)[0]);
        else waiters.push({ match, resolve });
      }),
    drain: () => {
      const out = buffer;
      buffer = [];
      return out;
    },
  };
}

const isState = (m: ServerMessage): m is StateMessage => m.type === "state";

async function nextState(c: Client, match: (m: StateMessage) => boolean = () => true): Promise<StateMessage> {
  const m = await c.next((x) => x.type === "error" || (isState(x) && match(x)));
  if (m.type === "error") throw new Error(m.message);
  if (!isState(m)) throw new Error("unreachable");
  return m;
}

/** What a client that keeps the log does with a frame: the whole log on
 * `eventsFrom` 0, else this frame's events appended — insisting they line up. */
class Log {
  events: GameEvent[] = [];
  deltas = 0;
  take(frame: StateMessage): void {
    const from = frame.eventsFrom ?? 0;
    if (from === 0) {
      this.events = [...frame.view.events];
      return;
    }
    expect(from).toBe(this.events.length);
    this.deltas += 1;
    this.events.push(...frame.view.events);
  }
}

/** The server's log, as it crosses the wire. */
const wire = (events: readonly GameEvent[]): unknown => JSON.parse(JSON.stringify(events));

describe("frames carry only the events a connection hasn't had", () => {
  let wss: WebSocketServer;
  let manager: RoomManager;
  let port: number;
  let sockets: WebSocket[];

  beforeEach(async () => {
    wss = new WebSocketServer({ port: 0 });
    // Every settle publishes once, on the message that caused it.
    manager = new RoomManager({ pacing: "immediate" });
    attachRoomServer(wss, manager);
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    port = (wss.address() as AddressInfo).port;
    sockets = [];
  });

  afterEach(async () => {
    for (const ws of sockets) ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  async function connect(deltas: boolean): Promise<Client> {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    sockets.push(ws);
    const c = client(ws);
    if (deltas) c.send({ type: "event-deltas" });
    return c;
  }

  /** A two-seat room of humans, both past their mulligans: Alice keeps the
   * log (and hosts), Bob doesn't. */
  async function startRoom(): Promise<{ alice: Client; bob: Client; roomId: string; aliceLog: Log }> {
    const alice = await connect(true);
    const bob = await connect(false);
    alice.send({ type: "create-room", players: 2, hostToken: "host" });
    const created = await alice.next((m) => m.type === "room-created");
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    alice.send({ type: "join-room", roomId, hostToken: "host" });
    alice.send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice-token", ready: true });
    bob.send({ type: "join-room", roomId });
    await bob.next((m) => m.type === "room-joined");
    bob.send({ type: "claim-seat", roomId, seat: BOB, clientToken: "bob-token", ready: true });
    await bob.next((m) => m.type === "room-joined" && m.seats.every((s) => s.ready));
    alice.send({ type: "start-game", roomId });
    const aliceLog = new Log();
    const first = await nextState(alice);
    expect(first.eventsFrom).toBe(0);
    aliceLog.take(first);
    await nextState(bob);
    alice.send({ type: "dispatch", roomId, action: { type: "mulligan", player: ALICE, keep: true } });
    aliceLog.take(await nextState(alice));
    await nextState(bob);
    bob.send({ type: "dispatch", roomId, action: { type: "mulligan", player: BOB, keep: true } });
    aliceLog.take(await nextState(alice));
    await nextState(bob);
    return { alice, bob, roomId, aliceLog };
  }

  function room(roomId: string): Room {
    const r = manager.get(roomId);
    if (!(r instanceof Room)) throw new Error("no game");
    return r;
  }

  /** Whoever holds priority passes it, `times` times over, each pass a frame
   * for both seats; `each` sees both. */
  async function passes(
    roomId: string,
    seats: { readonly [player: string]: Client },
    times: number,
    each: (frames: StateMessage[]) => void,
  ): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      const { awaiting, priority, zones } = room(roomId).game.state;
      if (awaiting?.kind === "discard") {
        // Cleanup's hand size: the first cards in hand go.
        const p = awaiting.player;
        const cards = zones.perPlayer[p].hand.slice(0, awaiting.count);
        seats[p].send({ type: "dispatch", roomId, action: { type: "discard", player: p, cards } });
      } else if (awaiting?.kind === "attackers") {
        // Nobody attacks.
        const p = awaiting.player;
        seats[p].send({ type: "dispatch", roomId, action: { type: "declare-attackers", player: p, attackers: [] } });
      } else if (awaiting === null && priority.holder !== null) {
        const p = priority.holder;
        seats[p].send({ type: "dispatch", roomId, action: { type: "pass-priority", player: p } });
      } else {
        throw new Error(`unexpected decision: ${awaiting?.kind}`);
      }
      each(await Promise.all(Object.values(seats).map((c) => nextState(c))));
    }
  }

  it("sends the whole log first, then only what's new — and the whole log every time to a connection that never asked", async () => {
    const { alice, bob, roomId, aliceLog } = await startRoom();
    await passes(roomId, { [ALICE]: alice, [BOB]: bob }, 6, ([forAlice, forBob]) => {
      aliceLog.take(forAlice);
      const log = room(roomId).game.state.eventLog;
      // Only what happened since her last frame…
      expect(forAlice.eventsFrom).toBeGreaterThan(0);
      expect(forAlice.view.events.length).toBeLessThan(log.length);
      // …while Bob, who never asked, gets the lot.
      expect(forBob.eventsFrom).toBe(0);
      expect(forBob.view.events).toEqual(wire(log));
    });
    expect(aliceLog.deltas).toBeGreaterThanOrEqual(6);
    expect(aliceLog.events).toEqual(wire(room(roomId).game.state.eventLog));
  });

  it("gives a reconnecting player and an arriving spectator the whole log, each connection its own slice after", async () => {
    const { alice, bob, roomId, aliceLog } = await startRoom();
    await passes(roomId, { [ALICE]: alice, [BOB]: bob }, 2, ([forAlice]) => aliceLog.take(forAlice));

    // Bob reloads: a new connection, which keeps the log this time.
    bob.ws.close();
    const bob2 = await connect(true);
    bob2.send({ type: "join-room", roomId });
    await bob2.next((m) => m.type === "room-joined");
    bob2.send({ type: "claim-seat", roomId, seat: BOB, clientToken: "bob-token" });
    const back = await nextState(bob2);
    // Alice's frames up to that same publish, in order.
    let sameFrame = await nextState(alice);
    while (sameFrame.seq < back.seq) {
      aliceLog.take(sameFrame);
      sameFrame = await nextState(alice);
    }
    expect(sameFrame.seq).toBe(back.seq);
    expect(back.eventsFrom).toBe(0);
    expect(back.view.events).toEqual(wire(room(roomId).game.state.eventLog));
    // The same publish, a slice for the one who has the rest.
    expect(sameFrame.eventsFrom).toBe(aliceLog.events.length);
    aliceLog.take(sameFrame);
    const bobLog = new Log();
    bobLog.take(back);

    // A spectator who keeps the log arrives: the whole of it.
    const watcher = await connect(true);
    watcher.send({ type: "spectate-room", roomId });
    const watched = await nextState(watcher);
    expect(watched.spectating).toBe(true);
    expect(watched.eventsFrom).toBe(0);
    expect(watched.view.events).toEqual(wire(room(roomId).game.state.eventLog));
    const watcherLog = new Log();
    watcherLog.take(watched);

    await passes(roomId, { [ALICE]: alice, [BOB]: bob2 }, 4, ([forAlice, forBob]) => {
      aliceLog.take(forAlice);
      bobLog.take(forBob);
    });
    // The spectator's frames of the same publishes, all of them slices.
    for (let seq = watched.seq; seq < room(roomId).frameSeq; ) {
      const frame = await nextState(watcher);
      expect(frame.eventsFrom).toBeGreaterThan(0);
      watcherLog.take(frame);
      seq = frame.seq;
    }
    const log = wire(room(roomId).game.state.eventLog);
    expect(aliceLog.events).toEqual(log);
    expect(bobLog.events).toEqual(log);
    expect(watcherLog.events).toEqual(log);
    expect(bobLog.deltas).toBeGreaterThan(0);
    expect(watcherLog.deltas).toBeGreaterThan(0);
  });

  it("starts over with the whole log when a rematch deals a new game", async () => {
    const { alice, bob, roomId, aliceLog } = await startRoom();
    await passes(roomId, { [ALICE]: alice, [BOB]: bob }, 3, ([forAlice]) => aliceLog.take(forAlice));
    const old = room(roomId);
    alice.send({ type: "rematch", roomId, restart: true });
    const fresh = await nextState(alice, (m) => m.game === 2);
    expect(room(roomId)).not.toBe(old);
    expect(fresh.eventsFrom).toBe(0);
    expect(fresh.view.events).toEqual(wire(room(roomId).game.state.eventLog));
    aliceLog.take(fresh);
    // And slices of the new game's log from there.
    alice.send({ type: "dispatch", roomId, action: { type: "mulligan", player: ALICE, keep: true } });
    const next = await nextState(alice, (m) => m.game === 2);
    expect(next.eventsFrom).toBe(fresh.view.events.length);
    aliceLog.take(next);
    expect(aliceLog.events).toEqual(wire(room(roomId).game.state.eventLog));
  });

  it("answers a resync with the current frame and the whole log, to that connection alone", async () => {
    const { alice, bob, roomId, aliceLog } = await startRoom();
    await passes(roomId, { [ALICE]: alice, [BOB]: bob }, 2, ([forAlice]) => aliceLog.take(forAlice));
    alice.drain();
    bob.drain();
    alice.send({ type: "resync", roomId });
    const again = await nextState(alice);
    expect(again.seq).toBe(room(roomId).frameSeq);
    expect(again.eventsFrom).toBe(0);
    expect(again.view.events).toEqual(wire(room(roomId).game.state.eventLog));
    aliceLog.take(again);
    // Bob was sent nothing: his next frame is the next one published.
    await passes(roomId, { [ALICE]: alice, [BOB]: bob }, 1, ([forAlice, forBob]) => {
      expect(forBob.seq).toBe(again.seq + 1);
      expect(forAlice.eventsFrom).toBe(aliceLog.events.length);
      aliceLog.take(forAlice);
    });
    expect(aliceLog.events).toEqual(wire(room(roomId).game.state.eventLog));
  });
});
