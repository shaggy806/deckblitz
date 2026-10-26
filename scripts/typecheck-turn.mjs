#!/usr/bin/env node
// Runs a command once a typecheck slot is free — the queue the set walks'
// card-author agents take turns through. Five agents' typechecks at once ran
// a cloud session (4 cores, 15 GB) out of memory: in batch 164 they had their
// cards written by 22:25 and spent until 22:59 in OOM kills (exit 137) and
// retries. The engine's tests typecheck (`tsc -p tsconfig.tests.json`) peaks
// at ~6.3 GB (measured 2026-10-26; 6.2-6.6 GB resident again after it became
// one pass, a lower heap limit or not), so slots are one per ~7 GB of RAM beyond
// 3 GB, at least one: one on a cloud session.
//
// Slots are directories under the OS temp dir, shared by every worktree on
// the machine; each holds its owner's pid, and a slot whose pid is gone is
// taken over, so a killed agent never wedges the queue.
//
// Usage: node scripts/typecheck-turn.mjs <command...>
//   e.g. node scripts/typecheck-turn.mjs npm run typecheck -w engine
// TYPECHECK_SLOTS=<n> overrides the slot count. Exits with the command's code.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error("usage: node scripts/typecheck-turn.mjs <command...>");
  process.exit(2);
}

const GB = 1024 ** 3;
const slots = Number(process.env.TYPECHECK_SLOTS) || Math.max(1, Math.floor((os.totalmem() / GB - 3) / 7));
const root = path.join(os.tmpdir(), "deckblitz-typecheck-slots");
fs.mkdirSync(root, { recursive: true });

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
}

function tryTake(i) {
  const dir = path.join(root, `slot-${i}`);
  try {
    fs.mkdirSync(dir);
  } catch {
    // Held: take it over only if its owner is gone.
    let owner = NaN;
    try {
      owner = Number(fs.readFileSync(path.join(dir, "pid"), "utf8"));
    } catch {
      // Taken a moment ago and its pid not written yet: still held.
      return null;
    }
    if (alive(owner)) return null;
    fs.rmSync(dir, { recursive: true, force: true });
    try {
      fs.mkdirSync(dir);
    } catch {
      return null;
    }
  }
  fs.writeFileSync(path.join(dir, "pid"), String(process.pid));
  return dir;
}

let held = null;
const started = Date.now();
let told = false;
while (held === null) {
  for (let i = 0; i < slots && held === null; i++) held = tryTake(i);
  if (held === null) {
    if (!told) {
      console.error(`typecheck-turn: all ${slots} slot(s) busy, waiting for a turn…`);
      told = true;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}
if (told) console.error(`typecheck-turn: got a slot after ${Math.round((Date.now() - started) / 1000)}s`);

const release = () => fs.rmSync(held, { recursive: true, force: true });
const child = spawn(cmd.join(" "), { stdio: "inherit", shell: true });
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    child.kill(sig);
    release();
    process.exit(130);
  });
}
child.on("exit", (code, signal) => {
  release();
  process.exit(code ?? (signal ? 137 : 1));
});
