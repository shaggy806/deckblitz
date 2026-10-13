/**
 * The main thread loads no engine when the rooms run on worker threads
 * (`docs/plans/room-shards.md`): every module on main's side imports values
 * only from Node, `ws` or each other — types from anywhere. The engine's
 * module graph is most of a shard's ~250 MB, so one value import from main
 * would cost that again on the one thread every socket waits on.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Main's side. Anything else under `src/` is shard-side. */
const MAIN_SIDE = [
  "index.ts",
  "transport.ts",
  "worker-host.ts",
  "room-host.ts",
  "shard-protocol.ts",
  "room-code.ts",
  "status-server.ts",
  "import-route.ts",
  "load-monitor.ts",
  "admission.ts",
];

/** Value imports a main-side module may make besides its own side. */
const ALLOWED_PACKAGES = ["ws"];

/** Every static import's specifier, and whether it's type-only. */
function importsOf(source: string): { specifier: string; typeOnly: boolean }[] {
  const out: { specifier: string; typeOnly: boolean }[] = [];
  const statement = /^\s*(import|export)\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/gms;
  for (const m of source.matchAll(statement)) {
    // `import { type A, type B }` is type-only too.
    const names = m[3];
    const allTyped = /^\{[^}]*\}$/s.test(names.trim()) && names.replace(/[{}\s]/g, "").split(",").filter(Boolean).every((n) => n.startsWith("type"));
    out.push({ specifier: m[4], typeOnly: m[2] !== undefined || allTyped });
  }
  for (const m of source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) out.push({ specifier: m[1], typeOnly: false });
  return out;
}

const read = (file: string): string => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

describe("main-side modules", () => {
  it.each(MAIN_SIDE)("%s imports no value from the engine or a shard-side module", (file) => {
    const bad = importsOf(read(file))
      .filter((i) => !i.typeOnly)
      .map((i) => i.specifier)
      .filter((s) => {
        if (s.startsWith("node:") || ALLOWED_PACKAGES.includes(s)) return false;
        if (s.startsWith("./")) return !MAIN_SIDE.includes(s.slice(2).replace(/\.js$/, ".ts"));
        return true; // "engine", "protocol" (types only), anything else
      });
    expect(bad).toEqual([]);
  });

  it("finds the imports it checks (the check can fail)", () => {
    const found = importsOf(read("index.ts"));
    expect(found.some((i) => i.specifier === "./worker-host.js" && !i.typeOnly)).toBe(true);
    expect(found.some((i) => i.specifier === "./room-host.js" && i.typeOnly)).toBe(true);
    // The room code takes the engine (`engine/local`), which a main-side module may not.
    expect(importsOf(read("card-registry.ts")).some((i) => i.specifier === "engine/local" && !i.typeOnly)).toBe(true);
  });

  it("loads the in-process rooms only by a dynamic import, for --shards 0", () => {
    const dynamic = [...read("index.ts").matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
    expect(dynamic).toEqual(["./in-process-host.js"]);
  });
});
