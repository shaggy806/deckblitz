import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  EVENTS_PER_MINUTE,
  UsageLog,
  cleanEvent,
  handleUsageRoute,
  renderUsage,
  summarizeUsage,
} from "../usage.js";

const dirs: string[] = [];
const tempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "usage-test-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const DAY = 86_400_000;
const NOON = Date.UTC(2026, 10, 21, 12);

describe("cleanEvent", () => {
  it("keeps a known kind's short flat fields and drops the rest", () => {
    const event = cleanEvent({
      kind: "view",
      page: "landing",
      loadMs: 420,
      firstVisit: true,
      missing: ["Sol Ring", 7, "x".repeat(500)],
      nested: { a: 1 },
      t: 1,
      v: "spoofed",
      "bad name": "x",
      long: "y".repeat(1000),
    });
    expect(event?.kind).toBe("view");
    expect(event?.fields).toEqual({
      page: "landing",
      loadMs: 420,
      firstVisit: true,
      missing: ["Sol Ring", "x".repeat(120)],
      long: "y".repeat(300),
    });
  });

  it("refuses what isn't an event", () => {
    expect(cleanEvent(null)).toBeNull();
    expect(cleanEvent([])).toBeNull();
    expect(cleanEvent({ kind: "drop-table" })).toBeNull();
    expect(cleanEvent({ page: "landing" })).toBeNull();
  });
});

describe("UsageLog", () => {
  it("names a visitor the same all day and differently the next, with no IP on disk", () => {
    const dir = tempDir();
    let now = NOON;
    const log = new UsageLog({ dir, now: () => now });
    const today = log.visitor("203.0.113.9", "Firefox");
    expect(log.visitor("203.0.113.9", "Firefox")).toBe(today);
    expect(log.visitor("203.0.113.10", "Firefox")).not.toBe(today);
    // A restart the same day reads the day's salt back.
    expect(new UsageLog({ dir, now: () => now }).visitor("203.0.113.9", "Firefox")).toBe(today);
    log.record(today, "view", { page: "landing" });
    now += DAY;
    expect(log.visitor("203.0.113.9", "Firefox")).not.toBe(today);
    for (const name of readdirSync(dir)) expect(readFileSync(join(dir, name), "utf8")).not.toContain("203.0.113");
  });

  it("writes a file a day and reads the days back in order", () => {
    const dir = tempDir();
    let now = NOON - DAY;
    const log = new UsageLog({ dir, now: () => now });
    log.record("aaa", "view", { page: "landing" });
    now = NOON;
    log.record("bbb", "view", { page: "library" });
    expect(log.days()).toEqual(["2026-11-20", "2026-11-21"]);
    const read = log.read(3);
    expect(read.map((d) => d.day)).toEqual(["2026-11-19", "2026-11-20", "2026-11-21"]);
    expect(read.map((d) => d.events.map((e) => e.page))).toEqual([[], ["landing"], ["library"]]);
  });

  it("drops a visitor's events past the rate, until the minute is over", () => {
    let now = NOON;
    const log = new UsageLog({ dir: tempDir(), now: () => now });
    for (let i = 0; i < EVENTS_PER_MINUTE; i++) expect(log.record("aaa", "view", {})).toBe(true);
    expect(log.record("aaa", "view", {})).toBe(false);
    expect(log.record("bbb", "view", {})).toBe(true);
    now += 61_000;
    expect(log.record("aaa", "view", {})).toBe(true);
  });
});

describe("the report", () => {
  it("counts visitors per day, a shared game once, and ranks what was imported", () => {
    const log = new UsageLog({ dir: tempDir(), now: () => NOON });
    log.record("aaa", "view", { page: "landing", firstVisit: true, referrer: "reddit.com", screen: "1920x1080", loadMs: 300 });
    log.record("aaa", "view", { page: "library", firstVisit: false, screen: "1920x1080", loadMs: 500 });
    log.record("bbb", "view", { page: "landing", firstVisit: false, screen: "1366x768", loadMs: 900 });
    // One two-person game, reported by both; one solo game, never finished.
    log.record("aaa", "game-start", { mode: "multiplayer", players: 4, humans: 2 });
    log.record("bbb", "game-start", { mode: "multiplayer", players: 4, humans: 2 });
    log.record("bbb", "game-start", { mode: "solo", players: 4, humans: 1 });
    log.record("aaa", "game-end", { mode: "multiplayer", humans: 2, outcome: "won", minutes: 30, turns: 12 });
    log.record("bbb", "game-end", { mode: "multiplayer", humans: 2, outcome: "lost", minutes: 30, turns: 12 });
    log.record("aaa", "import", { commanders: ["Atraxa, Praetors' Voice"], missing: ["Card A", "Card B"] });
    log.record("bbb", "import", { commanders: ["Atraxa, Praetors' Voice"], missing: ["Card B"] });
    log.record("bbb", "error", { message: "x is undefined", page: "room", at: "index-abc.js:1:2" });

    const summary = summarizeUsage(log.read(1));
    expect(summary.days).toEqual([
      { day: "2026-11-21", visitors: 2, newVisitors: 1, views: 3, games: 2, gamesFinished: 1, imports: 2, errors: 1 },
    ]);
    expect(summary.pages).toEqual([
      ["landing", 2],
      ["library", 1],
    ]);
    expect(summary.referrers).toEqual([["reddit.com", 1]]);
    expect(summary.commanders).toEqual([["Atraxa, Praetors' Voice", 2]]);
    expect(summary.missingCards).toEqual([
      ["Card B", 2],
      ["Card A", 1],
    ]);
    expect(summary.medianGameMinutes).toBe(30);
    expect(summary.medianLoadMs).toBe(500);

    const text = renderUsage(summary);
    expect(text).toContain("2026-11-21");
    expect(text).toContain("Atraxa, Praetors' Voice");
    expect(text).toContain("x is undefined  [room, index-abc.js:1:2]");
  });
});

describe("POST /usage", () => {
  const serve = async (log: UsageLog | null) => {
    const server = createServer((req, res) => {
      if (handleUsageRoute(req, res, log, () => "203.0.113.9", "*")) return;
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/usage`;
    return { url, close: () => new Promise((resolve) => server.close(resolve)) };
  };

  it("records a posted event, and answers 204 whatever it was sent", async () => {
    const log = new UsageLog({ dir: tempDir(), now: () => NOON });
    const { url, close } = await serve(log);
    try {
      const post = (body: string) => fetch(url, { method: "POST", body, headers: { "content-type": "text/plain" } });
      expect((await post(JSON.stringify({ kind: "view", page: "landing" }))).status).toBe(204);
      expect((await post("not json")).status).toBe(204);
      expect((await post(JSON.stringify({ kind: "nope" }))).status).toBe(204);
      expect((await post(JSON.stringify({ kind: "view", page: "x".repeat(20_000) }))).status).toBe(204);
      const events = log.read(1)[0]!.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ kind: "view", page: "landing", t: NOON });
      expect(events[0]!.v).toMatch(/^[0-9a-f]{12}$/);
    } finally {
      await close();
    }
  });

  it("notes the country Cloudflare names, never one the page claims", async () => {
    const log = new UsageLog({ dir: tempDir(), now: () => NOON });
    const { url, close } = await serve(log);
    try {
      const post = (headers: Record<string, string>) =>
        fetch(url, { method: "POST", body: JSON.stringify({ kind: "view", country: "ZZ" }), headers });
      await post({ "cf-ipcountry": "ca" });
      await post({});
      const events = log.read(1)[0]!.events;
      expect(events.map((e) => e.country)).toEqual(["CA", undefined]);
      expect(summarizeUsage(log.read(1)).countries).toEqual([["CA", 1]]);
    } finally {
      await close();
    }
  });

  it("drops the event when usage is off", async () => {
    const { url, close } = await serve(null);
    try {
      expect((await fetch(url, { method: "POST", body: JSON.stringify({ kind: "view" }) })).status).toBe(204);
    } finally {
      await close();
    }
  });
});
