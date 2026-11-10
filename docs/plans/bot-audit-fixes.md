# Fixing what the bot audit found

Status: **in progress** (2026-11-10): step 0 built, step 1 next. The findings, their evidence and
their finding numbers (S1-S8, Q1-Q8) are in `bot-audit-2026-11.md`; this file is only the order,
what each step changes, and how each is checked. Three choices near the end are the user's.

## Progress

One step a session, with the `bot-audit-next` skill. When a step lands, tick it here with its date
and commit, write its *As built* lines under the step, and move `Next`.

- Next: **step 2** (the clock).
- [x] Step 0. Tools (2026-11-10)
- [x] Step 1. Four misplays (2026-11-10; `d15599f95` Q3, `752a7550e` Q6, `aadc42a5a` and
  `e1b359709` Q7, `f626a7351` Q5)
- [ ] Step 2. The clock
- [ ] Step 2b. Deploy, and test live
- [ ] Step 3. Engine cost per tick
- [ ] Step 4. Search that buys nothing
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

*(none yet)*

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
