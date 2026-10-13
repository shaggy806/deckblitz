import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";

import { RoomManager } from "../room-manager.js";
import { BOT_DECISIONS } from "../room.js";
import { renderStatus, statusParts, statusSnapshot } from "../status.js";
import { assembleStatus, startStatusServer } from "../status-server.js";
import type { ShardStatus, StatusSnapshot } from "../status-server.js";
import { LoadMonitor } from "../load-monitor.js";
import type { LoadReport } from "../load-monitor.js";
import { ALICE, BOB } from "../decks.js";

const config = (seed = 1) => ({ seed });

/** A room with every seat bot-filled and the game actually running — the
 * `playing` case, which is what an operator is usually looking at. */
function startedRoom(manager: RoomManager) {
  const pending = manager.createPending(2, config());
  pending.addBot(ALICE);
  pending.addBot(BOB);
  return manager.promote(pending.id);
}

describe("status snapshot", () => {
  it("reports an empty server without inventing rooms", () => {
    const snapshot = statusSnapshot(new RoomManager());
    expect(snapshot.rooms).toHaveLength(0);
    expect(snapshot.counts.total).toBe(0);
    expect(snapshot.roomsCreated).toBe(0);
    expect(renderStatus(snapshot)).toContain("no rooms");
  });

  it("separates a room still filling up from one being played", () => {
    const manager = new RoomManager();
    manager.createPending(2, config(1));
    startedRoom(manager);

    const snapshot = statusSnapshot(manager);
    expect(snapshot.counts.total).toBe(2);
    expect(snapshot.counts.waiting).toBe(1);
    expect(snapshot.counts.playing).toBe(1);
    expect(snapshot.counts.finished).toBe(0);
  });

  it("counts rooms created since start, not just the live ones", () => {
    // A live count alone can't tell a quiet server from one that just
    // restarted, which is exactly the question being asked after an incident.
    const manager = new RoomManager();
    for (let i = 0; i < 3; i += 1) manager.createPending(2, config(i));
    manager.reapIdle(-1);
    const snapshot = statusSnapshot(manager);
    expect(snapshot.counts.total).toBe(0);
    expect(snapshot.roomsCreated).toBe(3);
  });

  it("reports a playing room's turn, step and seats", () => {
    const manager = new RoomManager();
    startedRoom(manager);
    const [room] = statusSnapshot(manager).rooms;

    expect(room.stage).toBe("playing");
    expect(room.turn).toBeGreaterThan(0);
    expect(room.step).toBeTruthy();
    expect(room.activePlayer).toBeTruthy();
    expect(room.winner).toBeNull();
    expect(room.bots).toBe(2);
    expect(room.humansOnline).toBe(0);
    expect(room.seats).toHaveLength(2);
  });

  it("leaves a waiting room's game fields empty rather than guessing", () => {
    const manager = new RoomManager();
    manager.createPending(4, config());
    const [room] = statusSnapshot(manager).rooms;

    expect(room.stage).toBe("waiting");
    expect(room.turn).toBeNull();
    expect(room.step).toBeNull();
    expect(room.activePlayer).toBeNull();
    expect(room.seats).toHaveLength(4);
    expect(room.seats.every((s) => !s.claimed)).toBe(true);
  });

  it("renders a table a person can read", () => {
    const manager = new RoomManager();
    const room = startedRoom(manager);
    const text = renderStatus(statusSnapshot(manager));

    expect(text).toContain(room.id);
    expect(text).toContain("playing");
    expect(text).toMatch(/uptime/);
    expect(text).toMatch(/rss \d+ MB/);
    // Bot seats read as "bot" rather than as a player name.
    expect(text).toContain("bot,bot");
  });

  it("shows main's own loop, and a table of shards when the rooms run on them", () => {
    const load: LoadReport = {
      elu: 0.25,
      delayP50Ms: 10.2,
      delayP99Ms: 31.5,
      delayMaxMs: 80,
      heapUsedMb: 120,
      botDecisions: 40,
      botDecisionP99Ms: 310,
      windowMs: 10_000,
    };
    const shard = (index: number, over: Partial<ShardStatus> = {}): ShardStatus => ({
      index,
      up: true,
      state: "up",
      responsive: true,
      restarts: 0,
      roomsCreated: 3,
      counts: { total: 3, waiting: 1, playing: 2, finished: 0 },
      load,
      ...over,
    });
    const text = renderStatus(
      assembleStatus(
        {
          rooms: [],
          roomsCreated: 6,
          shards: [
            shard(0),
            shard(1, { responsive: false, restarts: 2 }),
            shard(2, { up: false, state: "restarting", load: null }),
            shard(3, { up: false, state: "failed", restarts: 5, load: null }),
          ],
        },
        load,
      ),
    );
    expect(text).toContain("delay p50 10.2 ms, p99 31.5 ms, max 80 ms; busy 25%");
    expect(text).toMatch(/SHARD/);
    expect(text).toMatch(/\n {2}0 +up +1\/2\/0 +25% +10.2\/31.5 ms +120 MB +310 ms\n/);
    expect(text).toMatch(/\n {2}1 +unresponsive \(2x\)/);
    expect(text).toMatch(/\n {2}2 +restarting +1\/2\/0 +— +— +— +—\n/);
    expect(text).toMatch(/\n {2}3 +crash-looped \(5x\)/);
  });

  it("serves the snapshot from an async source, with main's load measured", async () => {
    const manager = new RoomManager();
    startedRoom(manager);
    const server = startStatusServer(async () => statusParts(manager), 0);
    try {
      await new Promise<void>((resolve) => server.once("listening", () => resolve()));
      const { port } = server.address() as AddressInfo;
      const snap = (await (await fetch(`http://127.0.0.1:${port}/status.json`)).json()) as StatusSnapshot;
      expect(snap.counts.playing).toBe(1);
      expect(snap.main?.heapUsedMb).toBeGreaterThan(0);
      expect(snap.main?.elu).toBeGreaterThanOrEqual(0);
      const text = await (await fetch(`http://127.0.0.1:${port}/status`)).text();
      expect(text).toMatch(/loop {5}delay p50/);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("times every bot decision on this thread", () => {
    const before = BOT_DECISIONS.count;
    // Paced as in play: the bots decide up to their first frame, then wait.
    startedRoom(new RoomManager()).dispose();
    expect(BOT_DECISIONS.count).toBeGreaterThan(before);
    const monitor = new LoadMonitor({ decisions: BOT_DECISIONS });
    try {
      expect(monitor.read().botDecisionP99Ms).toBeGreaterThanOrEqual(0);
    } finally {
      monitor.stop();
    }
  });

  it("carries room codes, which is why the endpoint is loopback-only", () => {
    // Not a behaviour test so much as a standing reminder: a room code is a
    // join credential, so this payload must never be served on the port the
    // Cloudflare tunnel forwards. See `status.ts`.
    const manager = new RoomManager();
    const room = startedRoom(manager);
    expect(statusSnapshot(manager).rooms[0].id).toBe(room.id);
  });
});
