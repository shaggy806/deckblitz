/**
 * `RoomService` without a socket: what it reports about its rooms
 * (`RoomEvent`s, which main uses to route and place them once rooms run on
 * worker threads), and its reaper.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { Game } from "engine";
import type { ServerMessage } from "protocol";
import { RoomManager } from "../room-manager.js";
import { RoomService } from "../room-service.js";
import type { RoomEvent } from "../room-host.js";
import { Room } from "../room.js";
import { LEARN_COMMANDER } from "../tutorials/learn-commander.js";
import { ALICE, BOB, CAROL } from "../decks.js";

function serviceWith(manager: RoomManager, options: ConstructorParameters<typeof RoomService>[2] = {}) {
  const events: RoomEvent[] = [];
  const sent: { conn: number; message: ServerMessage }[] = [];
  const service = new RoomService(
    manager,
    { send: (conn, message) => sent.push({ conn, message }), roomChanged: (event) => events.push(event) },
    options,
  );
  return { service, events, sent };
}

describe("RoomService room events", () => {
  it("follows a lobby from waiting to playing to finished, a rematch back to playing, and gone", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, events, sent } = serviceWith(manager);
    service.handle(1, { type: "create-room", hostToken: "host" });
    const created = sent.find((s) => s.message.type === "room-created")?.message;
    if (created?.type !== "room-created") throw new Error("no room-created");
    const id = created.roomId;
    // Nobody seated yet: a full table of seats a bot could take.
    expect(events).toEqual([{ id, kind: "lobby", stage: "waiting", bots: 4 }]);

    service.handle(1, { type: "join-room", roomId: id, hostToken: "host" });
    service.handle(1, { type: "claim-seat", roomId: id, seat: ALICE, clientToken: "a", ready: true });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "waiting", bots: 3 });
    // A bot in a seat that could already have been one changes nothing.
    service.handle(1, { type: "add-bot", roomId: id, seat: BOB });
    expect(events).toHaveLength(2);
    service.handle(1, { type: "start-game", roomId: id });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing", bots: 1 });

    service.handle(1, { type: "dispatch", roomId: id, action: { type: "mulligan", player: ALICE, keep: true } });
    service.handle(1, { type: "concede", roomId: id });
    expect(sent.filter((s) => s.message.type === "error")).toEqual([]);
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "finished", bots: 1 });

    service.handle(1, { type: "rematch", roomId: id });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing", bots: 1 });

    // Each change once, however many frames came between.
    expect(events.map((e) => e.stage)).toEqual(["waiting", "waiting", "playing", "finished", "playing"]);

    manager.remove(id);
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "gone", bots: 0 });
  });

  it("counts the bots a waiting table could seat, then the ones playing", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, events, sent } = serviceWith(manager);
    service.handle(1, { type: "create-room", hostToken: "host" });
    const created = sent.find((s) => s.message.type === "room-created")?.message;
    if (created?.type !== "room-created") throw new Error("no room-created");
    const id = created.roomId;

    service.handle(1, { type: "join-room", roomId: id, hostToken: "host" });
    service.handle(1, { type: "claim-seat", roomId: id, seat: ALICE, clientToken: "a", ready: true });
    expect(events.at(-1)?.bots).toBe(3);
    // A second person: one fewer seat a bot could take. A seat added to the
    // table is one the count already allowed for.
    service.handle(2, { type: "join-room", roomId: id });
    service.handle(2, { type: "claim-seat", roomId: id, seat: BOB, clientToken: "b", ready: true });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "waiting", bots: 2 });
    service.handle(1, { type: "add-seat", roomId: id });
    service.handle(1, { type: "remove-seat", roomId: id, seat: CAROL });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "waiting", bots: 2 });

    // Two people and nobody else: a game with no bot in it.
    service.handle(1, { type: "start-game", roomId: id });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing", bots: 0 });

    // A seat handed to a bot is a bot playing; taken back, it isn't.
    service.handle(2, { type: "bot-takeover", roomId: id, on: true });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing", bots: 1 });
    service.handle(2, { type: "bot-takeover", roomId: id, on: false });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing", bots: 0 });
    expect(sent.filter((s) => s.message.type === "error")).toEqual([]);
  });

  it("reports a tutorial, a builder and an adopted room by kind", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, events, sent } = serviceWith(manager, { builder: true });
    service.handle(1, { type: "tutorial-create", lesson: LEARN_COMMANDER.id });
    service.handle(2, { type: "builder-create", hostToken: "dev" });
    const [tutorial, builder] = sent.filter((s) => s.message.type === "room-created").map((s) => {
      if (s.message.type !== "room-created") throw new Error("unreachable");
      return s.message.roomId;
    });
    const game = Game.create({
      seed: 1,
      decks: [ALICE, BOB].map((player) => ({ player, cards: Array(40).fill("Forest") as string[] })),
    });
    manager.adopt(new Room("DEVRM", game, { pacing: "immediate" }));
    expect(events).toEqual([
      // The lesson's scripted opponent is the tutorial's one bot.
      { id: tutorial, kind: "tutorial", stage: "playing", bots: 1 },
      { id: builder, kind: "builder", stage: "playing", bots: 0 },
      { id: "DEVRM", kind: "adopted", stage: "playing", bots: 0 },
    ]);
  });

  describe("reaping", () => {
    afterEach(() => vi.useRealTimers());

    it("reaps idle rooms on its own clock, reporting each gone, until stopped", () => {
      vi.useFakeTimers();
      const manager = new RoomManager();
      const { service, events } = serviceWith(manager, { reapIdleMs: 500, reapIntervalMs: 100 });
      const first = manager.createPending(2, { seed: 1 });
      vi.advanceTimersByTime(1_000);
      expect(manager.get(first.id)).toBeUndefined();
      expect(events.at(-1)).toEqual({ id: first.id, kind: "lobby", stage: "gone", bots: 0 });

      service.stop();
      const second = manager.createPending(2, { seed: 1 });
      vi.advanceTimersByTime(10_000);
      expect(manager.get(second.id)).toBe(second);
    });

    it("doesn't reap without both settings", () => {
      vi.useFakeTimers();
      const manager = new RoomManager();
      serviceWith(manager, { reapIdleMs: 500 });
      const room = manager.createPending(2, { seed: 1 });
      vi.advanceTimersByTime(60 * 60 * 1000);
      expect(manager.get(room.id)).toBe(room);
    });
  });
});

describe("RoomService create-room", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens two to four seats whatever a client sends for players", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, sent } = serviceWith(manager);
    const seatsFor = (players: unknown): number => {
      sent.length = 0;
      service.handle(1, { type: "create-room", hostToken: "host", players } as never);
      const created = sent.find((s) => s.message.type === "room-created")?.message;
      if (created?.type !== "room-created") throw new Error("no room-created");
      service.handle(1, { type: "join-room", roomId: created.roomId, hostToken: "host" });
      const joined = sent.find((s) => s.message.type === "room-joined")?.message;
      if (joined?.type !== "room-joined") throw new Error("no room-joined");
      return joined.seats.length;
    };
    // Not a number at all (a string once made a room with no seats), or out of range.
    expect(["lots", {}, null, Number.NaN, undefined, 0, -5, 1].map(seatsFor)).toEqual([2, 2, 2, 2, 2, 2, 2, 2]);
    expect([3, 2.9, 4, 1e9].map(seatsFor)).toEqual([3, 2, 4, 4]);
  });

  it("takes no seed from the client, and salts every game's object ids", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, sent } = serviceWith(manager);
    const createPending = vi.spyOn(manager, "createPending");
    const build = vi.spyOn(Game, "create");
    for (const conn of [1, 2]) {
      sent.length = 0;
      service.handle(conn, { type: "create-room", hostToken: `host-${conn}`, seed: 1 } as never);
      const created = sent.find((s) => s.message.type === "room-created")?.message;
      if (created?.type !== "room-created") throw new Error("no room-created");
      const roomId = created.roomId;
      service.handle(conn, { type: "join-room", roomId, hostToken: `host-${conn}` });
      service.handle(conn, { type: "claim-seat", roomId, seat: ALICE, clientToken: `token-${conn}`, ready: true });
      service.handle(conn, { type: "add-bot", roomId, seat: BOB });
      service.handle(conn, { type: "start-game", roomId });
      expect(sent.filter((s) => s.message.type === "error")).toEqual([]);
    }
    const seeds = createPending.mock.calls.map(([, config]) => config.seed);
    expect(seeds).toHaveLength(2);
    expect(seeds.every((seed) => seed === 1)).toBe(false);

    // Each game dealt from a lobby is given a salt of its own.
    const salts = build.mock.calls.map(([config]) => config.idSalt);
    expect(salts.length).toBeGreaterThanOrEqual(2);
    expect(salts.every((salt) => typeof salt === "string" && salt.length >= 8)).toBe(true);
    expect(new Set(salts).size).toBe(salts.length);
  });
});
