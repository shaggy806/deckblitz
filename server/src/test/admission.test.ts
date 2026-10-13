import { describe, expect, it } from "vitest";
import { SERVER_FULL, TOO_MANY_ROOMS, capKey, openRoomsOf, placeRoom, roomWeight, shardLoads } from "../admission.js";
import type { RoomRecord, ShardCandidate } from "../admission.js";

const shard = (index: number, more: Partial<ShardCandidate> = {}): ShardCandidate => ({
  index,
  up: true,
  elu: null,
  delayP99Ms: null,
  ...more,
});
const lobby = (shard: number, ip: string | null = null, stage: RoomRecord["stage"] = "waiting"): RoomRecord => ({
  shard,
  kind: "lobby",
  stage,
  ip,
});

describe("admission", () => {
  it("weighs a room by what it will cost", () => {
    expect(roomWeight("lobby", "waiting")).toBe(1);
    expect(roomWeight("lobby", "playing")).toBe(1);
    expect(roomWeight("tutorial", "playing")).toBe(0.5);
    expect(roomWeight("lobby", "finished")).toBe(0.1);
    expect(roomWeight("tutorial", "finished")).toBe(0.1);
    expect(roomWeight("builder", "playing")).toBe(0);
    expect(roomWeight("adopted", "playing")).toBe(0);
    expect(
      shardLoads([lobby(0), lobby(0, null, "finished"), { shard: 1, kind: "tutorial", stage: "playing", ip: null }]),
    ).toEqual(
      new Map([
        [0, 1.1],
        [1, 0.5],
      ]),
    );
  });

  it("places on the cheapest up shard, shard 0 carrying half a room for imports", () => {
    expect(placeRoom([shard(0), shard(1)], [], {}, null)).toEqual({ shard: 1 });
    expect(placeRoom([shard(0), shard(1)], [lobby(1)], {}, null)).toEqual({ shard: 0 });
    // Down (or starting) shards are skipped.
    expect(placeRoom([shard(0), shard(1, { up: false })], [], {}, null)).toEqual({ shard: 0 });
    // A tie goes to the less busy, then the lower index.
    const tied = [{ shard: 1, kind: "tutorial", stage: "playing", ip: null }] as const;
    expect(placeRoom([shard(0), shard(1)], tied, {}, null)).toEqual({ shard: 0 });
    expect(placeRoom([shard(0, { elu: 0.3 }), shard(1, { elu: 0.1 })], tied, {}, null)).toEqual({ shard: 1 });
    expect(placeRoom([shard(0), shard(1), shard(2, { elu: 0.4 }), shard(3, { elu: 0.2 })], [lobby(0), lobby(1)], {}, null)).toEqual({
      shard: 3,
    });
  });

  it("passes over a lagging shard unless every one is", () => {
    const slow = { delayP99Ms: 400 };
    expect(placeRoom([shard(0), shard(1, slow)], [lobby(0), lobby(0)], {}, null)).toEqual({ shard: 0 });
    expect(placeRoom([shard(0, slow), shard(1, slow)], [lobby(1)], {}, null)).toEqual({ shard: 0 });
  });

  it("refuses only when every up shard is full", () => {
    const limits = { maxRoomsPerShard: 2 };
    expect(placeRoom([shard(0), shard(1)], [lobby(1), lobby(1)], limits, null)).toEqual({ shard: 0 });
    expect(placeRoom([shard(0), shard(1)], [lobby(0), lobby(0), lobby(1), lobby(1)], limits, null)).toEqual({
      refused: SERVER_FULL,
    });
    // Finished games weigh a tenth: they don't fill a shard.
    const finished = [lobby(0, null, "finished"), lobby(0, null, "finished"), lobby(0)];
    expect(placeRoom([shard(0)], finished, limits, null)).toEqual({ shard: 0 });
    // With no shard up, nothing opens.
    expect(placeRoom([shard(0, { up: false })], [], {}, null)).toEqual({ refused: SERVER_FULL });
  });

  it("caps the open rooms one address created, finished games not counted", () => {
    const limits = { maxRoomsPerIp: 2 };
    const rooms = [lobby(0, "a"), { shard: 1, kind: "tutorial", stage: "playing", ip: "a" } as const, lobby(0, "b")];
    expect(openRoomsOf(rooms, "a")).toBe(2);
    expect(placeRoom([shard(0), shard(1)], rooms, limits, "a")).toEqual({ refused: TOO_MANY_ROOMS });
    expect(placeRoom([shard(0), shard(1)], rooms, limits, "b")).toMatchObject({ shard: expect.any(Number) });
    expect(placeRoom([shard(0), shard(1)], rooms, limits, null)).toMatchObject({ shard: expect.any(Number) });
    const done = [lobby(0, "a", "finished"), lobby(0, "a")];
    expect(placeRoom([shard(0)], done, limits, "a")).toEqual({ shard: 0 });
  });

  it("exempts the box itself: loopback without the tunnel's header", () => {
    expect(capKey("127.0.0.1", false)).toBeNull();
    expect(capKey("::1", false)).toBeNull();
    expect(capKey("::ffff:127.0.0.1", false)).toBeNull();
    // Through the tunnel every request arrives from loopback, with the header.
    expect(capKey("127.0.0.1", true)).toBe("127.0.0.1");
    expect(capKey("203.0.113.9", true)).toBe("203.0.113.9");
    expect(capKey("192.168.1.20", false)).toBe("192.168.1.20");
  });
});
