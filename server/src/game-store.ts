/**
 * Played games, kept on disk (`game-record.ts` has what a record is and why):
 * one gzipped JSON file a game under `games/` at the repo root (git-ignored,
 * so a deploy leaves it be; `GAMES_DIR` moves it), in a folder a UTC day,
 * named by the room, which game of the room's it was and its seed.
 *
 * Records come two ways. A game a browser played alone is posted by its room
 * worker as the game ends (`POST /games`, `handleGamesRoute`): the server
 * never sees such a game otherwise. A game the server ran itself is written
 * by the thread that ran it (`writeRecord`).
 *
 * **Nobody is named.** A record holds the decks and the plays and nothing of
 * who played: no address, only the country Cloudflare says the post came
 * from, and the posting browser's tag (`tag`, `PLAYER_TAG`: ten hex digits
 * the page works out one way from a random number it keeps to itself, the
 * client's `playerTag.ts`). The tag says two games came from one browser, so
 * that ten games of one player's aren't read as ten players'; nothing leads
 * back from it to a browser or a person, and nothing else the server keeps
 * carries it. The About page says games are kept, and how.
 *
 * **It can't fill the disk.** A post is at most `GAME_BODY_LIMIT`, an address
 * may post `GAMES_PER_HOUR`, and the oldest files go first once the folder
 * holds `maxBytes` or the disk it is on has less than `minFreeBytes` free,
 * whichever comes first. `npm run games:pull` on the operator's machine
 * copies the files over SSH and deletes them here; `report` says how full the
 * folder is and whether it is time to (`GET /games` on the status port).
 *
 * Main-side: nothing here imports the engine (`test/main-imports.test.ts`).
 * A record is checked for its shape only; whether it is a real game is for
 * whoever plays it again.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, statfsSync, unlinkSync, writeFileSync, rmdirSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";

import { countryOf, dayOf } from "./usage.js";

/** A posted record's largest body, raw JSON: a long four-player game is about
 * 300 KB. */
export const GAME_BODY_LIMIT = 4 * 1024 * 1024;
/** Posts one address may make an hour. A browser hands a game over a few
 * inputs at a time (`game-record.ts`'s `HAND_OVER_EVERY`), some forty posts a
 * long game, so this is a dozen games an hour and still no way to fill a disk
 * (each post is small, and a game stops at `MAX_KEPT_INPUTS`). */
export const GAMES_PER_HOUR = 600;
/** The most inputs one kept game holds (`game-record.ts`'s
 * `MAX_RECORDED_INPUTS`): parts past it are refused. */
export const MAX_KEPT_INPUTS = 60_000;
/** What the folder may hold before the oldest files go: 20 GB, over a
 * million games at the 10-18 KB a four-player game comes to. It was 1 GB
 * until 2026-11-22; the live box has 54 GB free of 61. */
export const DEFAULT_MAX_BYTES = 20 * 1024 * 1024 * 1024;
/** The free space the store leaves on its disk whatever `maxBytes` says: a
 * deploy downloads and unpacks a build, and the usage log and the system
 * need room too. */
export const DEFAULT_MIN_FREE_BYTES = 5 * 1024 * 1024 * 1024;
/** How full the folder is, of what it may hold, before `report` says to
 * fetch the games away, and before it says to do it now. */
export const TRANSFER_SOON_AT = 0.5;
export const TRANSFER_NOW_AT = 0.8;

export interface GameStoreConfig {
  readonly dir: string;
  readonly maxBytes?: number;
  readonly minFreeBytes?: number;
  readonly now?: () => number;
  /** The disk the folder is on: its free and total bytes, or `null` where
   * that can't be read. `statfs` unless given (a test's). */
  readonly disk?: () => { readonly free: number; readonly total: number } | null;
}

/** How the store stands (`GameStore.report`). */
export interface GameStoreReport {
  readonly games: number;
  readonly bytes: number;
  /** The folder's own limit, and the most it can in fact reach: that, or
   * what the disk has left above `minFreeBytes`, whichever is less. */
  readonly maxBytes: number;
  readonly room: number;
  /** `bytes` over `room`. */
  readonly full: number;
  readonly oldest: number | null;
  readonly newest: number | null;
  /** Bytes a day, over the files of the last seven days still here (games
   * fetched away aren't counted, so right after a pull this reads low). */
  readonly perDay: number;
  readonly disk: { readonly free: number; readonly total: number } | null;
  readonly minFreeBytes: number;
  /** Whether to fetch the games to the operator's machine for the room:
   * not yet, soon (half full), or now (four fifths: at full the oldest go). */
  readonly transfer: "no" | "soon" | "now";
  /** How many different browsers posted games, by their tags (`PLAYER_TAG`),
   * from the store's own tally (`notePlayer`), which a pull leaves in place. */
  readonly players: PlayersReport;
}

/** The browsers that posted games, counted by tag: how many different ones
 * within each of the last `PLAYER_WINDOWS` days (today is 1), and each day's
 * own count with the tagged games begun that day, newest first. Only a
 * browser's own games carry a tag: a table's and the server's rooms' aren't
 * in it, nor a game from a browser that keeps no storage. */
export interface PlayersReport {
  readonly within: Readonly<Record<number, number>>;
  readonly byDay: readonly { readonly day: string; readonly players: number; readonly games: number }[];
}

/** The spans `PlayersReport.within` counts over, in days. */
export const PLAYER_WINDOWS = [1, 7, 14, 30, 90] as const;

/** The folder under the store's the tally of tags is kept in, a small JSON
 * file a UTC day (`{ tag: games }`), and how many days of it are kept. Not a
 * `.json.gz`, so `games:pull` and the room's pruning leave it alone. */
const PLAYERS_DIR = "players";
const PLAYER_DAYS_KEPT = 400;

/** The shape of a browser's tag (the client's `playerTag.ts`): ten lowercase
 * hex digits. Anything else sent as one is dropped. */
export const PLAYER_TAG = /^[0-9a-f]{10}$/;

/** The parts of a record the store reads. The rest is kept as it came. */
interface RecordShape {
  readonly version: number;
  readonly roomId: string;
  readonly gameNumber: number;
  /** Where `inputs` begin in the game's inputs: 0 (or absent) for a whole
   * record, more for a part that goes after what is already kept. */
  readonly from?: number;
  readonly seed?: unknown;
  /** Absent from a part past the first: the kept record has it. */
  readonly config?: { readonly seed?: unknown; readonly decks: readonly unknown[] };
  readonly inputs: readonly unknown[];
}

/** `body` as a record's shape, or `null`: not one this store keeps. */
export function recordShape(body: unknown): RecordShape | null {
  if (typeof body !== "object" || body === null) return null;
  const r = body as Record<string, unknown>;
  if (r.version !== 1) return null;
  if (typeof r.roomId !== "string" || !/^[A-Za-z0-9]{1,16}$/.test(r.roomId)) return null;
  if (typeof r.gameNumber !== "number" || !Number.isInteger(r.gameNumber) || r.gameNumber < 1) return null;
  if (!Array.isArray(r.inputs) || r.inputs.length === 0 || r.inputs.length > MAX_KEPT_INPUTS) return null;
  const from = r.from ?? 0;
  if (typeof from !== "number" || !Number.isInteger(from) || from < 0 || from > MAX_KEPT_INPUTS) return null;
  const config = r.config;
  if (from === 0 || config !== undefined) {
    if (typeof config !== "object" || config === null) return null;
    if (!Array.isArray((config as Record<string, unknown>).decks)) return null;
  }
  if (typeof r.end !== "object" || r.end === null) return null;
  return body as RecordShape;
}

/** The record kept at `path`, or `null` if it can't be read. */
function keptAt(path: string): (Record<string, unknown> & { inputs: unknown[] }) | null {
  try {
    const kept = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) as Record<string, unknown>;
    return Array.isArray(kept.inputs) ? (kept as Record<string, unknown> & { inputs: unknown[] }) : null;
  } catch {
    return null;
  }
}

interface StoredFile {
  readonly path: string;
  readonly bytes: number;
  readonly mtimeMs: number;
}

export class GameStore {
  readonly dir: string;
  private readonly maxBytes: number;
  private readonly minFreeBytes: number;
  private readonly disk: () => { readonly free: number; readonly total: number } | null;
  private readonly now: () => number;
  /** What the folder holds, oldest first: read once, then kept in step. */
  private files: StoredFile[] | null = null;
  /** Posts this hour, by address. Not kept anywhere else. */
  private posts = new Map<string, number>();
  private postsHour = -1;

  constructor(config: GameStoreConfig) {
    this.dir = config.dir;
    this.maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES;
    this.minFreeBytes = config.minFreeBytes ?? DEFAULT_MIN_FREE_BYTES;
    this.disk =
      config.disk ??
      ((): { free: number; total: number } | null => {
        try {
          // The folder itself once it exists, its parent until then.
          const at = statfsSync(existsSync(this.dir) ? this.dir : join(this.dir, ".."));
          return { free: at.bavail * at.bsize, total: at.blocks * at.bsize };
        } catch {
          return null;
        }
      });
    this.now = config.now ?? Date.now;
  }

  /** Whether `ip` may post another record this hour (and counts it). */
  admits(ip: string): boolean {
    const hour = Math.floor(this.now() / 3_600_000);
    if (hour !== this.postsHour) {
      this.postsHour = hour;
      this.posts = new Map();
    }
    const count = this.posts.get(ip) ?? 0;
    if (count >= GAMES_PER_HOUR) return false;
    this.posts.set(ip, count + 1);
    return true;
  }

  private scan(): StoredFile[] {
    if (this.files !== null) return this.files;
    const files: StoredFile[] = [];
    if (existsSync(this.dir)) {
      for (const day of readdirSync(this.dir, { withFileTypes: true })) {
        if (!day.isDirectory()) continue;
        for (const name of readdirSync(join(this.dir, day.name))) {
          if (!name.endsWith(".json.gz")) continue;
          const path = join(this.dir, day.name, name);
          const stat = statSync(path);
          files.push({ path, bytes: stat.size, mtimeMs: stat.mtimeMs });
        }
      }
    }
    files.sort((a, b) => a.mtimeMs - b.mtimeMs);
    this.files = files;
    return files;
  }

  /** How many records are kept, and their size on disk. */
  stats(): { readonly games: number; readonly bytes: number } {
    const files = this.scan();
    return { games: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0) };
  }

  /**
   * How the store stands, read from the folder afresh (another thread's
   * store writes here too, and a pull deletes): how much is kept, how much
   * room there is, how fast it is filling, and whether it is time to fetch
   * the games away.
   */
  report(): GameStoreReport {
    this.files = null;
    const files = this.scan();
    const now = this.now();
    const bytes = files.reduce((n, f) => n + f.bytes, 0);
    const disk = this.disk();
    const room = disk === null ? this.maxBytes : Math.max(0, Math.min(this.maxBytes, bytes + disk.free - this.minFreeBytes));
    const full = room > 0 ? bytes / room : bytes > 0 ? 1 : 0;
    const week = files.filter((f) => now - f.mtimeMs <= 7 * 86_400_000);
    const span = week.length === 0 ? 1 : Math.min(7, Math.max(1, (now - week[0]!.mtimeMs) / 86_400_000));
    return {
      games: files.length,
      bytes,
      maxBytes: this.maxBytes,
      room,
      full,
      oldest: files[0]?.mtimeMs ?? null,
      newest: files[files.length - 1]?.mtimeMs ?? null,
      perDay: week.reduce((n, f) => n + f.bytes, 0) / span,
      disk,
      minFreeBytes: this.minFreeBytes,
      transfer: full >= TRANSFER_NOW_AT ? "now" : full >= TRANSFER_SOON_AT ? "soon" : "no",
      players: this.players(),
    };
  }

  /** One more game begun under `tag` on `day`, in the tally. Never throws:
   * the tally is a count beside the records, not one of them. */
  private notePlayer(day: string, tag: string): void {
    try {
      const folder = join(this.dir, PLAYERS_DIR);
      mkdirSync(folder, { recursive: true });
      const path = join(folder, `${day}.json`);
      const first = !existsSync(path);
      const tally = first ? {} : (JSON.parse(readFileSync(path, "utf8")) as Record<string, number>);
      tally[tag] = (tally[tag] ?? 0) + 1;
      writeFileSync(path, JSON.stringify(tally));
      // A new day's file: the oldest ones go.
      if (first) {
        const days = readdirSync(folder).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort();
        for (const old of days.slice(0, Math.max(0, days.length - PLAYER_DAYS_KEPT))) unlinkSync(join(folder, old));
      }
    } catch (error) {
      console.error("game store: couldn't note a player", error);
    }
  }

  /** The tally read back (`PlayersReport`). */
  players(): PlayersReport {
    const now = this.now();
    const tallies: { day: string; tally: Record<string, number> }[] = [];
    try {
      const folder = join(this.dir, PLAYERS_DIR);
      if (existsSync(folder)) {
        for (const name of readdirSync(folder)) {
          if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(name)) continue;
          try {
            const tally = JSON.parse(readFileSync(join(folder, name), "utf8")) as Record<string, number>;
            tallies.push({ day: name.slice(0, 10), tally });
          } catch {
            // A file half written: left out.
          }
        }
      }
    } catch {
      // No tally to read: nothing counted.
    }
    tallies.sort((a, b) => (a.day < b.day ? 1 : -1));
    const within: Record<number, number> = {};
    for (const days of PLAYER_WINDOWS) {
      const from = dayOf(now - (days - 1) * 86_400_000);
      const tags = new Set<string>();
      for (const { day, tally } of tallies) if (day >= from) for (const tag of Object.keys(tally)) tags.add(tag);
      within[days] = tags.size;
    }
    return {
      within,
      byDay: tallies.map(({ day, tally }) => ({
        day,
        players: Object.keys(tally).length,
        games: Object.values(tally).reduce((n, games) => n + games, 0),
      })),
    };
  }

  /**
   * Keeps one record, with `extra` (when it came, from which country) beside
   * it. Returns the file written, or `null`: not a record, or one already
   * kept (the same room, game and seed on the same day) with as much of the
   * game in it. A browser hands a game over as it goes, so a longer record of
   * a game replaces the shorter one. Never throws.
   */
  write(body: unknown, extra: Readonly<Record<string, string | number>> = {}): string | null {
    return this.take(body, extra)?.path ?? null;
  }

  /**
   * Takes a record or a part of one (`game-record.ts`'s `GameRecordPart`) and
   * says how many of the game's inputs are now kept (`have`), with the file
   * written if one was (`path`). `null`: not a record at all.
   *
   * A whole record (`from` 0) is kept unless what is here already holds as
   * much. A part goes after what is kept: its inputs from `from` on replace
   * anything past there (they are the same game's, so the same inputs) and
   * its `end` and `seats` replace the old ones. A part whose `from` is past
   * what is kept can't be placed (the file was fetched away, or dropped for
   * room): nothing is written, and `have` tells the sender where to start
   * again. The file is looked for under today and yesterday, so a game
   * played across midnight UTC stays one file. Never throws.
   */
  take(
    body: unknown,
    extra: Readonly<Record<string, string | number>> = {},
  ): { readonly have: number; readonly path: string | null } | null {
    const shape = recordShape(body);
    if (shape === null) return null;
    try {
      const now = this.now();
      const from = shape.from ?? 0;
      const seedOf = typeof shape.seed === "number" ? shape.seed : shape.config?.seed;
      const name = `${shape.roomId}-${shape.gameNumber}-${typeof seedOf === "number" ? String(seedOf) : "noseed"}.json.gz`;
      const today = join(this.dir, dayOf(now), name);
      const yesterday = join(this.dir, dayOf(now - 86_400_000), name);
      const path = existsSync(today) ? today : existsSync(yesterday) ? yesterday : today;
      const kept = existsSync(path) ? keptAt(path) : null;
      const held = kept?.inputs.length ?? 0;
      // Nothing to add: a whole record no longer than what is here, a part
      // that can't be placed, or one that ends inside what is kept.
      if (from === 0 ? shape.inputs.length <= held : from > held || from + shape.inputs.length <= held) {
        return { have: held, path: null };
      }
      if (from + shape.inputs.length > MAX_KEPT_INPUTS) return { have: held, path: null };
      // A tag is kept only in its own shape: the one field of a record that
      // is about the sender, so nothing else may ride in it.
      const { from: _from, tag: sent, ...rest } = shape as RecordShape & { readonly tag?: unknown };
      // The one sent, or the one already kept: a part or a whole record that
      // comes without a tag (sent before the page had said it) leaves the
      // game's tag where it is.
      const keptTag = (existing: Record<string, unknown> | null): string | undefined =>
        typeof sent === "string" && PLAYER_TAG.test(sent)
          ? sent
          : typeof existing?.tag === "string" && PLAYER_TAG.test(existing.tag)
            ? existing.tag
            : undefined;
      const tagNow = keptTag(kept);
      const tag = tagNow !== undefined ? { tag: tagNow } : {};
      const whole =
        from === 0 || kept === null
          ? { ...rest, ...tag, received: now, ...extra }
          : { ...kept, ...rest, ...tag, config: kept.config, inputs: [...kept.inputs.slice(0, from), ...shape.inputs], received: now, ...extra };
      const files = this.scan();
      const at = files.findIndex((f) => f.path === path);
      if (at >= 0) files.splice(at, 1);
      mkdirSync(join(path, ".."), { recursive: true });
      const data = gzipSync(Buffer.from(JSON.stringify(whole), "utf8"));
      writeFileSync(path, data);
      files.push({ path, bytes: data.length, mtimeMs: now });
      // The tally of who posted (`players`): once a game, as its tag first
      // comes (with its first part, or a later one).
      if (tagNow !== undefined && kept?.tag !== tagNow) this.notePlayer(dayOf(now), tagNow);
      this.prune();
      return { have: (whole.inputs as readonly unknown[]).length, path };
    } catch (error) {
      console.error("game store: couldn't keep a record", error);
      return null;
    }
  }

  /** Drops the oldest files until the folder is within its size. */
  private prune(): void {
    // Short of room on the disk itself counts as over, by as much as it is short.
    const short = (): number => {
      const disk = this.disk();
      return disk === null ? 0 : Math.max(0, this.minFreeBytes - disk.free);
    };
    let over = short();
    if (over === 0 && this.scan().reduce((n, f) => n + f.bytes, 0) <= this.maxBytes) return;
    // Over: read the folder again first. Files go without this store knowing
    // (a pull, another thread's store), and it must not delete on a stale count.
    this.files = null;
    const files = this.scan();
    let total = files.reduce((n, f) => n + f.bytes, 0);
    while ((total > this.maxBytes || over > 0) && files.length > 1) {
      const oldest = files.shift()!;
      total -= oldest.bytes;
      over -= oldest.bytes;
      try {
        unlinkSync(oldest.path);
        // The day's folder too, once it is empty.
        const folder = join(oldest.path, "..");
        if (readdirSync(folder).length === 0) rmdirSync(folder);
      } catch {
        // Already gone (pulled meanwhile): nothing to free.
      }
    }
  }

  /** Forgets what it read of the folder: something else changed it (a pull). */
  rescan(): void {
    this.files = null;
  }
}

const size = (bytes: number): string =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
    : bytes >= 1024 ** 2
      ? `${(bytes / 1024 ** 2).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

/** A `GameStoreReport` as the status port prints it (`GET /games`). */
export function renderGamesReport(r: GameStoreReport): string {
  const day = (ms: number | null): string => (ms === null ? "—" : new Date(ms).toISOString().slice(0, 10));
  const left = r.room - r.bytes;
  const lines = [
    "Kept games",
    `  games      ${r.games} file(s), ${size(r.bytes)}${r.games > 0 ? ` (${size(r.bytes / r.games)} a game)` : ""}`,
    `  from       ${day(r.oldest)} to ${day(r.newest)}`,
    `  room       ${(r.full * 100).toFixed(r.full < 0.1 ? 2 : 0)}% of ${size(r.room)} used` +
      (r.room < r.maxBytes ? ` (the folder's limit is ${size(r.maxBytes)}; the disk allows less)` : ""),
    `  filling    ${size(r.perDay)} a day` +
      (r.perDay <= 0 || left <= 0
        ? ""
        : left / r.perDay > 730
          ? ": years from full at that rate"
          : `: full in about ${Math.max(1, Math.round(left / r.perDay))} day(s) at that rate`),
    r.disk === null
      ? "  disk       unknown"
      : `  disk       ${size(r.disk.free)} free of ${size(r.disk.total)} (the store leaves ${size(r.minFreeBytes)} free)`,
    r.transfer === "now"
      ? "  transfer   NOW: over four fifths full, and at full the oldest games are deleted (npm run games:pull)"
      : r.transfer === "soon"
        ? "  transfer   soon: over half full (npm run games:pull)"
        : "  transfer   not needed for room; fetch them when there is a game to look at (npm run games:pull)",
    "Players (different browsers that posted a game, by tag; a table's and the server's own rooms' games carry none)",
    `  unique     ${PLAYER_WINDOWS.map((days) => `${r.players.within[days] ?? 0} ${days === 1 ? "today" : `in ${days} days`}`).join(", ")}`,
    ...r.players.byDay.slice(0, 14).map((d) => `  ${d.day} ${String(d.players).padStart(4)} player(s), ${String(d.games).padStart(4)} game(s)`),
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * `POST /games`: one finished game's record, from a page's room worker. Sent
 * blind, like a usage event (a text body, so no preflight; the answer is
 * always 204 and says nothing). Returns whether the request was this route's.
 */
export function handleGamesRoute(
  req: IncomingMessage,
  res: ServerResponse,
  store: GameStore | null,
  ipOf: (req: IncomingMessage) => string,
  clientOrigin: string,
): boolean {
  if (req.url !== "/games") return false;
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": clientOrigin,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true;
  }
  if (req.method !== "POST") return false;
  // 204: nothing to say (not a record, too many posts, records off). 200:
  // how many of the game's inputs are kept now, which the page's worker
  // sends on from (`GameRecorder.acked`).
  const done = (have?: number): void => {
    if (res.headersSent) return;
    if (have === undefined) {
      res.writeHead(204, { "Access-Control-Allow-Origin": clientOrigin });
      res.end();
      return;
    }
    res.writeHead(200, { "Access-Control-Allow-Origin": clientOrigin, "Content-Type": "application/json" });
    res.end(JSON.stringify({ have }));
  };
  const chunks: Buffer[] = [];
  let size = 0;
  req.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size <= GAME_BODY_LIMIT) chunks.push(chunk);
    else chunks.length = 0;
  });
  req.on("error", () => done());
  req.on("end", () => {
    if (store === null || size > GAME_BODY_LIMIT || !store.admits(ipOf(req))) return done();
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return done();
    }
    const country = countryOf(req);
    done(store.take(body, country !== null ? { country } : {})?.have);
  });
  return true;
}
