---
name: author-walks-parallel
description: Start several cloud sessions at once, each authoring one card batch on its own range of sets (the newest-first walk, the oldest-first walk, a middle walk), so more of the card backlog is covered at the same time than one session's five agents allow — assign the ranges and batch numbers, record them on main, start the sessions with a prompt each, then check on them until each has landed on main. Use when the user asks to run the set walks in parallel, start several authoring sessions or cloud agents, fan out the card authoring, or cover more ground with bigger batches.
---

# Run the set walks in parallel cloud sessions

One cloud session is capped at five `card-author` agents: five typechecks at once run its
4 cores and ~15 GB out of memory (`author-by-set/agent-batches.md`, "On a cloud session").
Each child session (`create_session`) gets its own container, so three sessions run fifteen
agents. This session is the **coordinator**: it assigns, starts, watches and reports. It
doesn't author the children's cards itself.

First used 2026-10-25 (batches B158–B160): newest-first from Magic 2015, a middle walk from
Rise of the Eldrazi, oldest-first from Homelands.

**Coordinate from a fresh session.** The children keep the authoring skills' token savings
(one batch per session, lean agents, the digest), so tokens per card are about what a
single-session batch costs; parallel buys wall-clock time. The coordinator is the one place
that can waste tokens: every check-in turn re-reads its whole context. Run this skill in a
new session (after `/clear`, or a new session once a batch has shipped), never in a session
still holding a batch of its own, and don't take other work into it while the children run.
B158–B160 were coordinated from the session that had just shipped B157, past 100K before the
first check-in.

## The rules that make it safe

- **Ranges never overlap.** Two branches walking the same sets is how five sets were authored
  twice (merged 2026-10-25). Every walk owns a contiguous range of sets, written in
  `BACKLOG.md`'s line for the `author-by-set` skill ("Three walks run in parallel cloud
  sessions"), and each child is told to skip any card outside its range.
- **Batch numbers are assigned before starting**, one per child, consecutive after the highest
  `engine/data/sweep-3/B<N>.json` on `origin/main`. A child re-checks its number just before
  landing and renumbers if another walk took it.
- **The assignment lands on `main` first.** A child starts from `main` and reads its range off
  `BACKLOG.md`; a range that exists only in this session's head is invisible to it.
- **Each child lands its own batch**, one at a time on `main`: merge `origin/main`, regenerate
  the card files, re-run `verify` if anything came in, push, and repeat if `main` moved again.
- **One engine feature, built once.** A child about to build a feature first checks
  `git log origin/main` for another walk having built it.
- **One batch per child.** It ships, updates its walk's hand-off line and stops.

## 0. Orient

- `node scripts/unmerged-branches.mjs` prints nothing actionable, and this checkout is level
  with `origin/main` (`git fetch origin main && git status -sb`). A batch of this session's
  own still in flight lands first.
- `mcp__claude-code-remote__list_sessions` (tag `set-walk`): no earlier child still running.
  One that is still running owns its range until it lands; leave that range out.
- Read `BACKLOG.md`'s set-walk lines: where each walk stands and the ranges already recorded.

## 1. Choose the walks and their ranges

`npm run -s cards:sets -w engine -- --sets 400` lists every set with its cards left (`left`
column; build `engine` first). From it:

1. **Newest-first**: the next sets of `author-by-set`'s hand-off.
2. **Oldest-first**: the next sets of `author-by-set-oldest`'s hand-off.
3. **Middle** walk(s), one per extra session: a block of sets between the two, walked newest
   first by `cards:sets -- --set <code>` (`--next` only walks from either end). Give each a
   **closed range** (a named first and last set), and shrink the newest-first walk's range so
   it stops before the middle range starts.

Each child's batch is ~80–120 cards: one set, or two small ones. Three sessions is the tested
size; more works the same way, but each lands through the same merge, so expect more
merge-and-recheck rounds.

## 2. Record the assignment and land it

Edit `BACKLOG.md`'s `author-by-set` line: each walk's range (its first and last set by name
and code) and each child's batch number, plus the rule for later batches (the highest
`B<N>` on `origin/main` plus one, checked again before landing). Update the oldest-first
line's end too if a middle walk now bounds it. Commit (`Docs: the set walks' ranges for
parallel sessions`) and land it on `main` (`git push origin HEAD:main` after a fetch and
merge).

## 3. Start the sessions

First make the **report-in trigger**: one `mcp__claude-code-remote__create_trigger` with no
`cron_expression` and no `run_once_at` (a poke-only scheduled task that never fires on its
own), bound to this session (the default), `initiation: "own_followup"`, named "Set-walk
children report in", its prompt "A set-walk child reports in (its words follow): note it,
check its batch on origin/main, and report to the user once the last child is in." A child
can't `send_message` this session, but it can `fire_trigger` that trigger with its report as
`text`, which wakes this session with it. Its `trig_…` id goes in every child's prompt.

Fill `child-prompt.md` beside this file once per child (its placeholders: `SKILL` —
`author-by-set` or `author-by-set-oldest`; `WALK` — "the newest-first walk", "the middle
walk", "the oldest-first walk"; `RANGE` — the range as recorded; `BATCH_SETS` — this batch's
sets with their left counts; `HOW_TO_PICK` — for a middle walk the `--set <code>` sentence,
else empty; `BATCHNUM`; `TRIGGER_ID` — the report-in trigger's id). Start all of them in **one message**:

```
mcp__claude-code-remote__create_session({
  title: "Set walk, <walk>: <sets> (<BATCHNUM>)",
  source_url: "https://github.com/shaggy806/deckblitz",
  source_revision: "main",
  tags: ["set-walk"],
  prompt: <the filled prompt>,
})
```

The environment is inherited from this session (its setup hook installs and builds). Leave
`permission_mode` inherited: a `plan` child would stall waiting for an approval nobody gives.

## 4. Watch them

Each child **reports in** as its last act, by firing the report-in trigger: that wakes this
session once per child, with the child's own summary, and costs one turn each, against a
turn per timed check-in whatever the children are doing. Don't poll: each turn here
re-reads the coordinator's whole context.

A child that crashes, stalls or runs out of budget never reports, so arm **one safety net**
with `mcp__claude-code-remote__send_later` about 2 hours out (a batch takes 60–90 minutes:
setup, scaffolding, 20–25 minutes of agents, integrating, `verify`, landing), naming every
child's session id and batch. When a report or the safety net arrives, read as little as
answers the question:

- `git fetch origin main && git log --oneline origin/main` shows which batches landed.
- Only for a child that hasn't reported by the safety net: `get_session` (`status_bucket`
  `failed` means its last turn errored; `idle` with no landed batch means it stopped early),
  then its last words — `list_events` with `kinds: ["assistant", "result"]` and `limit: 20`,
  never the whole transcript.
- A stalled or failed child: `send_message` it a correction (it continues with its context),
  or tell the user what blocks it. Don't redo its batch here. Re-arm the safety net 30 minutes
  out while one is still working.
- When the last child is in: cancel the safety net (`delete_trigger` on its id) and the
  report-in trigger, and report to the user.

## 5. Report and close

When every child has landed: the batches and their sets, cards authored and blocked per
batch (each child's commit message has them), any feature built and by whom, any merge that
needed a fix. `archive_session` each finished child only once the user has acknowledged
the results. Offer the next round, with each walk's next sets, but don't start it unasked.
