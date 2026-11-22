#!/usr/bin/env node
// Fetches the live site's kept games (`server/src/game-store.ts`) to this
// machine over SSH, then deletes them there, so the box keeps only what
// hasn't been fetched yet.
//
//   npm run games:pull                 # fetch into games/, delete on the box
//   npm run games:pull -- --keep       # fetch, leave them on the box
//   npm run games:pull -- --list       # only say what is there
//
// `GAMES_HOST` (deckblitz) and `GAMES_REMOTE_DIR` (/opt/mtg-engine/games) say
// where. A file is deleted on the box only once its copy here has been read
// back whole (it gunzips to JSON). Then `npm run game:replay -- <file>`.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.GAMES_HOST ?? "deckblitz";
const remote = process.env.GAMES_REMOTE_DIR ?? "/opt/mtg-engine/games";
const local = join(root, "games");
const args = process.argv.slice(2);

/** Runs a command on the box, `input` on its stdin; returns its stdout. */
function ssh(command, input = "") {
  const run = spawnSync("ssh", [host, command], { input, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(`ssh ${host} failed (${run.status}): ${run.stderr.trim()}`);
  return run.stdout;
}

// A whole minute old (`-mmin +0`), so a file still being written isn't taken half done.
const listing = ssh(`cd ${remote} 2>/dev/null && find . -name '*.json.gz' -mmin +0 -printf '%s %p\\n' || true`);
const files = listing
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "")
  .map((line) => {
    const space = line.indexOf(" ");
    return { bytes: Number(line.slice(0, space)), path: line.slice(space + 1).replace(/^\.\//, "") };
  })
  // Only what the store writes: a day's folder and a plain file name.
  .filter((f) => /^\d{4}-\d{2}-\d{2}\/[A-Za-z0-9-]+\.json\.gz$/.test(f.path));
const total = files.reduce((n, f) => n + f.bytes, 0);
console.log(`${host}:${remote}: ${files.length} game(s), ${(total / 1024).toFixed(0)} KB`);
if (files.length === 0 || args.includes("--list")) {
  for (const f of files) console.log(`  ${f.path}  ${(f.bytes / 1024).toFixed(1)} KB`);
  process.exit(0);
}

mkdirSync(local, { recursive: true });
// One tar stream for them all: a connection, not one a file.
await new Promise((resolve, reject) => {
  const send = spawn("ssh", [host, `cd ${remote} && tar cf - -T -`], { stdio: ["pipe", "pipe", "inherit"] });
  const take = spawn("tar", ["xf", "-", "-C", local], { stdio: ["pipe", "inherit", "inherit"] });
  send.stdout.pipe(take.stdin);
  send.stdin.end(`${files.map((f) => f.path).join("\n")}\n`);
  send.on("error", reject);
  take.on("error", reject);
  take.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`tar exited ${code}`))));
});

const arrived = files.filter((f) => {
  const path = join(local, f.path);
  if (!existsSync(path)) return false;
  try {
    JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    return true;
  } catch {
    return false;
  }
});
console.log(`fetched ${arrived.length} of ${files.length} into ${local}`);
if (arrived.length < files.length) console.log("  the rest didn't arrive whole: left on the box");

if (!args.includes("--keep") && arrived.length > 0) {
  ssh(`cd ${remote} && xargs -d '\\n' rm -f -- && find . -mindepth 1 -type d -empty -delete`, `${arrived.map((f) => f.path).join("\n")}\n`);
  console.log(`deleted ${arrived.length} on the box`);
}
console.log(`look at one:  npm run game:replay -- games/${arrived[0]?.path ?? "<day>/<file>"}`);
