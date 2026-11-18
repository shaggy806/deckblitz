import { describe, expect, it } from "vitest";
import {
  FULL_TABLE,
  SERVER_FULL,
  TOO_MANY_ROOMS,
  capKey,
  initialBots,
  openRoomsOf,
  placeRoom,
  roomWeight,
  shardLoads,
} from "../admission.js";
import type { RoomRecord, ShardCandidate } from "../admission.js";
import { SEATS } from "../decks.js";

const shard = (index: number, more: Partial<ShardCandidate> = {}): ShardCandidate => ({
  index,
  up: true,
  elu: null,
  delayP99Ms: null,
  ...more,
});
/** A lobby nobody has sat down at, unless `bots` says otherwise: a whole
 * room, as the cap counts them. */
const lobby = (
  shard: number,
  ip: string | null = null,
  stage: RoomRecord["stage"] = "waiting",
  bots: number = FULL_TABLE,
): RoomRecord => ({ shard, kind: "lobby", stage, bots, ip });
const tutorial = (shard: number, ip: string | null = null): RoomRecord => ({
  shard,
  kind: "tutorial",
  stage: "playing",
  bots: 1,
  ip,
});

describe("admission", () => {
  it("weighs a room by what it will cost", () => {
    expect(roomWeight("lobby", "waiting", 4)).toBe(1);
    expect(roomWeight("lobby", "playing", 4)).toBe(1);
    expect(roomWeight("tutorial", "playing", 1)).toBe(0.5);
    expect(roomWeight("lobby", "finished", 3)).toBe(0.1);
    expect(roomWeight("tutorial", "finished", 1)).toBe(0.1);
    expect(roomWeight("builder", "playing", 3)).toBe(0);
    expect(roomWeight("adopted", "playing", 3)).toBe(0);
    expect(shardLoads([lobby(0), lobby(0, null, "finished"), tutorial(1)])).toEqual(
      new Map([
        [0, 1.1],
        [1, 0.5],
      ]),
    );
  });

  it("weighs a game by its bots: a table of people a fifth of an all-bot room", () => {
    expect(roomWeight("lobby", "playing", 0)).toBeCloseTo(0.2);
    expect(roomWeight("lobby", "playing", 1)).toBeCloseTo(0.4);
    expect(roomWeight("lobby", "playing", 2)).toBeCloseTo(0.6);
    expect(roomWeight("lobby", "playing", 3)).toBeCloseTo(0.8);
    // Never more than the all-bot room the cap is measured in, nor less than
    // a game.
    expect(roomWeight("lobby", "playing", 9)).toBe(1);
    expect(roomWeight("lobby", "playing", -1)).toBeCloseTo(0.2);
    // A waiting table is weighed the same way, by the bots it could seat.
    expect(roomWeight("lobby", "waiting", 3)).toBeCloseTo(0.8);
    expect(roomWeight("lobby", "waiting", 0)).toBeCloseTo(0.2);
    // A create in flight: nobody seated yet, so a full table of them.
    expect(initialBots("lobby")).toBe(FULL_TABLE);
    expect(roomWeight("lobby", "waiting", initialBots("lobby"))).toBe(1);
    expect(FULL_TABLE).toBe(SEATS.length);
  });

  it("fits thirty tables of people where six all-bot rooms fit, and refuses the next", () => {
    const limits = { maxRoomsPerShard: 6 };
    const people = (n: number): RoomRecord[] => Array.from({ length: n }, () => lobby(0, null, "playing", 0));
    expect(placeRoom([shard(0)], people(29), limits, null)).toEqual({ shard: 0 });
    // Thirty fifths sum to a hair off 6 either way: full all the same.
    expect(placeRoom([shard(0)], people(30), limits, null)).toEqual({ refused: SERVER_FULL });
    expect(placeRoom([shard(0)], Array.from({ length: 6 }, () => lobby(0, null, "playing", 4)), limits, null)).toEqual({
      refused: SERVER_FULL,
    });
    // Two people and two bots: ten of those.
    const mixed = (n: number): RoomRecord[] => Array.from({ length: n }, () => lobby(0, null, "playing", 2));
    expect(placeRoom([shard(0)], mixed(9), limits, null)).toEqual({ shard: 0 });
    expect(placeRoom([shard(0)], mixed(10), limits, null)).toEqual({ refused: SERVER_FULL });
  });

  it("places on the cheapest up shard, shard 0 carrying half a room for imports", () => {
    expect(placeRoom([shard(0), shard(1)], [], {}, null)).toEqual({ shard: 1 });
    expect(placeRoom([shard(0), shard(1)], [lobby(1)], {}, null)).toEqual({ shard: 0 });
    // Down (or starting) shards are skipped.
    expect(placeRoom([shard(0), shard(1, { up: false })], [], {}, null)).toEqual({ shard: 0 });
    // A tie goes to the less busy, then the lower index.
    const tied = [tutorial(1)];
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
    const rooms = [lobby(0, "a"), tutorial(1, "a"), lobby(0, "b")];
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
