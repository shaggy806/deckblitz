/**
 * The room code runs in a browser too: solo games played in the player's own
 * browser run the same `RoomService` in a Web Worker (`docs/plans/
 * local-rooms.md`). So everything the room code reaches imports values only
 * from `engine/local` (the engine without the card pool) and from itself —
 * never a Node built-in, `ws`, the `engine` barrel (which reaches every card
 * definition) or a Node-side server module (sockets, files, threads, the
 * status page). Node-only features come in from the hosts instead: capture as
 * a factory (`captureLogs`), the decision histogram as a recorder
 * (`bot-decisions.ts`), the card registry (`card-registry.ts`).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../", import.meta.url));

/** Where the room code starts: what a browser host constructs. */
const ENTRIES = ["local-host.ts", "room-service.ts", "room-manager.ts", "tutorial-session.ts", "builder.ts", "card-registry.ts"];

/** The server's Node side: the room code never imports these. */
const NODE_SIDE = new Set([
  "index.ts",
  "transport.ts",
  "ws-server.ts",
  "worker-host.ts",
  "shard.ts",
  "shard-worker.ts",
  "shard-protocol.ts",
  "loopback-channel.ts",
  "in-process-host.ts",
  "status.ts",
  "status-server.ts",
  "load-monitor.ts",
  "bot-decisions.ts",
  "capture.ts",
  "import-deck.ts",
  "import-route.ts",
  "card-data.ts",
  "oracle-tags.ts",
  "admission.ts",
]);

/** Packages the room code may import values from. */
const ALLOWED_PACKAGES = new Set(["engine/local"]);

/** Every static import's specifier, and whether it's type-only. */
function importsOf(source: string): { specifier: string; typeOnly: boolean }[] {
  const out: { specifier: string; typeOnly: boolean }[] = [];
  const statement = /^\s*(import|export)\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/gms;
  for (const m of source.matchAll(statement)) {
    const names = m[3];
    const allTyped =
      /^\{[^}]*\}$/s.test(names.trim()) &&
      names.replace(/[{}\s]/g, "").split(",").filter(Boolean).every((n) => n.startsWith("type"));
    out.push({ specifier: m[4], typeOnly: m[2] !== undefined || allTyped });
  }
  for (const m of source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) out.push({ specifier: m[1], typeOnly: false });
  return out;
}

/** Every module the entries' value imports reach, with each bad import found. */
function walk(entries: readonly string[]): { reached: Set<string>; bad: string[] } {
  const reached = new Set<string>();
  const bad: string[] = [];
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (reached.has(file)) continue;
    reached.add(file);
    for (const { specifier, typeOnly } of importsOf(readFileSync(path.join(SRC, file), "utf8"))) {
      if (typeOnly) continue;
      if (specifier.startsWith(".")) {
        const next = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier.replace(/\.js$/, ".ts")));
        if (NODE_SIDE.has(next)) bad.push(`${file} imports ${next}`);
        else if (existsSync(path.join(SRC, next))) queue.push(next);
      } else if (!ALLOWED_PACKAGES.has(specifier)) {
        bad.push(`${file} imports ${specifier}`);
      }
    }
  }
  return { reached, bad };
}

describe("the room code", () => {
  const { reached, bad } = walk(ENTRIES);

  it("imports nothing a browser can't run: no Node, no engine barrel, no Node-side module", () => {
    expect(bad).toEqual([]);
  });

  it("is walked for real", () => {
    // The walk reaches the rooms, the lobby, the bots and the lessons…
    for (const file of ["room.ts", "pending-room.ts", "scripted-bot.ts", "tutorials/lesson.ts", "decks.ts"]) {
      expect(reached).toContain(file);
    }
    // …and would catch a Node-side import: the hosts make them.
    expect(walk(["in-process-host.ts"]).bad.length).toBeGreaterThan(0);
    expect(walk(["shard.ts"]).bad.some((b) => b.includes("capture.ts"))).toBe(true);
  });
});
