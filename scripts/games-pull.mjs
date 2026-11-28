#!/usr/bin/env node
// Copies the live site's kept games (`server/src/game-store.ts`) to this
// machine over SSH. They stay on the box unless `--delete` is given (the
// user, 2026-11-27: nothing is removed from the server unasked).
//
//   npm run games:pull                 # copy into games/, leave them on the box
//   npm run games:pull -- --delete     # copy, then delete the copied ones on the box
//   npm run games:pull -- --list       # only say what is there
//
// A game already here whole (the same size, and it gunzips to JSON) isn't
// fetched again. `GAMES_HOST` (deckblitz) and `GAMES_REMOTE_DIR`
// (/opt/mtg-engine/games) say where. With `--delete`, a file is deleted on the
// box only once its copy here has been read back whole. Then
// `npm run game:replay -- <file>`.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
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

/** Whether `f` is here already, whole: the same size, and it gunzips to JSON. */
const whole = (f) => {
  const path = join(local, f.path);
  if (!existsSync(path) || statSync(path).size !== f.bytes) return false;
  try {
    JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    return true;
  } catch {
    return false;
  }
};

mkdirSync(local, { recursive: true });
const had = files.filter(whole);
const wanted = files.filter((f) => !had.includes(f));
if (had.length > 0) console.log(`${had.length} already here`);
// One tar stream for them all: a connection, not one a file.
if (wanted.length > 0) {
  await new Promise((resolve, reject) => {
    const send = spawn("ssh", [host, `cd ${remote} && tar cf - -T -`], { stdio: ["pipe", "pipe", "inherit"] });
    const take = spawn("tar", ["xf", "-", "-C", local], { stdio: ["pipe", "inherit", "inherit"] });
    send.stdout.pipe(take.stdin);
    send.stdin.end(`${wanted.map((f) => f.path).join("\n")}\n`);
    send.on("error", reject);
    take.on("error", reject);
    take.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`tar exited ${code}`))));
  });
}

const fetched = wanted.filter(whole);
const arrived = [...had, ...fetched];
console.log(`fetched ${fetched.length} of ${wanted.length} new into ${local}`);
if (fetched.length < wanted.length) console.log("  the rest didn't arrive whole");

if (args.includes("--delete") && arrived.length > 0) {
  ssh(`cd ${remote} && xargs -d '\\n' rm -f -- && find . -mindepth 1 -type d -empty -delete`, `${arrived.map((f) => f.path).join("\n")}\n`);
  console.log(`deleted ${arrived.length} on the box`);
} else {
  console.log("left on the box (--delete removes the copied ones there)");
}
console.log(`look at one:  npm run game:replay -- games/${(fetched[0] ?? arrived[0])?.path ?? "<day>/<file>"}`);
