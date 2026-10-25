#!/usr/bin/env node
// Which remote branches hold work main doesn't have — the check that would
// have caught claude/top-cards-batch-141, left unmerged on 2026-10-24 while
// the next sessions, starting from main, walked the same five sets again.
// Run at every cloud session's start (`.claude/hooks/session-start.mjs`) and
// as the authoring skills' first step: a branch listed here is merged before
// anything is authored, or its work is done twice.
//
// A branch counts when it shares history with origin/main and has commits
// whose change main doesn't carry (`git cherry`: a commit cherry-picked or
// squashed into main doesn't count). Branches from before main's history was
// restarted (2026-10-21) share none and are named on one line only. Also
// says when the checked-out branch is behind origin/main.
//
// Usage: node scripts/unmerged-branches.mjs [--no-fetch]
// Prints nothing when there's nothing to say; always exits 0.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};

if (!process.argv.includes("--no-fetch")) git("fetch", "--quiet", "--prune", "origin");
const MAIN = "origin/main";
if (git("rev-parse", "--verify", "--quiet", MAIN) === null) process.exit(0);

const current = git("rev-parse", "--abbrev-ref", "HEAD");
const branches = (git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin") ?? "")
  .split("\n")
  .filter((b) => b && b !== MAIN && b !== "origin/HEAD" && b !== "origin");

const unmerged = [];
const unrelated = [];
for (const branch of branches) {
  if (git("merge-base", MAIN, branch) === null) {
    unrelated.push(branch.replace(/^origin\//, ""));
    continue;
  }
  // `+` lines are commits whose change main lacks; merges aren't listed.
  const missing = (git("cherry", MAIN, branch) ?? "").split("\n").filter((l) => l.startsWith("+")).length;
  if (missing === 0) continue;
  const last = git("log", "-1", "--format=%cs %s", branch) ?? "";
  unmerged.push({ branch: branch.replace(/^origin\//, ""), missing, last });
}

const lines = [];
if (unmerged.length > 0) {
  lines.push(`UNMERGED WORK — ${unmerged.length} branch(es) hold commits main doesn't have:`);
  for (const u of unmerged.sort((a, b) => b.last.localeCompare(a.last))) {
    lines.push(`  ${u.branch}: ${u.missing} commit(s) not on main; last ${u.last.slice(0, 110)}`);
  }
  lines.push(
    "  Merge each into main (or confirm it's abandoned and delete it) before authoring anything,",
    "  or that work gets done twice. The session's own branch is listed too until it's on main.",
  );
}
if (current !== null && current !== "HEAD") {
  const behind = Number(git("rev-list", "--count", `HEAD..${MAIN}`) ?? "0");
  if (behind > 0) lines.push(`This branch (${current}) is ${behind} commit(s) behind main: \`git merge origin/main\` first.`);
}
if (unrelated.length > 0) {
  lines.push(
    `(${unrelated.length} older branch(es) share no history with main — from before its restart on 2026-10-21, ` +
      `their work already in main: ${unrelated.join(", ")}. Safe to delete once confirmed.)`,
  );
}
if (lines.length > 0) console.log(lines.join("\n"));
