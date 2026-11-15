// Two engine builds side by side, for comparing bots across commits
// (`bot-ab.mjs`, `bot-diff.mjs`): the engine as it was at a git ref, built
// from `git archive` into `.scratch/baseline/<sha>/` (git-ignored, inside the
// repo so the repo's own node_modules resolve for it), and a frozen copy of
// the current `engine/dist`, so rebuilding while a run is going doesn't pull
// the rug from under it. Controllers from two builds can share one table
// because `GameState` is plain data; a run is only meaningful while its shape
// hasn't changed between the two refs.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// `MTG_BASELINE_DIR` puts the builds somewhere else: for trying this file's
// own housekeeping without touching the real copies.
const SCRATCH = process.env.MTG_BASELINE_DIR ?? join(ROOT, ".scratch", "baseline");

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

/** The dist directory of the engine at `ref`, built once per commit. */
export function baselineDist(ref) {
  const sha = git("rev-parse", "--short", ref);
  const dir = join(SCRATCH, sha);
  const dist = join(dir, "engine", "dist");
  if (existsSync(join(dist, "index.js"))) return { sha, dist };
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  process.stderr.write(`building the engine at ${ref} (${sha}) into ${dir} ...\n`);
  const tar = execFileSync(
    "git",
    ["archive", "--format=tar", sha, "engine/src", "engine/tsconfig.json", "engine/package.json"],
    { cwd: ROOT, maxBuffer: 1 << 30 },
  );
  // From inside the directory: GNU tar reads a "C:" path as a remote host.
  execFileSync("tar", ["-x"], { cwd: dir, input: tar, maxBuffer: 1 << 30 });
  execFileSync(
    process.execPath,
    [join(ROOT, "node_modules", "typescript", "bin", "tsc"), "-p", join(dir, "engine")],
    { cwd: ROOT, stdio: "inherit" },
  );
  return { sha, dist };
}

/** Delete `dirs` in a process of its own, so the caller neither waits for it
 * nor loses it by exiting: a build is tens of thousands of files, and a
 * minute to remove. */
function removeApart(dirs) {
  if (dirs.length === 0) return;
  const script = "for (const d of process.argv.slice(1)) require('node:fs').rmSync(d, { recursive: true, force: true });";
  spawn(process.execPath, ["-e", script, ...dirs], { detached: true, stdio: "ignore", windowsHide: true }).unref();
}

/** How old a working copy is before the next run clears it away: one left by
 * a run that was killed (a stopped task, a closed terminal) has no exit to
 * remove it at. A day, so no run still going loses its own. */
const STALE_MS = 24 * 60 * 60 * 1000;

/**
 * A frozen copy of the current `engine/dist` (build it first), removed when
 * this process exits.
 *
 * Only what runs: the `.js` files. The declarations and source maps beside
 * them are three quarters of the 134,000 files, and every run left its whole
 * copy behind — 106 of them by 2026-11-15, 285 MB each.
 */
export function workingDist() {
  const source = join(ROOT, "engine", "dist");
  if (!existsSync(join(source, "index.js"))) throw new Error("no engine/dist — run `npm run build -w engine`");
  mkdirSync(SCRATCH, { recursive: true });
  const now = Date.now();
  removeApart(
    readdirSync(SCRATCH)
      .filter((name) => /^working-\d+$/.test(name) && now - Number(name.slice("working-".length)) > STALE_MS)
      .map((name) => join(SCRATCH, name)),
  );
  const dir = join(SCRATCH, `working-${now}`);
  mkdirSync(join(dir, "engine"), { recursive: true });
  cpSync(join(ROOT, "engine", "package.json"), join(dir, "engine", "package.json"));
  cpSync(source, join(dir, "engine", "dist"), {
    recursive: true,
    filter: (path) => !/\.(d\.ts|map|tsbuildinfo)$/.test(path),
  });
  process.once("exit", () => removeApart([dir]));
  return { sha: "working", dist: join(dir, "engine", "dist") };
}

/** Import one build's barrel. */
export const importBuild = (dist) => import(pathToFileURL(join(dist, "index.js")).href);
