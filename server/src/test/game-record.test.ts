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
import { GameRecorder, MIN_RECORDED_INPUTS, replayRecord } from "../game-record.js";
import type { DealtConfig, GameRecord, GameRecordPart } from "../game-record.js";
import { GAMES_PER_HOUR, GameStore, handleGamesRoute, recordShape, renderGamesReport } from "../game-store.js";
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
  // Whole records here: nothing is handed over until the game ends or the
  // room goes, so each part begins at 0 and carries the deal.
  recordGamesTo({ build: "abc123", where: "server", deliver: (part) => void records.push(part as GameRecord) });
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

  it("is handed over a part at a time where the sink asks, and the parts put together are the game", () => {
    const EVERY = 60;
    const parts: GameRecordPart[] = [];
    const store = new GameStore({ disk: () => null, dir: tempDir() });
    let file: string | null = null;
    // A keeper that takes each part as it comes and says nothing: all of it.
    recordGamesTo({
      build: null,
      where: "browser",
      asItGoes: EVERY,
      deliver: (part) => {
        parts.push(part);
        file = store.take(part)?.path ?? file;
      },
    });
    const config = dealt(7);
    const room = new Room("REC4", Game.create({ ...config, registry }), {
      pacing: "immediate",
      botController: (player) => new HeuristicBotController(player, registry),
      dealt: config,
    });
    room.addBot(ALICE);
    room.addBot(BOB);
    room.start();
    const last = parts[parts.length - 1];
    expect(last.end.reason).toBe("over");
    expect(parts.length).toBeGreaterThan(2);
    // Only the first carries the deal; each of the rest begins where the one
    // before ended.
    expect(parts[0]).toMatchObject({ from: 0, seed: 7 });
    expect(parts[0].config).toBeDefined();
    let at = 0;
    for (const part of parts) {
      expect(part.from).toBe(at);
      if (at > 0) expect(part.config).toBeUndefined();
      at += part.inputs.length;
    }
    expect(parts.slice(0, -1).every((part) => part.inputs.length === EVERY && part.end.reason === "so-far")).toBe(true);
    // What the store kept of them is the whole game.
    const kept = JSON.parse(gunzipSync(readFileSync(file!)).toString("utf8")) as GameRecord;
    expect(kept.inputs).toHaveLength(at);
    expect(kept.end.reason).toBe("over");
    expect(replayRecord(kept, registry).matches).toBe(true);
    // Asked for it once more with nothing new: nothing.
    room.handOverRecordSoFar();
    expect(parts[parts.length - 1]).toBe(last);
  });

  it("sends again from where the keeper says it is, when the keeper has fallen behind", async () => {
    const parts: GameRecordPart[] = [];
    // A keeper whose copy went after the first part (fetched away): it holds
    // nothing when the second arrives, and takes whatever starts from 0.
    let held = 0;
    recordGamesTo({
      build: null,
      where: "browser",
      deliver: (part) => {
        parts.push(part);
        if (parts.length === 2) held = 0;
        if (part.from <= held) held = part.from + part.inputs.length;
        return Promise.resolve(held);
      },
    });
    const config = dealt(8);
    const room = new Room("REC5", Game.create({ ...config, registry }), {
      pacing: "immediate",
      botController: (player) => new HeuristicBotController(player, registry),
      dealt: config,
    });
    room.addBot(ALICE);
    room.start();
    const first = room.recordSoFar()?.inputs.length ?? 0;
    expect(first).toBeGreaterThanOrEqual(MIN_RECORDED_INPUTS);
    room.handOverRecordSoFar();
    await Promise.resolve();
    expect(parts).toHaveLength(1);
    expect(room.recordSoFar()?.handed).toBe(first);
    // The rest of the game, handed over as it ends: a part from `first`,
    // which the keeper can't place, then the whole game.
    room.addBot(BOB);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(parts.map((part) => part.from)).toEqual([0, first, 0]);
    expect(parts[2].config).toBeDefined();
    expect(held).toBe(parts[2].inputs.length);
    expect(replayRecord(parts[2] as GameRecord, registry).matches).toBe(true);
  });

  it("a recorder left unanswered sends the same inputs again with the next part, and never loops on a keeper that takes nothing", () => {
    const recorder = new GameRecorder(dealt(9));
    const game = Game.create({ ...dealt(9), registry });
    const about = { build: null, where: "browser" as const, roomId: "R", gameNumber: 1, seats: [] };
    const pass: RoomInput = { kind: "action", action: { type: "pass-priority", player: ALICE } };
    for (let i = 0; i < 20; i += 1) recorder.note(pass, "person");
    const first = recorder.part(game, "so-far", about);
    expect(first).toMatchObject({ from: 0 });
    expect(first?.inputs).toHaveLength(20);
    // Nothing new: nothing to send.
    expect(recorder.part(game, "so-far", about)).toBeNull();
    // The post failed: the next part carries those twenty too.
    expect(recorder.acked(null, 20)).toBe(false);
    recorder.note(pass, "person");
    const second = recorder.part(game, "so-far", about);
    expect(second).toMatchObject({ from: 0 });
    expect(second?.inputs).toHaveLength(21);
    // Kept: the next starts after them.
    expect(recorder.acked(21, 21)).toBe(false);
    recorder.note(pass, "person");
    // What the page keeps by it for a closing tab: the same inputs, with
    // nothing counted as sent and no fingerprint of the state.
    const tail = recorder.tail(game, about);
    expect(tail).toMatchObject({ from: 21, seed: 9, end: { reason: "so-far", events: null, digest: null } });
    expect(tail?.inputs).toHaveLength(1);
    expect(tail?.config).toBeUndefined();
    const third = recorder.part(game, "so-far", about);
    expect(third).toMatchObject({ from: 21 });
    expect(third?.config).toBeUndefined();
    // The keeper holds nothing of it: once, send again; told the same a
    // second time, wait for more to send.
    expect(recorder.acked(0, 22)).toBe(true);
    expect(recorder.part(game, "so-far", about)).toMatchObject({ from: 0 });
    expect(recorder.acked(0, 22)).toBe(false);
    expect(recorder.soFar()?.handed).toBe(0);
    // Held in full: no tail.
    expect(recorder.acked(22, 22)).toBe(false);
    expect(recorder.tail(game, about)).toBeNull();
  });

  it("keeps nothing where no sink is set, and nothing in a room that wasn't told its deal", () => {
    recordGamesTo(null);
    const game = Game.create({ ...dealt(6), registry });
    const room = new Room("REC2", game, { pacing: "immediate", dealt: dealt(6) });
    expect(room.recordSoFar()).toBeNull();
    const records: GameRecordPart[] = [];
    recordGamesTo({ build: null, where: "browser", deliver: (r) => void records.push(r) });
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
    const store = new GameStore({ disk: () => null, dir, now: () => NOON });
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
    const store = new GameStore({ disk: () => null, dir: tempDir() });
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
    const one = new GameStore({ disk: () => null, dir, now: () => now }).write(sample());
    const size = readFileSync(one!).length;
    const store = new GameStore({ disk: () => null, dir, maxBytes: Math.floor(size * 2.5), now: () => now });
    now += 1000;
    store.write(sample({ gameNumber: 2 }));
    expect(store.stats().games).toBe(2);
    now += 1000;
    store.write(sample({ gameNumber: 3 }));
    expect(store.stats().games).toBe(2);
    expect(existsSync(one!)).toBe(false);
    expect(readdirSync(join(dir, "2026-11-22")).sort()).toEqual(["ABCD-2-7.json.gz", "ABCD-3-7.json.gz"]);
  });

  it("puts a part after what it holds, and says where to start again when it can't", () => {
    const dir = tempDir();
    let now = NOON;
    const store = new GameStore({ disk: () => null, dir, now: () => now });
    const input = (n: number): GameRecord["inputs"][number] => ({ input: { kind: "concede", player: ALICE }, by: "person", via: String(n) });
    const inputs = (from: number, to: number): GameRecord["inputs"] => Array.from({ length: to - from }, (_, i) => input(from + i));
    const read = (path: string): GameRecord => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) as GameRecord;
    const { config, ...rest } = sample();
    const part = (from: number, to: number, more: Partial<GameRecordPart> = {}): GameRecordPart => ({
      ...rest,
      seed: 7,
      from,
      ...(from === 0 ? { config } : {}),
      inputs: inputs(from, to),
      ...more,
    });

    // A part with nothing kept to go after: not placed, start from 0.
    expect(store.take(part(3, 5))).toEqual({ have: 0, path: null });
    const first = store.take(part(0, 3));
    expect(first).toMatchObject({ have: 3 });
    const path = first!.path!;
    // The next goes after it, and its `end` is the record's.
    expect(store.take(part(3, 5, { end: { ...sample().end, reason: "over", turn: 9 } }))).toEqual({ have: 5, path });
    const kept = read(path);
    expect(kept.inputs.map((i) => i.via)).toEqual(["0", "1", "2", "3", "4"]);
    expect(kept.config).toEqual(config);
    expect(kept.end).toMatchObject({ reason: "over", turn: 9 });
    expect("from" in kept).toBe(false);
    // One that overlaps what is kept replaces from where it begins; one that
    // ends inside it, or begins past it, changes nothing.
    expect(store.take(part(4, 7))).toEqual({ have: 7, path });
    expect(read(path).inputs.map((i) => i.via)).toEqual(["0", "1", "2", "3", "4", "5", "6"]);
    expect(store.take(part(2, 6))).toEqual({ have: 7, path: null });
    expect(store.take(part(9, 12))).toEqual({ have: 7, path: null });
    expect(store.take(part(0, 5))).toEqual({ have: 7, path: null });
    // Past midnight UTC it is still the one file.
    now += 86_400_000 / 2 + 3_600_000;
    expect(store.take(part(7, 8))).toEqual({ have: 8, path });
    expect(store.stats().games).toBe(1);
    // Fetched away: the next part can't be placed, and the whole game starts a new file.
    rmSync(path);
    expect(store.take(part(8, 9))).toEqual({ have: 0, path: null });
    expect(store.take(part(0, 9))).toMatchObject({ have: 9 });
  });

  it("takes a post over HTTP and answers how much of the game it holds", async () => {
    const dir = tempDir();
    const store = new GameStore({ disk: () => null, dir, now: () => NOON });
    const server = createServer((req, res) => {
      if (handleGamesRoute(req, res, store, () => "1.2.3.4", "https://deckblitz.net")) return;
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const url = `http://localhost:${(server.address() as AddressInfo).port}/games`;
    try {
      const post = (body: string): Promise<Response> => fetch(url, { method: "POST", body });
      const answer = await post(JSON.stringify(sample()));
      expect(answer.status).toBe(200);
      expect(answer.headers.get("access-control-allow-origin")).toBe("https://deckblitz.net");
      expect(await answer.json()).toEqual({ have: 1 });
      // A part it can't place: told what it holds.
      const { config: _config, ...rest } = sample();
      const late = await post(JSON.stringify({ ...rest, seed: 7, from: 4 }));
      expect(await late.json()).toEqual({ have: 1 });
      // Not a record: nothing said.
      const junk = await post("not json");
      expect(junk.status).toBe(204);
      expect(await junk.text()).toBe("");
      expect(store.stats().games).toBe(1);
    } finally {
      server.close();
    }
  });

  it("reports how full it is, how fast it fills, and when to fetch the games away", () => {
    const dir = tempDir();
    const GB = 1024 ** 3;
    let free = 50 * GB;
    // The report reads the folder itself, so its times are the files' own.
    const store = new GameStore({ dir, maxBytes: 100_000, minFreeBytes: 5 * GB, disk: () => ({ free, total: 60 * GB }) });
    expect(store.report()).toMatchObject({ games: 0, bytes: 0, room: 100_000, full: 0, transfer: "no", oldest: null });
    store.write(sample());
    store.write(sample({ gameNumber: 2 }));
    const two = store.report();
    const bytes = two.bytes;
    expect(two).toMatchObject({ games: 2, maxBytes: 100_000, room: 100_000, transfer: "no" });
    expect(bytes).toBeGreaterThan(200);
    expect(two.full).toBeCloseTo(bytes / 100_000);
    expect(two.oldest).not.toBeNull();
    // Both written just now: all of it within the day.
    expect(two.perDay).toBe(bytes);
    const text = renderGamesReport(two);
    expect(text).toContain("2 file(s)");
    expect(text).toContain("50.0 GB free of 60.0 GB");
    expect(text).toContain("transfer   not needed for room");

    // Half of what it may hold: soon. Four fifths: now.
    const half = new GameStore({ dir, maxBytes: 2 * bytes, disk: () => null });
    expect(half.report()).toMatchObject({ full: 0.5, transfer: "soon" });
    expect(renderGamesReport(half.report())).toContain("transfer   soon");
    const most = new GameStore({ dir, maxBytes: Math.floor(1.2 * bytes), disk: () => null });
    expect(most.report().transfer).toBe("now");
    expect(renderGamesReport(most.report())).toContain("transfer   NOW");

    // The disk can allow less than the folder's own limit: what is free
    // above the floor, with what is already here.
    free = 5 * GB + bytes;
    const tight = store.report();
    expect(tight.room).toBe(2 * bytes);
    expect(tight.transfer).toBe("soon");
    expect(renderGamesReport(tight)).toContain("the disk allows less");
  });

  it("drops the oldest games when the disk itself runs short, whatever the folder's limit", () => {
    const dir = tempDir();
    let now = NOON;
    const GB = 1024 ** 3;
    let free = 50 * GB;
    const store = new GameStore({ dir, now: () => now, minFreeBytes: 5 * GB, disk: () => ({ free, total: 60 * GB }) });
    const first = store.write(sample())!;
    now += 1000;
    const second = store.write(sample({ gameNumber: 2 }))!;
    expect(store.stats().games).toBe(2);
    // Short by a few bytes: one game's worth frees it, and the oldest goes.
    free = 5 * GB - 10;
    now += 1000;
    const third = store.write(sample({ gameNumber: 3 }))!;
    expect(existsSync(first)).toBe(false);
    expect(existsSync(second)).toBe(true);
    expect(existsSync(third)).toBe(true);
  });

  it("stops an address that posts too many in an hour", () => {
    let now = NOON;
    const store = new GameStore({ disk: () => null, dir: tempDir(), now: () => now });
    for (let i = 0; i < GAMES_PER_HOUR; i += 1) expect(store.admits("1.2.3.4")).toBe(true);
    expect(store.admits("1.2.3.4")).toBe(false);
    expect(store.admits("5.6.7.8")).toBe(true);
    now += 3_600_000;
    expect(store.admits("1.2.3.4")).toBe(true);
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
