#!/usr/bin/env node
// One parallel set-walk session at a time merges, verifies and pushes to main
// (the `author-walks-parallel` skill). Without it each session that landed
// after another had to merge and re-verify once per batch that landed under
// it: round thirteen (2026-10-26, five sessions) re-ran `verify --only
// fuzzwith` five times, B194 alone merging three times over half an hour.
//
// The lock is the branch `landing-lock` on origin, a chain of empty commits
// whose tip says "held <label> <time>" or "free". Taking, releasing or
// breaking it pushes one more commit on the tip that was read: a push is a
// fast-forward only from that tip, so if anyone moved the lock in between,
// ours is refused — a compare-and-swap. (The cloud sessions' git proxy
// refuses tag pushes and branch deletions, so the lock can't be a ref that
// comes and goes.) A held tip older than STALE_MINUTES is a session that died
// holding it, and may be taken over.
//
// Usage: node scripts/landing-lock.mjs acquire <label> [--wait]
//        node scripts/landing-lock.mjs release
//        node scripts/landing-lock.mjs status
// acquire exits 0 holding the lock, 1 when it's held and --wait wasn't given;
// --wait polls every minute until it's free (run it in the background).
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const REF = "refs/heads/landing-lock";
const SEEN = "refs/landing-lock/seen";
const MINE = "refs/landing-lock/mine";
const STALE_MINUTES = 45;
const POLL_MS = 60_000;

const git = (...args) => spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
const out = (...args) => {
  const r = git(...args);
  return r.status === 0 ? r.stdout.trim() : null;
};

/** The lock's tip on origin: null when the branch doesn't exist yet. */
function readLock() {
  const line = out("ls-remote", "origin", REF);
  if (line === null) throw new Error("git ls-remote origin failed");
  if (line === "") return null;
  const sha = line.split(/\s+/)[0];
  git("fetch", "--quiet", "--no-tags", "origin", `+${REF}:${SEEN}`);
  const [when, state, ...label] = (out("log", "-1", "--format=%ct %s", sha) ?? "0 ?").split(" ");
  return { sha, held: state !== "free", label: label.join(" "), minutes: (Date.now() / 1000 - Number(when)) / 60 };
}

/** Push a commit saying `message` on top of `parent` (null: the branch's first); its sha when the push went through. */
function swap(parent, message) {
  const emptyTree = out("hash-object", "-t", "tree", "-w", "/dev/null");
  const commit = emptyTree && out("commit-tree", emptyTree, ...(parent ? ["-p", parent] : []), "-m", message);
  if (!commit) throw new Error("git commit-tree failed");
  return git("push", "--quiet", "origin", `${commit}:${REF}`).status === 0 ? commit : null;
}

const describe = (l) => (l?.held ? `held by ${l.label}, ${Math.round(l.minutes)} min` : "free");
const [cmd, label] = process.argv.slice(2);
const wait = process.argv.includes("--wait");

if (cmd === "status") {
  console.log(describe(readLock()));
} else if (cmd === "release") {
  const l = readLock();
  if (!l?.held) console.log("landing-lock: already free");
  else if (l.sha !== out("rev-parse", "--verify", "--quiet", MINE)) console.log(`landing-lock: not ours (${describe(l)}); left alone`);
  else console.log(swap(l.sha, "free") ? "landing-lock: released" : "landing-lock: release refused — run it again");
  git("update-ref", "-d", MINE);
} else if (cmd === "acquire" && label) {
  for (;;) {
    const l = readLock();
    const stale = l?.held && l.minutes > STALE_MINUTES;
    if (!l?.held || stale) {
      if (stale) console.log(`landing-lock: taking over a stale lock (${describe(l)})`);
      const stamp = new Date().toISOString().slice(0, 16) + "Z";
      const commit = swap(l?.sha ?? null, `held ${label} ${stamp}`);
      if (commit) {
        git("update-ref", MINE, commit);
        console.log(`landing-lock: acquired by ${label}`);
        process.exit(0);
      }
      continue; // someone moved it first: read it again
    }
    if (!wait) {
      console.log(`landing-lock: ${describe(l)}`);
      process.exit(1);
    }
    console.log(`landing-lock: waiting — ${describe(l)}`);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
} else {
  console.error("usage: node scripts/landing-lock.mjs acquire <label> [--wait] | release | status");
  process.exit(2);
}
