# Fixing what the bot audit found

Status: **in progress** (2026-11-10): steps 0-2 built and live, steps 3 and 4 built, step 5 under way (its scenarios in; hand quality next). The findings, their evidence and
their finding numbers (S1-S8, Q1-Q8) are in `bot-audit-2026-11.md`; this file is only the order,
what each step changes, and how each is checked. Three choices near the end are the user's.

## Progress

One step a session, with the `bot-audit-next` skill. When a step lands, tick it here with its date
and commit, write its *As built* lines under the step, and move `Next`.

- Next: **step 5, sub-step 5** (the sequencing rules retired, then the step's one A/B;
  sub-steps 1, the scenarios, 2, hand quality, 3, the other engines, and 4, interaction on
  the player it hits, are built).
- [x] Step 0. Tools (2026-11-10)
- [x] Step 1. Four misplays (2026-11-10; `d15599f95` Q3, `752a7550e` Q6, `aadc42a5a` and
  `e1b359709` Q7, `f626a7351` Q5)
- [x] Step 2. The clock (2026-11-10; `0fb9b8bec` the bots, `72b1173f4` the server's figures)
- [x] Step 2b. Deploy, and test live (2026-11-10; `9a0290c21` live)
- [x] Step 3, parts 1 and 2. Engine cost per tick: no trigger scan on the priority events, the
  board scans kept per mutation (2026-11-10; `8cf669edc` the scan, `ced532adf` the lists)
- [x] Step 3, part 3. The journal's snapshots and the resolution context (2026-11-10;
  `1acc7f27a`)
- [x] Step 4. Search that buys nothing (2026-11-10; `70c51a5c8` S5, `b741490be` S3,
  `ef5e18906` S4)
- [ ] Step 5. The evaluation (several sessions; its sub-steps are ticked in the step itself)

## Principles

- **One finding, one commit, one scenario.** Every decision-quality fix lands with the gate
  scenario built from the audit's own position, watched fail on today's code first.
- **Ship on the gate and a sane `bot:diff`**, as bot changes do now. No A/B is planned before
  step 5; the audit's own point is that an A/B at count budgets can't see most of this.
- **Speed is measured, before and after, on the same positions.** The audit's probes become
  tracked tools in step 0 so "17-27% faster" can be re-measured on the fix itself, not on a stub.
- **Smallest sound change first.** Where the audit's checkers narrowed a fix (the window memo,
  the characteristics cache, the deadline's callers), the narrow form is what's planned.

## Step 0. Tools the rest depends on (half a session)

Nothing here changes how a bot plays.

1. **A clock the tests can drive.** `EvalBotOptions.now` (default `Date.now`), read by
   `onClock`, `outOfTime` and `timed`. A scenario can then say "the clock runs out during the
   first simulation" through the real path; today's `maxSimulations: 1` stand-in is a different
   path and stays for what it tests.
2. **The probes, tracked.** Move from `.scratch/bot-audit/` into `engine/scripts/`:
   `anatomy.mjs` as `bot:anatomy` (unit costs, ticks, ms a tick, from a snapshot), `harvest.mjs`
   as `bot:timings` (games at a wall-clock budget, one row per searched decision, the
   by-board-size table), `expiry.mjs` folded into scenarios once (1) exists. `bot:timings` draws
   from `BENCH_DECKS` by default, so nothing from the pilot branch is needed or named.
3. **Three or four big-board snapshots checked in** under `engine/data/bot-positions/`, taken
   from bench-deck games (`seed-50-t40` is one): the fixed positions every speed step is timed
   on. Bench decks only, so they are publishable.
4. `--budget` on `bot:replay`; `bot:behaviour`'s default budget read from one exported
   `LIVE_BOT_BUDGET_MS` that `room.ts` also uses.

Done when: `npm run bot:anatomy -w engine -- --from <snapshot>` prints the audit's numbers for
that position, and a scenario using `now` fails on today's S1 behaviour.

*As built* (2026-11-10). `EvalBotOptions.now` is carried on each search's budget, so `onClock`,
`outOfTime`, `timed` and the audit's `expired` all read the one clock. The S1 position is a test,
not yet a gate scenario, because the gate has to stay green until step 2: `eval-bot.test.ts`
drives a clock that jumps 2 s once the first simulation is scored (through `trace`), checks the
search ends at one simulation, expired, where v1 and an unhurried v2 both cast, and holds "plays
v1's cast" as an `it.fails` — step 2 turns that into a plain test and adds the gate scenario.
`expiry.mjs` is not carried over; that test is what it measured. The probes are `bot:anatomy`
and **`bot:timings`** (the audit's `harvest.mjs`; `bot:harvest` was already the fit's training
set), which prints its own summary and saves positions with `--snaps`. `bot:timings` deals the
bench seatings (`bot-seating.mjs`). Four positions are in `engine/data/bot-positions/` with a
README of where each came from and its figures: `seed-50-t40-b73` (the audit's; 995 ms a
simulation and 5.83 ms a tick here over its first six searched decisions, against the audit's
740 ms for one simulation), and boards of 94, 87 and 50 from this step's run. Bench decks don't
reach the pilot decks' sizes: the widest board in 12 games was 95. `bot:replay` takes
`--budget MS|live`; `LIVE_BOT_BUDGET_MS` (`eval-bot.ts`) is what `room.ts` seats bots with and
`bot:behaviour` now defaults to (it said 300 ms, the budget before 2026-10-18).

The baseline for step 2, from that run (12 bench games from seed 1, the live budget, 6 workers,
the development PC): 3,095 searched decisions, p50 154 ms, p90 892 ms, worst 1,700 ms; 22 over
1 s and 2 over 1.5 s; 146 ended at one simulation (88 of them land searches, 36 decisions, 21
attack declarations, none a priority search); 5 priority searches were cut to their two
baselines and passed where a fresh v1 acts (4 activations, 1 cast). On boards of 60-79, 27% of
searches were cut and a simulation cost 89 ms. So on bench decks on this machine S1's own case
(one simulation, then a pass) didn't occur: the pilot's decks or a slower machine are where it
shows, which step 2b measures.

## Step 1. Four misplays, each a few lines (one session)

Independent of each other; any order. Each gets its scenario in `scenarios.ts`.

| Finding | Change | Scenario |
| --- | --- | --- |
| Q3 sacrifice fodder | `cheapestPermanents` (and `withSacrificeChoices`' single candidate) rank a permanent that is the ability's own source, or has a dies / sacrifice / leaves trigger, after every other choice, reusing `isSpareFodder`'s test. If the cheapest and the cheapest-spare differ, offer both. | Seer, Blood Artist, two Grizzly Bears, opponents at 2 behind blockers: sacrifices a Bear, and an opponent is dead by end of turn. |
| Q6 planner past the crackback guard | `planLines` drops `lastUnsafe` moves from its first moves; the chosen line's board is checked with `crackbackLethal` after each step that taps or sacrifices a creature of ours, and a failing line is refused. `continueTurnPlan` drops the plan if the guard is set and the step would be unsafe now. | The gate's station position with one more land in play (the checker's position), and the Memnite variant: passes instead of stationing. |
| Q7 "payoff first", "landfall first" | In v2 only, both stop returning: the pick moves to the front of the candidate list and wins ties. v1 keeps its rule (it has no search). `payoffFirst`'s cast branch also learns to ask whether the follow-up would trigger the payoff. | Beast Whisperer, Opt and Murder against a lethal Shivan Dragon: Murder is cast. Jaddi Offshoot, a land and Murder: the same. The five existing payoff scenarios and the two landfall ones stay green. |
| Q5 counters | `UNSCORED_COUNTERS` takes `HARMFUL_COUNTERS` from `target-polarity.ts` plus `age`; a creature with a stun counter isn't an untapped or deterring body. | Evaluation-level test: stun on theirs doesn't lower our score, stun or age on ours doesn't raise it. |

Check: gate (now 182 + ~7), `bot:diff` against `origin/main` on six bench games read for
anything that isn't one of these four. Expected cost: the "payoff first" decisions go from ~5 ms
to 120-250 ms (measured in the audit); nothing else moves.

Also here, docs only: the three `BACKLOG.md` corrections the audit lists (the baselines line,
the several-sacrifice line, the `followUps` line) and the stale comments (`simulate.ts`'s 0.3 ms,
`eval-bot.ts`'s header, `bot-behaviour.mjs`'s 300 ms, the `ab-bench` skill's 18 workers).

### As built (2026-11-10)

- **Q3** (`d15599f95`). `cheapestFodder` (`controller.ts`) pays a sacrifice *cost* with the
  cheapest choice that isn't the ability's own source or a permanent that watches things die, be
  sacrificed or leave (`watchesSacrifices`), while another choice exists; v1's casts and
  activations and `isCantripDue` use it, and v2's `withSacrificeChoices` offers the plain
  cheapest as a second candidate where the two differ. Narrower than the plan in one way: a
  permanent that triggers only on its *own* death (Doomed Traveler) is not ranked last, being
  the best fodder there is. An edict's or an effect's sacrifice still gives up the cheapest by
  stats. Scenario: "pays Viscera Seer with the Bears, not Blood Artist, and drains an opponent
  out" (judged over the turn: an opponent dead).
- **Q6** (`752a7550e`). `planLines` drops `lastUnsafe` moves from its first moves; a line is
  taken only if every step passes the one-move search's own check on the board that step is
  played on (`lineSafe`; `PlannedLine.before` keeps those states), tried on up to six lines that
  beat the one-move answer (`PLAN_SAFE_LINES`), and free while no tap could be lethal; and
  `continueTurnPlan` re-reads the guard on the real board before replaying a cast or an
  activation, dropping the plan if it is unsafe now. A step isn't blamed for a board the planned
  attack had already left open. Two scenarios, each judged over the turn (the Bears stays
  untapped): with a Forest in hand (the land chains), and with a Memnite in hand (Memnite,
  station, station).
- **Q7** (`aadc42a5a`, `e1b359709`). In v2 neither rule returns: the pick is the first candidate
  scored. With a landfall permanent castable, the fetch, the only land and the land search wait
  for that search too, since a land played first is what the rule was there to prevent.
  `payoffFirst`'s cast branch (v1's too) asks that the spell castable after the payoff match
  its trigger's filter. **Found by `bot:diff`**: a land drop had never been weighed against
  passing, and now could be: when a play was held for combat the answer became a pass and two
  lands stayed in hand (seed 5, turn 34). The land rules are now one answer (`landRule`), asked
  again when the search passed with a landfall permanent in hand; that window then costs a
  search and a land search. The `"payoff first"` and `"landfall first"` audit labels are gone.
  Two scenarios, judged over the turn (Murder cast, or held with its mana up): Beast Whisperer,
  Opt and Murder; Jaddi Offshoot, a Swamp and Murder. The seven older payoff and landfall
  scenarios pass unchanged.
- **Q5** (`f626a7351`). `UNSCORED_COUNTERS` takes `HARMFUL_COUNTERS` (stun, blight, flood,
  -1/-1) and `age`. **Not done: "a creature with a stun counter isn't an untapped body".** An
  untapped creature with a stun counter blocks and attacks as usual; the counter only replaces
  its next untapping (rule 122.1d), so the plan's wording would have been wrong for it. A
  *tapped* stunned creature staying down a turn longer is not modelled. Three tests in
  `test/bot-features.test.ts`, watched fail first.
- **Checks.** Each scenario failed on the code before its fix. Gate 207 of 207 (202 before, the
  resolved captures included). `bot:diff` against `origin/main`, six four-player games, before
  the land fix: 19 of 11,314 decisions differ. Thirteen are Q7 by the cards alone (a land, Sol
  Ring, a removal spell or another creature ahead of Elsha, Jaws of Defeat, Omnath, Ob Nixilis,
  Manaform Hellkite or Champion of Lambholt, and what followed from the new order); one was
  the pass that became the land fix; two read as Q6 but were not replayed (a Clue cracked
  instead of a stationing; Champion of Lambholt instead of a convoked Nissa's Expedition); and
  three were not traced to a cause (Hearthhull's draw ability at beginning of combat where the
  old bot passed; Carven Caryatid where it passed; Citanul Hierophants ahead of Thunderfoot
  Baloth). Only the pass was replayed and read on its board. Not re-run after the land fix, and the cost of the decisions that used to
  return at once (the audit's 120-250 ms) was not re-measured.
- Docs: the three `BACKLOG.md` corrections, `simulate.ts`'s cost figure, `eval-bot.ts`'s header
  and the `ab-bench` skill's worker advice (`bot-behaviour.mjs` was fixed in step 0).

## Step 2. The clock (one session, after step 0)

In this order, because each makes the next testable:

1. **S1, an expired search.** When the clock stopped the main search with no candidate scored,
   return v1's pick if it is a cast that survived `listCandidates`; otherwise pass as now. Match
   v1's pick to a candidate by offer (card + via + face, or source + ability), not by
   `JSON.stringify`. Fix the comment at `eval-bot.ts:1148-1157` and `room.ts`'s.
2. **Skip a baseline that can't fit.** Keep the last decision's longest simulation on the
   controller, keyed by turn; when it alone exceeds the budget, answer at zero simulations by
   (1)'s rule. This is the change that turns a 1-3 s window into tens of ms.
3. **v1's proposal must not count as an activation** (`controller.ts:4589-4592`): count where
   the action is returned to the engine, not where it is proposed. A precondition for leaning on
   v1's pick.
4. **S2, a deadline inside a rollout.** One shared predicate wrapper (`withDeadline(pred,
   until, now)`) used by `horizonTest` and by every inline predicate (`simulateSettled`,
   `simulateCombat`, `simulateTurns`, `simulatePlan`, `turn-plan.ts`'s three); it throws one
   module-level `ABORTED`. `simulate*` return a distinct aborted result, not `null`. The four
   callers that misread a null are fixed in the same commit: `tapsIntoCrackback` (aborted is
   "unsafe"), `nextTurnValue`, the attackers search (falls back to v1's swing), the pass baseline
   (falls to rule 1). The stand-in's nested `bestDecision` inherits the outer deadline. Count
   budgets (`until === Infinity`) take none of this, so the gate and benches stay deterministic.
5. **The server can see a slow decision**: beside the histogram, a max since start, counts over
   the budget and over twice it, and one `console.warn` per over-budget decision with board size
   and `lastDecision`. `/status` shows the max and the count.

Check: scenarios through `now` for 1, 2 and 4; `bot:timings` before and after on the same seeds
— decisions over 1.5 s should go to about zero and the share of one-simulation passes with it;
the gate at `timeBudgetMs: 1000` still 182/182; server and client suites.

### As built (2026-11-10)

All five parts, in `0fb9b8bec` (the bots) and `72b1173f4` (the server).

- **(1) An expired search** (`unscoredCast`, `eval-bot.ts`). When the clock has stopped a
  priority search with no candidate scored, it plays v1's pick if that is a cast still among the
  search's candidates and not one kept on a condition only a rollout shows (`mustKill`, held for
  after combat); otherwise it passes, and a pass still falls to the land a landfall permanent
  was waiting on and to a due cantrip, as before. Matched by card, `via` and face; the
  candidate played is v1's own filling if the search listed it, else the search's first.
  `lastDecision.via` reads `"v1's cast"` or `"no time"`.
- **(2) A baseline that can't fit** (`tooSlow`, `noteCost`). A search whose *first* simulation
  the deadline stopped, or in which one simulation outlasted the whole budget, marks the turn;
  for the rest of that turn a priority window is answered by (1) with no simulation and an
  awaited decision with v1's answer. Keyed by turn number, as planned, so the first window of
  each player's turn tries again. Differs from the plan in what it remembers: not the longest
  simulation's length (with (4) no simulation can run much past the budget, so the length says
  little) but that the first one didn't finish. Attack and block declarations still search
  every time: they have v1's declaration to fall to, at the cost of one budget.
- **(3) v1's proposal** (`controller.ts`). `HeuristicBotController.act` is now `propose` (what
  it would do, nothing counted) under an `act` that counts the activation it hands to the
  engine (`noteActivation`); v2 asks `propose` and counts what it actually plays. v1's own play
  is unchanged.
- **(4) A deadline inside a rollout** (`simulate.ts`). Differs from the plan in mechanism, not
  in effect: the deadline is module state set for the length of one decision
  (`withRolloutDeadline`, from `onClock`), not a parameter threaded through every `simulate*`;
  each stop test is wrapped (`untilDeadline`: `horizonTest`, the four inline tests in
  `simulate.ts`, `turn-plan.ts`'s three) and throws `ABORTED`, and one wrapper (`rollout`)
  replaces every function's `try`/`catch`. A stopped rollout still returns `null`, and
  `rolloutAborted()` says that the last `null` was the clock: a flag beside the `null` rather
  than a distinct result type, because most callers already do the right thing with a `null`
  (skip the candidate; the next clock check ends the loop) and only the four the audit named
  have to ask. Those four: `tapsIntoCrackback` reads an aborted check as unsafe;
  `nextTurnValue` returns `null` and `planLines` then keeps the one-move answer; the attackers
  search returns v1's swing when its first simulation was stopped; a stopped pass baseline
  leads to (1). A stand-in's nested `bestDecision` inherits the deadline through the module
  state without being given a clock. With no clock nothing is wrapped or read.
- **(5) The server** (`room.ts`, `load-monitor.ts`, `status-server.ts`). Per thread, since it
  started: the slowest decision and the counts over the budget and over twice it
  (`botDecisionTotals`), carried in the load report; `/status` prints them beside the p99, for
  the main thread (a new `bots` line) and for each shard, and `/status.json` has the fields.
  One `console.warn` per over-budget decision: its time, seat, turn and step, permanents,
  stack size, and `lastDecision` (kind, via, simulations, expired, cut).
- **Also**: `bot:scenarios -- --budget MS` runs the gate on a clock.

Scenarios (two; both read the clock through `now`): "casts v1's spell when the clock stops the
search before anything is scored" (the clock jumps during the first rollout; it also asks a
second window the same turn and requires zero simulations, which is (2)) — fails on the code
before this step; and "does not station into a lethal crackback when the clock stops the
check" (the clock jumps between a candidate's rollout and its crackback check) — which can't
fail before (4) exists, so it was watched failing with the `tapsIntoCrackback` line put back
to "safe", as (2)'s half was with the `tooSlow` check removed.

Measured, `bot:timings`, 12 four-player games from seed 1 at the live budget, 6 workers, the
bench decks, the build before this step against the one after (a clocked game doesn't replay
exactly, so these are neighbouring games, not the same ones):

| | Searched decisions | Over 1 s | Over 1.5 s | Worst | p90 | Cut to baselines |
| --- | --- | --- | --- | --- | --- | --- |
| Before | 3,069 | 24 | 2 | 1,850 ms | 884 ms | 5 (3 passes where v1 acted) |
| After | 3,054 | 16 | 0 | 1,036 ms | 894 ms | 1 (a cast, as v1's) |

The 16 still over a second are all within 36 ms of it: the budget plus the tick in flight. One
window in the twelve games was answered by (1) (`no time`). So on this machine and these decks
the step bounds the tail and changes little else, which is what the audit predicted ("no
average gain"); the boards where one rollout doesn't fit (the pilot's decks, the live box) are
what step 2b measures. `bot:diff` against `origin/main` at count budgets: 0 of 11,316
decisions differ over six games. The gate is 209/209, and 209/209 at `--budget 1000`.

## Step 2b. Deploy, and test live (a short session; the user's call, 2026-11-10)

Steps 0-2 go live together, and the live box is measured before anything is optimised for it.
Every time in the audit is the development PC's; this is the first figure from the machine
players use.

1. **Deploy** with the `deploy` skill, once CI is green on the commit that ends step 2.
2. **Play it live, on big boards.** Two blitz games on deckblitz.net (a decklist against three
   bots), in the browser, to at least turn 25 or the game's end, with decks that go wide (a token
   deck and a ramp deck from the bench decks). Watch for: a bot that stops acting on a wide
   board (S1), a pause of several seconds on one bot decision (S2), a bot that passes its whole
   turn with castable spells in hand.
3. **Read the server's figures** after each game (`/status.json` over SSH, and the service log's
   over-budget lines from step 2's (5)): the slowest decision, how many ran over the budget and
   over twice it, and the board sizes they happened on.
4. **Record them here**, under *Live figures*, beside the development PC's for the same decks
   from `bot:timings`: decisions over 1 s, the worst decision, ms a simulation by board size.
   The ratio between the two machines is the number every later estimate in this plan needs.
5. **Decide the next step from them.** If the live box is still over budget often after step 2,
   step 3 (cost per tick) goes next as written. If over-budget decisions are rare but the search
   is thin (few simulations a decision on mid-size boards), step 4 goes first. Say which, and
   why, in *Progress*.

Done when the figures are in this file and `Next` names step 3 or step 4. A fault found in play
that isn't one of the audit's is a `bug-report` or `bot-misplay`, not this step's to fix.

### Live figures

Deployed 2026-11-10 (`9a0290c21`; the box idle, no game ended). Measured the same day.

**A blitz doesn't run on the box.** It plays in a Web Worker in the player's own browser
(`local-rooms.md`, on by default since October), so the box's bots only play in lobby rooms, or
with `?local=0`. Both games here were lobby rooms on the server, every seat a bot (the human seat
handed over with "Let a bot play for me"), bot speed Fast, read from `/status` every 20 s and from
the service log's slow-decision lines. So these are the box's figures, which is what a lobby with
bots gets; a blitz gets the player's machine, which this step didn't measure (the low-end laptop
would be the one to try).

| | Decks | Turns | Over 1 s | Over 2 s | Worst | Boards of the slow ones | Shard busy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Game 1 | Token Triumph ×2, World Shaper, Draconic Destruction | 24 (crashed, below) | 18 | 0 | 1,053 ms | 28-54 permanents | ~75% from turn 14 |
| Game 2 | World Shaper, Tramplesaurus Rex, Token Triumph, Jeskai Striker | 24, won | 1 | 0 | 1,001 ms | 36 | 43-49% |

The development PC, `bot:timings`, 12 four-player games of the bench decks from seed 1, 6
workers, same build: 3,229 searched decisions, 11 over 1 s, none over 1.5 s, worst 1,024 ms, p90
887 ms; ms a simulation 13 (0-9 permanents), 20, 29, 37, 43 (40-49), 55 (50-59), 68 (60-79),
179 (80-99); one `no time` window in the twelve games.

What they say:

- **Step 2's clock holds on the box.** The worst decision was 53 ms past the budget and nothing
  reached twice it; no bot stopped acting, and no pause of several seconds showed (S1, S2).
- **The search is thin there.** The box's slow decisions finished 1-4 simulations in the second
  at 38-54 permanents (two had 8 and 11, at 28 and 40), where the PC's slowest finished 8-11 at
  42-71: **250-500 ms a simulation against 90-120, so 3-5 times slower** on the decisions that
  hit the clock (the same ratio `local-rooms.md` gave, 3-4). Ten of game 1's eighteen were
  `no time` windows, the baselines alone using the second, against one in 3,229 on the PC; one
  was answered by `v1's cast`. From turn 14 the shard's p99 decision sat at 0.9-1.0 s.
- **Not measured**: ms a simulation by board size on the box. The server logs only decisions
  over budget, so the figures above are that tail, not an average; `bot:timings` on the box
  itself would give the table, and wasn't run (a benchmark on the production machine is the
  user's call).

**Next is step 4, then step 3.** By the rule above: decisions over budget are bounded, and the
search is thin on mid-size boards. Step 3's 15-25% off a rollout turns two simulations into two
and a half; step 4 stops paying for searches that change nothing (the repeated empty-stack
windows, the `"acting"` rollouts `castPayoff` asks for, the planner's cut levels), which is what
a search that affords two simulations needs first.

**A fault that isn't the audit's**, found in game 1 and recorded in `docs/engine-gaps.md`
("A bot's cast the engine refuses takes the shard down"): at turn 24 a bot's cast of Conclave
Tribunal (convoke) threw `alice cannot pay the cost of Conclave Tribunal` from `Game.castSpell`;
nothing catches a bot's move in `Room`, so the shard exited and every room on it was lost.

## Step 3. Engine cost per tick (one session, engine only)

1. **No trigger scan for `priority-passed` / `priority-received`** (S6). First read every branch
   of the trigger matcher for a kind that ignores event type, and grep the card pool's trigger
   kinds once more; then skip `detectTriggers` for those two types in `emit`. Keep the cache
   flush. Check: the whole engine suite, the 2- and 4-player fuzzers with `MTG_CACHE_CHECK=1`, the
   situation fuzzer, and end-state hashes equal on the step-0 snapshots. Expect 15-25% off a
   rollout on ordinary boards, ~5% on token turns (the audit measured it by stubbing).
2. **Memoise `typeGrantSources`, `contributingStaticSources` and the ability-grant sources** on
   (state, mutation epoch), the way `staticLossesMemo` is. Same checks. Expect 5-15% (a guess).
3. **Only if (1) and (2) land clean and `bot:anatomy` still shows them**: the journal's uncached
   last-known snapshot per entered permanent, and building the resolution context lazily. Each is
   a token-turn cost; neither is planned until measured again.

Not planned: a general epoch-keyed characteristics cache (unsound as first proposed); making the
name helpers faster (their time is scan volume, which (2) removes); anything in the evaluation
or the clone.

### As built (2026-11-10): parts 1 and 2

**Part 1.** `Game.emit` returns before `detectTriggers` for `priority-passed` and
`priority-received`, after the cache flush. Read first: every case of `triggerKindMatches` tests
the event's type before anything else (the generic `{ on: "event" }` kind through
`triggerEventSubjects`, which reads a `TRIGGER_EVENTS` row's type), the scan's own special cases
and its watchers (`fireLeaveWatchers` and the rest) are each behind a type test, and
`fireWheneverWatchers` goes through the same matcher. `trigger-scan.test.ts` holds the table half:
no `TRIGGER_EVENTS` row is a priority event.

**Part 2.** `typeGrantSources`, `contributingStaticSources` and `abilityGrantSources` go through
one `boardScan` (`characteristics.ts`): the last answer of each, kept on (state, registry,
mutation epoch) as `staticAbilityLosses` is, never kept or served inside a re-entrancy guard, and
under `MTG_CACHE_CHECK` recomputed on each epoch's first hit and one hit in 16 after.

**Where it differs from the plan.** The plan took the epoch as it was. It isn't enough: the
epoch moved only in `invalidateComputedCache`, and a write between cache regions that never
called it was safe only because a region clears as it opens. Three tests failed on the memo
alone. Two wrote the state by hand (now they say so); the third was real: the `grant-static`
effect adds its modifier and announces nothing, so the next instruction read the old list. So
the epoch now also moves at the end of every effect instruction (`applyEffectSpec`) and every
dispatched action (`Game.dispatchOne`), through `noteStateMutation`, which leaves an open
region's cache alone. This is the audit's own warning about a general cache, met for these
three lists; a wider epoch-keyed cache would still need the same care at every write.

**Checks.** The engine suite; the end state of a v1 rollout from each fixed position (up to 400
acts) hashed equal before, after part 1 and after part 2; simulations and ticks a decision
unchanged; with `MTG_CACHE_CHECK=1`, 40 two-player games with every memo hit recomputed, then on
the build as shipped 40 two-player and 8 four-player games (12 more at four players before the
epoch's wider net went in), and the situation fuzzer over twelve
cards with layer-4 and lose-all statics (Blood Moon, Humility, Urborg, Opalescence, Mycosynth
Lattice and others, every hit recomputed). Recomputing every hit at four players was too slow to
finish a game in 17 minutes, which is why the check samples.

**Measured** (`bot:anatomy`, the development PC, alone, ms a simulation; simulations and ticks
identical in every column):

| Position | Before | Part 1 | Parts 1 and 2 | Off |
| --- | --- | --- | --- | --- |
| `seed-5-t28-b50` (ordinary) | 149 | 136 | 131 | 12% |
| `seed-5-t34-b87` | 229 | 225 | 186 | 19% |
| `seed-10-t40-b94` (widest) | 284 | 283 | 204 | 28% |
| `seed-50-t40-b73` (token turn) | 992 | 905 | 799 | 19% |

Part 1 gave 9% on the ordinary board and the token turn and nothing on the two wide combat
boards: less than the audit's 17-27%, which was on quiet 20-43 permanent boards where the two
priority events are most of what happens. Part 2 gave nothing much on the ordinary board and
17-28% on the wide ones, more than the 5-15% guessed.

**Left: part 3.** A profile of the token turn after both parts still shows
`recordJournal` → `takeLastKnown` at 9.7% and `makeResolutionContext` at 8.8% self (garbage
collection 11.9%), so both are worth building; `detectTriggers` is still 21.6% inclusive there,
which is real events now.

### As built (2026-11-10): part 3

**The resolution context.** Not built lazily: it didn't need to be. `makeResolutionContext`
cost 2 ms a call (measured alone, 20,000 calls), and the profile spread that evenly over its
lines, which is not what 690 closures cost. The cause was the literal's head: five spreads for
the optional fields (`readTargets`, `sourceLost`, `granter`…) among its first dozen keys, and
after a spread the runtime defines every later property one at a time, ~480 of them into a
dictionary. The optional fields are now gathered in their own small object and assigned after a
plain literal (`Object.assign`): **5 microseconds a call**, 400 times less. The context's keys
and values are the same; only their order differs.

**The journal's snapshots.** Counted on the token turn (one v1 turn from `seed-50-t40-b73`): 405
`entered` snapshots, in batches of 7 to 17 permanents, each taken inside its own `emit` just
after the flush, so each rescanned the board's statics (the scans part 2 keeps per mutation, and
`emit` moves the epoch). `withEnterBatch` now takes the batch's snapshots together, in one cache
region, before the first is announced; `recordJournal` uses one while its permanent is still in
that stint. They entered together (rule 603.6a), and nothing between two announcements is meant
to show in the later snapshot. A batch of one is unchanged.

**Not taken on.** The `damage-dealt` snapshot of the source (141 on that turn, 0.7% of it; most
of the journal's cost on a combat board): the damage is marked between two of them, so they
aren't one read. The other callers (`moveObject`'s departures) each have their own state.

**Checks.** The engine suite (32,377 tests); the end state of a v1 play-out from each fixed
position (up to 400 acts) hashed equal before and after; simulations and ticks a decision
unchanged; with `MTG_CACHE_CHECK=1` 40 two-player and 8 four-player games (seed 24 timed out at
60 s beside the other two jobs and passes alone); the situation fuzzer over five token makers.

**Measured** (`bot:anatomy`, the development PC, alone, ms a simulation; simulations and ticks
identical in every column; *before* is parts 1 and 2, re-measured this session where marked):

| Position | Before | Context alone | Both | Off |
| --- | --- | --- | --- | --- |
| `seed-5-t28-b50` (ordinary) | 133 (re-measured) | 99 | 99 | 26% |
| `seed-5-t34-b87` | 186 | — | 145 | 22% |
| `seed-10-t40-b94` (widest) | 204 | — | 183 | 10% |
| `seed-50-t40-b73` (token turn) | 814 (re-measured) | 698 | 638 | 22% |

The context was a guess of "up to 8% on token turns" and gave 14% there and 26% on the ordinary
board, where a resolving ability is a larger share of a short rollout. The batch snapshots gave
a further 7% of the token turn (9% of what was left) and nothing elsewhere, as expected.

**Found on the way, not fixed** (`BACKLOG.md`, Bots): a v1 turn played for real from
`seed-50-t40-b73` takes 110 s for 312 acts, 89% of it in `legalActions` planning mana for an X
spell (`maxAffordableX` → `planManaPayment` → `coverGeneric` → `keepScore` → `supplyLeft`, which
looks quadratic in mana sources). Rollouts don't show it; a live seat on that board would.

## Step 4. Search that buys nothing (one or two sessions)

1. **S5, narrow `castPayoff`.** True only on our own turn, with the payoff on the battlefield or
   castable this turn, and another castable spell its trigger's filter would see. Keep the Shiko
   and Guttersnipe scenarios green. Check with `bot:timings`: the share of searches under
   "acting" (30% today) and ms a simulation.
2. **S3, a memo for repeated empty-stack windows.** A completed, uncut search that passed is
   remembered for the turn under: the candidate set; whether attackers and blockers are
   declared; battlefield ids with tapped state, damage and counters; life totals; our hand; every
   hand size; until-end-of-turn effects; who is alive. A hit skips the search and v1's `act`,
   then still runs the step-dependent rules (`isCantripDue`, `isSuspendDue`,
   `holdsCreatureFetch`, `holdsForASpell`) and never applies at the last window before our
   untap. Two things to settle before building: that a rollout of an identical state is
   deterministic (the audit didn't check), and the signature's cost against a search's.
   Check: a `bot:diff`-style run in which the memo's answer is compared with a real search at
   every hit — it must agree in all of them before the search is actually skipped.
3. **S4, the planner.** Score each child as it is settled and expand best first, so a level the
   budget cuts keeps what it paid for; under the default rollout take depth-0 values from the
   one-move search. Compare plan lines with a baseline scored under the same policy (the
   "acting" mismatch). The budget stays at 48: the planner is what carries the sequencing rules
   (Q1).

### As built (2026-11-10): parts 1 and 2

**S5, `castPayoff`.** Now true only on our own turn, with a "whenever you cast" payoff of ours
on the battlefield or the stack, or in hand or the command zone and castable now, and a spell
castable now (not the payoff itself) that the trigger's filter takes. "Castable" is the window's
own legal casts, which is narrower than the plan's "castable this turn": before the land drop, a
spell the land would pay for doesn't count. Gate 209 of 209, the Shiko and Guttersnipe scenarios
among them. `bot:diff` against `origin/main`, six games: 2 of 11,335 decisions changed, both on
the seat's own turn with a payoff out and nothing castable (which land of two; a Necropolis
Fiend activation at begin combat that the passive rollout passes on).

**S3, the pass memo** (`EvalBotController.passMemo`, `passMemoKey`). A whole search that passed
at an empty-stack window outside our own main phases is remembered; a later window with the
same key passes without the search or v1's `act`. Where it differs from the plan:

- **The key is the whole state**, serialised, not a list of fields: every candidate and the due
  cantrip, then the state but its event log and event counter, who holds priority, the step, and
  the turn's three phase counters (`mainPhases`, `combatPhases`, `endSteps`, which say no more
  than the step). Everything the plan listed is in it, and so is whatever a rollout reads that
  the list would have missed. A few milliseconds on a big board. The turn's number is in the
  key, so the memo never outlives the turn; one entry is kept, the last passed search.
- **The step-dependent rules run inside `listCandidates`**, which is called before the memo is
  asked: a fetch or a creature a hold released changes the candidates and so the key, and a
  cantrip that came due is played on a hit. The last window before our untap never uses it
  (`isEndOfTurnBeforeOurs`).
- Not remembered: a search the count or the clock cut, or one whose pass stood for a play held
  for combat. Off with `passMemo: "off"`; `"check"` searches at every hit and counts.

The two things to settle first: **rollouts of an identical state are deterministic enough** —
with `bot:timings --budget none --pass-memo check`, 12 four-player games, the memo hit 452
times (1,440 simulations a skip saves) and the real search gave the memo's answer at all 452;
the same run twice played the same games. And the key's cost is a serialisation of the state
against a search of several rollouts. With the phase counters left in the key it hit 355 times;
with the event counter left in, never.

**Measured** (`bot:timings`, 12 games from seed 1, 6 workers, live budget, the development PC;
clocked games don't replay exactly, so the two runs are nearby games, not the same ones):

| | Before | After |
| --- | --- | --- |
| Priority searches | 2,091, 659 s | 1,830, 615 s |
| … under "acting" | 368 (17.6%), 170 s | 154 (8.4%), 115 s |
| … on others' turns under "acting" | 121 | 0 |
| Empty-stack searches outside own main phases | 1,117, 156 s | 800, 117 s |
| ms a simulation, all searched decisions | 42.1 | 42.8 |
| Decisions over 1 s | 17 | 10 |

So about 7% of priority-search time on this machine, less than the audit's two guesses added
together (10-15% for a third of seats, and 11%): the "acting" share was already 18% on these
decks, not the harvest's 30%, and the sound key hits 38% of the eligible windows where the
coarse one hit half. On the live box, where a simulation costs 3-5 times as much, the skipped
searches are the same count and so a larger time. `bot:timings` now prints the "acting" share.

### As built (2026-11-10): part 3, the planner

**S4** (`planTurn`, `turn-plan.ts`; `planLines`). Three changes to the level loop, and one to
what a line must beat:

- **A move is passed out as soon as it has resolved**, the best kept line's moves first, so a
  level the simulations or the clock cut keeps every line it paid for.
- **First moves the one-move search scored are lines for nothing** (`lastEnds`, `planTurn`'s
  `scored`), where its rollout is the plan's own: the `"turn"` horizon, the `"combat"` rollout, no
  `rolloutDecisions` (`plansAsScored`). Then they're resolved best first, and only until
  `PLAN_BEAM` of them can go on, where every one used to be resolved and passed out. A land
  scored with its crack isn't one, and such a window resolves and scores its first moves as before.
- **Only a line with a step left takes a place in the beam**: one with nothing more to do
  can't begin a longer one. Not in the plan; it fell out of resolving best first.
- **Under `"acting"`** the plan scores its own first moves, as before, and a line must beat the
  plan's own line for the one-move answer (for passing, the turn passed out: one simulation),
  not the answer's `"acting"` score. The answer's line also keeps a place in the beam whatever
  it scored passed out (`planTurn`'s `lead`): with the new bar alone, the Shiko scenario failed —
  Opt passed out is worth nothing, no line began with it, and Bolt-then-Opt beat Opt's own line.
  An answer that isn't one plain move (a batch, an untap plan, a land with its crack), or that
  no line may begin with (a wipe held for combat), keeps its score as the bar.

**The reuse is exact**: in six bench games to turn 30, at each planner call every scored first
move was also resolved and passed out by the plan itself: 491 values, all equal.

**Measured** (`.scratch/bot-audit/s4-step/planner-games.mjs`: six four-player bench games,
seeds 1-6, to turn 30, count budgets; the games part ways at the first changed decision, so
these are like games, not the same ones):

| | Before | After |
| --- | --- | --- |
| Planner calls that spent a simulation | 185 | 199 |
| Planner simulations (of all the searches') | 3,001 (43% of 7,014) | 3,200 (44% of 7,239) |
| … a call | 16.2 | 16.1 |
| Two-move-or-longer lines scored | 612 (3.3 a call) | 925 (4.6 a call) |
| Calls that returned a plan | 38 (21%) | 48 (24%) |
| … under `"acting"` | 6 of 36 | 14 of 37 |
| Simulations in calls that scored no longer line | 482 | 358 |

**So no simulations are saved**, against the audit's guess of 5-10%: what the first moves no
longer cost is spent on longer lines, the budget staying at 48 as the step said, and the plan
finds half again as many lines for it. The waste the audit measured (calls that spend and score
no longer line) is down a quarter; what is left of it is mostly finding out that nothing chains,
which costs the first moves resolved. The planner is 43% of simulations in these games, not the
audit's 29%: turns 1-30 are when hands are full.

Gate 209 of 209. `bot:diff` against `origin/main`, six games: 25 of 12,110 decisions changed, at
16 windows, all on the seat's own turn: a different first step of a longer line (Kishla
Skimmer, Disciple of Bolas, combat, then Phyrexian Reclamation, where the old plan stopped at
two moves), and passes in combat that hold a later step of the plan for after it. Two unit
tests in `turn-plan.test.ts`, each failing on the old loop.

## Step 5. The evaluation, and the rules it would retire (several sessions; needs a bench)

The slow part, and the only one where "is the bot stronger" is the question.

1. **Asymmetric scenarios first** (Q4): the counterspell positions with another player ahead,
   Smothering Tithe and Rhystic Study on the stack, a tutor in hand, as *training* scenarios —
   they say what right looks like before any weight moves.
2. **Hand quality** (Q2): a per-card worth in hand from `effect-worth.ts` and the board features,
   discounted by castability, scaled so an average card stays near 2. Read with `bot:diff`; then
   try `isCantripDue`, the tutor branch, `isFreeFetch` and `isSuspendDue` off one at a time
   (`ablate.mjs`'s method, moved into `engine/scripts` in step 0) and delete each rule the gate
   no longer needs.
3. **Engines that aren't draw or creature tokens** (Q4): resource tokens, drain per trigger,
   cost reduction as mana, through `engineRate`'s consumers.
4. **Interaction scored on the affected opponent at full weight**, for counterspells, removal
   and wipes only.
5. **Retire the sequencing rules** the planner now covers — `reducerFirst`, `payoffBeforeWipe`,
   `holdsTapForCombat` — one at a time against `bot:diff` on real games, after step 1 has made
   "payoff first" a hint. Write a gate scenario that makes `hideawayFirst`, `holdsForNextSpell`
   and "only land" fire, or delete them. Delete `followUps`, `scoreFrom` and
   `FOLLOW_UP_SIMULATIONS` once Q6's check lives in the planner.

One A/B at the end of this step, at the live budget, paired by seed if the tooling exists by
then (`docs-challenge` in the audit's notes): it is the first point at which strength, not
correctness or speed, is what changed.

- [x] 1. Asymmetric scenarios (2026-11-10; `1103c8bb4`)
- [x] 2. Hand quality, and the rules it retires (2026-11-10; `726ca9237`)
- [x] 3. Engines that aren't draw or creature tokens (2026-11-10; `1a0be1bed`)
- [x] 4. Interaction scored on the affected opponent (2026-11-10; `8a141debe`)
- [ ] 5. The sequencing rules retired; the A/B

### As built (2026-11-10): sub-step 1, the scenarios

Six scenarios in `engine/src/bot/scenarios.ts`, under "answers at an uneven table", from
`interact.mjs`'s positions (four players, six lands each, opponents holding three; "carol ahead"
is two Craw Wurms and two more lands). No weight or rule changed, so no `bot:diff`.

- **Training** (wrong today, 0 of 3, as the audit's table says): *counters a draw engine from a
  player who isn't ahead* (bob's Rhystic Study, carol ahead: sub-step 4's), *counters a tax
  engine* (bob's Smothering Tithe, level table: sub-step 3's) and *counters a tax engine from a
  player who isn't ahead* (both).
- **Gate** (right today, to stay right as the weights move): *counters the leader's big threat*
  (carol ahead and casting the Craw Wurm), *saves Counterspell from a trailing player's mana
  rock* (bob's Arcane Signet, carol ahead: what sub-step 4 mustn't overshoot into), and *casts a
  tutor in its own main phase* (Demonic Tutor on two Swamps with better cards in the library).
  The tutor had no scenario at all; it passes only through `isCantripDue`'s tutor branch, so it
  is the check sub-step 2 needs when that rule is tried off.
- **Left out on purpose**: a trailing player's Craw Wurm with carol ahead, and a tutor on the
  stack. The audit calls holding the counter defensible in both, so neither answer is asserted.
  Move a training scenario to the gate (drop its `kind`) in the sub-step that turns it right.

### As built (2026-11-10): sub-step 2, hand quality

A new feature, `handQuality` (`engine/src/bot/hand-worth.ts`), at `hand`'s weight of 2: the sum
over our own hand of each card's **quality** less 1, where 1 is an average card and the range is
0.5 to 1.5. `hand` and `handManaValue` are unchanged, so a hand of average cards scores what it
did.

- **Card flow** (the old rule's `isCardFlow`, now `card-flow.ts`, returning the cards netted):
  0.4 for each card it leaves us up, less the cards a discard cost throws. Opt, Ponder,
  Brainstorm, Preordain, Thrill of Possibility 0.4; Divination 0.8; Harmonize 1.2.
- **A tutor into hand**: 0.85 of the best cards in the library its filter matches.
- **Any other untargeted instant or sorcery**: 0.85 of `effectWorth` over 2.
- **A creature**: a fifth of its board terms (2.5 + half its power and toughness), and never
  under 1 if it has any ability. Bears 0.9, a 3/3 1.1, a Craw Wurm the cap.
- **A land**: 1.25 for the first in hand below seven lands (the next land drop), 1 for the
  rest, 0.5 at seven or more.
- **Everything else** (targets, an additional cost, a noncreature permanent): 1.
- **Reach**: 15% off per mana past lands + 1, down to half, by the card's cheapest face.

**Where it differs from the plan.** The plan priced every spell by `effectWorth`. Card flow
isn't: `effectWorth` adds half a card for a scry and doesn't see a put-back, so Opt came out at
1.06 and Brainstorm at the cap, and casting either was a loss. Pricing a cantrip at 0.85 of an
average card was the second try, and `bot:diff` showed what is wrong with it: the rollouts read
the real library, so Preordain was held on turn two because the top card was out of reach, and
Harmonize and Deep Analysis were held on poor tops. At 0.4 a card (under the least any card
can be) drawing is a gain whatever is on top. Removal and counterspells are left at 1 on
purpose: what they are worth in hand is sub-step 4's.

**The search's pick had to agree.** A tutor is priced on the best card, but the rollout took
v1's pick, which ranked every land the board was short of above any spell: Demonic Tutor at
four lands found a Forest, and the tutor priced on a Craw Wurm scored a loss. A search into
our own hand now ranks by the same quality (`chooseFromZone`), and "the first land in hand is
1.25" is what keeps the land when the hand has none.

**Rules, one off at a time** (the gate, 192 scenarios without the captures; `ablate.mjs`'s
loader hooks no longer match `eval-bot.ts`, so this was a small script of prototype overrides):

| Rule off | Before the feature (audit) | With it |
| --- | --- | --- |
| `isCantripDue` | 4 fail (Opt, Ponder, Expressive Iteration, Compulsive Research) and the tutor | none |
| `isSuspendDue` | 1 | 1 (Ancestral Vision) |
| `isFreeFetch` | 4 | 4 (the fetch-land plays) |

So **`isCantripDue` is deleted**, cantrips and tutors both. One piece of it stays under its
own name, `isSacrificeForCardsDue`: Deadly Dispute and Village Rites paid with a spare
creature, which is the price of a creature (two and a half cards for a Grizzly Bears), not of
a card in hand (`bot-sacrifice.test.ts` fails without it). `isSuspendDue` and `isFreeFetch`
stay, as the audit half expected: a suspended card and a cracked fetch aren't cards in hand,
so nothing here prices them. The tutor branch's "instant tutors wait for the end of the turn"
went with the rule.

**Scenarios.** "Holds Opt earlier in the round" asserted the rule's timing, not a reason, and
is replaced by four that give the reason: Opt is cast at the end of the turn before ours and
earlier in the round when nothing else wants its Island; held earlier in the round while two
Islands hold up Counterspell (the `answers` reserve); cast beside Counterspell at the last
window. New: "casts Opt in its own main phase to look for a land" (the audit's -0.05). Two of
the five fail on `origin/main` (the earlier cast and the main-phase cast). Gate 215 of 215.
Tests: `bot-hand-worth.test.ts` (the prices), `bot-tutor.test.ts` (what a tutor finds).

**`bot:diff`** against `origin/main`, six four-player games, 35 of 12,132 decisions:

- Cantrips and loots cast sooner: Thrill of Possibility and Think Twice in the main phase,
  Opt before a charge-counter ability, a cycler cycled where it passed. Right.
- Scry, discard and search picks by quality (7): a Plains kept over Archmage Emeritus at four
  lands, a commander discarded rather than a land (it goes to the command zone), Magma Opus
  thrown before Tempest Technique. Right or a judgment call.
- Phyrexian Reclamation not activated (6, one combat): two mana and 2 life for a small
  creature card, which is now worth less than a card. A judgment call.
- Order within a turn (about 12): a ramp spell or a cheap one before the big creature, whose
  quality in hand is the cap, so casting it gains a point less than it did. Harmonize and
  Canopy Gargantuan "passed" before combat were cast after it. Gaze of Granite over Rampaging
  Baloths is the one to watch: the wipe was already close.
- Two attack declarations differ, downstream of the plays the rollouts now make.

**Left for later.** Reach ignores a cost the card reduces itself (Blasphemous Act reads as
out of reach). A hand at seven cards still holds a draw-three, since the cleanup discard is
priced. `followUps` and the sequencing rules are sub-step 5's.

### As built (2026-11-10): sub-step 3, engines that aren't draw or creature tokens

A new feature, `valueEngines` (`valueRate` in `engine/src/bot/features.ts`), in cards a round
at `drawEngines`' weight of 4, and one more term in `nonlandMana`. Each goes through
`engineRate`, so a trigger on what opponents do counts once per opponent, one with an
intervening "if" about once, and a one-shot not at all.

- **Resource tokens** (a token spent by sacrificing itself: Treasure, Clue, Food, Blood), four
  to a card, as `resourceTokens` already prices one; halved under an `unless` an opponent can
  pay, as Rhystic Study's draw is. Smothering Tithe at four players: 3 × 0.5 / 4 = 0.375 cards
  a round, 1.5 points.
- **Drain**, life taken from opponents at four a card (`trackRecord`'s rate): a loss or damage
  to each opponent counts every opponent (Zulaport Cutthroat 0.75 at four players, Purphoros
  the cap), a targeted player's loss one (Blood Artist 0.25). Damage aimed at a target isn't
  counted, since it may be a creature's; life we gain isn't either. A printed drain is taken
  off `trackRecordOf`'s tally, so it isn't counted there again.
- **The cap** is 1.5 cards a round for one permanent (six Treasures or six life).
- **Cost reduction as mana**: the generic mana a permanent's best static takes off spells its
  controller casts (`reductionPerTurn`: Goblin Electromancer 1, Urza's Incubator 2, 1 for a
  counted amount) is added to `nonlandMana`, as for one spell a turn, so a reducer is priced
  like a rock, `earlyMana` included.
- `engineScore` adds the value rate, so `aimOffer` ranks these engines among removal's targets.

**Where it differs from the plan.** One feature for tokens and drain together, since both are
already in cards; the reducer is not an engine rate at all but mana, which is what the plan's
words say and what `earlyMana` should see.

**Scenarios.** *Counters a tax engine* (level table) moves from training to the gate: it scored
-1.1 and now counters. Two new gate scenarios, Murder choosing between a Grizzly Bears and the
engine beside it: *removal takes the drain engine* (Zulaport Cutthroat) and *removal takes the
cost reducer* (Goblin Electromancer). All three fail on `09bdc8b13`. *Counters a tax engine
from a player who isn't ahead* is still wrong, as expected: bob's permanent counts at a
quarter there, which is sub-step 4's. Gate 218 of 218. Tests: `bot-value-engines.test.ts`.

**`bot:diff`** against `origin/main`, six four-player games, 11 of 12,967 decisions:

- A reducer cast first (2): Nogi, Draco-Zealot ahead of an Orb and of a Spit Flame. Right.
- Removal at a reducer (1): Infernal Grasp on alice's Nogi on turn 11, where the old bot
  ramped. Right by `earlyMana`'s rule; a judgment call otherwise.
- A drain engine cast or hit (2): Guttersnipe over Shiny Impetus; Windgrace's Judgment takes
  Firespitter Whelp. Right.
- Order within a turn (4): Dragonhawk before Spit Flame, Shadrix Silverquill before Wall of
  Reverence, Orb of Dragonkind before Drakuseth, and Izzet Signet held until after Vanquish
  the Horde (read in `bot:replay`: the Signet was cast later the same turn). Judgment calls,
  from boards with a reducer or a Treasure maker on them.
- Two attack declarations differ (a different opponent; a Wall of Reverence sent along).

**Left for later.** A Treasure under an `unless` is halved whatever the price, so Tithe's {2}
reads as paid as often as Rhystic Study's {1}: 1.5 points is low for the card, and it only
just turns the level-table counter. Tax effects on opponents (Thalia, Sphere of Resistance)
are still blank. Sub-step 4 is what makes any of this count for a player who isn't ahead.

### As built (2026-11-10): sub-step 4, interaction scored on the player it hits

A counterspell, removal or a wipe is scored by what it took from the opponent it was aimed
at, in full, instead of by where that opponent stands.

- **Which actions** (`engine/src/bot/interaction.ts`, new): read off the action, not the card.
  A spell or ability with a target an opponent controls, a permanent or a spell on the stack,
  is aimed at that opponent; one with no such target whose effect tree has `destroy-all`,
  `exile-all`, `damage-all`, `return-to-hand-all` or a `sacrifice-all` is aimed at every
  opponent. A player as a target is not interaction (burn at a face is a race), nor is an
  attack.
- **The score** (`aimedOutcome`, `scoreOutcome` in `evaluate.ts`): the outcome carries how each
  player aimed at stood in this decision's pass (`EvalOutcome.hit`; `players` names each of
  `theirs`). Of those, the one left furthest below the pass is put back at the pass's score
  among the standings, and what they lost is subtracted at `opponent`. So the answer counts
  once in full, a wipe counts one board in full and the others by standings, the result is
  never below the plain score, and an action that took nothing scores as before.
- **Where**: the priority search's `score` and `scoreAlone` (each against its own pass), and
  the turn planner, whose `value` hook now takes the line's steps and the board each was made
  from (`aimedByLine`); under `plan: "next-turn"` the line keeps that difference on top of its
  next turn's plain value. `scenario-fit.ts` replays it: the trace hands over the outcome as
  scored.

**Where it differs from the plan.** "Removal" isn't read from the effect: any target an
opponent controls counts, since a spell pointed at an opponent's object that takes nothing
from them changes no score. `followUps`' `scoreFrom` is left plain (unreachable under the
default plan, and sub-step 5 deletes it).

**Scenarios.** *Counters a draw engine from a player who isn't ahead* and *counters a tax
engine from a player who isn't ahead* move from training to the gate; both fail on
`25aa95b54`. *Saves Counterspell from a trailing player's mana rock* still holds. No wipe
scenario: Wrath of God was already cast at a single Grizzly Bears on a trailing board with a
creatureless leader, so nothing there fails first (and that eagerness is worth a look in
sub-step 5's A/B). Gate 220 of 220. Tests: `bot-interaction.test.ts`.

**`bot:diff`** against `origin/main`, six four-player games, 9 of 12,755 decisions, all in
the bot's own main phase (no counterspell came up):

- Removal over a developing play (2): Abrade on dave's Emmara over a Talisman on turn 14;
  Lightning Bolt on bob's Elsha over Shivan Devastator at X=1. Judgment calls, the first the
  more doubtful.
- A wipe cast (3): Gaze of Granite at X=1 over the commander Hearthhull and at X=3 over
  Eumidian Wastewaker; Chandra's Ignition from Lathliss over Anger. The pilot's usage report
  had sweepers cast in 0 of 10 games they could have been; whether these are right was not
  checked board by board, and is what the step's A/B is for.
- Targets gathered on one player (2): Swords to Plowshares at alice's Dragonhawk rather than
  dave's Teval; Baral's Expertise at three of alice's creatures rather than two and carol's
  commander. The fix at work: one player's loss counts in full.
- A line (1): Basilisk Collar equipped to Lathliss before Chandra's Ignition, where the old
  bot cast the Ignition bare. Right.
- One attack declaration lists the same attackers in another order.

**Left for later.** A triggered ability's target chosen as it goes on the stack (Ravenous
Chupacabra) isn't in the cast action, so the creature is scored by standings. Edicts aren't
wipes here. The A/B at the end of step 5 is the first measure of whether the freer removal
and wipes win games.

## Housekeeping, any time

Bench pools default to 8 workers and record the count in `bench-log.jsonl`; re-measure the
32 MB young-generation cap before keeping it; benches stop a game on a turn cap rather than
wall time, and list what they dropped.

## What this plan does not take on

- **Opponents that respond inside a rollout** (Q8) and holding instants for a better moment: a
  design of its own, after step 5 shows what the evaluation alone fixes.
- **Hidden information** (rollouts read the real library order): unprobed in the audit.
- **A worker thread for bots**: reconsider once step 2's server figures exist.

## Choices for the user

1. **Start with step 1 or step 2?** Recommended: step 0, then 1, then 2. Step 1 is small and
   each fix is a watched misplay; step 2 is what a player feels on a big board but needs step
   0's clock to test.
2. **Delete `followUps`** (about 300 unreachable lines) in step 5, or keep it as the `plan:
   "off"` fallback? Recommended: delete, once the planner has the crackback check.
3. **The step 5 A/B** costs hours. Recommended: one, at the end of step 5, and none before.
