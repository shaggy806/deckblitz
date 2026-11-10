# Bot audit, November 2026: speed and decision quality

Status: **proposed** (2026-11-10). An audit, not a change: no engine or bot code was touched.
Every figure below was measured on 2026-11-10 unless it says "read in code" or "guess". Nothing
here is scheduled; `BACKLOG.md` (Bots) points at this file.

It covers v2 (`EvalBotController`, `engine/src/bot/`) as live rooms seat it — `timeBudgetMs: 1000`
and every other option at its default (`server/src/room.ts`) — and v1 (`HeuristicBotController`,
`engine/src/controller.ts`), which v2 extends, consults at every window and uses as the stand-in
inside its simulations.

## Summary: what to change first

1. **Make the clock mean what the comments say** (findings S1, S2). A search whose first
   simulation ends past the deadline returns *pass*, not v1's move: 180 of 180 windows in a
   probe, 34 priority searches in 24 live-budget games, 6 of 16 on a 73-permanent bench-deck
   board. Nothing can stop a simulation in flight, so 4.6% of searched decisions ran past 1 s
   (worst 3.6 s) on the development PC, and the live box is several times slower. Return v1's
   *cast* (not its activation) when nothing but the baseline was measured, skip the baseline when
   the last one on this board didn't fit, and put a deadline in the rollout predicate.
2. **Stop searching windows that cannot differ, and stop paying for the "acting" rollout all
   game** (S3, S5). 43% of priority-search time went to opponents' turns, where the bot acted in
   2.4% of searches. A conservative memo reaches about 11% of priority-search time; more needs
   care. The "acting" rollout is on for 30% of searches (27 of 95 seats had it on for the whole
   game, from a commander's cast trigger in the command zone) and costs 1.5-2.4 times as much a
   simulation at every board size.
3. **Skip the trigger scan for the two priority events** (S6). Every pass of priority emits two
   events and each runs a whole-board trigger scan that cannot find anything. Stubbed out in a
   probe, a rollout's end state was identical on four boards and the rollout 17-27% faster on
   ordinary boards (5-6% on a token turn). It is the cheapest measured engine gain; memoising
   three static-source lists is next.
4. **Fix three demonstrated misplays that are each a few lines** (Q3, Q6, Q7): a sacrifice cost
   paid with the payoff itself (Blood Artist fed to Viscera Seer ahead of two Grizzly Bears); the
   turn planner playing a move the crackback guard had just marked unsafe; "payoff first" and
   "landfall first" returning before any search and losing the game to a creature the removal in
   hand would have killed.
5. **Price what a card in hand is, instead of adding a rule per card family** (Q1, Q2). With one
   rule switched off at a time, the gate shows which rules are load-bearing: the ones that price
   a card the evaluation calls a wash (cantrips, tutors, fetches, suspend). The sequencing rules
   are now carried by the turn planner on every gate scenario written for them. A per-card
   hand worth is the change that retires the first group; it needs `bot:diff`, not a bench.

Two things to *not* do, from the same measurements: don't optimise cloning or the evaluation for
speed (together under 5% of a simulation), and don't cut the turn planner's budget before the
sequencing rules are settled — the planner is what covers for them.

## How it was measured

The scripts are in `.scratch/bot-audit/` (git-ignored, on the development PC): `harvest.mjs`,
`anatomy.mjs`, `expiry.mjs`, `probe.mjs`, `ablate.mjs`, `blood.mjs`, `interact.mjs`, `stun.mjs`,
and the six checkers' own scripts in `check-*/`. They run `engine/dist` and patch prototypes in
their own process; no source file was changed.

- **The harvest**: 24 four-player games between the strong-decks pilot's decks (the pilot
  branch's engine build, never checked out), every seat v2 at the live 1 s budget, six games at
  once. 47,960 calls to `act`; 7,422 searched (15%); one row each with board size, time,
  simulations, step, whose turn, rollout policy. Boards reached 150 permanents in play (one game
  ended on a 529-permanent token turn whose decisions were all trivial). **Six games at once
  roughly doubles every time against a quiet machine** (the scaling table, S7), and the live
  box is slower again (`BACKLOG.md` records 152 ms live against 37 ms here for one decision), so
  read the times as ratios, not as what a player sees.
- **Quiet-machine probes**, one process at a time: unit costs and rollout anatomy on seven
  harvested positions and `seed-50-t40` (a bench-deck game, 73 permanents); two CPU profiles;
  the clock probe on four positions; the gate with one rule off (182 scenarios, 6 s a run).
- **Checking**: every finding below was handed to an independent checker told to refute it, with
  the scripts and data. Their corrections are folded in; where a checker weakened a claim, the
  weaker form is what's written. Two candidate findings from the first session did not survive
  and are listed under "Dropped".

## Speed findings

### S1. An expired search passes; it does not fall back to v1's move

**Evidence.** `expiry.mjs` makes the clock jump 2 s during a decision's first rollout. On three
positions, 180 of 180 searched windows ended at one simulation and returned pass; v1's own pick
at those windows was a cast in 64 and an activation in 60 (about a dozen distinct plays repeated
across windows, so not 124 independent positions). In the harvest 34 of 5,597 priority searches
ended at one simulation, 32 of them a pass where a fresh v1 acts. On `seed-50-t40` at the 1 s
budget on a quiet machine, 6 of 16 priority searches got the pass baseline and nothing else, and
the median searched decision took 1.2 s.

**Cause.** `outOfTime` (`eval-bot.ts:235-241`) tests `now >= budget.until` before the
"baselines always run" exemption, and the main search (`:1141-1203`) scores only the pass
baseline unconditionally; v1's pick is `candidates[0]`, behind `if (spent(budget)) break`.
Batches, untap plans, the planner and the tap guard all stop on the same clock. The deadline
runs from when the bot was asked, so v1's own `act` and the candidate listing can spend it before
any rollout. The one exception: a due cantrip still replaces the pass (`:1357`). The comment at
`:1148-1157` ("the floor is v1's move, or passing, whichever measured better") and
`room.ts`'s ("degrades to v1-quality play") describe what doesn't happen. The other searches do
degrade properly: the land search to v1's land, awaited decisions to v1's answer, blockers to
v1's blocks, attackers to the better of v1's swing and no attack.

**Fix.** When the clock stopped the search with nothing but the baseline scored, return v1's pick
if it is a cast that survived `listCandidates`, unscored. Better, remember the longest rollout of
the last decision on this board and, when it alone exceeds the budget, skip the baseline too.
*Not* v1's activations: with a full search v2 passes at most windows where v1 wants to activate
(20 of 22 on one position, though 18 of those are two cards), while it acts in 19 of
24 where v1 wants to cast (the same cast in 11). That direction is fair; the sample is a handful
of cards. v1's `act` also counts an activation each time it merely proposes one
(`controller.ts:4589-4592`), which matters more once its pick is played unscored.

**Gain.** On a board where one rollout doesn't fit, each window drops from one whole rollout
(1-3.6 s measured) to v1's `act` (tens of ms), and the bot keeps casting. How often live boards
get there is unknown: 0.6% of priority searches here, on a machine several times faster than the
live one.

### S2. Nothing stops a rollout in flight, and its cost is not set by board size alone

**Evidence.** Harvest: 343 of 7,422 searched decisions took over 1 s, 98 over 1.5 s, the worst
3.6 s. The slowest were single rollouts of 2.7-3.6 s answering an awaited decision (modes,
targets, a scry) on boards of 35-72 permanents. By board size:

| Permanents | Searched decisions | Median ms | Over 1 s | ms a simulation | Cut by the clock |
| --- | --- | --- | --- | --- | --- |
| 0-9 | 481 | 70 | 0 | 20 | 0% |
| 10-19 | 889 | 113 | 0 | 30 | 4% |
| 20-29 | 1,435 | 225 | 12 | 48 | 8% |
| 30-39 | 1,457 | 317 | 39 | 63 | 13% |
| 40-49 | 1,326 | 458 | 70 | 81 | 25% |
| 50-59 | 1,097 | 618 | 102 | 104 | 35% |
| 60-79 | 646 | 769 | 110 | 162 | 50% |
| 80+ | 91 | — | 8 | 69-158 | 8-65% (few rows) |

A searched decision ran 5.9 simulations on average against the gate's budget of 200 (340
decisions got one, 1,788 two, 2,022 three or four). On a quiet machine at the count budget a
simulation is ticks times cost per tick, and both vary about thirteenfold between positions of
similar size: 10 to 132 ticks a rollout, 1.3 to 16 ms a tick. A 127-permanent board cost 50 ms a
simulation; the 73-permanent `seed-50-t40` cost 740 ms (its turn makes 307 tokens), and one
unbudgeted main-phase decision there took 57 s (84 simulations). **Cloning (1.3-2.4 ms) and
evaluating (0.9-2 ms) are under 5% of a simulation on every position measured.**

The "3-9 s a simulation on 50-270 permanent boards" of `BACKLOG.md` did not occur in these 24
games; the worst single simulation was 3.6 s. The pilot saw it in 7 of 156 games at the count
budget. So it is a tail, and board size is a poor predictor of it: what a rollout *plays* is.

**Cause.** The clock is read only between simulations. `horizonTest` (`simulate.ts:63-94`)
bounds a rollout by ticks (400), never time; the ceiling was not hit once (most ticks seen:
205).

**Fix.** A deadline in the predicate handed to `advanceUntil`, throwing a sentinel: every
`simulate*` function and `turn-plan.ts`'s three already catch and return null, the predicate runs
between ticks, and the checker found no module state a throw would corrupt. It is more work than
it looks: `simulateSettled`, `simulateCombat`, `simulateTurns` and the planner use inline
predicates, not `horizonTest`; the stand-in's nested `bestDecision` runs with no clock at all
(`newBudget(2, Infinity)`), so one outer tick can hold whole rollouts; and four callers mishandle
an aborted null — `tapsIntoCrackback` reads it as "safe", `nextTurnValue` evaluates a different
state, the attackers search returns no attack, and a null pass baseline becomes `-Infinity`. An
abort has to be told apart from an engine error, and under S1's fix v1's pick must be returned
unscored.

**Gain.** Bounds the worst decision at about the budget plus one tick instead of budget plus a
whole rollout. No average gain.

### S3. Most searching happens at windows where the bot almost never acts

**Evidence.** Harvest, priority searches (5,950; 2,667 s):

| Windows | Searches | Acted | Time |
| --- | --- | --- | --- |
| Opponents' turns | 3,059 | 73 (2.4%) | 1,148 s (43%) |
| … with an empty stack | 2,104 | 24 (1.1%) | 630 s |
| Own turn, begin combat to end step, empty stack | 750 | 33 | 264 s |
| Own turn, main phases, empty stack | 1,532 | 1,178 | 822 s |

Of the 24 empty-stack actions on an opponent's turn, 20 were the seat's first searched window of
that turn (17 at upkeep), and the rest came after the board or hand changed. On `seed-50-t40`
the same three-simulation search ran at upkeep, upkeep again, draw and draw again at 3 s each.

**Cause.** A seat holding any instant or activated ability reaches the full search at every
priority window of every turn. `holdPass` covers only a stack already passed on. Nothing
remembers "searched this, passed".

**Fix.** On an empty stack outside our own main phases, remember a completed search that passed,
keyed on the candidate set and a board signature, and pass at the repeats. The checker's
corrections matter here. Consecutive windows do *not* score the same futures across combat (a
rollout from upkeep contains a predicted attack; one from the end step the real one or none), so
the signature needs whether attackers are declared, tapped state, damage, counters, life totals,
our hand, hand sizes, until-end-of-turn effects and who is alive. The step-dependent rules
(`isCantripDue`, `isSuspendDue`, `holdsCreatureFetch`, `holdsForASpell`) must still run on a memo
hit. A pass from a clock-cut search must not be memoised (144 of the 2,104 were cut).

**Gain.** On a coarse signature (board count plus hand count) the memo skips 1,081 of the 2,104
searches, 291 s — **about 11% of priority-search time**, with all 73 actions kept. A sound
signature skips somewhat fewer. The 43% headline is what is spent there, not what a safe fix
recovers; the rest needs the search itself to be cheaper off-turn (for instance a horizon that
ends at the stack, which is a design change and unmeasured).

### S4. The turn planner costs a quarter of the simulations at the count budget

**Evidence.** `probe.mjs` on eight harvested positions at the count budget: 48 planner calls used
1,339 of 4,613 simulations (29%) and 6 returned a line. The checker re-ran the planner beside
each real call on three positions (31 spending calls): of 23 that returned nothing, 10 (283
simulations) had scored two-move lines that lost to the one-move answer — a real answer — and
13 (360 simulations) scored no two-move line at all, which is the waste. Another 84 calls
returned nothing at no cost.

**Cause** (`turn-plan.ts:248-305`). Each level settles every move of every kept node before
scoring any, so a level the budget cuts yields nothing. Depth 0 settles each first move (new
work) and then passes each out to end of turn, which repeats the one-move search's rollout when
something chains — exactly under the default rollout (74 of 74 values equal), not under "acting"
(about half differ, by up to 60 points, so plan lines and the baseline they must beat are on
different scales there). With 10 or more first moves, 8 of 11 calls spent all 48 simulations and
5 scored any two-move line; it is certain to score none only from about 23 first moves.

**Fix.** Score each child as it is settled and expand best first, so a cut level keeps what it
paid for; take depth-0 values from the one-move search under the default rollout. Under a clock
the planner is also the first thing cut, so at the live budget on a mid-size board it mostly does
not run (unmeasured: the harvest did not split it out).

**Gain.** The 13-of-31 wasted calls, about 360 of 1,339 planner simulations on those positions:
a guess of 5-10% of count-budget simulations. Small at the live budget. **Do not shrink the
planner to save this** — see Q1.

### S5. The "acting" rollout is on all game for a third of seats and costs about twice as much

**Evidence.** Harvest: 1,809 of 5,950 priority searches (30%) ran under "acting", 36% of
priority-search time. Of 95 seat-games, 27 were under it at every search and 55 never. A
simulation cost 95.8 ms against 61.7, and the ratio holds inside every board-size bucket:

| Permanents | 0-9 | 10-19 | 20-29 | 30-39 | 40-49 | 50-59 | 60-79 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| acting / combat | 1.81 | 1.49 | 1.99 | 1.52 | 1.90 | 1.91 | 2.42 |

It holds on opponents' turns too (111 against 70 ms), where "play out the rest of our turn" is
not what the policy is for. The deck confound is reduced by the buckets, not removed. On one
83-permanent position v1's `act` was 28% of the decision's time.

**Cause.** `castPayoff` (`eval-bot.ts:3014-3032`, switched at `:978-979`) is true when any
object of ours on the battlefield, on the stack, in hand or in the command zone has a
"whenever you cast" trigger — no check of whose turn it is, of the trigger's filter, or that
the card can be cast. A commander with such a trigger turns it on from turn one. Under it our
seat in every rollout is a whole v1, whose `act` reads characteristics outside any cache region
and clones the game for its land and reducer looks.

**Fix.** Require our own turn, the payoff on the battlefield or castable this turn, and another
castable spell its filter would see. One gate scenario needs the switch ("casts Opt first so
Shiko's Flurry copies the Lightning Bolt"); the Guttersnipe misplay it was written for is the
other case to keep.

**Gain.** If the narrowing removes the opponents'-turn share and the no-payoff-castable share,
a guess of 10-15% of priority-search time for the affected third of seats.

### S6. Where a tick's time goes

**Evidence.** Two CPU profiles (a token turn on `seed-50-t40`; a combat-heavy 83-permanent
board), with the checker's attribution of overlapping figures:

| | Token turn | Combat board |
| --- | --- | --- |
| Uncached `computeCharacteristics`, inclusive | 32.8% | 45.3% |
| … of which outside any cache region | 12.7% | 28.2% |
| … under the trigger scan / the stand-in's `act` / combat damage | 9.2 / 6.5 / 2.6% | 13.1 / 16.4 / 12.6% |
| `detectTriggers`, inclusive | 27.8% | 28.7% |
| Name helpers (`rulesTextName`, `printedCardName`, `faceName`…), self | 17.6% | 21.7% |
| `typeGrantSources`, inclusive | 7.0% | 20.4% |
| State-based actions, own time | 10.6% | 2.5% |
| `recordJournal` → `takeLastKnown` | 9.5% | 7.9% |
| `makeResolutionContext`, self | 7.6% | — |
| Garbage collection | 11.0% | 5.8% |

One passing turn, counted: on `seed-50-t40` 171 ticks emitted 1,279 events, 26% of them
`priority-passed` / `priority-received`; 914 of 972 trigger scans found nothing, all 336
priority scans among them. On four quiet boards (20-43 permanents) 65-80% of events were the
two priority events and the scans were 16-25% of the rollout.

**Cause.** "No single hot spot" (`bot-effect-knowledge.md`, `BACKLOG.md`) is true by function
and misleading by cause. Three things account for most of a tick: (1) `emit` runs a whole-board
trigger scan for every event, whatever its type (`detectTriggers`); (2) the characteristics
cache exists only inside a `withComputedCache` region, every region clears it on opening and
`emit` flushes it twice, so `recordJournal`, combat damage, token creation and everything the
stand-in's `act` reads are computed fresh each time; (3) outside a region `typeGrantSources`
rescans the battlefield for every `layerFour` call, and the name helpers' self time is just the
volume of those scans (`rulesTextName` loops an object's modifiers on every call).
`makeResolutionContext` builds about 690 closures per resolution (1.7 ms a call).

**Fixes, cheapest first.**

1. *Skip the trigger scan for `priority-passed` and `priority-received`.* Nothing in
   `engine/src`, cards included, reads either type except the emit sites, and the journal has no
   case for them. Stubbed at run time, the end state hashed identical on four positions and the
   rollout ran **17-27% faster on the quiet boards, 5-6% on the token turn** (measured). Before
   shipping: every branch of the trigger matcher checked for a kind that ignores event type, and
   a fuzzer pass with `MTG_CACHE_CHECK=1`.
2. *Memoise the three board-scan lists on (state, mutation epoch)* — `typeGrantSources`,
   `contributingStaticSources`, the ability-grant sources — as `staticLossesMemo` already is.
   A guess of 5-15% of a rollout, from the 7-20% inclusive.
3. *Don't take an uncached last-known snapshot per entered permanent in the journal*, and build
   the resolution context lazily: up to about 8% each on token turns (guess).

A general epoch-keyed characteristics cache is **not** sound as first proposed: the epoch moves
only in `invalidateComputedCache`, mutations outside regions are covered only by `emit`'s flush,
bot clones share object ids so it must be keyed by state, and on a token turn every entry bumps
the epoch anyway. Skipping the flush alone buys nothing, since every region clears on open.

### S7. Benches at 18 workers: hardware, with a garbage-collection share

From the first session's matrix (one 22-turn game, the same work in every row, per-game seconds
on the second repetition; i5-13600K, six P-cores and eight E-cores). Rows from "4 unpinned" to
"8 on four P-cores" ran beside nine light reader agents and were not re-run.

| Workers | Seconds a game |
| --- | --- |
| 1 | 21.7 |
| 1, pinned to an E-core | 56.0 |
| 2 on one P-core's two hyperthreads | 52.1 |
| 4 | 43.1 |
| 6 | 42.7 |
| 8 | 53.6 |
| 8 on the eight E-cores | 75.1 |
| 8, no heap caps | 44.1 |
| 8 separate processes, bench caps | 48.4-49.0 |

Eight workers buy about 3.2 times one worker's throughput. Eight separate processes are still
2.2 times slower a game than one, so most of the slowdown is core topology and shared memory,
not V8: an E-core runs this 2.7 times slower than a free P-core and a shared P-core 2.5 times.
Sharing one process costs about 10% on top and the bench heap caps (768 MB old, 32 MB young)
about 18%. So the pilot's "not the heap cap" holds as "not mainly". At 18 every P-core is
doubled and every E-core full, enough for the reported 2.3 times over 8 without any one
pathology (18 was not re-run: the 8-worker rule). Every parallel bot script still defaults to
`cpus - 2` = 18 threads, and the `ab-bench` skill still calls 18 right.

**Fix.** Default the pools to 8 (as `bot-behaviour.mjs` already does), record the worker count
in `bench-log.jsonl`, and re-measure the young-generation cap before keeping it.

### S8. Tooling that hides all of the above

Read in code, not measured, except where noted.

- **Nothing exercises the live clock.** The gate, `bot:benchmarks`, `bot:bench`, `bot:ab`,
  `bot:diff` and `bot:replay` build the bot with count budgets. `bot:behaviour` defaults to
  `--budget 300` and its header calls that the live budget; `room.ts` has used 1000 since
  2026-10-18. The gate does pass 182/182 at `timeBudgetMs: 1000` (measured) — on small boards,
  where the clock never bites.
- Scenarios imitate an expired clock with `maxSimulations: 1`, which is a different code path
  from S1's.
- Benches stop a game on wall time (300 s in `bot:bench`, 1,500 s in `bot:ab`) and drop or
  even-share it, so the long big-board games are the ones censored, and more are at 18 workers.
- The server's bot-time histogram resets every 10 s and reports a count and a p99 over every
  `act`, trivial passes included: one 3 s decision among a hundred passes never shows.

**Fix.** A clock injected through the bot's options (a `now` function) so a few gate scenarios
run "expires after N simulations" through the real `outOfTime`; `--budget` on `bot:replay`;
`bot:behaviour` defaulting to the live figure from one exported constant; a max and an
over-budget count beside the server's histogram, with a log line naming board size.

## Decision-quality findings

### Q1. Which rules around the search still hold anything up

**Evidence.** `ablate.mjs` runs the 182 gate scenarios with one rule switched off (all pass
untouched). v1 alone passes 137 (seven of those through a v2 the scenario builds itself); v2
with two simulations only, 167.

| Rule off | Gate | What fails |
| --- | --- | --- |
| `isCantripDue` | 178 | Opt, Ponder, Expressive Iteration, Compulsive Research |
| `isFreeFetch` | 178 | four fetch-land plays |
| the fetch return | 180 | Sakura-Tribe Elder, Bountiful Landscape at end of turn |
| landfall first | 180 | Jaddi Offshoot, Omnath before their land |
| `isSuspendDue`, `holdsWipeForCombat`, `holdsForASpell`, `wastedNow`, `holdsManaForMain`, the acting switch, `tapsIntoCrackback`, the planner | 181 each | one scenario each |
| `reducerFirst`, `payoffFirst`'s early return, `payoffBeforeWipe`, `holdsTapForCombat` | 182 | nothing — **the planner decides their scenarios** |
| `hideawayFirst`, `holdsForNextSpell`, "only land", `followUps` | 182 | nothing — **no gate scenario makes them fire** |

The checker's pairs show who covers: with the planner off as well, `reducerFirst` off fails
Urza's Incubator, `payoffBeforeWipe` off fails Colfenor's Urn, `holdsTapForCombat` off fails
Faeburrow Elder, and `payoffFirst` off fails three of its five scenarios.

**Reading.** The owner's question was whether "cast X at its moment when the search would pass"
is a sound pattern or a sign of something deeper. Both, by group:

- *Sequencing rules* (reducer first, payoff first, payoff before a wipe, attack before tapping)
  were written when rollouts passed our own seat and nothing looked two moves ahead. The turn
  planner now finds every one of their gate lines without them. They are redundant on the gate
  — which is small boards and narrow hands, so that is permission to try retiring them one at a
  time against `bot:diff` on real games, not proof. They also cost: with `payoffFirst`'s return
  off, its scenarios take 120-250 ms instead of 5.
- *Pricing rules* (cantrip due, free fetch, suspend due, tutor) are load-bearing and will keep
  multiplying, because the evaluation calls each of those plays a wash (Q2). No search depth
  fixes that: the value is missing at the leaf.
- *Untested rules* (`hideawayFirst`, `holdsForNextSpell`, "only land") have no gate scenario
  that makes them fire. `followUps` is unreachable under the default `plan: "turn"`; `BACKLOG.md`
  still plans its tuning.

**Fix.** For the sequencing rules: demote each from "return this" to "score this first", then
retire. For the untested ones: write the scenario or delete the rule. For the pricing rules: Q2.

### Q2. A card in hand is worth 2 + 0.05 × mana value, whatever it is

**Evidence** (`interact.mjs`, values against passing). Opt in our own main phase: −0.05, so the
bot passes and casts it only at the end step before its turn, by `isCantripDue`. Demonic Tutor
with a library holding better cards: −0.10, cast only by the same rule's tutor branch (added
2026-11-09). Divination +1.80. The exceptions in `features.ts`: a castable counterspell adds
the `answers` reserve, removal adds `earlyRemoval` in rounds 1-2, and the mana-value term counts
our own nonland cards only.

**What the bot should do** is cast the tutor because the card it finds is better than the card
it spends, and not because a rule says tutors are due.

**Fix.** A hand-quality feature: each hand card's static worth (the effect worth
`effect-worth.ts` already computes for spells, the board value the features would give a
permanent), discounted by whether it can be cast soon, weighted so an average card stays near 2.
A tutor is then worth best-card minus average-card, a cantrip that digs is positive, a discard
throws the worst card. That this retires `isCantripDue` and its kin is an inference: the probe
shows the wash, not the cure.

### Q3. A sacrifice cost is paid with the payoff

**Position** (`blood.mjs --fodder "Grizzly Bears"`): four players, our main phase; we have
Viscera Seer, Blood Artist and two Grizzly Bears; each opponent is at 2 life behind two Craw
Wurms. **v2 sacrifices Blood Artist to the Seer.** Its only candidate afterwards sacrifices the
Seer itself. The turn ends with nobody dead. Sacrificing the two Bears kills an opponent.

**Why.** `withSacrificeChoices` (`eval-bot.ts:1520-1561`) offers one candidate per ability, paid
with `cheapestPermanents(...)[0]`, which ranks by `targetValue` — stats only: Blood Artist 2,
Memnite 2.5, the Seer 3, Bears 6. The kill line is never a candidate. The checker confirmed the
cause: with `cheapestPermanents` patched to skip the Artist and the Seer, the planner takes the
kill (10.87 against 7.40).

**Fix.** Order fodder so the ability's own source and anything with a dies or sacrifice trigger
go last while another choice exists (`isSpareFodder` in `controller.ts` already knows "a
creature with anything ongoing is never spare"), or offer two sacrifice choices when cheapest
and cheapest-spare differ.

**`BACKLOG.md` is out of date here.** Its "Left: a kill that takes several sacrifices … both
bots pass" no longer holds for v2 on the board it describes: with two real 1/1 tokens the planner
takes both sacrifices in response to each other (19.82 against 3.42 for passing) and the opponent
dies, at round 9 and at turn 1; without the Wurms it attacks one opponent dead and drains a
second. v1 still passes. It works because a 1/1 token prices at 1.5, under Blood Artist's 2; a
2/2 token (4) would put the Artist first again (arithmetic, not run). The line's stated cause,
"nothing aims a second trigger where the first went", is also wrong: both drains went to the
same opponent.

### Q4. A counterspell is spent by the caster's rank, and never on a card with no board

**Positions** (`interact.mjs`): four players, six lands each, bob casts, alice holds Counterspell
with mana up; counter against pass:

| Bob casts | Level table, opponents hold 3 / 6 | Carol clearly ahead, 3 / 6 |
| --- | --- | --- |
| Craw Wurm | +7.9 / +4.9 (counters) | −0.3 / −3.3 (passes) |
| Rhystic Study | +4.4 / +1.4 (counters) | −2.7 / −5.7 (passes) |
| Smothering Tithe | −1.1 / −4.1 (passes) | −4.1 / −7.1 (passes) |
| Demonic Tutor | −3.4 / −6.1 (passes) | −4.9 / −7.6 (passes) |

**Why.** `scoreOutcome` (`evaluate.ts:584-598`) subtracts the strongest opponent's whole score at
1 and the average of the others at 0.5, so a non-leader's permanent counts at 0.25 in a
four-player game. By hand: keeping the Counterspell is worth 3.05, bob's Wurm 10.95; level,
3.05 − 10.95 = −7.9; with carol ahead, 3.05 − 10.95 × 0.25 = +0.31. The step between 3 and 6
cards in opponents' hands is the `answers` reserve doubling, exactly 3.0.

**What it should do.** Holding the only counter while a trailing player lands a vanilla 6/4 is
defensible, arguably right, and so is letting a tutor through. The misplays are the ones the
evaluation cannot see at any seat: Smothering Tithe is never countered even on a level table
(it is 2 + 0.5 × 4 points, less than Grizzly Bears: engines other than card draw and creature
tokens are blank permanents), and Rhystic Study is let through from anyone who isn't the
leader. This is the arithmetic behind the pilot's usage report (a sweeper cast in 0 of 10 games
it could have been, a tax engine in 3 of 13): the same evaluation prices those cards for the
bot's own casts.

**Fix.** Give engine permanents a rate the way draw and token engines have one (resource
tokens, drain per trigger, cost reduction as mana), and score an interaction's target by the
change to the affected opponent at full weight rather than by standings. The earlier softened
leader lost its bench (`deck-autopsies.md`); this is narrower, and needs asymmetric scenarios in
the gate first — every answers scenario today is a level table, where the caster is the leader
by construction.

### Q5. Stun and age counters score for their controller

**Position** (`stun.mjs`): two stun counters on an opponent's Craw Wurm *lower* our score by 1.0
(by 0.5 if it is also tapped); three stun or three age counters on our own *raise* it by 1.5.
`UNSCORED_COUNTERS` (`features.ts:306-312`) lists five kinds and every other counter adds 0.5 to
its controller; nothing else in the evaluation reads stun. `target-polarity.ts` already has
`HARMFUL_COUNTERS`. 93 pool cards mention stun counters. A sign error, cheap to fix; how often
it changes a real decision was not measured.

### Q6. The turn planner plays a move the crackback guard just marked unsafe

**Position** (the gate's "does not station its only blocker into a lethal crackback", plus one
Forest in play so that something chains; `check-planner/q6.mjs`): we are at 6 life with a
Spacecraft to station and Grizzly Bears, against Hill Giant and Grizzly Bears. The one-move
search scores stationing as UNSAFE (−100,000,031.67) and prefers passing (−32.17). The planner
then returns the same stationing at −31.67, and the bot taps its blocker. With `plan: "off"` it
passes; the unmodified gate position passes only because nothing there chains. With a Memnite in
hand the plan is Memnite, station, station, and the replay taps every blocker with no check.

**Why.** Plan lines are valued by plain `evaluateState` with no UNSAFE term and compared with
the one-move best (`eval-bot.ts:2689-2760`); `planLines`' first moves include the ones in
`lastUnsafe`; `continueTurnPlan` replays later steps unchecked. The older follow-up search did
apply the check (`scoreFrom`), so the protection was lost when `plan: "turn"` became the default
on 2026-10-18.

**Caveat.** "Unsafe" is the guard's own verdict; real lethality on that board was not checked,
and the probe saw no such plan among six in real positions. Built position, unknown frequency,
game-losing when it happens.

**Fix.** Drop `lastUnsafe` moves from the planner's first moves and run the crackback check on
the board after each tapping step of the chosen line.

### Q7. "Payoff first" and "landfall first" return before any search, and lose to it

**Positions** (two players, the opponent has an untapped Shivan Dragon, we are at 5 life;
`check-rules/q7.mjs`):

| In hand | With the rule | With v2's early return off |
| --- | --- | --- |
| Beast Whisperer, Opt, Murder; five lands | Beast Whisperer (`payoff first`, 0 simulations), then Opt; Murder unaffordable; **dead next turn** | Opt, land, Murder on the Dragon; alive |
| Guttersnipe, Opt, Murder | the same, dead | the same, alive |
| Jaddi Offshoot, a land, Murder; two lands | Jaddi Offshoot (`landfall first`), land; Murder never cast; at 1 life | land, Murder; at 5, Dragon dead |

**Why.** `payoffFirst` (`controller.ts:2236-2278`) returns the payoff when any other spell is
castable with it on the stack — so any cheap instant satisfies it — without asking whether
that spell would trigger it (Opt does not trigger Beast Whisperer) or whether the mana has a
better use. "Landfall first" (`eval-bot.ts:1049-1060`) takes the first landfall permanent in
enumeration order whenever a land is on offer. Both return at `:1013-1076`, before the search,
the planner, the crackback guard and the held-wipe check, at zero simulations, so nothing can
overrule them. Six rules return this way (payoff, reducer, hideaway, landfall, fetch, only
land).

**Fix.** Put the rule's pick first in the candidate list, as v1's pick already is, and let the
search confirm it. Q1 shows the gate still passes with `payoffFirst` handled that way; landfall
first needs its two scenarios kept green by ordering rather than by return.

### Q8. The search assumes nobody ever responds (read in code)

Under the live options every seat in a rollout passes priority at every window; stand-ins only
attack, block and answer decisions. So no simulated opponent counters, removes the creature
being equipped, or wipes the board, and nothing reads opponents' open mana. The bot's own
instants are never used "later" inside a pass either: holding one is worth the flat hand value
plus two special reserves — counterspells (`answers`, which also taxes the bot's own
development, since it is read with our lands still tapped) and removal in rounds 1-2 only
(`earlyRemoval`), after which removal fires at the first target worth more than a card. Bots
rarely interact with each other, so self-play cannot see any of this; a human holding removal
can. Not measured.

## Where this disagrees with the design records

- **"An expired search degrades to v1's play"** (`eval-bot.ts:1148-1157`, `room.ts:135-154`,
  and `BACKLOG.md`'s "the two baselines always run"): only the first baseline always runs, and
  an expired priority search passes (S1).
- **"No engine hot spot; the cost is how much a rollout plays"** (`BACKLOG.md`,
  `bot-effect-knowledge.md:681-692`): half right. How much a rollout plays does vary
  thirteenfold. But per tick there are causes, and one of them — a trigger scan on every
  priority event — is removable for a measured 17-27% on ordinary boards. The record's
  "deferring conditional trigger grants was worth under 2%" tested a different change.
- **"3-9 s a simulation on 50-270 permanent boards"**: real in the pilot's seven long games,
  absent from 24 games here. Board size predicts cost poorly; 127 permanents cost 50 ms a
  simulation and 73 cost 740.
- **The acting rollout is "opt-in, not the default"** (`bot-effect-knowledge.md:670-680`): it
  switches itself on for 30% of live searches (S5).
- **"Left: a kill that takes several sacrifices … nothing aims a second trigger"**
  (`BACKLOG.md`): v2 finds it with tokens; the live fault is the fodder choice (Q3).
- **"The follow-up search's next steps"** (`BACKLOG.md`): `followUps` is unreachable on the
  default path, and the retirements it proposes should be tried against the planner (Q1).
- **The gate "can't be gamed by anything except playing correctly"** (`scenarios.ts`,
  `check-scenarios.mjs`): it checks the action, on small boards, at count budgets. Ten scenarios
  are decided by a pre-search rule label rather than a search, three rules have no scenario that
  makes them fire, and one gate scenario (the crackback station) passes only because nothing on
  its board chains (Q6).
- **"Benched level"** as a reason to close an idea: 400 four-player games resolve about four
  points, timed-out games count as an even share, and the benches run a budget live rooms don't.
  The pilot's best deck moved 19 points between the count budget and the 1 s budget alone. Level
  means "not worse by about four points at 200 simulations", nothing stronger.
- **Stale figures**: `simulate.ts`'s "roughly 0.3 ms per candidate … nearly free" (measured
  here: 20 ms on a near-empty board, 60-160 ms mid-game); `bot-behaviour.mjs`'s "live 300 ms
  budget"; the `ab-bench` skill's "18 workers is right"; `eval-bot.ts`'s header calling v2
  one-ply.

## Dropped or downgraded after checking

- **v1's pick isn't recognised as a candidate** (`sameAction` is `JSON.stringify` and the two
  bots build keys in different orders): true in code, but key order alone missed v1's pick in 4
  of 147 windows (2.7%). A footnote to S1's fix, which should match by offer anyway.
- **The 400-step ceiling truncates rollouts silently**: never hit (most ticks seen 205).
- **Evaluation speed** (one cache region per player, the threat loop's repeated scans): real in
  code, but the whole evaluation is 0.9-2 ms against simulations of 30-740 ms.
- **Cloning**: 1.3-2.4 ms; not a cost.
- **"The planner returns nothing 86% of the time, so it is waste"**: 10 of 23 such calls had
  scored two-move lines that lost, which is an answer (S4).
- **"Sequencing rules are no longer needed"**: weakened to "the planner covers them on their
  gate scenarios"; four others are untested rather than redundant (Q1).

## Not verified

- How often any of S1, Q3, Q6, Q7 happens in real games. Each is shown on a built or replayed
  position; only S1 has a count from play (34 of 5,597 searches, on a fast machine).
- Anything on the live box. All times are the development PC's; the six-at-once harvest roughly
  doubles them, and the live machine is slower again by a factor this audit did not measure.
- The very big boards (150-270 permanents in play for many turns): 24 games produced 64 such
  decisions and no snapshot of a multi-second simulation there.
- The planner's cost and cut rate at the live budget.
- The fixes. Nothing proposed here was built; every "gain" not marked measured is an estimate,
  and S6's first fix was measured only by stubbing the scan in a probe, with the combat rollout,
  on five positions.
- Whether rollouts of an identical state are deterministic (S3's memo assumes so).
- The three unpinned rows of the worker-scaling matrix on a quiet machine, and 18 workers
  itself.
- Whether hidden information matters: rollouts read the real library order, and the first
  session's reader argues that is the material leak rather than opponents' hands. Not probed.
- Wipes and removal timing (held only in rounds 1-2; a wipe of two trailing boards scored at a
  quarter): arithmetic from the weights, no position run.
