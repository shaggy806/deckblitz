/**
 * A table end to end (`docs/plans/replicated-rooms.md`, step 3): devices that
 * can hold a copy of a game sit down in a waiting room, the game starts as a
 * table, and from then on each device plays its own copy (`TableCopy`, a
 * real `Room`) while the server only puts their inputs in order. Run over
 * real sockets against both hosts: rooms on this thread, and on worker
 * threads (the loopback channel), where the table lives on main and no shard
 * holds a game for it.
 */

import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { AutomaticController, HeuristicBotController, answeringPlayer, stateDigest } from "engine";
import type { PlayerId } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";
import { cardRegistry } from "../card-registry.js";
import { ALICE, BOB, CAROL } from "../decks.js";
import { loopbackChannel } from "../loopback-channel.js";
import { RoomManager } from "../room-manager.js";
import type { Connection } from "../room.js";
import { TableCopy } from "../table-copy.js";
import type { TableSummary } from "../tables.js";
import { attachTransport } from "../transport.js";
import { WorkerRoomHost } from "../worker-host.js";
import { attachRoomServer } from "../ws-server.js";

/** A device: a socket, and once the table starts, its copy of the game. */
interface Device {
  readonly ws: WebSocket;
  readonly send: (message: ClientMessage) => void;
  /** The next message matching, among those not yet taken. */
  readonly next: (match: (m: ServerMessage) => boolean) => Promise<ServerMessage>;
  /** Its copy, dealt when `table-start` arrives. */
  copy: TableCopy | null;
  /** Its page's connection to its own room. */
  readonly page: Connection;
  /** Every table message it was sent, in order. */
  readonly got: ServerMessage[];
  /** Every table input it sent, in order. */
  readonly made: Extract<ClientMessage, { type: "table-input" }>[];
}

function device(ws: WebSocket): Device {
  const buffer: ServerMessage[] = [];
  const waiters: { match: (m: ServerMessage) => boolean; resolve: (m: ServerMessage) => void }[] = [];
  const self: Device = {
    ws,
    send: (message) => {
      if (message.type === "table-input") self.made.push(message);
      ws.send(JSON.stringify(message));
    },
    next: (match) =>
      new Promise((resolve) => {
        const i = buffer.findIndex(match);
        if (i >= 0) resolve(buffer.splice(i, 1)[0]);
        else waiters.push({ match, resolve });
      }),
    copy: null,
    page: { send: () => {} },
    got: [],
    made: [],
  };
  ws.on("message", (raw: Buffer) => {
    const message = JSON.parse(raw.toString()) as ServerMessage;
    if (message.type.startsWith("table-")) self.got.push(message);
    if (message.type === "table-start") {
      // Deal this device's copy: v1 for the bots (quick, no clock), and its
      // own seat claimed by its page.
      self.copy = new TableCopy(message, {
        send: self.send,
        room: { pacing: "immediate", botController: (player) => new HeuristicBotController(player, cardRegistry()) },
      });
      if (message.seat !== null) self.copy.room.claimSeat(message.seat, "page", self.page);
    } else {
      self.copy?.handle(message);
    }
    const i = waiters.findIndex((w) => w.match(message));
    if (i >= 0) waiters.splice(i, 1)[0].resolve(message);
    else buffer.push(message);
  });
  return self;
}

const tick = (ms = 5): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

interface Served {
  readonly port: number;
  readonly tables: () => TableSummary[];
  readonly stop: () => Promise<void>;
}

const HOSTS: readonly (readonly [string, () => Promise<Served>])[] = [
  [
    "rooms on this thread",
    async () => {
      const wss = new WebSocketServer({ port: 0 });
      const host = attachRoomServer(wss, new RoomManager({ pacing: "immediate" }), { tables: { hostGraceMs: 0 } });
      await new Promise<void>((resolve) => wss.once("listening", resolve));
      return {
        port: (wss.address() as AddressInfo).port,
        tables: () => host.tableSummaries(),
        stop: () => new Promise<void>((resolve) => wss.close(() => resolve())),
      };
    },
  ],
  [
    "rooms on worker threads",
    async () => {
      const host = new WorkerRoomHost({
        shards: 2,
        tables: { hostGraceMs: 0 },
        config: { builder: false, capture: null, loadReportMs: 1_000, pacing: "immediate" },
        spawn: (config) => loopbackChannel(config),
      });
      await host.start();
      const wss = new WebSocketServer({ port: 0 });
      attachTransport(wss, host);
      await new Promise<void>((resolve) => wss.once("listening", resolve));
      return {
        port: (wss.address() as AddressInfo).port,
        tables: () => host.tableSummaries(),
        stop: async () => {
          await new Promise<void>((resolve) => wss.close(() => resolve()));
          await host.stop();
        },
      };
    },
  ],
];

describe.each(HOSTS)("a table, end to end: %s", (_label, serve) => {
  let served: Served | null = null;
  const sockets: WebSocket[] = [];

  afterEach(async () => {
    for (const ws of sockets.splice(0)) ws.close();
    await served?.stop();
    served = null;
  });

  /** A device connected; `build` is what it says it can hold copies on. */
  async function connect(build: string | null = "test-build"): Promise<Device> {
    if (served === null) served = await serve();
    const ws = new WebSocket(`ws://127.0.0.1:${served.port}`);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    sockets.push(ws);
    const d = device(ws);
    if (build !== null) d.send({ type: "table-capable", build });
    return d;
  }

  /** Alice hosts a three-seat room: Bob sits down, Carol's seat gets a bot.
   * Returns once the host has pressed start. */
  async function lobby(alice: Device, bob: Device, watchers: readonly Device[] = []): Promise<string> {
    alice.send({ type: "create-room", players: 3, hostToken: "host" });
    const created = await alice.next((m) => m.type === "room-created");
    if (created.type !== "room-created") throw new Error("unreachable");
    const roomId = created.roomId;
    alice.send({ type: "join-room", roomId, hostToken: "host" });
    alice.send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "alice-token", ready: true });
    alice.send({ type: "add-bot", roomId, seat: CAROL });
    bob.send({ type: "join-room", roomId });
    await bob.next((m) => m.type === "room-joined");
    bob.send({ type: "claim-seat", roomId, seat: BOB, clientToken: "bob-token", ready: true });
    await bob.next((m) => m.type === "room-joined" && m.seats.filter((s) => !s.isBot).every((s) => s.ready));
    for (const watcher of watchers) {
      watcher.send({ type: "spectate-room", roomId });
      await watcher.next((m) => m.type === "room-joined");
    }
    await alice.next((m) => m.type === "room-joined" && m.seats.every((s) => s.isBot || s.ready));
    alice.send({ type: "start-game", roomId });
    return roomId;
  }

  /** Waits until every device's copy holds all the server has put in order
   * and has nothing of its own outstanding. */
  async function rest(devices: readonly Device[], roomId: string): Promise<number> {
    let calm = 0;
    for (let i = 0; i < 2_000; i += 1) {
      const inputs = served?.tables().find((t) => t.id === roomId)?.inputs ?? -1;
      const copies = devices.map((d) => d.copy);
      const done = copies.every((c) => c !== null && c.outOfStep === null && c.settled && c.head === inputs);
      calm = done ? calm + 1 : 0;
      if (calm >= 3) return inputs;
      await tick(2);
    }
    const where = devices.map((d) => `${d.copy?.seat ?? "watcher"}: head ${d.copy?.head}, ${d.copy?.outOfStep ?? "in step"}`);
    const told = (d: Device): string =>
      d.got
        .slice(-8)
        .map((m) =>
          m.type === "table-input"
            ? `${m.index} from ${m.from}: ${JSON.stringify(m.input).slice(0, 90)}`
            : m.type === "table-refused"
              ? `refused after ${m.after} (head ${m.head})`
              : m.type,
        )
        .join(" | ");
    const made = devices[0].made.slice(-4).map((m) => `after ${m.after}: ${JSON.stringify(m.input).slice(0, 90)}`);
    throw new Error(
      `what ${devices[0].copy?.seat ?? "the first"} made last: ${made.join(" | ")}. ` +
      `the table never came to rest: ${where.join("; ")}. What ${devices[0].copy?.seat ?? "the first"} was told last: ${told(devices[0])}`,
    );
  }

  /** `moves` moves by people, each through that person's own copy, passing
   * or answering as little as they may. */
  async function play(devices: readonly Device[], roomId: string, moves: number): Promise<void> {
    for (let i = 0; i < moves; i += 1) {
      await rest(devices, roomId);
      const first = devices[0].copy;
      if (first === null) throw new Error("no copy");
      const state = first.room.game.state;
      if (state.result.over) return;
      const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
      if (asked === null) throw new Error("the game waits on nobody");
      const answering: PlayerId = answeringPlayer(state, asked);
      const who = devices.find((d) => d.copy?.seat === answering);
      if (who === undefined || who.copy === null) throw new Error(`nobody at the table plays ${answering}: a bot's move didn't come`);
      who.copy.room.dispatch(who.page, new AutomaticController(asked).act(who.copy.room.game.controllerView(asked)));
    }
    await rest(devices, roomId);
  }

  const digests = (devices: readonly Device[]): string[] =>
    devices.map((d) => (d.copy === null ? "none" : stateDigest(d.copy.room.game.state, { events: true })));

  it("starts as a table when every device can hold a copy, and the devices play it through the server's order", async () => {
    const [alice, bob, watcher] = [await connect(), await connect(), await connect()];
    const roomId = await lobby(alice, bob, [watcher]);
    const starts = await Promise.all([alice, bob, watcher].map((d) => d.next((m) => m.type === "table-start")));
    const [forAlice, forBob, forWatcher] = starts.map((m) => {
      if (m.type !== "table-start") throw new Error("unreachable");
      return m;
    });
    // One recipe for all, each its own seat, the creator's device hosting.
    expect(forBob.recipe).toEqual(forAlice.recipe);
    expect(forWatcher.recipe).toEqual(forAlice.recipe);
    expect([forAlice.seat, forBob.seat, forWatcher.seat]).toEqual([ALICE, BOB, null]);
    expect(starts.every((m) => m.type === "table-start" && m.host === ALICE && m.log.length === 0)).toBe(true);
    expect(forAlice.recipe.seats).toMatchObject([
      { player: ALICE, bot: false },
      { player: BOB, bot: false },
      { player: CAROL, bot: true },
    ]);
    expect(typeof forAlice.recipe.config.seed).toBe("number");
    expect(typeof forAlice.recipe.config.idSalt).toBe("string");
    // No game frame from the server: it holds no game.
    expect([alice, bob, watcher].every((d) => d.got.every((m) => m.type.startsWith("table-")))).toBe(true);

    const all = [alice, bob, watcher];
    await play(all, roomId, 40);
    const inputs = await rest(all, roomId);
    expect(inputs).toBeGreaterThan(40);
    expect(new Set(digests(all)).size).toBe(1);
    expect(alice.copy?.room.game.state.turn.number).toBeGreaterThan(1);
    // The bot's moves came from the host's device.
    const botMoves = bob.got.filter((m) => m.type === "table-input" && m.input.kind === "action" && m.input.action.player === CAROL);
    expect(botMoves.length).toBeGreaterThan(0);
    expect(botMoves.every((m) => m.type === "table-input" && m.from === ALICE)).toBe(true);
    expect(served?.tables()).toMatchObject([{ id: roomId, inputs, people: 2, connected: 2, watching: 1, host: ALICE }]);

    // The server has no room to act on under that code: only the table.
    alice.send({ type: "dispatch", roomId, action: { type: "pass-priority", player: ALICE } });
    expect(await alice.next((m) => m.type === "error")).toMatchObject({ message: /its players' own devices/ });
  }, 60_000);

  it("hands the bots to the next device when the host's goes, and deals a device that comes back its seat again", async () => {
    const [alice, bob] = [await connect(), await connect()];
    const roomId = await lobby(alice, bob);
    await Promise.all([alice, bob].map((d) => d.next((m) => m.type === "table-start")));
    await play([alice, bob], roomId, 12);
    /** Who the game is waiting on, as Bob's copy has it. */
    const waitingOn = (): PlayerId | null => {
      const state = bob.copy!.room.game.state;
      const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
      return state.result.over || asked === null ? null : answeringPlayer(state, asked);
    };
    // On until the move is Bob's: after it comes Carol's, the bot's.
    for (let i = 0; i < 400 && waitingOn() !== BOB; i += 1) await play([alice, bob], roomId, 1);
    expect(waitingOn()).toBe(BOB);

    // Alice's device goes. Bob's runs the bots from here.
    alice.ws.close();
    await bob.next((m) => m.type === "table-host" && m.host === BOB);
    expect(bob.copy?.isHost).toBe(true);
    // The game goes on between Bob and the bot until it waits on Alice.
    const before = await rest([bob], roomId);
    for (let i = 0; i < 400 && waitingOn() === BOB; i += 1) await play([bob], roomId, 1);
    const after = await rest([bob], roomId);
    expect(after).toBeGreaterThan(before);
    const fromBob = bob.got.filter(
      (m) => m.type === "table-input" && m.index >= before && m.input.kind === "action" && m.input.action.player === CAROL,
    );
    expect(fromBob.length).toBeGreaterThan(0);
    expect(fromBob.every((m) => m.type === "table-input" && m.from === BOB)).toBe(true);

    // Alice's page reloads: a new socket, her token, the whole log.
    const back = await connect();
    back.send({ type: "table-join", roomId, clientToken: "alice-token", from: 0 });
    const rejoined = await back.next((m) => m.type === "table-start");
    if (rejoined.type !== "table-start") throw new Error("unreachable");
    expect(rejoined).toMatchObject({ seat: ALICE, host: ALICE, from: 0 });
    expect(rejoined.log).toHaveLength(after);
    // Her copy, dealt afresh and caught up, is the game Bob holds; and the
    // bots are hers again (the creator's).
    await bob.next((m) => m.type === "table-host" && m.host === ALICE);
    await rest([bob, back], roomId);
    expect(new Set(digests([bob, back])).size).toBe(1);
    expect(back.copy?.isHost).toBe(true);
    expect(bob.copy?.isHost).toBe(false);
    await play([bob, back], roomId, 12);
    expect(new Set(digests([bob, back])).size).toBe(1);
  }, 60_000);

  it("deals every device a new game when the host asks for a rematch", async () => {
    const [alice, bob] = [await connect(), await connect()];
    const roomId = await lobby(alice, bob);
    const [first] = await Promise.all([alice, bob].map((d) => d.next((m) => m.type === "table-start")));
    await play([alice, bob], roomId, 8);
    const old = alice.copy;
    alice.send({ type: "table-rematch", roomId });
    const [again] = await Promise.all([alice, bob].map((d) => d.next((m) => m.type === "table-start")));
    if (first.type !== "table-start" || again.type !== "table-start") throw new Error("unreachable");
    expect(again.recipe.gameNumber).toBe(2);
    expect(again.recipe.config.seed).not.toBe(first.recipe.config.seed);
    expect(again.log).toEqual([]);
    expect(alice.copy).not.toBe(old);
    await play([alice, bob], roomId, 8);
    expect(new Set(digests([alice, bob])).size).toBe(1);
    expect(alice.copy?.room.gameNumber).toBe(2);
  }, 60_000);

  it("starts on the server as ever when a device can't hold a copy, or the builds differ", async () => {
    // Bob's page is an older one: it never said it could.
    const [alice, bob] = [await connect(), await connect(null)];
    const roomId = await lobby(alice, bob);
    const [a, b] = await Promise.all([alice, bob].map((d) => d.next((m) => m.type === "state")));
    expect(a.type === "state" && b.type === "state" && a.view.turn.number === b.view.turn.number).toBe(true);
    expect(served?.tables()).toEqual([]);
    expect(alice.got).toEqual([]);
    void roomId;

    // Two pages from either side of a deploy.
    const [carol, dave] = [await connect("build-1"), await connect("build-2")];
    await lobby(carol, dave);
    await Promise.all([carol, dave].map((d) => d.next((m) => m.type === "state")));
    expect(served?.tables()).toEqual([]);
  }, 60_000);
});
