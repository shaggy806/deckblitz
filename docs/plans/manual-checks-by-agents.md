# Agents playing the manual checks

Status: **pilot run 2026-11-25, 40 tests; not yet run over the whole list.** The tools it left
are in the tree and work.

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

## What it says

Feasible, and cheap, for the tests whose Expect is words, counts or an outcome: 58% of the
sample got a trustworthy verdict at about 133K tokens a test, nearly all of it cached re-reads.
The whole list at that rate is about 257M cache-read tokens, 16M cache-write and 2.7M output.

Before running all 2,077:

1. Close the runner gaps above (each is a few lines in `run-check.spec.ts`): they are 7 of the
   16 unjudged, and they recur across the list.
2. Give a long test five runs, or let an agent mark it "partly passed" with the sentence it
   reached.
3. Ten tests an agent instead of twenty. The cost is the conversation re-read on every call, so
   a shorter conversation is the cheaper one.
4. Keep "passed" tests for a second look rather than deleting them at once: move them under a
   "Passed by an agent" heading with the quoted evidence, and delete after a spot check of one
   in ten.
5. Tests about looks stay with a person. An agent can open one screenshot for something that
   stands still (Bonecrusher Giant's lit exile passed that way); motion it cannot judge.
