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
 * who played: no address, no visitor id, only the country Cloudflare says the
 * post came from. The About page says games are kept.
 *
 * **It can't fill the disk.** A post is at most `GAME_BODY_LIMIT`, an address
 * may post `GAMES_PER_HOUR`, and once the folder holds `maxBytes` the oldest
 * files go first. `npm run games:pull` on the operator's machine copies the
 * files over SSH and deletes them here.
 *
 * Main-side: nothing here imports the engine (`test/main-imports.test.ts`).
 * A record is checked for its shape only; whether it is a real game is for
 * whoever plays it again.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync, rmdirSync } from "node:fs";
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
/** What the folder may hold before the oldest files go: 1 GB, some 20,000
 * games. */
export const DEFAULT_MAX_BYTES = 1024 * 1024 * 1024;

export interface GameStoreConfig {
  readonly dir: string;
  readonly maxBytes?: number;
  readonly now?: () => number;
}

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
  private readonly now: () => number;
  /** What the folder holds, oldest first: read once, then kept in step. */
  private files: StoredFile[] | null = null;
  /** Posts this hour, by address. Not kept anywhere else. */
  private posts = new Map<string, number>();
  private postsHour = -1;

  constructor(config: GameStoreConfig) {
    this.dir = config.dir;
    this.maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES;
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
      const { from: _from, ...rest } = shape;
      const whole =
        from === 0 || kept === null
          ? { ...rest, received: now, ...extra }
          : { ...kept, ...rest, config: kept.config, inputs: [...kept.inputs.slice(0, from), ...shape.inputs], received: now, ...extra };
      const files = this.scan();
      const at = files.findIndex((f) => f.path === path);
      if (at >= 0) files.splice(at, 1);
      mkdirSync(join(path, ".."), { recursive: true });
      const data = gzipSync(Buffer.from(JSON.stringify(whole), "utf8"));
      writeFileSync(path, data);
      files.push({ path, bytes: data.length, mtimeMs: now });
      this.prune();
      return { have: (whole.inputs as readonly unknown[]).length, path };
    } catch (error) {
      console.error("game store: couldn't keep a record", error);
      return null;
    }
  }

  /** Drops the oldest files until the folder is within its size. */
  private prune(): void {
    if (this.scan().reduce((n, f) => n + f.bytes, 0) <= this.maxBytes) return;
    // Over: read the folder again first. Files go without this store knowing
    // (a pull, another thread's store), and it must not delete on a stale count.
    this.files = null;
    const files = this.scan();
    let total = files.reduce((n, f) => n + f.bytes, 0);
    while (total > this.maxBytes && files.length > 1) {
      const oldest = files.shift()!;
      total -= oldest.bytes;
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
