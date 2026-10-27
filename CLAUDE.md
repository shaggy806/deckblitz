# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MTG-Engine is a Magic: The Gathering rules engine (`engine/`) with an authoritative multiplayer
room server (`server/`) and a React web client (`client/`) — a real networked 2-4 player game
(Commander-capable), not a local hot-seat demo. **Desktop and laptop only, permanently**: never
design, plan, test or fix for phones or tablets; the weakest machine to plan for is a low-end
laptop. The repo is an **npm workspaces monorepo**
(`workspaces: ["engine", "protocol", "server", "client"]` in the root `package.json`, in
that order so `engine` builds first, then `protocol`, then `server`).

- `engine/` — the rules engine: a pure TypeScript state machine driven through `Game.dispatch`,
  no I/O, no UI. **`engine/CLAUDE.md`** holds its invariants.
- `protocol/` — types only: the wire contract between `server` and `client`, imported by both.
  Emits no runtime code.
- `server/` — Node + `ws`: the room host, one real `Game` per room, each seat pushed its own
  redacted view. **`server/CLAUDE.md`**.
- `client/` — Vite + React 19: a networked client, one device per seat, never running a `Game`
  itself. Needs `engine/dist` and `protocol/dist` built. **`client/CLAUDE.md`**.

Each workspace's `CLAUDE.md` loads when you work in it. The full per-file detail behind them is
in **`docs/architecture/engine.md`, `server.md` and `client.md`**: not loaded automatically, so
read the entry for a file before changing that file. When a file's shape changes, update its
entry there (and the workspace `CLAUDE.md` if an invariant changed) in the same commit.

## Where the docs live

These files are a map of *current architecture*, not a changelog. The others, and what each is
for:

- **`BACKLOG.md`** — **the plan of record for open work**: one line per thing still to do
  (commander gap, card backlog, engine rules gaps, bots, client/UI, tooling), each pointing at
  where its detail lives, and nothing finished. When an item lands, move its line to
  `COMPLETED.md`; add one when you find something. Nothing else lists open work, so check it
  before starting and update it in the same commit.
- **`COMPLETED.md`** — the backlog's landed items, newest first, under the backlog's sections,
  each with its date and commit (since 2026-10-14; older work is in `git log` and `ROADMAP.md`).
  **Check it before building something**, with `top-commanders-gaps.json`'s `built` array and
  `git log --grep`: the feature may already exist.
- **`ROADMAP.md`** — the engine's build history, condensed. Its 11 phases and the follow-on
  "needed-cards" P0–P20 passes are **all done**; ~180 source comments cite "ROADMAP Phase N", so
  the phase index stays. **Read its *Architecture constraints* section before touching the
  engine.** Per-phase narrative detail is in `git log`, not here.
- **`engine/src/cards/neededCards-features.md`** — the detail behind `BACKLOG.md`'s engine items:
  engine features ranked by how many real cards each would unblock, over two measured
  populations, plus a compact index of finished passes (P0–P20, Tier 1, E1–E3) that source
  comments cite. **The commander gap comes first**: `top-commanders.txt` (`npm run cmdrs:top` /
  `cmdrs:mark -w engine`) is the top 500 commanders by decks run *as commander* — ranking them by
  card popularity misses 53 of the top 100, because a commander is a singleton played almost
  nowhere but its own deck — and `top-commanders-gaps.json` maps every unimplemented one to the
  engine features it needs (a per-card triage over one ~245-feature vocabulary), which
  `npm run cmdrs:gaps -w engine` ranks by commanders blocked and as a greedy engine-only build
  order. Add a feature's key to the JSON's `built` array when it lands. The coverage figure is
  `top-commander-cards.txt` (the top 5000 Commander cards by EDHREC rank against the pool, fully
  triaged), re-marked in place by `npm run cards:mark -w engine`; new cards now come from the
  Oracle EDHREC ranks past it.
  **The current authoring priority is set by set, whole sets, newest set first** (the
  `author-by-set` skill since 2026-10-14; `npm run cards:sets -w engine -- --sets | --next 60`):
  every set's Commander-legal first printings, going back first over the sets whose top half was
  walked before; and the same walk the other way, oldest set first and forward in time (the
  `author-by-set-oldest` skill since 2026-10-21; `cards:sets -- --oldest`), until the two meet.
  Several walks can run at once, each in its own cloud session on a range of sets of its own
  (the `author-walks-parallel` skill since 2026-10-25), or each in its own local session and
  worktree on this PC (the `author-walks-local` skill since 2026-10-26), sharing its memory
  through `scripts/machine-slots.mjs`: typechecks and builds take a slot, a verify the whole
  machine.
  The other order is EDHREC rank across all sets (the `author-top-cards` skill;
  `npm run cards:needs -w engine -- --next 60` lists the next untriaged cards by rank, `-- --rank`
  what blocks the most triaged ones). The bots' decks' stand-ins (the
  substitution tables in `engine/src/sample-decks.ts`) go as their originals land. The pool is
  ~5,400 real cards (`npm run card:verify -w engine` prints the current count of definitions,
  which is a little higher: each face of a double-faced card is its own).
- **`docs/manual-checks.md`** — quick tests to play by hand in the scenario builder: a new player
  decision or a careful rules call, **one thing per test** — a `###` title, a one- or two-step
  **Do** and a short **Expect** (the doc's intro has the format). Each authoring pass adds tests
  for what it introduces, each with its own board in `client/src/builder/manualChecks.ts` (the
  builder's Manual checks list plays it in one click; a server test insists every test has exactly
  one); a test is deleted once it checks out.
- **`docs/card-blockers.md`** — reference, not a to-do list: what blocks the unimplemented cards,
  batch by batch (top-5000 batches, the TDC precons, card sweep 2) and by family, indexing the
  per-card JSON records in `engine/data/sweep-2/` and `sweep-3/` — their needs keyed on one
  vocabulary (`engine/data/needs-vocabulary.json` beside the gaps file's features; `npm run
  cards:needs -w engine` ranks them and lists what's been built since). Batch summaries go here, and
  so do card lists (which cards wait on a feature, which a built one may have unblocked): its
  "Open leads" section holds them, and `BACKLOG.md` points at it rather than listing cards.
- **`docs/bot-misplays.md`** — bot misplays the user saw on the live site without a capture, each rebuilt as a training scenario by the `bot-misplay` skill, with why the bot chose it and the likely fix.
- **`docs/engine-gaps.md`** and **`docs/client-gaps.md`** — the detail behind `BACKLOG.md`'s
  "Engine rules gaps" and "Client / UI" items (rule numbers, code sites, blocked cards), under
  the same bold titles; `BACKLOG.md` keeps one line each. Add an item in both; when one lands,
  delete its detail and move its `BACKLOG.md` line to `COMPLETED.md`.
- **`engine/src/cards/AUTHORING.md`** — the hand-authoring guide for adding a card. Read before
  authoring.
- **`DEPLOYMENT.md`** — the deckblitz.net (AWS Lightsail) production hosting/update runbook.
- **`docs/rules/MagicCompRules_20260925.txt`** — the Comprehensive Rules, effective 2026-09-25
  (Wizards' text, unedited). Grep it for a rule's number and wording before citing one in code, a
  comment or a commit; when a newer edition is added, replace the file and this line.
- **`docs/plans/*.md`** — design records, each saying *why* its piece is shaped the way it is,
  with a `Status:` line at the top. `docs/plans/README.md` indexes them. Two are **in
  progress**: `bot-effect-knowledge` (the plan of record for the bots — read it before changing
  how a bot picks actions) and `token-stack-choices`.
- **`client/BOARD_REDESIGN_PLAN.md`** — the board-overhaul record: the mockup URL, the settled
  design rules, and the known gaps. All 18 phases shipped.

## Commands

Run from the repo root unless noted. Workspace scripts: `npm run <script> -w engine` / `-w server` / `-w client`.
Each workspace's `CLAUDE.md` lists its everyday commands; `docs/architecture/*.md` has all of
them in full.

**Whole repo** (root scripts fan out with `--workspaces --if-present`):
- `npm run build` — builds `engine` (tsc), then `server` (tsc), then `client` (`tsc -b && vite build`)
- `npm test` — runs `engine`, `server` and `client` vitest, each once (the client's Playwright suite is separate: `npm run test:e2e -w client`)
- `npm run lint` — oxlint on `client`
- `npm run typecheck` — `engine`'s through `tsconfig.tests.json` alone (its source and its tests in one pass, 2026-10-26: a separate source pass first was 30 s more that the build already covers), `tsc --noEmit` on `server` then its tests, `tsc -b` on `client`
- `npm run verify [-- --full | --quick | --fuzz-new] [-- --with "Card"] [-- --skip fuzz,gate | --only fuzzwith] [-- --landing]` — everything a change must pass, fastest-failing first. **Full only every third card batch**: it counts batch records (`engine/data/sweep-3/B<N>.json`) since the last full run that passed, kept in `scripts/verify-state.json` (commit it when verify rewrites it); in between it runs quick — no plain fuzzer, the new-cards fuzzer at half, the bot gate and the server and client suites only when the change touches them (`scripts/verify.mjs`): gen:cards, build, the backlog re-marks, typecheck + lint, the three suites, the test files you added type-checked (vitest never does), card:verify offline — and, from the build on, in the background beside them: the fuzzer at 2 and 4 players, the fuzzer with every card not yet on `origin/main` forced in (each 4-player run split across two processes), and the bot gate (on a machine of 4 cores or fewer — a cloud session — those wait for the test suites, which they'd otherwise starve). ~4 minutes on a big machine; on a cloud session's 4 cores everything runs one step after another, ~10 minutes quick and 12-17 full (batches 173-175). So, from 2026-10-26: a full run with nothing but cards since the last full one (`lastFullCommit`) skips the plain fuzzer and the bot gate too; **`--fuzz-new`** runs just the new-cards fuzzer — the step that finds the bugs — as soon as a batch's cards are written, and a later verify skips it while the cards and the engine code are unchanged (a stamp in the OS temp dir); **`--only <step>`** re-checks a fix to what one step found (gen:cards, build, typecheck and the engine suite always run); **`--landing`** is the landing lock's check after a merge (`--only marks,fuzzwith`, with the engine suite cut to its pool-wide tests and the merge's test files when the merge brought no engine code); and a fuzzer game killed for its time is reported with how it last looked (turn, stack, the battlefield's most repeated cards), so it needs no replay at a longer `--timeout`. `--help` prints the flags; an unknown one stops. Logs per step in the OS temp dir.

Local servers: the `dev-up` / `dev-down` skills start and stop the room server (or `dev-rooms`,
preloaded test boards) and Vite. Scripts and the fuzzer run `dist/`, so build before running them.

## Git workflow

- **Standing authorization to commit and push**: once a feature is working (build/lint/typecheck/tests clean, and — for anything UI-visible — checked live in the browser), commit it and push to `origin/main` without asking first each time. Split unrelated work into separate, logically-scoped commits the way the existing history does (see `git log`), rather than one giant commit. This still doesn't cover force-push, history rewrites, or pushing something you haven't actually verified — those still warrant asking.
- **CI** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`: `npm ci`, the full build, a check that the build left no generated file uncommitted (the engine's prebuild rewrites `cards/generated.ts`), typecheck, lint, both test suites, and a short 2- and 4-player fuzzer pass. A green push to `main` then publishes the **deploy bundle** the live box installs (`deploy-<sha>.tar.gz` on the `deploy` pre-release — nothing compiles on the box; `DEPLOYMENT.md`).
- **Cloud sessions** (Claude Code on the web) start from a bare clone with no `node_modules`, and push to their own session branch (`claude/…`). **That branch isn't the end: land finished, verified work on `main` before the session ends** — `git fetch origin main`, `git merge origin/main` (re-run the checks if it brought anything), then `git push origin HEAD:main` — under the same standing authorization as above. The next session starts from `main` and can't see a session branch: one left unmerged had five sets walked a second time (merged 2026-10-25). **At the start**, the SessionStart hook runs `scripts/unmerged-branches.mjs` and prints any remote branch holding commits `main` lacks; if it lists one, merge it (or ask whether it's abandoned) before starting new work. `.claude/hooks/session-start.mjs`, registered as a SessionStart hook in `.claude/settings.json`, installs dependencies and builds engine, protocol and server before the session starts. It's Node rather than bash because a CRLF checkout breaks a shell script, and it does nothing outside a cloud session.

## Toolchain notes

- **Module systems differ**: `engine`/`server` are ESM + NodeNext, so their own relative imports need explicit `.js` extensions (e.g. `import { x } from "./foo.js"` even though the file is `foo.ts`). `client` is ESM + bundler mode.
- **Engine/server TS config is `erasableSyntaxOnly`** (same as the client): **no `enum`, no `namespace`, no constructor parameter properties**. Use string-literal unions + `as const satisfies` tables instead. Also `verbatimModuleSyntax` → split `import type { … }` from value imports. `strict` + `noUnusedLocals`/`noUnusedParameters`.
- **Client TS config** (`client/tsconfig.app.json`) is strict bundler-mode: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`/`noUnusedParameters`, `allowImportingTsExtensions` (relative imports include the `.tsx`/`.ts` extension). `noEmit` — Vite does the transform.
- **Engine/server tsconfig excludes `src/**/*.test.ts`** from the build, and vitest doesn't type-check tests: each one's `typecheck` checks them through its own `tsconfig.tests.json` (the server's since 2026-10-13, which found seven errors).
- **`package-lock.json` is written by npm 11.** npm 10 drops the `libc` fields npm 11 records for platform-specific optional packages, so changing dependencies with npm 10 churns the lockfile. Where the installed npm is older (the cloud sessions' image has 10.9), use `npx npm@11 install …`.
- **Shared dev deps are hoisted to the root** `package.json` (`typescript`, `@types/node`). Don't re-add them to a workspace unless a version needs to diverge.
- **Lint** is oxlint, not ESLint. Config in `client/.oxlintrc.json` (`react`, `typescript`, `oxc` plugins; `react/rules-of-hooks` errors).
- Assets in `client/public/` are referenced by absolute path (e.g. `/favicon.svg`); assets imported from `src/` go through Vite.
- **`game.ts` reads as *binary* to git and grep.** It contains a literal NUL byte — the `"\0none"` sentinel at the `chosenCreatureType` fallback, written as a raw byte rather than the escape — so a plain `grep` over it reports "Binary file matches" and finds nothing. **Use `grep -a`** (the Grep tool hits this too). Don't remove the byte casually: with `core.autocrlf=true` and no `.gitattributes`, being binary is the only reason git stores that file verbatim, and making it text normalises CRLF→LF across all ~10,100 lines in one commit, taking `git blame` with it. See `docs/plans/decision-registry.md`. **Edit it with the Edit tool**, which keeps its CRLF and the NUL byte (checked 2026-10-09) — not a script's text-mode rewrite. To check endings, count bytes (`python -c` over `open(f,'rb')`) or read `git diff` through `cat -A`: Git Bash's `sed`, `grep` and `wc` hide the CRs.
- **Windows CRLF/LF drift**: editing an existing pure-LF source file on Windows can leave it with *mixed* line endings (untouched lines stay LF, lines the tool rewrites come out CRLF) — distinct from a file that's already consistently CRLF (harmless). Before committing, if `git diff --stat` on an edited file looks disproportionate to the actual edits, check directly (`git cat-file -p HEAD:<path> | grep -c $'\r'` vs total line count) rather than trusting the diff size. Fix with `sed -i 's/\r$//' <path>`, rebuild/retest, then fold the fix into the same commit via `git commit --amend` if nothing's been pushed yet.
