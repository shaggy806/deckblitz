# Verify speed audit (2026-11-10)

Status: **audit done, nothing built.** The findings below are ranked; `BACKLOG.md` ("Tooling /
docs") carries the one line of open work.

An audit of `npm run verify` (`scripts/verify.mjs`) and every step it runs, to make it faster
without changing what it catches. Eleven read-only analysts each took one area, a skeptic
re-checked each area against the code and the baseline, and a critic listed overlaps. Numbers
marked *measured* were timed alone on the idle PC; the rest are estimates from the code and the
baseline.

## Baseline (measured)

The PC: i5-13600K (20 threads), 32 GB, Node 24.20, TypeScript 7.0.2, vitest 4.1.11. Warm build,
tree equal to `origin/main`, 12 cards forced with `--with` to stand in for a batch.

| run | wall | the serial main chain |
|---|---|---|
| `--full` | 330 s | gen:cards 4, build 19, marks 2, stand-ins 29, typecheck 22, engine suite 169, server suite 56, card:verify 28 |
| `--quick` | 192 s | gen:cards 3, build 17, marks 2, stand-ins 8, typecheck 14, engine suite 119, card:verify 28 |
| `--fuzz-new` | 73 s | gen:cards 4, build 18, then the 4 uncapped new-card games 51 |

- **The main chain is the whole wall time.** Every background step ends earlier; the last is a
  4-player fuzz half at 306 s of the full run.
- **Memory runs out during the engine suite.** Free memory falls from ~20 GB to under 1 GB, even
  in the quick run with no fuzzer beside it (8 workers at ~2.3 GB each). Beside the plain fuzzers
  the suite takes 169 s against 119 s.
- **The head and tail are nearly idle.** 4-8 of 20 threads busy during gen:cards and the build;
  2-4 during card:verify, which runs alone at the end.

## Findings, ranked

Savings are wall seconds on the PC and are not additive: in a full run everything on the main
chain is capped at ~24 s (the 306 s fuzz floor) until item 5 lands.

### Same coverage, small changes

1. **card:verify from the bundled barrel** — 28 s to **1.7 s, measured** (a prototype; a tampered
   copy still fails). `verify-cards.mjs` imports 31,417 files from `dist/cards/pool` one at a
   time; `dist/cards/generated.js` already holds the same definitions as `CARD_FILES` and imports
   in ~1.1 s. Keep the per-file path for `--dir review|scaffold`. The only thing no longer
   checked is the leftover dist file of a deleted card. Quick −26 s, full −24 s.
2. **Server suite: let Node import the built engine** — 46.7 s to **15.9 s, measured** (11.9 s at
   8 workers; 30 files, 360 tests pass). `engine` is a workspace symlink outside `node_modules`,
   so vitest inlines it and pushes the 29 MB barrel through Vite once per isolated file. Add
   `server: { deps: { external: [/\/engine\/dist\//] } }` to `server/vitest.config.ts`. Lost:
   source-mapped engine frames in a failing stack. Full −24 s now, ~−30 s once the fuzz floor
   moves; quick runs that touch `server/` −30 s.
3. **Typecheck: run only the two tests configs, directly** — 9.0 s to **3.3 s, measured**
   (engine 3.0 s, server 0.3 s). Root `npm run typecheck` re-runs gen-cards a third time and
   re-checks protocol, server source and client, which the build checked seconds before on the
   same tsconfigs. Quick −6 s, full −8 s.
4. **gen-cards runs three times a verify** (step 1, the build's prebuild, pretypecheck); two are
   repeats, ~2.5 s each. Item 3 removes one; calling the engine build's parts directly removes
   the other. −3 to −5 s.
5. **Plain fuzzers after the engine suite, in more processes** (full runs with engine changes
   only). Three fuzz processes sit beside the suite and starve it of memory (169 s against
   119 s), and the 4-player half ending at 306 s is the floor under every other full-run saving.
   Start them when the suite ends, beside the server suite, as seed ranges: 2p in two processes,
   4p in four to six. Estimated −35 s alone and it unlocks the rest; the risk is the server's
   timed tests flaking beside the load, so measure it three times first.
6. **One shared card registry per test worker** — `table()` in `src/test/harness.ts` builds a
   fresh 32,190-entry registry for every game (2.75 ms each, measured on dist; 23,600 call sites).
   Share one per worker, with `register` throwing, and give the six files that register on a
   game's default registry their own. Estimated −11 s quick, −16 s full; not yet run.
7. **stand-ins off the chain** — 9 s alone (measured), 29 s where it runs in a full run. It reads
   pool sources and the Oracle snapshot only, so it can start with gen:cards; nothing later reads
   the marks, so they need not be awaited. Quick −7 s; full only after item 5.
8. **Engine-tests typecheck beside the build** — it reads `src`, not `dist`. Quick −3 to −8 s on
   top of item 3; needs a free-memory guard (two tsc at once peak near 12.6 GB) and is not for
   4-core machines.
9. **Smaller ones**: serve the bundled barrel to Vite without a source map (−4 s); three tests
   re-read all 29,400 card files `pool.test.ts` already holds (−2.5 s); one test runs every bot
   scenario to read one report (−1 s); `bundle-shards` re-bundles all 33 files when no card
   changed (−8 s on engine-only builds, but the cache key must include the script and the
   rolldown version).

With items 1-4 and 7 a quick run goes from 192 s to about 150 s; with 6 and 8 to about 130 s. A
full run goes from 330 s to about 300 s without item 5 and to about 230 s with it.

### Trades coverage — the owner's call

10. **Narrow the engine suite on a cards-only quick run** (as `--landing` does): run the ~39
    files that walk the pool plus the changed tests, ~75-80 s against 119 s. Both skeptics
    marked this as a real reduction: the engine reads the whole pool at run time (the card-name
    catalogue, fixed-seed bot games, sample decks), so an unchanged test can change with a new
    card, and batches that edit an existing card fall back to the whole suite anyway. Not
    recommended without replaying past batches to count what it would have missed.

### Coverage holes found on the way (these cost time, not save it)

- **Quick mode skips suites whose inputs changed.** `server/src/test/manual-check-presets.test.ts`
  reads `client/src/builder/manualChecks.ts` and `docs/manual-checks.md`, which card batches
  edit, but quick runs the server suite only for `server/` or `protocol/` paths. An engine-only
  change in quick also skips the server suite, though the server tests drive `engine/dist`.
- **`addedCards()` drops a new card that was staged and then edited** (`AM` in porcelain;
  `verify.mjs:270` accepts only `??` and `A `): no situation fuzz for it.
- **The `--fuzz-new` stamp ignores token files and edited existing cards**, so a token fix after
  a pass leaves the stamp valid, and an edited card is never fuzzed.
- **`--landing`** re-runs 5 hand-listed pool-wide files; a branch that changed engine code and
  then merges main's new cards sees "no engine code brought", so the run-time audits never meet
  main's cards.
- **A main-chain failure throws away background results that already passed**: the stamp is
  written only on `--fuzz-new`'s success path, so the re-run replays situations and the new-card
  games.

### 4-core cloud sessions and CI (derived, not measured here)

- CI plays its 60 two-player and 8 four-player fuzz games one at a time on a 4-vCPU runner: run
  them as four processes at once.
- On 4 cores the 30 four-player games are one process that outlasts every other late step:
  split it in two.
- CI as parallel jobs (typecheck and lint, the suites, the fuzzers), the bundle published by a
  last job; the job runs close to its 25-minute limit today.
- `--fuzz-new` ends on one process of four uncapped games: two processes of two.

### Not timed

- Build and typecheck right after an engine-source edit (the baseline is warm with nothing
  changed); if each takes tens of seconds, running them side by side moves up the list.
- A fresh local worktree's first verify is fully cold (~140 s build, ~24 s typecheck): seeding
  `engine/dist` and `engine/.cache` from the main checkout was not tried.

## Ruled out

- More than 8 engine-suite workers: memory, not CPU, is the limit (0.7 GB free at 8).
- Lowering game or scenario counts: coverage calls with measurements behind them in
  `verify.mjs`'s comments; nothing here argues against them.
- The client suite (3.5 s) and oxlint itself are fine; lint's 6-9 s is mostly npm's nested
  shells.
