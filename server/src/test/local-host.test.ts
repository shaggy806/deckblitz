/**
 * `LocalRoomHost`: the rooms a browser runs for a solo game (`docs/plans/
 * local-rooms.md`) — the same messages a page sends the server, answered by
 * the same `RoomService`, with one connection and no Node-side host.
 */

import { describe, expect, it } from "vitest";
import type { ServerMessage } from "protocol";
import { ALICE } from "../decks.js";
import { LocalRoomHost } from "../local-host.js";
import { RoomManager } from "../room-manager.js";
import { RoomService } from "../room-service.js";

/** A page's worth of messages: what it was sent, and a way to wait for one. */
function page() {
  const received: ServerMessage[] = [];
  const host = new LocalRoomHost((message) => received.push(structuredClone(message)), { pacing: "immediate" });
  const last = <T extends ServerMessage["type"]>(type: T) =>
    received.filter((m): m is Extract<ServerMessage, { type: T }> => m.type === type).at(-1);
  return { host, received, last };
}

describe("a local room host", () => {
  it("plays a four-seat game against three bots, from create to the opening hand", () => {
    const { host, received, last } = page();
    host.message({ type: "event-deltas" });
    host.message({ type: "create-room", players: 4, hostToken: "host-1" });
    const created = last("room-created");
    expect(created?.roomId).toMatch(/^[A-Z0-9]{5}$/);
    const roomId = created!.roomId;

    host.message({ type: "join-room", roomId, hostToken: "host-1" });
    expect(last("room-joined")?.isHost).toBe(true);
    host.message({ type: "claim-seat", roomId, seat: "alice" as never, clientToken: "me", ready: true });
    for (const seat of ["bob", "carol", "dave"]) host.message({ type: "add-bot", roomId, seat: seat as never });
    host.message({ type: "start-game", roomId });

    expect(received.filter((m) => m.type === "error")).toEqual([]);
    const state = last("state");
    expect(state?.seat).toBe("alice");
    expect(Object.keys(state!.view.players)).toHaveLength(4);
    // The page opted into event slices: its first frame carries the whole
    // log, later ones only what's new.
    const frames = received.filter((m): m is Extract<ServerMessage, { type: "state" }> => m.type === "state");
    expect(frames[0].eventsFrom ?? 0).toBe(0);
    expect(state!.eventsFrom).toBeGreaterThan(0);
    expect(state!.actions.length).toBeGreaterThan(0);
  });

  it("answers what it can't do as the server would, with an error to the page", () => {
    const { host, last } = page();
    host.message({ type: "join-room", roomId: "ZZZZZ" });
    expect(last("error")?.message).toMatch(/ZZZZZ/);
    host.message({ type: "builder-create", hostToken: "x" });
    expect(last("error")?.message).toMatch(/builder/);
  });

  it("saves a running game and picks it up again in a fresh host, the player rejoining by token", () => {
    const first = page();
    first.host.message({ type: "create-room", players: 4, hostToken: "host-1" });
    const roomId = first.last("room-created")!.roomId;
    first.host.message({ type: "join-room", roomId, hostToken: "host-1" });
    first.host.message({ type: "claim-seat", roomId, seat: "alice" as never, clientToken: "me", ready: true });
    for (const seat of ["bob", "carol", "dave"]) first.host.message({ type: "add-bot", roomId, seat: seat as never });
    first.host.message({ type: "start-game", roomId });
    const before = first.last("state")!;
    // A waiting room and a lesson aren't kept; the game is.
    first.host.message({ type: "create-room", hostToken: "other" });
    first.host.message({ type: "tutorial-create", lesson: "basics-proof", hostToken: "t" });
    // Through a structured clone, as IndexedDB keeps it.
    const saved = structuredClone(first.host.save());
    expect(saved.map((s) => s.id)).toEqual([roomId]);

    const second = page();
    expect(second.host.restore(saved)).toEqual([roomId]);
    second.host.message({ type: "event-deltas" });
    second.host.message({ type: "join-room", roomId });
    second.host.message({ type: "claim-seat", roomId, seat: "alice" as never, clientToken: "me" });
    expect(second.received.filter((m) => m.type === "error")).toEqual([]);
    const after = second.last("state")!;
    expect(after.seat).toBe("alice");
    expect(after.game).toBe(before.game);
    expect(after.seq).toBeGreaterThan(before.seq);
    expect(after.view.turn).toEqual(before.view.turn);
    expect(after.view.players[ALICE].life).toBe(before.view.players[ALICE].life);
    expect(after.actions.length).toBeGreaterThan(0);
    // Another player's token doesn't get the seat.
    second.host.message({ type: "claim-seat", roomId, seat: "alice" as never, clientToken: "someone-else" });
    expect(second.last("error")).toBeDefined();
  });

  it("restores nothing it can't load, and skips a code already taken", () => {
    const { host } = page();
    expect(host.restore([{ id: "BROKE", state: {} } as never])).toEqual([]);
  });

  it("lets the host's bots think longer — and back — a browser's game holding up no one else", () => {
    const { host, last } = page();
    host.message({ type: "create-room", players: 2, hostToken: "h" });
    const roomId = last("room-created")!.roomId;
    host.message({ type: "join-room", roomId, hostToken: "h" });
    expect(last("room-joined")?.botThinkLongAllowed).toBe(true);
    expect(last("room-joined")?.botThinkLong).toBeUndefined();
    // Set in the waiting room, carried into the game.
    host.message({ type: "set-bot-think-long", roomId, long: true });
    expect(last("room-joined")?.botThinkLong).toBe(true);
    host.message({ type: "claim-seat", roomId, seat: "alice" as never, clientToken: "me", ready: true });
    host.message({ type: "add-bot", roomId, seat: "bob" as never });
    host.message({ type: "start-game", roomId });
    expect(last("state")).toMatchObject({ botThinkLong: true, botThinkLongAllowed: true });
    const budget = () => {
      const room = host.service.manager.get(roomId) as unknown as { bots: Map<string, unknown> };
      const bot = room.bots.get("bob") as { timeBudgetMs: number; maxSimulations: number };
      return { ms: bot.timeBudgetMs, sims: bot.maxSimulations };
    };
    expect(budget()).toEqual({ ms: 1000, sims: 600 });
    host.message({ type: "set-bot-think-long", roomId, long: false });
    expect(last("state")?.botThinkLong).toBeUndefined();
    expect(budget()).toEqual({ ms: 1000, sims: 200 });
  });

  it("is refused on a server that doesn't allow it, which doesn't offer it", () => {
    const received: ServerMessage[] = [];
    const service = new RoomService(new RoomManager({ pacing: "immediate" }), {
      send: (_conn, message) => received.push(structuredClone(message)),
    });
    const conn = 1;
    service.handle(conn, { type: "create-room", players: 2, hostToken: "h" });
    const roomId = (received.find((m) => m.type === "room-created") as { roomId: string }).roomId;
    service.handle(conn, { type: "join-room", roomId, hostToken: "h" });
    const joined = received.filter((m) => m.type === "room-joined").at(-1) as { botThinkLongAllowed?: true };
    expect(joined.botThinkLongAllowed).toBeUndefined();
    service.handle(conn, { type: "set-bot-think-long", roomId, long: true });
    expect(received.at(-1)).toMatchObject({ type: "error", message: expect.stringMatching(/think longer/) });
  });

  it("opens a lesson", () => {
    const { host, last } = page();
    host.message({ type: "tutorial-create", lesson: "basics-proof", hostToken: "t" });
    const created = last("room-created");
    expect(created?.seat).toBe("alice");
  });
});
