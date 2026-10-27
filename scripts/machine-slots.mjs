// The machine-wide gate for the memory-heavy steps, shared by every worktree
// and session on the machine: `typecheck-turn.mjs` takes one slot for a
// typecheck or build, `verify.mjs` takes the whole machine.
//
// Measured on the 20-thread, 32 GB PC (2026-10-26): the engine's tests
// typecheck peaks at ~6.3 GB, an engine build about the same, one test file
// run alone ~4.2 GB (vitest's main process and its worker each load the card
// barrel), the engine suite at 8 workers ~18.5 GB. On a cloud session (4
// cores, ~15 GB) five agents' typechecks at once ran out of memory (batch
// 164); on the PC several parallel set-walk sessions' agents and verifies at
// once would. So:
//
// - Slots: one per ~7 GB of RAM beyond 3 GB, at least one — one on a cloud
//   session, four on the PC. TYPECHECK_SLOTS=<n> overrides the count.
// - A typecheck or build takes any free slot (`takeSlot`), and beside other
//   slots only when there's ~7 GB available for it: the PC has other
//   programs open (15 GB of its 32 free at idle, 2026-10-26), and agents'
//   test runs aren't gated.
// - A verify takes the verify turn first (one verify at a time), which stops
//   new slots being handed out, then every slot as its holders finish
//   (`takeMachine`): its engine suite alone is most of the machine. Nothing
//   holds one thing while waiting for another that a holder of the first
//   could be waiting on, so the gate can't deadlock.
//
// A process that holds a slot or the machine says so in MACHINE_SLOT_HELD,
// which its children inherit: one of them asking again gets through at once
// (a `typecheck-turn.mjs npm run verify` would otherwise wait on itself).
//
// Slots are directories under the OS temp dir holding their owner's pid; a
// slot or turn whose pid is gone is taken over, so a killed process never
// wedges the gate.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const GB = 1024 ** 3;
const ROOT = path.join(os.tmpdir(), "deckblitz-typecheck-slots");
const VERIFY_TURN = "verify-turn";
const POLL_MS = 2000;
const SLOT_GB = 7;
const GROW_MS = 40_000;

export const slotCount = () => Number(process.env.TYPECHECK_SLOTS) || Math.max(1, Math.floor((os.totalmem() / GB - 3) / SLOT_GB));

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
}

/** The pid holding `name`, or null when it's free or its holder is gone. */
function holder(name) {
  try {
    const pid = Number(fs.readFileSync(path.join(ROOT, name, "pid"), "utf8"));
    return alive(pid) ? pid : null;
  } catch {
    // No pid file: free, or taken a moment ago and its pid not written yet —
    // a mkdir in `tryTake` tells the two apart.
    return null;
  }
}

/** Take `name` now if it's free (or its holder is gone): its path, else null. */
function tryTake(name) {
  const dir = path.join(ROOT, name);
  try {
    fs.mkdirSync(dir);
  } catch {
    let owner = NaN;
    try {
      owner = Number(fs.readFileSync(path.join(dir, "pid"), "utf8"));
    } catch {
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

const sleep = () => new Promise((r) => setTimeout(r, POLL_MS));

/** Release what `takeSlot` / `takeMachine` returned. Safe to call twice. */
export const release = (dirs) => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
};

/** Room for one more slot: the memory the OS calls available covers a
 * typecheck's ~7 GB for it and for each slot taken in the last 40 s (still
 * growing, not yet counted as used). Always room while no other slot is held,
 * so a machine busy with other things still gets one at a time through. */
function room(n) {
  const held = [];
  for (let i = 0; i < n; i++) if (holder(`slot-${i}`) !== null) held.push(`slot-${i}`);
  if (held.length === 0) return true;
  const young = held.filter((s) => {
    try {
      return Date.now() - fs.statSync(path.join(ROOT, s)).mtimeMs < GROW_MS;
    } catch {
      return false;
    }
  }).length;
  return os.freemem() / GB >= SLOT_GB * (1 + young);
}

const HELD = "MACHINE_SLOT_HELD";
const mark = (held) => {
  process.env[HELD] = "1";
  return held;
};

/** One slot, waiting while all are busy or a verify is draining them. */
export async function takeSlot(log = (m) => console.error(m)) {
  if (process.env[HELD]) return [];
  fs.mkdirSync(ROOT, { recursive: true });
  const n = slotCount();
  const started = Date.now();
  let told = false;
  for (;;) {
    if (holder(VERIFY_TURN) === null && room(n)) {
      for (let i = 0; i < n; i++) {
        const dir = tryTake(`slot-${i}`);
        if (dir !== null) {
          if (told) log(`typecheck-turn: got a slot after ${Math.round((Date.now() - started) / 1000)}s`);
          return mark([dir]);
        }
      }
    }
    if (!told) {
      log(
        holder(VERIFY_TURN) !== null
          ? "typecheck-turn: a verify has the machine, waiting for it…"
          : `typecheck-turn: all ${n} slot(s) busy or too little memory free, waiting for a turn…`,
      );
      told = true;
    }
    await sleep();
  }
}

/** The verify turn and then every slot: the machine to itself. */
export async function takeMachine(log = (m) => console.log(m)) {
  if (process.env[HELD]) return [];
  fs.mkdirSync(ROOT, { recursive: true });
  const n = slotCount();
  const started = Date.now();
  let told = false;
  let turn = null;
  while ((turn = tryTake(VERIFY_TURN)) === null) {
    if (!told) {
      log(`verify: another verify on this machine has it (pid ${holder(VERIFY_TURN) ?? "?"}), waiting…`);
      told = true;
    }
    await sleep();
  }
  const held = [turn];
  for (let i = 0; i < n; i++) {
    let dir;
    while ((dir = tryTake(`slot-${i}`)) === null) {
      if (!told) {
        log("verify: waiting for the typechecks and builds already running to finish…");
        told = true;
      }
      await sleep();
    }
    held.push(dir);
  }
  if (told) log(`verify: have the machine after ${Math.round((Date.now() - started) / 1000)}s`);
  return mark(held);
}
