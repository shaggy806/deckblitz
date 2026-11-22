/**
 * Who uses the site and what for, kept on the box and nowhere else: visits,
 * games, deck imports and the page's own errors, as small anonymous events
 * the client posts (`POST /usage`, `client/src/usage.ts`), appended to one
 * JSON-lines file a day (`usage/<YYYY-MM-DD>.jsonl` at the repo root, UTC
 * days; `USAGE_DIR` moves it, `USAGE=0` turns it off) and read back as a
 * report on the operator's loopback port (`curl localhost:4010/usage`,
 * `status-server.ts`). Main-side: no engine.
 *
 * The client reports because the server can't see most of it: the pages are
 * static files served by Caddy, and a solo game runs in the player's browser
 * (`docs/plans/local-rooms.md`). So everything arrives by one door, which
 * anyone can knock on: a body is capped, an event is one of
 * {@link USAGE_KINDS} with a few short flat fields ({@link cleanEvent}), a
 * visitor is rate-limited, and a day's file stops growing at
 * {@link DAY_BYTES_LIMIT}. The numbers are for the operator's eyes; nothing
 * in the game reads them.
 *
 * ## No identifiers
 *
 * No cookie, no stored id, no IP on disk. A visitor is the first 12 hex
 * digits of SHA-256 over the day's random salt, their IP and their user
 * agent: the same person counts once a day, and can't be followed from one
 * day to the next or traced back, since the salt is thrown away when the day
 * ends (it's kept in `<dir>/.salt.json` so a restart doesn't split a day).
 * "New or returning" is the page's own flag (`localStorage`), not an id.
 */

import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";

/** The events the client may report. */
export const USAGE_KINDS = ["view", "game-start", "game-end", "import", "import-failed", "error"] as const;
export type UsageKind = (typeof USAGE_KINDS)[number];

/** A field's value: short text, a number, a flag, or a short list of short
 * texts (card names). */
export type UsageValue = string | number | boolean | readonly string[];

/** One line of a day's file. */
export interface UsageEvent {
  /** When it arrived, ms since the epoch. */
  readonly t: number;
  /** The day's anonymous visitor (see the module comment). */
  readonly v: string;
  readonly kind: UsageKind;
  readonly [field: string]: UsageValue;
}

/** A request body past this is refused: an event is a few hundred bytes. */
export const USAGE_BODY_LIMIT = 8 * 1024;
/** A day's file stops taking events here, so a flood can't fill the disk. */
export const DAY_BYTES_LIMIT = 20 * 1024 * 1024;
/** Events one visitor may send a minute; a visit sends a handful. */
export const EVENTS_PER_MINUTE = 60;

const MAX_FIELDS = 16;
const MAX_TEXT = 300;
const MAX_LIST = 60;
const MAX_LIST_TEXT = 120;
/** Field names an event can't use: the log's own. */
const RESERVED = new Set(["t", "v", "kind"]);

/**
 * What a posted body may put in the log: its `kind` if it's one of ours, and
 * up to {@link MAX_FIELDS} flat fields with plain names, text cut to length,
 * finite numbers, flags, and lists of text cut the same way. `null` for
 * anything that isn't an event at all.
 */
export function cleanEvent(body: unknown): { readonly kind: UsageKind; readonly fields: Record<string, UsageValue> } | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  const kind = (body as { kind?: unknown }).kind;
  if (typeof kind !== "string" || !(USAGE_KINDS as readonly string[]).includes(kind)) return null;
  const fields: Record<string, UsageValue> = {};
  let kept = 0;
  for (const [name, value] of Object.entries(body)) {
    if (RESERVED.has(name) || !/^[a-zA-Z][a-zA-Z0-9]{0,23}$/.test(name)) continue;
    if (kept >= MAX_FIELDS) break;
    if (typeof value === "string") fields[name] = value.slice(0, MAX_TEXT);
    else if (typeof value === "number" && Number.isFinite(value)) fields[name] = value;
    else if (typeof value === "boolean") fields[name] = value;
    else if (Array.isArray(value)) {
      fields[name] = value
        .filter((item): item is string => typeof item === "string")
        .slice(0, MAX_LIST)
        .map((item) => item.slice(0, MAX_LIST_TEXT));
    } else continue;
    kept++;
  }
  return { kind: kind as UsageKind, fields };
}

/** A day as its file is named: `YYYY-MM-DD`, UTC. */
export const dayOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

export interface UsageLogConfig {
  readonly dir: string;
  /** The clock, for tests. */
  readonly now?: () => number;
}

/** The usage files in one folder: appends events, reads days back. */
export class UsageLog {
  private readonly dir: string;
  private readonly now: () => number;
  private salt: { day: string; salt: string } | null = null;
  private readonly sent = new Map<string, { count: number; resetAt: number }>();
  /** The day whose file is full, so each further event isn't a `stat`. */
  private fullDay: string | null = null;

  constructor(config: UsageLogConfig) {
    this.dir = config.dir;
    this.now = config.now ?? Date.now;
  }

  /** Today's anonymous name for whoever sent a request from `ip` with this
   * user agent. */
  visitor(ip: string, userAgent: string): string {
    return createHash("sha256").update(`${this.daySalt()}\n${ip}\n${userAgent}`).digest("hex").slice(0, 12);
  }

  /**
   * Appends one event for `visitor`. `false` when it was dropped: the
   * visitor is over their rate, or the day's file is full. Never throws: a
   * disk that can't be written costs the numbers, not the server.
   */
  record(visitor: string, kind: UsageKind, fields: Record<string, UsageValue>): boolean {
    const now = this.now();
    if (this.overRate(visitor, now)) return false;
    const day = dayOf(now);
    if (this.fullDay === day) return false;
    const file = join(this.dir, `${day}.jsonl`);
    try {
      mkdirSync(this.dir, { recursive: true });
      if (existsSync(file) && statSync(file).size >= DAY_BYTES_LIMIT) {
        this.fullDay = day;
        return false;
      }
      const event: UsageEvent = { ...fields, t: now, v: visitor, kind };
      appendFileSync(file, `${JSON.stringify(event)}\n`);
      return true;
    } catch {
      return false;
    }
  }

  /** The last `days` days' events, oldest day first, today included; a day
   * with no file is an empty list. A line that doesn't parse is skipped. */
  read(days: number): { readonly day: string; readonly events: readonly UsageEvent[] }[] {
    const out: { day: string; events: UsageEvent[] }[] = [];
    const now = this.now();
    for (let back = days - 1; back >= 0; back--) {
      const day = dayOf(now - back * 86_400_000);
      const events: UsageEvent[] = [];
      try {
        for (const line of readFileSync(join(this.dir, `${day}.jsonl`), "utf8").split("\n")) {
          if (line === "") continue;
          try {
            events.push(JSON.parse(line) as UsageEvent);
          } catch {
            // A torn line (the process died mid-append).
          }
        }
      } catch {
        // No file: nobody came, or the log started later.
      }
      out.push({ day, events });
    }
    return out;
  }

  /** The days there are files for, oldest first. */
  days(): string[] {
    try {
      return readdirSync(this.dir)
        .filter((name) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
        .map((name) => name.slice(0, 10))
        .sort();
    } catch {
      return [];
    }
  }

  private daySalt(): string {
    const day = dayOf(this.now());
    if (this.salt?.day === day) return this.salt.salt;
    const file = join(this.dir, ".salt.json");
    try {
      const kept = JSON.parse(readFileSync(file, "utf8")) as { day?: unknown; salt?: unknown };
      if (kept.day === day && typeof kept.salt === "string") {
        this.salt = { day, salt: kept.salt };
        return kept.salt;
      }
    } catch {
      // None yet, or yesterday's.
    }
    this.salt = { day, salt: randomBytes(16).toString("hex") };
    try {
      mkdirSync(this.dir, { recursive: true });
      writeFileSync(file, JSON.stringify(this.salt));
    } catch {
      // Kept in memory only: a restart today counts today's visitors again.
    }
    return this.salt.salt;
  }

  private overRate(visitor: string, now: number): boolean {
    if (this.sent.size > 10_000) {
      for (const [key, entry] of this.sent) if (entry.resetAt <= now) this.sent.delete(key);
    }
    const entry = this.sent.get(visitor);
    if (entry === undefined || entry.resetAt <= now) {
      this.sent.set(visitor, { count: 1, resetAt: now + 60_000 });
      return false;
    }
    entry.count++;
    return entry.count > EVENTS_PER_MINUTE;
  }
}

/**
 * Handles `POST /usage` (and its CORS preflight), or returns `false` for any
 * other request. Always answers 204 once it has read the body, recorded or
 * not: the page sends these blind and reads nothing back. With `log` null
 * (usage turned off) the event is dropped the same way.
 */
export function handleUsageRoute(
  req: IncomingMessage,
  res: ServerResponse,
  log: UsageLog | null,
  ipOf: (req: IncomingMessage) => string,
  clientOrigin: string,
): boolean {
  if (req.url !== "/usage") return false;
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
  const done = (): void => {
    if (res.headersSent) return;
    res.writeHead(204, { "Access-Control-Allow-Origin": clientOrigin });
    res.end();
  };
  const chunks: Buffer[] = [];
  let size = 0;
  req.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size <= USAGE_BODY_LIMIT) chunks.push(chunk);
  });
  req.on("error", done);
  req.on("end", () => {
    done();
    if (log === null || size > USAGE_BODY_LIMIT) return;
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return;
    }
    const event = cleanEvent(body);
    if (event === null) return;
    const agent = req.headers["user-agent"];
    log.record(log.visitor(ipOf(req), typeof agent === "string" ? agent : ""), event.kind, event.fields);
  });
  return true;
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

const text = (value: UsageValue | undefined, fallback = "?"): string =>
  typeof value === "string" && value !== "" ? value : fallback;
const list = (value: UsageValue | undefined): readonly string[] => (Array.isArray(value) ? value : []);
const num = (value: UsageValue | undefined): number | null => (typeof value === "number" ? value : null);

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Counts by key, most first (ties by name). */
function tally(keys: Iterable<string>): [string, number][] {
  const counts = new Map<string, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** One day's headline numbers. */
export interface UsageDay {
  readonly day: string;
  /** Distinct visitors (anonymous, per day). */
  readonly visitors: number;
  /** Of those, how many said it was their first visit. */
  readonly newVisitors: number;
  readonly views: number;
  /** Games begun. A game with several people in it is reported by each, so
   * each report counts for one over the humans in it. */
  readonly games: number;
  readonly gamesFinished: number;
  readonly imports: number;
  readonly errors: number;
}

export interface UsageSummary {
  readonly days: readonly UsageDay[];
  /** Distinct visitors a day, added up: one person on three days is three. */
  readonly visitorDays: number;
  readonly pages: readonly [string, number][];
  readonly referrers: readonly [string, number][];
  readonly modes: readonly [string, number][];
  readonly outcomes: readonly [string, number][];
  readonly medianGameMinutes: number | null;
  readonly medianGameTurns: number | null;
  readonly commanders: readonly [string, number][];
  /** Cards people's lists had that the engine doesn't. */
  readonly missingCards: readonly [string, number][];
  readonly importFailures: readonly [string, number][];
  readonly errors: readonly [string, number][];
  readonly screens: readonly [string, number][];
  readonly medianLoadMs: number | null;
}

/** A game's share of one report of it: one over the people at the table. */
const share = (event: UsageEvent): number => 1 / Math.max(1, num(event.humans) ?? 1);

/** The report's numbers over some days of events ({@link UsageLog.read}). */
export function summarizeUsage(days: readonly { readonly day: string; readonly events: readonly UsageEvent[] }[]): UsageSummary {
  const all = days.flatMap((d) => d.events);
  const of = (kind: UsageKind): UsageEvent[] => all.filter((e) => e.kind === kind);
  const round1 = (n: number): number => Math.round(n * 10) / 10;
  const views = of("view");
  const ends = of("game-end");
  return {
    days: days.map(({ day, events }) => {
      const dayViews = events.filter((e) => e.kind === "view");
      return {
        day,
        visitors: new Set(events.map((e) => e.v)).size,
        newVisitors: new Set(dayViews.filter((e) => e.firstVisit === true).map((e) => e.v)).size,
        views: dayViews.length,
        games: round1(events.filter((e) => e.kind === "game-start").reduce((sum, e) => sum + share(e), 0)),
        gamesFinished: round1(events.filter((e) => e.kind === "game-end").reduce((sum, e) => sum + share(e), 0)),
        imports: events.filter((e) => e.kind === "import").length,
        errors: events.filter((e) => e.kind === "error").length,
      };
    }),
    visitorDays: days.reduce((sum, { events }) => sum + new Set(events.map((e) => e.v)).size, 0),
    pages: tally(views.map((e) => text(e.page))),
    referrers: tally(views.map((e) => text(e.referrer, "")).filter((r) => r !== "")),
    modes: tally(of("game-start").map((e) => `${text(e.mode)}, ${num(e.players) ?? "?"} players`)),
    outcomes: tally(ends.map((e) => text(e.outcome))),
    medianGameMinutes: median(ends.map((e) => num(e.minutes)).filter((n): n is number => n !== null)),
    medianGameTurns: median(ends.map((e) => num(e.turns)).filter((n): n is number => n !== null)),
    commanders: tally(of("import").flatMap((e) => list(e.commanders))),
    missingCards: tally(of("import").flatMap((e) => list(e.missing))),
    importFailures: tally(of("import-failed").map((e) => text(e.message))),
    errors: tally(of("error").map((e) => `${text(e.message)}  [${text(e.page)}${e.at !== undefined ? `, ${text(e.at)}` : ""}]`)),
    screens: tally(views.map((e) => text(e.screen))),
    medianLoadMs: median(views.map((e) => num(e.loadMs)).filter((n): n is number => n !== null)),
  };
}

/** The summary as the plain text `curl localhost:4010/usage` prints. */
export function renderUsage(summary: UsageSummary, top = 20): string {
  const lines: string[] = [];
  const first = summary.days[0]?.day ?? "";
  const last = summary.days[summary.days.length - 1]?.day ?? "";
  lines.push(`Deck Blitz usage, ${first} to ${last} (UTC days)`, "");
  const cols = ["DAY       ", "VISITORS", "NEW", "VIEWS", "GAMES", "FINISHED", "IMPORTS", "ERRORS"];
  lines.push(`  ${cols.join("  ")}`);
  const cell = (value: string | number, width: number): string => String(value).padStart(width);
  for (const d of summary.days) {
    lines.push(
      `  ${[
        d.day,
        cell(d.visitors, 8),
        cell(d.newVisitors, 3),
        cell(d.views, 5),
        cell(d.games, 5),
        cell(d.gamesFinished, 8),
        cell(d.imports, 7),
        cell(d.errors, 6),
      ].join("  ")}`,
    );
  }
  const total = (pick: (d: UsageDay) => number): number => Math.round(summary.days.reduce((sum, d) => sum + pick(d), 0) * 10) / 10;
  lines.push(
    `  ${[
      "total     ",
      cell(summary.visitorDays, 8),
      cell(total((d) => d.newVisitors), 3),
      cell(total((d) => d.views), 5),
      cell(total((d) => d.games), 5),
      cell(total((d) => d.gamesFinished), 8),
      cell(total((d) => d.imports), 7),
      cell(total((d) => d.errors), 6),
    ].join("  ")}`,
    "  (visitors are counted per day: one person on three days is three)",
    "",
  );
  const section = (title: string, rows: readonly [string, number][]): void => {
    if (rows.length === 0) return;
    lines.push(title);
    for (const [name, count] of rows.slice(0, top)) lines.push(`  ${String(count).padStart(6)}  ${name}`);
    if (rows.length > top) lines.push(`          … and ${rows.length - top} more`);
    lines.push("");
  };
  section("PAGES OPENED", summary.pages);
  section("CAME FROM", summary.referrers);
  section("GAMES STARTED (each player's report)", summary.modes);
  section("HOW GAMES ENDED (each player's report)", summary.outcomes);
  if (summary.medianGameMinutes !== null || summary.medianGameTurns !== null) {
    lines.push(
      `  a finished game: ${summary.medianGameMinutes?.toFixed(0) ?? "?"} minutes, ${summary.medianGameTurns?.toFixed(0) ?? "?"} turns (medians)`,
      "",
    );
  }
  section("COMMANDERS IMPORTED", summary.commanders);
  section("CARDS IMPORTED THAT THE ENGINE LACKS", summary.missingCards);
  section("IMPORTS THAT FAILED", summary.importFailures);
  section("ERRORS ON THE PAGE", summary.errors);
  section("WINDOW SIZES", summary.screens.slice(0, 8));
  if (summary.medianLoadMs !== null) lines.push(`  page ready in ${Math.round(summary.medianLoadMs)} ms (median)`, "");
  return `${lines.join("\n")}\n`;
}
