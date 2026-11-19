/**
 * A table as a page's worker holds it (`docs/plans/replicated-rooms.md`,
 * step 4): a `LocalRoomHost` a device, each with its page, over the server's
 * real `Tables`. What the browser's worker does with `table-start` and the
 * rest (`client/src/local/room-worker.ts` calls exactly these methods), run
 * here in Node: the page is seated at its copy and plays it through the
 * messages it would send any room, a rematch and a rejoin deal a new copy
 * under the same code, an undo reaches the page as one frame and a notice,
 * and a copy that lost its place is dealt again from the table's log.
 *
 * Messages between devices and the server wait in queues, delivered by hand:
 * a copy may not be called back into while it is sending (`RoomCopy.sent`).
 */

import { describe, expect, it } from "vitest";
import { AutomaticController, COMMANDER_RULES, HeuristicBotController, answeringPlayer, stateDigest } from "engine";
import type { PlayerId } from "engine";
import type { ClientMessage, ServerMessage, TableRecipe } from "protocol";
import { cardRegistry } from "../card-registry.js";
import { SEATS } from "../decks.js";
import { LocalRoomHost } from "../local-host.js";
import { Room } from "../room.js";
import { DIGEST_EVERY } from "../table-copy.js";
import type { TableStart } from "../table-copy.js";
import { Tables } from "../tables.js";

const ROOM = "TABLE";
const PLAYS = 60_000;

type State = Extract<ServerMessage, { type: "state" }>;

interface Device {
  readonly conn: number;
  /** Its seat, or `null`: it watches. */
  readonly player: PlayerId | null;
  readonly token: string | null;
  readonly host: LocalRoomHost;
  /** Everything its page was sent. */
  readonly got: ServerMessage[];
  /** Sent to the server, not yet there. */
  readonly up: ClientMessage[];
  /** Sent by the server, not yet here. */
  readonly down: ServerMessage[];
  /** The page's own join, handed over with the next `table-start`. */
  join: ClientMessage | null;
  /** Every `table-start` it was dealt from, oldest first. */
  readonly starts: TableStart[];
}

function table(seats: readonly ("person" | "bot")[], options: { readonly watchers?: number; readonly seed?: number } = {}) {
  const players = seats.map((_, i) => SEATS[i].id);
  const recipe: TableRecipe = {
    gameNumber: 1,
    config: {
      seed: options.seed ?? 11,
      idSalt: "local-tables",
      mulligans: true,
      rules: COMMANDER_RULES,
      decks: players.map((player, i) => ({ player, cards: SEATS[i].cards, commanders: SEATS[i].commanders })),
    },
    firstPlayer: "random",
    botSpeed: "fast",
    seats: players.map((player, i) => ({ player, name: `Seat ${i + 1}`, bot: seats[i] === "bot" })),
  };
  const devices: Device[] = [];
  const byConn = new Map<number, Device>();
  const tables = new Tables((conn, message) => byConn.get(conn)?.down.push(structuredClone(message)), { hostGraceMs: 0 });
  const device = (conn: number, player: PlayerId | null, token: string | null): Device => {
    const got: ServerMessage[] = [];
    const up: ClientMessage[] = [];
    const made: Device = {
      conn,
      player,
      token,
      got,
      up,
      down: [],
      join: null,
      starts: [],
      host: new LocalRoomHost((message) => got.push(structuredClone(message)), {
        pacing: "immediate",
        toServer: (message) => up.push(structuredClone(message)),
        tableRoom: { botController: (bot) => new HeuristicBotController(bot, cardRegistry()) },
      }),
    };
    // As a page says when its socket opens.
    made.host.message({ type: "event-deltas" });
    devices.push(made);
    byConn.set(conn, made);
    return made;
  };
  players.forEach((player, i) => {
    if (seats[i] === "person") device(i + 1, player, `token-${player}`);
  });
  for (let i = 0; i < (options.watchers ?? 0); i += 1) device(50 + i, null, null);

  /** One message from the server into `d`'s worker. */
  const toDevice = (d: Device): boolean => {
    const message = d.down.shift();
    if (message === undefined) return false;
    if (message.type === "table-start") {
      d.starts.push(message);
      d.host.table(message, { token: d.token, join: d.join });
      d.join = null;
    } else {
      d.host.tableMessage(message);
    }
    return true;
  };
  /** One message from `d` to the server. */
  const toServer = (d: Device): boolean => {
    const message = d.up.shift();
    if (message === undefined) return false;
    tables.message(d.conn, message);
    return true;
  };
  /** Everything delivered, until nothing is on its way. */
  const rest = (): void => {
    for (let i = 0; i < 200_000; i += 1) {
      let moved = false;
      for (const d of devices) moved = toServer(d) || moved;
      for (const d of devices) moved = toDevice(d) || moved;
      if (!moved) return;
    }
    throw new Error("the table never came to rest");
  };
  const roomOf = (d: Device): Room => {
    const room = d.host.service.manager.get(ROOM);
    if (!(room instanceof Room)) throw new Error(`device ${d.conn} holds no copy`);
    return room;
  };
  const digests = (): string[] => devices.map((d) => stateDigest(roomOf(d).game.state, { events: true }));
  const frames = (d: Device): State[] => d.got.filter((m): m is State => m.type === "state");
  /** The device whose person the game waits on, at rest; `null` when it is
   * over (a bot's move is made by the host's device as the table rests). */
  const waitingOn = (): Device | null => {
    const state = roomOf(devices[0]).game.state;
    if (state.result.over) return null;
    const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
    if (asked === null) return null;
    const answering = answeringPlayer(state, asked);
    return devices.find((d) => d.player === answering) ?? null;
  };
  /** The person at `d` answers as little as they may, through their page. */
  const move = (d: Device): void => {
    const room = roomOf(d);
    const state = room.game.state;
    const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
    if (asked === null) throw new Error("nobody is asked");
    d.host.message({ type: "dispatch", roomId: ROOM, action: new AutomaticController(asked).act(room.game.controllerView(asked)) });
  };
  /** Plays on from rest until the opening hands are kept and `ready` likes
   * who is asked; returns their device, the table at rest. */
  const playTo = (ready: (waiting: Device) => boolean = () => true): Device => {
    for (let i = 0; i < 800; i += 1) {
      rest();
      const waiting = waitingOn();
      if (waiting === null) break;
      if (roomOf(waiting).game.state.awaiting?.kind !== "mulligan" && ready(waiting)) return waiting;
      move(waiting);
    }
    throw new Error("the game never came to the position asked for");
  };
  const open = (): void => {
    tables.open({
      id: ROOM,
      recipe,
      people: devices.filter((d) => d.player !== null).map((d) => ({ player: d.player as PlayerId, token: d.token as string, conn: d.conn })),
      watchers: devices.filter((d) => d.player === null).map((d) => d.conn),
      creator: players[0],
    });
  };
  return { tables, devices, device, toDevice, toServer, rest, roomOf, digests, frames, waitingOn, move, playTo, open, players };
}

const errors = (d: Device): ServerMessage[] => d.got.filter((m) => m.type === "error");

describe("a table in a page's worker", () => {
  it("seats each page at its own copy when the waiting room starts as a table", () => {
    const t = table(["person", "bot", "person"], { watchers: 1 });
    const [alice, carol, watcher] = t.devices;
    t.open();
    t.rest();

    for (const d of t.devices) expect(errors(d)).toEqual([]);
    // Each page's first word from its copy is a frame of its own seat: no
    // seat picker, no second join.
    const first = t.frames(alice)[0];
    expect(alice.got[0]).toBe(first);
    expect(first).toMatchObject({ roomId: ROOM, game: 1, seat: alice.player, eventsFrom: 0, canRematch: true });
    expect(first.artManifest?.length).toBeGreaterThan(0);
    expect(t.frames(carol)[0]).toMatchObject({ seat: carol.player });
    expect(t.frames(watcher)[0]).toMatchObject({ spectating: true, actions: [] });
    expect(watcher.got.some((m) => m.type === "room-joined")).toBe(false);

    // The host is the creator's device, and only its page is told so.
    expect(t.frames(alice).at(-1)?.isHost).toBe(true);
    expect(t.frames(carol).at(-1)?.isHost).toBe(false);
    // Every seat is someone's: the other person's is held and connected,
    // though no token or connection of theirs is in this copy.
    expect(t.frames(carol).at(-1)?.seats.map((s) => [s.claimed, s.online, s.isBot])).toEqual([
      [true, true, false],
      [false, false, true],
      [true, true, false],
    ]);
    // One game, in three places; and nothing of a table is saved for a reload.
    expect(new Set(t.digests()).size).toBe(1);
    expect(alice.host.save()).toEqual([]);
    expect(t.tables.summaries()).toMatchObject([{ id: ROOM, connected: 2 }]);
  });

  it("plays a game through the pages' own messages, a bot's moves made on the host's device", () => {
    const t = table(["person", "bot", "person"]);
    const [alice, carol] = t.devices;
    t.open();
    let moves = 0;
    for (; moves < 150; moves += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();
    expect(moves).toBeGreaterThan(20);
    for (const d of t.devices) expect(errors(d)).toEqual([]);
    expect(new Set(t.digests()).size).toBe(1);
    // Only the host's device sent the bot's moves.
    const log = t.tables.summaries()[0];
    expect(log.inputs).toBeGreaterThan(moves);
    const state = t.roomOf(alice).game.state;
    expect(state.turn.number).toBeGreaterThan(1);
    // Each page's frames count up without a gap, and carry only what is new.
    for (const d of [alice, carol]) {
      const seqs = t.frames(d).map((f) => f.seq);
      expect(seqs).toEqual([...seqs].sort((a, b) => a - b));
      expect(t.frames(d).at(-1)?.eventsFrom).toBeGreaterThan(0);
    }
  }, PLAYS);

  it("answers a page that came by the room's code, which takes its seat back by its token", () => {
    const t = table(["person", "person"]);
    const [alice, bob] = t.devices;
    t.open();
    t.playTo();
    const before = t.digests()[0];

    // Bob reloads: a new worker, a new connection, the same token.
    t.tables.close(bob.conn);
    const back = t.device(60, bob.player, bob.token);
    back.join = { type: "join-room", roomId: ROOM };
    t.tables.message(back.conn, { type: "table-join", roomId: ROOM, clientToken: bob.token as string });
    t.rest();

    // Dealt from the game as Alice's device holds it and the inputs since:
    // nothing of the log before that is sent, or played again.
    const start = back.starts.at(-1);
    expect(typeof start?.state).toBe("string");
    expect(start?.from).toBeGreaterThan(0);
    expect(start?.log.length).toBeLessThan(start?.from ?? 0);
    expect(start?.resync).toBeUndefined();
    // Its page's join is answered once the copy is dealt, the seat held for it.
    const joined = back.got.find((m) => m.type === "room-joined");
    expect(joined).toMatchObject({ roomId: ROOM, pending: false, seat: null });
    expect(joined?.type === "room-joined" && joined.seats.every((s) => s.claimed)).toBe(true);
    expect(t.frames(back)).toEqual([]);
    // The page claims it with the token it kept, as it would a room's seat.
    back.host.message({ type: "claim-seat", roomId: ROOM, seat: bob.player as PlayerId, clientToken: bob.token as string });
    expect(errors(back)).toEqual([]);
    expect(t.frames(back).at(-1)).toMatchObject({ seat: bob.player, eventsFrom: 0 });
    expect(stateDigest(t.roomOf(back).game.state, { events: true })).toBe(before);
    // And everyone was told he went and came back.
    expect(alice.got.filter((m) => m.type === "state").at(-1)).toMatchObject({ seats: [{ online: true }, { online: true }] });

    // The game goes on from the new device.
    const stale = t.devices.indexOf(bob);
    t.devices.splice(stale, 1);
    for (let i = 0; i < 20; i += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();
    expect(new Set(t.digests()).size).toBe(1);
    expect(t.digests()[0]).not.toBe(before);
  }, PLAYS);

  it("deals a rematch into the same room: a new copy, the page still seated, frames counting on", () => {
    const t = table(["person", "person"]);
    const [alice, bob] = t.devices;
    t.open();
    t.playTo();
    const lastSeq = t.frames(bob).at(-1)?.seq ?? 0;
    const old = t.roomOf(bob);

    // The page's "rematch" goes to the table, not to the copy (`HybridSocket`).
    t.tables.message(alice.conn, { type: "table-rematch", roomId: ROOM });
    t.rest();
    for (const d of t.devices) expect(errors(d)).toEqual([]);
    expect(t.roomOf(bob)).not.toBe(old);
    const frame = t.frames(bob).at(-1);
    expect(frame).toMatchObject({ game: 2, seat: bob.player, eventsFrom: 0 });
    expect(frame?.seq).toBeGreaterThan(lastSeq);
    expect(frame?.view.turn.number).toBe(0);
    expect(new Set(t.digests()).size).toBe(1);
    t.playTo();
    expect(new Set(t.digests()).size).toBe(1);
  }, PLAYS);

  it("shows an undo as one frame, marked as a game put in place of the last, and tells the person why", () => {
    const t = table(["person", "person", "person"], { seed: 32 });
    t.open();
    const mover = t.playTo();
    const [leaver, third] = t.devices.filter((d) => d !== mover);
    const shown = t.frames(mover).length;

    // The move is on the mover's board at once: one frame, no trip to the server.
    t.move(mover);
    expect(t.frames(mover).length).toBe(shown + 1);
    expect(t.frames(mover).at(-1)?.replaced).toBeUndefined();
    leaver.host.message({ type: "concede", roomId: ROOM });
    // The concession reaches the server first, and then the mover.
    while (t.toServer(leaver));
    while (t.toServer(mover));
    const before = t.frames(mover).length;
    // Up to and including the concession: the refusals of the mover's own
    // inputs come after it on the socket.
    while (mover.down[0]?.type !== "table-input") t.toDevice(mover);
    t.toDevice(mover);

    // One frame for the whole undo: the game as it stands, not the game put
    // back and then the concession.
    const since = t.frames(mover).slice(before);
    expect(since).toHaveLength(1);
    expect(since[0]).toMatchObject({ replaced: true, eventsFrom: 0 });
    expect(since[0].view.players[leaver.player as PlayerId].hasLost).toBe(true);
    expect(mover.got.filter((m) => m.type === "notice")).toEqual([
      { type: "notice", roomId: ROOM, message: expect.stringContaining(`${leaver.player} conceded just as you moved`) },
    ]);

    t.rest();
    expect(new Set(t.digests()).size).toBe(1);
    for (const d of [leaver, third]) {
      expect(d.got.filter((m) => m.type === "notice")).toEqual([]);
      expect(t.frames(d).some((f) => f.replaced === true)).toBe(false);
    }
    for (const d of t.devices) expect(errors(d)).toEqual([]);
  }, PLAYS);

  it("deals a copy that lost its place again from the table's log, without a word to the page", () => {
    const t = table(["person", "person"]);
    const [alice, bob] = t.devices;
    t.open();
    t.playTo();
    const old = t.roomOf(bob);
    const seq = t.frames(bob).at(-1)?.seq ?? 0;

    // An input that skips ahead of what this copy holds: it can't be right.
    bob.host.tableMessage({
      type: "table-input",
      roomId: ROOM,
      index: 9_999,
      from: alice.player as PlayerId,
      input: { kind: "concede", player: alice.player as PlayerId },
    });
    expect(bob.up).toEqual([{ type: "table-join", roomId: ROOM, clientToken: bob.token }]);
    t.rest();

    expect(t.roomOf(bob)).not.toBe(old);
    expect(errors(bob)).toEqual([]);
    expect(t.frames(bob).at(-1)).toMatchObject({ seat: bob.player, game: 1 });
    expect(t.frames(bob).at(-1)?.seq).toBeGreaterThan(seq);
    expect(new Set(t.digests()).size).toBe(1);
    // And it plays on.
    for (let i = 0; i < 12; i += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();
    expect(new Set(t.digests()).size).toBe(1);
  }, PLAYS);

  it("puts a copy that holds another game right from the host's state, at the next place they compare", () => {
    const t = table(["person", "person", "person"]);
    const [alice, bob, carol] = t.devices;
    t.open();
    t.playTo();
    const drifted = (d: Device): ServerMessage[] => d.got.filter((m) => m.type === "notice" && m.message.includes("drifted"));
    const inputs = (): number => t.tables.summaries()[0].inputs;

    // Bob's device comes to hold a game the table doesn't, as a browser that
    // worked something out differently would.
    expect(bob.host.corruptTable(ROOM)).toBe(true);
    expect(new Set(t.digests()).size).toBe(2);
    const at = inputs();
    const dealt = bob.starts.length;
    for (let i = 0; i < 400 && drifted(bob).length === 0; i += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();

    // Noticed within one stretch between fingerprints, and dealt the host's.
    expect(drifted(bob)).toHaveLength(1);
    expect(inputs() - at).toBeLessThanOrEqual(2 * DIGEST_EVERY);
    expect(bob.starts).toHaveLength(dealt + 1);
    expect(bob.starts.at(-1)).toMatchObject({ resync: true, seat: bob.player });
    expect(typeof bob.starts.at(-1)?.state).toBe("string");
    expect(new Set(t.digests()).size).toBe(1);
    // Nobody else was touched, and the page was only told, not refused.
    for (const d of [alice, carol]) {
      expect(drifted(d)).toEqual([]);
      expect(d.starts).toHaveLength(1);
    }
    for (const d of t.devices) expect(errors(d)).toEqual([]);
    // The game goes on, the copies still one, through another comparison.
    const on = inputs();
    for (let i = 0; i < 400 && inputs() < on + 2 * DIGEST_EVERY; i += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();
    expect(new Set(t.digests()).size).toBe(1);
    expect(drifted(bob)).toHaveLength(1);
  }, PLAYS);

  it("takes the host's game for the table's: a host whose copy differs puts everyone else on it", () => {
    const t = table(["person", "person", "person"]);
    const [alice, bob, carol] = t.devices;
    t.open();
    t.playTo();
    const drifted = (d: Device): number => d.got.filter((m) => m.type === "notice" && m.message.includes("drifted")).length;
    const before = t.roomOf(alice).game.state.players[alice.player as PlayerId].life;
    alice.host.corruptTable(ROOM);
    for (let i = 0; i < 400 && (drifted(bob) === 0 || drifted(carol) === 0); i += 1) {
      t.rest();
      const waiting = t.waitingOn();
      if (waiting === null) break;
      t.move(waiting);
    }
    t.rest();
    // "Unless the host disagrees": hers is the game, a life up and all.
    expect([drifted(alice), drifted(bob), drifted(carol)]).toEqual([0, 1, 1]);
    expect(new Set(t.digests()).size).toBe(1);
    for (const d of t.devices) {
      expect(t.roomOf(d).game.state.players[alice.player as PlayerId].life).toBe(before + 1);
    }
  }, PLAYS);

  it("lets go of the copy when the page leaves", () => {
    const t = table(["person", "person"]);
    const [alice] = t.devices;
    t.open();
    t.rest();
    expect(alice.host.hasTable(ROOM)).toBe(true);
    alice.host.leaveTable(ROOM);
    expect(alice.host.hasTable(ROOM)).toBe(false);
    expect(alice.host.service.manager.get(ROOM)).toBeUndefined();
  });
});
