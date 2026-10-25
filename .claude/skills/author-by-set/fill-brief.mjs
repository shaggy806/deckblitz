#!/usr/bin/env node
// Writes each staged group's `brief.md` from `agent-brief.md`, its
// placeholders filled — the step `agent-batches.md` calls "Brief each agent".
// A script rather than a shell heredoc: the brief is full of backticked
// commands, and an unquoted heredoc runs them (it ran `npm install` and
// `git reset --hard` on the main checkout once, 2026-10-25).
//
// Usage (from the repo root):
//   node .claude/skills/author-by-set/fill-brief.mjs --staging <dir> \
//     --set-names "Eldritch Moon (EMN, 2016-07-22), the rest of the set" \
//     --set-code EMN --test-prefix set-emn-batch-1 [--base <commit>]
//
// <dir> holds `group-a/`, `group-b/`, … each with a `cards.txt` (one card
// name a line, as `cards:sets` prints it), and optionally `notes.md`: the
// batch's notes section (the feature just built, the batch's mechanics and
// the pool cards to copy, the tokens already made), put before
// `## Your cards`. The digest is `<dir>/digest.md`. `--base` is the commit
// the agents bring their worktree to (default: HEAD).
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const staging = opt("staging");
const setNames = opt("set-names");
const setCode = opt("set-code");
const testPrefix = opt("test-prefix");
if (!staging || !setNames || !setCode || !testPrefix) {
  console.error("usage: fill-brief.mjs --staging <dir> --set-names <text> --set-code <code> --test-prefix <prefix> [--base <commit>]");
  process.exit(2);
}
const fwd = (p) => p.replace(/\\/g, "/");
const base =
  opt("base") ?? execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const template = readFileSync(path.join(here, "agent-brief.md"), "utf8");
const notesFile = path.join(staging, "notes.md");
const notes = existsSync(notesFile) ? readFileSync(notesFile, "utf8").trimEnd() + "\n\n" : "";
const groups = readdirSync(staging).filter((d) => /^group-[a-z]$/.test(d)).sort();
if (groups.length === 0) {
  console.error(`no group-<x>/ directories in ${staging}`);
  process.exit(1);
}
for (const dir of groups) {
  const letter = dir.slice(-1).toUpperCase();
  const cards = readFileSync(path.join(staging, dir, "cards.txt"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const brief = template
    .replaceAll("GROUP_LETTER", letter)
    .replaceAll("SET_NAMES", setNames)
    .replaceAll("STAGING_DIR", fwd(path.resolve(staging, dir)))
    .replaceAll("TEST_FILE_PREFIX", testPrefix)
    .replaceAll("SET_CODE", setCode)
    .replaceAll("DIGEST_PATH", fwd(path.resolve(staging, "digest.md")))
    .replaceAll("BASE_COMMIT", base)
    .replaceAll("MAIN_CHECKOUT", fwd(root))
    .replace("## Your cards (", `${notes}## Your cards (`)
    .replace("CARD_LIST", cards.map((c) => `- ${c}`).join("\n"));
  writeFileSync(path.join(staging, dir, "brief.md"), brief);
  console.log(`${dir}/brief.md — ${cards.length} cards`);
}
