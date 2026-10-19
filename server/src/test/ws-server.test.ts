/**
 * End-to-end proof that dispatch → broadcast round-trips over a real
 * WebSocket connection, not just through the in-process `Room` API.
 */

import type { AddressInfo, Socket } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { RoomManager } from "../room-manager.js";
import { Room } from "../room.js";
import { COMPRESSION, attachRoomServer } from "../ws-server.js";
import type { ServerMessage } from "protocol";
import { ALICE, BOB, CAROL, DAVE, SEATS } from "../decks.js";

function nextMessage(ws: WebSocket): Promise<ServerMessage> {
  return new Promise((resolve, reject) => {
    ws.once("message", (raw) => {
      try {
        resolve(JSON.parse(raw.toString()) as ServerMessage);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/** Buffers every message from `ws`, so back-to-back server sends aren't lost
 * between `nextMessage` calls. */
function messageQueue(ws: WebSocket): () => Promise<ServerMessage> {
  const buffer: ServerMessage[] = [];
  const waiters: ((m: ServerMessage) => void)[] = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString()) as ServerMessage;
    const waiter = waiters.shift();
    if (waiter) waiter(msg);
    else buffer.push(msg);
  });
  return () =>
    new Promise((resolve) => {
      const buffered = buffer.shift();
      if (buffered) resolve(buffered);
      else waiters.push(resolve);
    });
}

function connect(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.once("open", () => resolve(ws));
    ws.once("error", reject);
  });
}

describe("room server (end to end over WebSocket)", () => {
  let wss: WebSocketServer;
  let manager: RoomManager;
  let port: number;
  let sockets: WebSocket[];

  beforeEach(async () => {
    wss = new WebSocketServer({ port: 0 });
    manager = new RoomManager();
    attachRoomServer(wss, manager);
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    port = (wss.address() as AddressInfo).port;
    sockets = [];
  });

  afterEach(async () => {
    for (const ws of sockets) ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  async function openSocket(): Promise<WebSocket> {
    const ws = await connect(port);
    sockets.push(ws);
    return ws;
  }

  it("lets two devices create a room, claim both seats, and see each other's moves", async () => {
    const aliceWs = await openSocket();
    const bobWs = await openSocket();

    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    expect(created.type).toBe("room-created");
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;

    aliceWs.send(
      JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice-token" }),
    );
    // The room isn't ready to start yet — Bob hasn't claimed a seat, so
    // there's no Game yet, just a refreshed seat list (no `state`).
    const aliceJoined = await nextMessage(aliceWs);
    expect(aliceJoined.type).toBe("room-joined");
    if (aliceJoined.type !== "room-joined") throw new Error("unreachable");
    expect(aliceJoined.seats).toEqual([
      {
        player: ALICE,
        claimed: true,
        online: true,
        displayName: null,
        isBot: false,
        // Claimed with no explicit deck — falls back to ALICE's positional
        // starter deck (see `PendingRoom.claimSeat`).
        deck: { name: SEATS[0].name, commanders: [{ name: SEATS[0].commanders![0], printing: SEATS[0].printings?.[SEATS[0].commanders![0]] ?? null }] },
        ready: false,
        isHost: true,
        deckProblem: null,
      },
      { player: BOB, claimed: false, online: false, displayName: null, isBot: false, deck: null, ready: false, isHost: false, deckProblem: null },
    ]);

    bobWs.send(JSON.stringify({ type: "join-room", roomId }));
    const joined = await nextMessage(bobWs);
    expect(joined.type).toBe("room-joined");

    bobWs.send(
      JSON.stringify({ type: "claim-seat", roomId, seat: BOB, clientToken: "bob-token" }),
    );
    await nextMessage(aliceWs); // room-joined — both claimed, neither ready yet
    await nextMessage(bobWs);

    // Filling every seat doesn't start the game by itself — every human seat
    // has to ready up, and someone still has to explicitly start it.
    aliceWs.send(JSON.stringify({ type: "set-ready", roomId, ready: true }));
    await nextMessage(aliceWs);
    await nextMessage(bobWs);
    bobWs.send(JSON.stringify({ type: "set-ready", roomId, ready: true }));
    await nextMessage(aliceWs);
    await nextMessage(bobWs);

    aliceWs.send(JSON.stringify({ type: "start-game", roomId }));
    // Both sockets get pushed a fresh state once the game actually starts.
    const aliceRebroadcast = await nextMessage(aliceWs);
    const bobState = await nextMessage(bobWs);
    if (aliceRebroadcast.type !== "state" || bobState.type !== "state") {
      throw new Error("unreachable");
    }
    expect(aliceRebroadcast.seats.every((s) => s.claimed)).toBe(true);
    expect(bobState.seat).toBe(BOB);
    // The game's first frame names every card in it, for the client to load
    // the art of ahead of time — each player's deck, commanders included.
    expect(bobState.artManifest?.length).toBeGreaterThan(0);
    expect(aliceRebroadcast.artManifest?.some((e) => e.name === SEATS[0].commanders![0])).toBe(true);
    // Real rooms turn on mulligans — both players are asked at once (parallel,
    // not turn order) and keep their opening hand before turn 1's priority
    // even exists.
    expect(bobState.view.awaiting).toEqual({
      kind: "mulligan",
      player: ALICE,
      hands: {
        [ALICE]: { taken: 0, step: "decide" },
        [BOB]: { taken: 0, step: "decide" },
      },
    });

    aliceWs.send(
      JSON.stringify({
        type: "dispatch",
        roomId,
        action: { type: "mulligan", player: ALICE, keep: true },
      }),
    );
    await Promise.all([nextMessage(aliceWs), nextMessage(bobWs)]);

    bobWs.send(
      JSON.stringify({
        type: "dispatch",
        roomId,
        action: { type: "mulligan", player: BOB, keep: true },
      }),
    );
    const [, bobAfterKeep] = await Promise.all([nextMessage(aliceWs), nextMessage(bobWs)]);
    if (bobAfterKeep.type !== "state") throw new Error("unreachable");
    // Only the first frame carries it.
    expect(bobAfterKeep.artManifest).toBeUndefined();

    const holder = bobAfterKeep.view.priority.holder;
    expect(holder).not.toBeNull();
    const holderWs = holder === ALICE ? aliceWs : bobWs;
    const otherWs = holder === ALICE ? bobWs : aliceWs;

    holderWs.send(
      JSON.stringify({ type: "dispatch", roomId, action: { type: "pass-priority", player: holder } }),
    );

    const [holderUpdate, otherUpdate] = await Promise.all([
      nextMessage(holderWs),
      nextMessage(otherWs),
    ]);
    expect(holderUpdate.type).toBe("state");
    expect(otherUpdate.type).toBe("state");
  });

  it("creating a room without a seed picks a fresh random one each time, not a fixed default", async () => {
    const aliceWs = await openSocket();

    async function createAndStartRoom(): Promise<string> {
      aliceWs.send(JSON.stringify({ type: "create-room" }));
      const created = await nextMessage(aliceWs);
      if (created.type !== "room-created") throw new Error("unreachable");
      aliceWs.send(
        JSON.stringify({
          type: "claim-seat",
          roomId: created.roomId,
          seat: ALICE,
          clientToken: "alice-token",
          ready: true,
        }),
      );
      await nextMessage(aliceWs); // room-joined — Bob hasn't claimed yet
      aliceWs.send(JSON.stringify({ type: "add-bot", roomId: created.roomId, seat: BOB }));
      await nextMessage(aliceWs); // room-joined — bot-filled, but not started until asked
      aliceWs.send(JSON.stringify({ type: "start-game", roomId: created.roomId }));
      await nextMessage(aliceWs); // state — room started
      return created.roomId;
    }

    const firstRoomId = await createAndStartRoom();
    const secondRoomId = await createAndStartRoom();

    const firstRoom = manager.get(firstRoomId);
    const secondRoom = manager.get(secondRoomId);
    if (!(firstRoom instanceof Room) || !(secondRoom instanceof Room)) {
      throw new Error("expected both rooms to have started");
    }
    expect(firstRoom.game.state.seed).not.toBe(secondRoom.game.state.seed);
  });

  it("rejects a dispatch for a seat the connection hasn't claimed", async () => {
    const aliceWs = await openSocket();
    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    if (created.type !== "room-created") throw new Error("unreachable");

    aliceWs.send(
      JSON.stringify({
        type: "dispatch",
        roomId: created.roomId,
        action: { type: "pass-priority", player: BOB },
      }),
    );
    const reply = await nextMessage(aliceWs);
    expect(reply.type).toBe("error");
  });

  it("a rejected seat claim sends an error and a fresh seat list", async () => {
    const aliceWs = await openSocket();
    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    if (created.type !== "room-created") throw new Error("unreachable");
    aliceWs.send(
      JSON.stringify({
        type: "claim-seat",
        roomId: created.roomId,
        seat: ALICE,
        clientToken: "alice-token",
      }),
    );
    await nextMessage(aliceWs); // room-joined — Alice is in, room not started yet

    // Bob's device tries to grab Alice's seat with a different token.
    const bobWs = await openSocket();
    const bobMsg = messageQueue(bobWs);
    bobWs.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    await bobMsg(); // room-joined
    bobWs.send(
      JSON.stringify({
        type: "claim-seat",
        roomId: created.roomId,
        seat: ALICE,
        clientToken: "bob-token",
      }),
    );
    const err = await bobMsg();
    expect(err.type).toBe("error");
    const refreshed = await bobMsg();
    if (refreshed.type !== "room-joined") throw new Error("expected room-joined");
    const alice = refreshed.seats.find((s) => s.player === ALICE);
    expect(alice?.claimed).toBe(true);
    expect(refreshed.seats.find((s) => s.player === BOB)?.claimed).toBe(false);
  });

  it("reports an error for an unknown room id", async () => {
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: "join-room", roomId: "NOPE1" }));
    const reply = await nextMessage(ws);
    expect(reply).toEqual({ type: "error", message: "no such room: NOPE1" });
  });

  it("omitting players still creates a 2-seat room", async () => {
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(ws);
    if (created.type !== "room-created") throw new Error("unreachable");

    ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    const joined = await nextMessage(ws);
    if (joined.type !== "room-joined") throw new Error("unreachable");
    expect(joined.seats.map((s) => s.player)).toEqual([ALICE, BOB]);
  });

  it("players: 3 creates a room with a third seat", async () => {
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: "create-room", players: 3 }));
    const created = await nextMessage(ws);
    if (created.type !== "room-created") throw new Error("unreachable");

    ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    const joined = await nextMessage(ws);
    if (joined.type !== "room-joined") throw new Error("unreachable");
    expect(joined.seats).toHaveLength(3);
    expect(joined.seats.map((s) => s.player)).toEqual([ALICE, BOB, CAROL]);
  });

  it("players: 4 creates a room with all four seats", async () => {
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: "create-room", players: 4 }));
    const created = await nextMessage(ws);
    if (created.type !== "room-created") throw new Error("unreachable");

    ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    const joined = await nextMessage(ws);
    if (joined.type !== "room-joined") throw new Error("unreachable");
    expect(joined.seats.map((s) => s.player)).toEqual([ALICE, BOB, CAROL, DAVE]);
  });

  it("clamps an out-of-range players count into 2-4", async () => {
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: "create-room", players: 99 }));
    const created = await nextMessage(ws);
    if (created.type !== "room-created") throw new Error("unreachable");

    ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    const joined = await nextMessage(ws);
    if (joined.type !== "room-joined") throw new Error("unreachable");
    expect(joined.seats).toHaveLength(4);
  });

  it("sizes the table from the seat board: add-seat and remove-seat, refreshing a watcher who holds no seat", async () => {
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "join-room", roomId }));
    await next();

    // This connection has claimed nothing, so it isn't in `connectedSeats()`
    // and only the direct refresh reaches it — the case that made `add-bot`
    // need the same follow-up send.
    ws.send(JSON.stringify({ type: "add-seat", roomId }));
    const grown = await next();
    if (grown.type !== "room-joined") throw new Error("unreachable");
    expect(grown.seats.map((s) => s.player)).toEqual([ALICE, BOB, CAROL]);

    ws.send(JSON.stringify({ type: "remove-seat", roomId, seat: CAROL }));
    const shrunk = await next();
    if (shrunk.type !== "room-joined") throw new Error("unreachable");
    expect(shrunk.seats.map((s) => s.player)).toEqual([ALICE, BOB]);
  });

  it("refuses to drop a seat below two, or one a player is sitting in", async () => {
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room", players: 3 }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice" }));
    await next();

    ws.send(JSON.stringify({ type: "remove-seat", roomId, seat: ALICE }));
    const claimedErr = await next();
    expect(claimedErr.type).toBe("error");

    ws.send(JSON.stringify({ type: "remove-seat", roomId, seat: CAROL }));
    await next();
    ws.send(JSON.stringify({ type: "remove-seat", roomId, seat: BOB }));
    const floorErr = await next();
    expect(floorErr.type).toBe("error");
    if (floorErr.type !== "error") throw new Error("unreachable");
    expect(floorErr.message).toMatch(/at least 2 seats/);
  });

  it("rejects resizing a table once the game has started", async () => {
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice", ready: true }));
    await next();
    ws.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    await next();
    ws.send(JSON.stringify({ type: "start-game", roomId }));
    let message = await next();
    while (message.type !== "state") message = await next();

    // Asked from a second connection holding no seat: a live room keeps
    // publishing frames to its *seated* players as the bot plays on, so
    // asking from Alice's socket would race the reply against those.
    const watcher = await openSocket();
    const watcherNext = messageQueue(watcher);
    watcher.send(JSON.stringify({ type: "join-room", roomId }));
    await watcherNext();
    watcher.send(JSON.stringify({ type: "add-seat", roomId }));
    const err = await watcherNext();
    expect(err.type).toBe("error");
    if (err.type !== "error") throw new Error("unreachable");
    expect(err.message).toMatch(/already started/);
  });

  it("lets a connection with no seat spectate: the seat board, then frames with no hand and no actions", async () => {
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice", ready: true }));
    await next();
    ws.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    await next();

    // A full table: the watcher spectates the waiting room.
    const watcher = await openSocket();
    const watcherNext = messageQueue(watcher);
    watcher.send(JSON.stringify({ type: "spectate-room", roomId }));
    const joined = await watcherNext();
    expect(joined.type === "room-joined" && joined.spectating).toBe(true);
    expect(joined.type === "room-joined" && joined.seat).toBeNull();

    // The game starts: its frames reach the spectator too.
    ws.send(JSON.stringify({ type: "start-game", roomId }));
    let frame = await watcherNext();
    while (frame.type !== "state") frame = await watcherNext();
    expect(frame.spectating).toBe(true);
    expect(frame.actions).toEqual([]);
    // Every hand hidden: its cards are named in the zones, never shown.
    const handCards = [ALICE, BOB].flatMap((p) => frame.type === "state" ? frame.view.zones.hands[p] ?? [] : []);
    expect(handCards.length).toBeGreaterThan(0);
    expect(handCards.filter((id) => frame.type === "state" && frame.view.objects[id] !== undefined)).toEqual([]);
  });

  it("closes a waiting room once the last person walks out, but not while a seat is held", async () => {
    // A host whose game with bots alone moved into their browser leaves the
    // lobby behind: it mustn't hold a place under the room caps.
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room", players: 3 }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice", ready: true }));
    await next();
    ws.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    await next();

    // Someone else holds the third seat: the host leaving closes nothing.
    const other = await openSocket();
    const otherNext = messageQueue(other);
    other.send(JSON.stringify({ type: "claim-seat", roomId, seat: CAROL, clientToken: "carol" }));
    await otherNext();
    ws.send(JSON.stringify({ type: "leave-room", roomId }));
    await otherNext();
    expect(manager.get(roomId)).toBeDefined();

    // They leave too, and nobody's left: gone.
    other.send(JSON.stringify({ type: "leave-room", roomId }));
    await new Promise((r) => setTimeout(r, 50));
    expect(manager.get(roomId)).toBeUndefined();
  });

  it("tells a waiting room's seats how many are watching it", async () => {
    // What decides whether a host's game with bots alone may move into their
    // browser (`client/src/lobby/localStart.ts`): not while anyone watches.
    const ws = await openSocket();
    const next = messageQueue(ws);
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await next();
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice", ready: true }));
    const seated = await next();
    expect(seated.type === "room-joined" && seated.spectators).toBeUndefined();

    const watcher = await openSocket();
    const watcherNext = messageQueue(watcher);
    watcher.send(JSON.stringify({ type: "spectate-room", roomId }));
    const watching = await watcherNext();
    expect(watching.type === "room-joined" && watching.spectators).toBe(1);
    const told = await next();
    expect(told.type === "room-joined" && told.spectators).toBe(1);

    watcher.send(JSON.stringify({ type: "leave-room", roomId }));
    let after = await next();
    while (after.type === "room-joined" && after.spectators !== undefined) after = await next();
    expect(after.type === "room-joined" && after.spectators).toBeUndefined();
  });

  it("rate-limits a connection that sends a flood of messages", async () => {
    const ws = await openSocket();
    const nextMsg = messageQueue(ws);
    // Comfortably past RATE_LIMIT_MAX_MESSAGES within the same window.
    for (let i = 0; i < 60; i += 1) {
      ws.send(JSON.stringify({ type: "join-room", roomId: "NOPE1" }));
    }
    const replies = await Promise.all(Array.from({ length: 60 }, () => nextMsg()));
    expect(replies.some((r) => r.type === "error" && r.message === "too many requests, slow down"))
      .toBe(true);
    // Everything up to the limit still went through as normal "no such room" errors.
    expect(replies.some((r) => r.type === "error" && r.message === "no such room: NOPE1")).toBe(
      true,
    );
  });

  it("doesn't rate-limit ordinary play", async () => {
    const ws = await openSocket();
    const nextMsg = messageQueue(ws);
    // Fewer messages than the limit, spread across normal room setup —
    // should never see a rate-limit error.
    ws.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMsg();
    if (created.type !== "room-created") throw new Error("unreachable");
    for (let i = 0; i < 10; i += 1) {
      ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    }
    const replies = await Promise.all(Array.from({ length: 10 }, () => nextMsg()));
    expect(replies.every((r) => r.type === "room-joined")).toBe(true);
  });

  it("fills an open seat with a bot and refreshes an unclaimed watcher's seat list", async () => {
    const aliceWs = await openSocket();
    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;

    // Alice hasn't claimed a seat yet — she's still on the seat picker,
    // deciding whether to fill Bob's seat with a bot before claiming her own.
    const aliceMsg = messageQueue(aliceWs);
    aliceWs.send(JSON.stringify({ type: "join-room", roomId }));
    await aliceMsg(); // room-joined

    aliceWs.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    const refreshed = await aliceMsg();
    if (refreshed.type !== "room-joined") throw new Error("expected room-joined");
    expect(refreshed.seats).toContainEqual({
      player: BOB,
      claimed: false,
      online: false,
      displayName: expect.any(String),
      isBot: true,
      deck: { name: SEATS[1].name, commanders: [{ name: SEATS[1].commanders![0], printing: SEATS[1].printings?.[SEATS[1].commanders![0]] ?? null }] },
      ready: true,
      isHost: false,
      deckProblem: null,
    });
  });

  it("rejects starting the game before everyone is ready, and rejects it again after the game has started", async () => {
    const aliceWs = await openSocket();
    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;

    aliceWs.send(
      JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice-token" }),
    );
    await nextMessage(aliceWs); // room-joined — Alice claimed but not ready
    aliceWs.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    await nextMessage(aliceWs); // room-joined — Bob's a bot (always ready), Alice still isn't

    aliceWs.send(JSON.stringify({ type: "start-game", roomId }));
    const rejected = await nextMessage(aliceWs);
    expect(rejected).toEqual({ type: "error", message: "not everyone is ready yet" });

    aliceWs.send(JSON.stringify({ type: "set-ready", roomId, ready: true }));
    await nextMessage(aliceWs); // room-joined
    aliceWs.send(JSON.stringify({ type: "start-game", roomId }));
    const started = await nextMessage(aliceWs);
    expect(started.type).toBe("state");

    // Once the game exists, both the readiness dance and a second start are moot.
    aliceWs.send(JSON.stringify({ type: "start-game", roomId }));
    const afterStart = await nextMessage(aliceWs);
    expect(afterStart).toEqual({ type: "error", message: `room ${roomId} has already started` });
  });

  it("rejects adding a bot to a seat someone already claimed", async () => {
    const aliceWs = await openSocket();
    aliceWs.send(JSON.stringify({ type: "create-room" }));
    const created = await nextMessage(aliceWs);
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;

    aliceWs.send(
      JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice-token" }),
    );
    await nextMessage(aliceWs); // room-joined

    aliceWs.send(JSON.stringify({ type: "add-bot", roomId, seat: ALICE }));
    const reply = await nextMessage(aliceWs);
    expect(reply.type).toBe("error");
  });

  it("answers JSON that isn't an object as malformed, and keeps serving", async () => {
    // `null` once threw out of the socket's listener reading its `type`,
    // which would have ended the process.
    const ws = await openSocket();
    for (const text of ["null", "42", "\"create-room\""]) {
      ws.send(text);
      expect(await nextMessage(ws)).toEqual({ type: "error", message: "malformed message" });
    }
    ws.send(JSON.stringify({ type: "create-room" }));
    expect((await nextMessage(ws)).type).toBe("room-created");
  });
});

describe("compression (permessage-deflate)", () => {
  it("negotiates it, and a game frame crosses the wire at a fraction of its size", async () => {
    // The live server's Wi-Fi uploads ~25 KB/s, and an uncompressed frame of a
    // late board is 400-600 KB (2026-10-07): bots wait on each frame's ack, so
    // the frames' size was the bots' speed.
    const wss = new WebSocketServer({ port: 0, perMessageDeflate: COMPRESSION });
    attachRoomServer(wss, new RoomManager());
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    const ws = await connect((wss.address() as AddressInfo).port);
    try {
      expect(ws.extensions).toMatch(/permessage-deflate/);
      let received = 0;
      ws.on("message", (raw: Buffer) => {
        received += raw.length;
      });
      const next = messageQueue(ws);
      ws.send(JSON.stringify({ type: "create-room" }));
      const created = await next();
      if (created.type !== "room-created") throw new Error("unreachable");
      const roomId = created.roomId;
      ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice", ready: true }));
      await next();
      ws.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
      await next();
      ws.send(JSON.stringify({ type: "start-game", roomId }));
      let message = await next();
      while (message.type !== "state") message = await next();
      // What reached the socket, against what the messages decompressed to —
      // once it's closed, so no frame is half read. (An opening board deflates
      // to about a quarter; a late one, to a tenth.)
      const socket = (ws as unknown as { _socket: Socket })._socket;
      ws.close();
      await new Promise<void>((resolve) => ws.once("close", () => resolve()));
      expect(received).toBeGreaterThan(10_000);
      expect(socket.bytesRead).toBeLessThan(received / 2);
    } finally {
      ws.close();
      await new Promise<void>((resolve) => wss.close(() => resolve()));
    }
  });
});

describe("the caps on opening rooms (in-process)", () => {
  let wss: WebSocketServer;
  let port: number;
  const sockets: WebSocket[] = [];

  async function serve(admission: { maxRoomsPerIp?: number; maxRoomsPerShard?: number }): Promise<void> {
    wss = new WebSocketServer({ port: 0 });
    attachRoomServer(wss, new RoomManager({ pacing: "immediate" }), { admission });
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    port = (wss.address() as AddressInfo).port;
  }

  afterEach(async () => {
    for (const ws of sockets.splice(0)) ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  /** A socket from `ip` as the tunnel delivers it (`CF-Connecting-IP`), or
   * a bare loopback one. */
  async function from(ip?: string): Promise<{ ws: WebSocket; next: () => Promise<ServerMessage> }> {
    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${port}`, ip !== undefined ? { headers: { "cf-connecting-ip": ip } } : {});
      socket.once("open", () => resolve(socket));
      socket.once("error", reject);
    });
    sockets.push(ws);
    return { ws, next: messageQueue(ws) };
  }

  it("refuses an address past its open rooms, across every kind of create, and frees one when its game ends", async () => {
    await serve({ maxRoomsPerIp: 2 });
    const c = await from("203.0.113.7");
    c.ws.send(JSON.stringify({ type: "create-room", hostToken: "h" }));
    const created = await c.next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    const roomId = created.roomId;
    c.ws.send(JSON.stringify({ type: "tutorial-create", lesson: "basics-proof" }));
    expect((await c.next()).type).toBe("room-created");
    c.ws.send(JSON.stringify({ type: "create-room" }));
    expect(await c.next()).toEqual({
      type: "error",
      code: "too-many-rooms",
      message: "You have too many rooms open — finish or leave one first.",
    });

    // Starting the room it has is never refused.
    c.ws.send(JSON.stringify({ type: "join-room", roomId, hostToken: "h" }));
    c.ws.send(JSON.stringify({ type: "claim-seat", roomId, seat: ALICE, clientToken: "a", ready: true }));
    c.ws.send(JSON.stringify({ type: "add-bot", roomId, seat: BOB }));
    c.ws.send(JSON.stringify({ type: "start-game", roomId }));
    let m = await c.next();
    while (m.type !== "state") m = await c.next();
    // Another address, and the box itself, are counted apart.
    const other = await from("203.0.113.8");
    other.ws.send(JSON.stringify({ type: "create-room" }));
    expect((await other.next()).type).toBe("room-created");
    const local = await from();
    for (let i = 0; i < 3; i += 1) {
      local.ws.send(JSON.stringify({ type: "create-room" }));
      expect((await local.next()).type).toBe("room-created");
    }

    // The game ends: that room no longer counts.
    c.ws.send(JSON.stringify({ type: "dispatch", roomId, action: { type: "mulligan", player: ALICE, keep: true } }));
    c.ws.send(JSON.stringify({ type: "concede", roomId }));
    m = await c.next();
    while (m.type !== "state" || !m.view.result.over) m = await c.next();
    c.ws.send(JSON.stringify({ type: "create-room" }));
    expect((await c.next()).type).toBe("room-created");
    // And a rematch, back over the cap, isn't refused either.
    c.ws.send(JSON.stringify({ type: "rematch", roomId }));
    m = await c.next();
    while (m.type !== "state" || m.game !== 2) m = await c.next();
  }, 30_000);

  it("refuses a create once this thread's rooms reach the per-shard cap, but not a join", async () => {
    await serve({ maxRoomsPerShard: 1.5 });
    const c = await from();
    c.ws.send(JSON.stringify({ type: "create-room" }));
    const created = await c.next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    c.ws.send(JSON.stringify({ type: "tutorial-create", lesson: "basics-proof" }));
    expect((await c.next()).type).toBe("room-created");
    c.ws.send(JSON.stringify({ type: "create-room" }));
    expect(await c.next()).toEqual({
      type: "error",
      code: "server-full",
      message: "The server is full right now — try again in a minute.",
    });
    c.ws.send(JSON.stringify({ type: "join-room", roomId: created.roomId }));
    expect(await c.next()).toMatchObject({ type: "room-joined", roomId: created.roomId });
  });
});
