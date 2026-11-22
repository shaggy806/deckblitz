/**
 * A game kept as how it was dealt and what was done to it (`game-record.ts`),
 * and the folder such records are kept in (`game-store.ts`).
 */

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

import { afterEach, describe, expect, it } from "vitest";
import { Game, HeuristicBotController, createDefaultRegistry } from "engine";
import type { RoomInput, TableRecipe } from "protocol";

import { ALICE, BOB, DECKS } from "../decks.js";
import { MIN_RECORDED_INPUTS, replayRecord } from "../game-record.js";
import type { DealtConfig, GameRecord } from "../game-record.js";
import { GAMES_PER_HOUR, GameStore, handleGamesRoute, recordShape } from "../game-store.js";
import { Room, recordGamesTo } from "../room.js";
import { Tables } from "../tables.js";

const registry = createDefaultRegistry();
const dirs: string[] = [];
const tempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "games-test-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  recordGamesTo(null);
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const dealt = (seed: number): DealtConfig => ({
  seed,
  decks: [
    { player: ALICE, cards: [...DECKS.alice] },
    { player: BOB, cards: [...DECKS.bob] },
  ],
});

/** Two v1 bots in a room that records, with `records` what it hands over. */
function recordingRoom(config: DealtConfig | GameRecord, game = Game.create({ ...(config as DealtConfig), registry })): {
  room: Room;
  records: GameRecord[];
} {
  const records: GameRecord[] = [];
  recordGamesTo({ build: "abc123", where: "server", deliver: (record) => records.push(record) });
  const room = new Room("REC1", game, {
    pacing: "immediate",
    botController: (player) => new HeuristicBotController(player, registry),
    dealt: config,
  });
  return { room, records };
}

describe("a game's record", () => {
  it("is handed over once as the game ends, and plays again to the same game", () => {
    const { room, records } = recordingRoom(dealt(1));
    room.addBot(ALICE);
    room.addBot(BOB);
    room.start();
    expect(room.game.state.result.over).toBe(true);
    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record).toMatchObject({ version: 1, build: "abc123", where: "server", roomId: "REC1", gameNumber: 1 });
    expect(record.end.reason).toBe("over");
    expect(record.end.winner).toBe(room.game.state.result.winner);
    expect(record.inputs.length).toBeGreaterThan(MIN_RECORDED_INPUTS);
    // Every move here was a bot's or the room's own pass for one.
    expect(record.inputs.every((i) => i.by === "bot" || i.by === "room")).toBe(true);
    expect(record.inputs.some((i) => i.by === "bot")).toBe(true);
    expect(record.seats).toEqual([
      { player: ALICE, name: null, bot: true },
      { player: BOB, name: null, bot: true },
    ]);

    // Through JSON, as a kept record goes: nothing in it but data.
    const kept = JSON.parse(JSON.stringify(record)) as GameRecord;
    const replay = replayRecord(kept, registry);
    expect(replay.refused).toBeNull();
    expect(replay.applied).toBe(kept.inputs.length);
    expect(replay.matches).toBe(true);
    expect(replay.game.state.result).toEqual(room.game.state.result);

    // The room going afterwards hands nothing over twice.
    room.dispose();
    expect(records).toHaveLength(1);
  });

  it("stops where asked, with the game as it stood there", () => {
    const { room, records } = recordingRoom(dealt(2));
    room.addBot(ALICE);
    room.addBot(BOB);
    room.start();
    const record = records[0];
    const half = Math.floor(record.inputs.length / 2);
    const part = replayRecord(record, registry, { upTo: half });
    expect(part.applied).toBe(half);
    expect(part.matches).toBeNull();
    expect(part.game.state.result.over).toBe(false);
    // To a turn: the first input that leaves the game there.
    const turn = replayRecord(record, registry, { stop: (game) => game.state.turn.number >= 3 });
    expect(turn.game.state.turn.number).toBe(3);
    expect(turn.applied).toBeLessThan(record.inputs.length);
  });

  it("says a record no longer plays on this build, and where", () => {
    const { room, records } = recordingRoom(dealt(3));
    room.addBot(ALICE);
    room.addBot(BOB);
    room.start();
    const record = records[0];
    // The same inputs on another shuffle: some input soon names a card that
    // isn't where it was, or the game ends up somewhere else.
    const other = replayRecord({ ...record, config: { ...record.config, seed: 99 } }, registry);
    expect(other.matches).toBe(false);
  });

  it("carries across a saved game: the record so far, then the rest", () => {
    const { room, records } = recordingRoom(dealt(4));
    // Nobody plays yet: the record so far is the deal and no inputs.
    const first = room.recordSoFar();
    expect(first?.inputs).toHaveLength(0);
    room.addBot(ALICE);
    // Bob is nobody's: the game stops at his first decision, as a saved game
    // stops wherever its page was closed.
    room.start();
    const soFar = JSON.parse(JSON.stringify(room.recordSoFar())) as GameRecord;
    const snapshot = room.game.snapshot();
    expect(records).toHaveLength(0);

    const again = recordingRoom(soFar, Game.fromSnapshot(snapshot, { registry }));
    again.room.addBot(ALICE);
    again.room.addBot(BOB);
    again.room.start();
    expect(again.room.game.state.result.over).toBe(true);
    expect(again.records).toHaveLength(1);
    expect(again.records[0].inputs.length).toBeGreaterThan(soFar.inputs.length);
    expect(replayRecord(again.records[0], registry).matches).toBe(true);
  });

  it("is handed over as left when the room goes mid-game, and not at all for a game that hardly began", () => {
    const { room, records } = recordingRoom(dealt(5));
    room.dispose();
    expect(records).toHaveLength(0);

    const played = recordingRoom(dealt(5));
    played.room.addBot(ALICE);
    played.room.start();
    // Alice's bot has played up to Bob's first decision.
    const made = played.room.recordSoFar()?.inputs.length ?? 0;
    played.room.dispose();
    expect(played.records).toHaveLength(made >= MIN_RECORDED_INPUTS ? 1 : 0);
    if (played.records.length === 1) {
      expect(played.records[0].end.reason).toBe("left");
      expect(replayRecord(played.records[0], registry).matches).toBe(true);
    }
  });

  it("is handed over as it goes where the sink asks, each time longer, and each plays again", () => {
    const records: GameRecord[] = [];
    const EVERY = 60;
    recordGamesTo({ build: null, where: "browser", asItGoes: EVERY, deliver: (record) => records.push(record) });
    const config = dealt(7);
    const room = new Room("REC4", Game.create({ ...config, registry }), {
      pacing: "immediate",
      botController: (player) => new HeuristicBotController(player, registry),
      dealt: config,
    });
    room.addBot(ALICE);
    room.addBot(BOB);
    room.start();
    const last = records[records.length - 1];
    expect(last.end.reason).toBe("over");
    const soFar = records.slice(0, -1);
    expect(soFar).toHaveLength(Math.floor((last.inputs.length - 1) / EVERY));
    expect(soFar.length).toBeGreaterThan(0);
    for (const [i, record] of soFar.entries()) {
      expect(record.end.reason).toBe("so-far");
      expect(record.inputs).toHaveLength((i + 1) * EVERY);
      expect(replayRecord(record, registry).matches).toBe(true);
    }
    // Asked for it once more with nothing new: nothing.
    room.handOverRecordSoFar();
    expect(records[records.length - 1]).toBe(last);
  });

  it("keeps nothing where no sink is set, and nothing in a room that wasn't told its deal", () => {
    recordGamesTo(null);
    const game = Game.create({ ...dealt(6), registry });
    const room = new Room("REC2", game, { pacing: "immediate", dealt: dealt(6) });
    expect(room.recordSoFar()).toBeNull();
    const records: GameRecord[] = [];
    recordGamesTo({ build: null, where: "browser", deliver: (r) => records.push(r) });
    const untold = new Room("REC3", Game.create({ ...dealt(6), registry }), { pacing: "immediate" });
    expect(untold.recordSoFar()).toBeNull();
  });
});

const sample = (more: Partial<GameRecord> = {}): GameRecord => ({
  version: 1,
  build: "abc",
  where: "browser",
  roomId: "ABCD",
  gameNumber: 1,
  config: { seed: 7, decks: [] },
  startedAt: 1,
  endedAt: 2,
  seats: [],
  inputs: [{ input: { kind: "concede", player: ALICE }, by: "person" }],
  end: { reason: "over", winner: null, turn: 3, events: 10, digest: "00" },
  ...more,
});

describe("the game store", () => {
  const NOON = Date.UTC(2026, 10, 22, 12);

  it("keeps a record gzipped under its day, once", () => {
    const dir = tempDir();
    const store = new GameStore({ dir, now: () => NOON });
    const path = store.write(sample(), { country: "CA" });
    expect(path).toBe(join(dir, "2026-11-22", "ABCD-1-7.json.gz"));
    const kept = JSON.parse(gunzipSync(readFileSync(path!)).toString("utf8")) as Record<string, unknown>;
    expect(kept).toMatchObject({ roomId: "ABCD", received: NOON, country: "CA" });
    // The same game again (another device at the table, a retry): not twice.
    expect(store.write(sample())).toBeNull();
    expect(store.write(sample({ gameNumber: 2 }))).not.toBeNull();
    expect(store.stats().games).toBe(2);
    // More of the same game (a browser hands one over as it goes): it replaces.
    const more = sample({ inputs: [...sample().inputs, ...sample().inputs] });
    expect(store.write(more)).toBe(path);
    expect((JSON.parse(gunzipSync(readFileSync(path!)).toString("utf8")) as GameRecord).inputs).toHaveLength(2);
    expect(store.write(sample())).toBeNull();
    expect(store.stats().games).toBe(2);
  });

  it("refuses what isn't a record", () => {
    const store = new GameStore({ dir: tempDir() });
    expect(recordShape(null)).toBeNull();
    expect(recordShape({ ...sample(), version: 2 })).toBeNull();
    expect(recordShape({ ...sample(), roomId: "../../etc" })).toBeNull();
    expect(recordShape({ ...sample(), inputs: [] })).toBeNull();
    expect(recordShape({ ...sample(), config: null })).toBeNull();
    expect(store.write({ ...sample(), roomId: "a/b" })).toBeNull();
    expect(store.stats().games).toBe(0);
  });

  it("drops the oldest files once the folder is full", () => {
    const dir = tempDir();
    let now = NOON;
    const one = new GameStore({ dir, now: () => now }).write(sample());
    const size = readFileSync(one!).length;
    const store = new GameStore({ dir, maxBytes: Math.floor(size * 2.5), now: () => now });
    now += 1000;
    store.write(sample({ gameNumber: 2 }));
    expect(store.stats().games).toBe(2);
    now += 1000;
    store.write(sample({ gameNumber: 3 }));
    expect(store.stats().games).toBe(2);
    expect(existsSync(one!)).toBe(false);
    expect(readdirSync(join(dir, "2026-11-22")).sort()).toEqual(["ABCD-2-7.json.gz", "ABCD-3-7.json.gz"]);
  });

  it("takes a posted record over HTTP, answers nothing, and stops an address that posts too many", async () => {
    const dir = tempDir();
    const store = new GameStore({ dir, now: () => NOON });
    const server = createServer((req, res) => {
      if (handleGamesRoute(req, res, store, () => "1.2.3.4", "*")) return;
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const url = `http://localhost:${(server.address() as AddressInfo).port}/games`;
    try {
      const post = (body: string): Promise<Response> => fetch(url, { method: "POST", body });
      const answer = await post(JSON.stringify(sample()));
      expect(answer.status).toBe(204);
      expect(await answer.text()).toBe("");
      expect((await post("not json")).status).toBe(204);
      expect(store.stats().games).toBe(1);
      for (let i = 2; i <= GAMES_PER_HOUR + 5; i += 1) await post(JSON.stringify(sample({ gameNumber: i })));
      // The first, the junk and 38 more were admitted; the rest dropped unread.
      expect(store.stats().games).toBe(GAMES_PER_HOUR - 1);
    } finally {
      server.close();
    }
  });
});

describe("a table's record", () => {
  const recipe: TableRecipe = {
    gameNumber: 1,
    config: { seed: 7, idSalt: "salt", decks: [], startingPlayer: ALICE },
    firstPlayer: "random",
    botSpeed: "normal",
    seats: [
      { player: ALICE, name: "Alice", bot: false },
      { player: BOB, name: "Bot Bob", bot: true },
    ],
  };
  const pass = (player: typeof ALICE): RoomInput => ({ kind: "action", action: { type: "pass-priority", player } });

  it("is kept from the server's own log as the table goes, and at a rematch", () => {
    const kept: GameRecord[] = [];
    const tables = new Tables(() => {}, { keep: { build: "abc", record: (r) => kept.push(r) } });
    tables.open({ id: "TABLE", recipe, people: [{ player: ALICE, token: "a", conn: 1 }], watchers: [], creator: ALICE });
    for (let i = 0; i < MIN_RECORDED_INPUTS; i += 1) {
      tables.message(1, { type: "table-input", roomId: "TABLE", after: i, mine: i, input: pass(i % 2 === 0 ? ALICE : BOB) });
    }
    tables.message(1, { type: "table-rematch", roomId: "TABLE" });
    expect(kept).toHaveLength(1);
    expect(kept[0]).toMatchObject({ where: "table", roomId: "TABLE", gameNumber: 1, build: "abc" });
    expect(kept[0].inputs.map((i) => i.by)).toEqual(Array.from({ length: MIN_RECORDED_INPUTS }, (_, i) => (i % 2 === 0 ? "person" : "bot")));
    expect(kept[0].end).toMatchObject({ reason: "closed", events: null, digest: null });
    // The rematch's game hardly began: forgetting the table keeps nothing more.
    tables.remove("TABLE");
    expect(kept).toHaveLength(1);
  });
});
