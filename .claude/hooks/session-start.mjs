// SessionStart hook for Claude Code on the web. A remote session starts from a
// bare clone with no node_modules, and `server`/`client` resolve `engine` and
// `protocol` through their built dist/, so until both exist only the engine's
// own tests can run. This installs dependencies and builds everything the
// server needs, so tests, typecheck, lint and the dev servers work at once.
//
// Node rather than bash on purpose: a Windows checkout with core.autocrlf=true
// gives a shell script CRLF line endings, which breaks it, and this file runs
// at the start of local sessions too, where it only does the first step.
//
// First, in every session, local or cloud: which remote branches hold work
// main doesn't have (`scripts/unmerged-branches.mjs`). Its output goes on
// stdout, which a SessionStart hook adds to the session's context, so the
// session knows before it authors anything — a cloud session's branch left
// unmerged once had five sets walked again from main (2026-10-25).
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const unmerged = spawnSync("node", [path.join(root, "scripts", "unmerged-branches.mjs")], {
  cwd: root,
  encoding: "utf8",
  timeout: 60_000,
});
if (unmerged.stdout) console.log(unmerged.stdout.trimEnd());

if (process.env.CLAUDE_CODE_REMOTE !== "true") process.exit(0);

const started = Date.now();

const steps = [
  // `install` rather than `ci`: the container is cached once this hook
  // finishes, and `ci` would throw that node_modules away every session.
  // --no-save keeps it from ever rewriting package-lock.json.
  ["npm", ["install", "--no-save", "--no-audit", "--no-fund"]],
  // Dependency order: protocol imports engine, server imports both.
  ["npm", ["run", "build", "-w", "engine"]],
  ["npm", ["run", "build", "-w", "protocol"]],
  ["npm", ["run", "build", "-w", "server"]],
];

for (const [command, args] of steps) {
  // A SessionStart hook's stdout is added to the session's context, so each
  // command's own output goes to stderr instead.
  const result = spawnSync(command, args, { cwd: root, stdio: ["ignore", 2, 2] });
  if (result.status !== 0) {
    const why = result.error?.message ?? `exit code ${result.status ?? result.signal}`;
    console.error(`session-start: \`${command} ${args.join(" ")}\` failed (${why})`);
    process.exit(1);
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`Dependencies installed; engine, protocol and server built (${seconds}s).`);
