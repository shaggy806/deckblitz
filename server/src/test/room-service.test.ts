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
import { BASICS_PROOF } from "../tutorials/basics-proof.js";
import { ALICE, BOB } from "../decks.js";

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
    expect(events).toEqual([{ id, kind: "lobby", stage: "waiting" }]);

    service.handle(1, { type: "join-room", roomId: id, hostToken: "host" });
    service.handle(1, { type: "claim-seat", roomId: id, seat: ALICE, clientToken: "a", ready: true });
    service.handle(1, { type: "add-bot", roomId: id, seat: BOB });
    service.handle(1, { type: "start-game", roomId: id });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing" });

    service.handle(1, { type: "dispatch", roomId: id, action: { type: "mulligan", player: ALICE, keep: true } });
    service.handle(1, { type: "concede", roomId: id });
    expect(sent.filter((s) => s.message.type === "error")).toEqual([]);
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "finished" });

    service.handle(1, { type: "rematch", roomId: id });
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "playing" });

    // Each change once, however many frames came between.
    expect(events.map((e) => e.stage)).toEqual(["waiting", "playing", "finished", "playing"]);

    manager.remove(id);
    expect(events.at(-1)).toEqual({ id, kind: "lobby", stage: "gone" });
  });

  it("reports a tutorial, a builder and an adopted room by kind", () => {
    const manager = new RoomManager({ pacing: "immediate" });
    const { service, events, sent } = serviceWith(manager, { builder: true });
    service.handle(1, { type: "tutorial-create", lesson: BASICS_PROOF.id });
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
      { id: tutorial, kind: "tutorial", stage: "playing" },
      { id: builder, kind: "builder", stage: "playing" },
      { id: "DEVRM", kind: "adopted", stage: "playing" },
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
      expect(events.at(-1)).toEqual({ id: first.id, kind: "lobby", stage: "gone" });

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
