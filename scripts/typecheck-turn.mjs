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
// The slots are `machine-slots.mjs`'s, shared by every worktree on the
// machine; a verify takes all of them, so a command here also waits while one
// runs (`author-walks-local` runs several sessions' agents and verifies on one
// machine).
//
// Usage: node scripts/typecheck-turn.mjs <command...>
//   e.g. node scripts/typecheck-turn.mjs npm run typecheck -w engine
// TYPECHECK_SLOTS=<n> overrides the slot count. Exits with the command's code.
import { spawn } from "node:child_process";
import { release, takeSlot } from "./machine-slots.mjs";

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error("usage: node scripts/typecheck-turn.mjs <command...>");
  process.exit(2);
}

const held = await takeSlot();
process.on("exit", () => release(held));
const child = spawn(cmd.join(" "), { stdio: "inherit", shell: true });
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    child.kill(sig);
    process.exit(130);
  });
}
child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 137 : 1));
});
