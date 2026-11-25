# Agents playing the manual checks

Status: **two batches run 2026-11-25, 137 of 2,077 tests played** (100 passed, 3 failed, 34 not
judged); the rest of the list is not started. The verdicts are in `docs/manual-checks-verdicts.md`
(`node scripts/manual-check-verdicts.mjs` rewrites it), and nothing has been deleted from the list.

`docs/manual-checks.md` holds 2,077 hand tests nobody has had time to play. The question was
whether Sonnet agents can work through them, at what cost, and how far a verdict can be trusted
(a wrong "passed" is the costly mistake: a passed test gets deleted).

## How an agent plays a test

It never drives a browser itself and never reads the docs or the source.

- **`scripts/manual-check-brief.mjs`** stages a brief per agent: each test as the doc words it,
  with its board as `client/src/builder/manualChecks.ts` builds it (`--every N --offset K` for a
  spread sample, `--titles file` for a named set).
- **`.claude/manual-checks/agent-guide.md`** is the one page an agent reads: the step words, how
  the game moves, what counts as passed, failed and cannot-judge, and what to hand back.
- **`client/e2e/run-checks.mjs`** plays a plan of up to ten tests in one command, each through
  `run-check.mjs` on ports of its own, and prints every screen as text.
- **`run-check.spec.ts`** prints, after each step, what a reader with no screen needs (added for
  this): the turn and step, each player's permanents with power, toughness, counters and
  keywords, the hand, unspent mana, each graveyard and exile, an open menu's items, and every
  line the log gained in that step (the page's dev-only `deckblitzView.logSince`). A board, hand
  or pile line is printed only where it changed. Before this an agent saw the banner, life
  totals and the log's last five lines, and would have needed a screenshot for most verdicts.

## The pilot

Every 52nd test of the doc (40 tests over 24 sections), two Sonnet agents with 20 each, two
tests at a time per agent. I played four of the tests myself first as an answer key.

| | Agent A | Agent B | Both |
|---|---|---|---|
| passed | 12 | 11 | 23 |
| failed | 1 | 0 | 1 |
| cannot-judge | 7 | 9 | 16 |
| runner commands | 6 | 7 | 13 |
| minutes | 16.2 | 15.2 | 16 side by side |
| cache-write input | 165K | 146K | 311K |
| cache-read input | 2,664K | 2,284K | 4,948K |
| output | 30K | 21K | 51K |

Per test: 7.8K tokens written to cache, 124K read from it, 1.3K output, 47 seconds. No uncached
input. Counted once per message id from the agents' transcripts.

**How right were they.**

- The four answer-key tests (Anger, Tangleweave Armor, Tasigur, Wand of Denial) all came back
  as I had them.
- Every "passed" quotes printed text for its Expect. Two are soft: Kinnan's Treasure quotes the
  five entries and the sacrifice but not the two mana, and Fortunate Few quotes the log where
  the Expect is about the prompt's words. None is wrong that I found.
- The one "failed" is a true mismatch and a stale test, not an engine bug: *Thrill of
  Possibility: you keep priority after the discard*. With both Mountains tapped and nothing
  castable, the client passes the empty window for you, so the Pass controls the test expects
  never show. I replayed it to check.

**Why 16 could not be judged.**

- Six ran out of their three runs before the last sentence of Expect (long tests: a second
  seat, an extra combat, an end step).
- Seven hit a gap in the runner: a card in a choice popup that a `card:` click doesn't select
  (Isochron Scepter, Yarus), two permanents with one name (Zada), a divided amount's `+`
  buttons (Dragonlord Atarka), the scry popup's confirm, a `stack:` click as a damage source
  (Circle of Protection: Red), and no window to respond in (Lithoform Engine).
- Three are about how something looks (which cards are lit, a type line, the History list).

## The second batch

Every 21st test (99 tests), ten Sonnet agents with ten each, five at a time, after these changes:

- the printout shows which popup cards are picked or can't be, a popup's own buttons, any other
  dialog, the seat being played (`you are bob`), and each player's counters;
- a `#2` suffix picks the second thing a step's words match (a second same-named permanent, a
  divided amount's second `+`, a menu's fifth entry), and `look:<card>` reads a card's type line
  and text without clicking it (added after the batch, for the tests about what a permanent has
  become);
- five runs a test instead of three, and the guide says how the game moves between seats.

Most of the pilot's "runner gaps" turned out to be things an agent couldn't *see* (a picked card,
a Confirm button, whose seat it was) rather than couldn't click.

| | Pilot | Second batch |
|---|---|---|
| tests | 40 | 99 |
| passed | 23 (58%) | 78 (79%) |
| failed | 1 | 2 |
| cannot-judge | 16 (40%) | 19 (19%) |
| runs a test | about 2 | 2.4 |
| seconds a test | 47 | 64 |
| cache-write input a test | 7.8K | 9.1K |
| cache-read input a test | 124K | 144K |
| output a test | 1.3K | 1.1K |

The batch's totals: 900K cache-write, 14,261K cache-read, 106K output, no uncached input; 106
agent-minutes, about 25 on the clock. Ten tests an agent did not make a test cheaper than twenty:
the guide is read by twice as many agents and each test now gets more runs. It bought the higher
pass rate, not a lower cost.

**The three failures are all faulty tests**, each replayed by hand: the board can't show what the
Expect says (Thrill of Possibility, Stormshriek Feral's Dynamic Soar with no creature to target,
Silent Hallcreeper's copy mode with nothing to copy). The game was right each time. They are in
`BACKLOG.md`.

**One real bug came out of a pass.** The agent that passed Chaos Dragon noted a log line reading
"Chaos Dragon can't attack this combat" when it only can't attack the player who rolled highest;
replayed and confirmed, the board is right and the log's wording is wrong (`docs/client-gaps.md`).

**The passes.** I read all 78 against their Expects. Each quotes printed text for what it claims,
and the agents marked their own thin ones (a click that did nothing as the evidence that a card
can't be cast; a 4/4 read off a counter line rather than the board). I found none wrong.

**The 19 unjudged**: what another seat's panel or a tooltip or an icon shows (6), a type line or
an ability list (3, which `look:` now reads), unspent mana that was gone before it printed (3,
the guide now says to hold priority), an ability of a card in a graveyard or exile (2), a bot
seat the test needs played by hand (2), out of runs (3).

At the second batch's rate the 1,940 tests left are about 280M cache-read tokens, 18M
cache-write and 2M output, and some 35 hours of agent time, seven at five agents at once.

## What it says

Feasible, and cheap, for the tests whose Expect is words, counts or an outcome, which is most of
the list: four in five got a verdict in the second batch, at about 150K tokens a test, nearly all
of it cached re-reads. A wrong "passed" has not turned up in 101 passes read; the failures were
faulty tests; and the run found one bug no test was looking for.

To run more:

1. `node scripts/manual-check-brief.mjs --every N --offset K --agents 10 --out .scratch/manual-checks/<batch>`
   (or `--titles file`), then one agent a brief, five at a time, each on ports of its own
   (`--ports 0`, `10`, `20`, `30`, `40`), told to read the guide and its brief and nothing else.
2. Replay every "failed" by hand before believing it: so far each has been the test.
3. `node scripts/manual-check-verdicts.mjs`, and read the passes' quotes. Delete passed tests
   from `docs/manual-checks.md` (and their boards) only once the quotes are trusted; none has
   been deleted yet.
4. Tests about looks stay with a person. An agent can open one screenshot for something that
   stands still (Bonecrusher Giant's lit exile passed that way); motion it cannot judge.

What would raise the judged share further is in `BACKLOG.md` ("What `run-check` still can't show
an agent").
