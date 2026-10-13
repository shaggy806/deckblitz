/**
 * `LocalRoomHost`: the rooms a browser runs for a solo game (`docs/plans/
 * local-rooms.md`) — the same messages a page sends the server, answered by
 * the same `RoomService`, with one connection and no Node-side host.
 */

import { describe, expect, it } from "vitest";
import type { ServerMessage } from "protocol";
import { LocalRoomHost } from "../local-host.js";

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

  it("opens a lesson", () => {
    const { host, last } = page();
    host.message({ type: "tutorial-create", lesson: "basics-proof", hostToken: "t" });
    const created = last("room-created");
    expect(created?.seat).toBe("alice");
  });
});
