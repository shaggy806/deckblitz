---
name: author-walks-parallel
description: Start several cloud sessions at once, each authoring one card batch on its own range of sets (the newest-first walk, the oldest-first walk, a middle walk), so more of the card backlog is covered at the same time than one session's five agents allow — assign the ranges and batch numbers, record them on main, start the sessions with a prompt each, then check on them until each has landed on main. Also runs the need-keys plan's recheck lists (engine/data/recheck/R<K>.txt) the same way, a list per child. Use when the user asks to run the set walks or the recheck lists in parallel, start several authoring sessions or cloud agents, fan out the card authoring, or cover more ground with bigger batches.
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
- **Each child lands its own batch, under the landing lock** (`scripts/landing-lock.mjs`,
  from 2026-10-26), **and verifies before taking it** (from round fifteen): it merges
  `origin/main` and runs its one plain `npm run verify` on its own branch, beside the other
  children's; then it takes the lock, merges `origin/main` again, runs the short
  `npm run verify -- --landing` if the merge brought anything (the new-cards fuzzer
  re-runs only for engine code, its stamp skipping it otherwise; the engine suite narrows to its
  pool-wide tests and the merge's test files when the merge brought no engine code — from
  2026-10-27, about one landing in five by the 34 before it), pushes to `main` and
  releases. Holds are a few minutes. Round thirteen, without the lock, paid nine merges and five
  `--only fuzzwith` re-checks (B194 three merges over half an hour); round fourteen, verifying
  whole *under* the lock, paid none, but its five batches, ready within 20 minutes of each
  other, landed one after another at 9-20 minutes a hold: the round took 121 minutes to round
  thirteen's 93, all of it in landing (the audit, 2026-10-26). The lock is a branch,
  `landing-lock`, moved by compare-and-swap pushes (the cloud proxy refuses tag pushes and
  branch deletions); `node scripts/landing-lock.mjs status` says who holds it. Each child's
  verify picks full or quick from its own branch's `scripts/verify-state.json` and batch
  number, so with consecutive numbers the later children run full, in parallel; the merges
  keep the higher `lastFullBatch`. No child needs a mode assigned.
- **The coordinator lands under the lock too, once the children run.** Anything it pushes to
  `main` after step 3 (a doc, a plan) goes through `node scripts/landing-lock.mjs acquire
  coordinator --wait`, merge, push, `release`; better, it waits until the round is in. In round
  eighteen the coordinator pushed two docs commits bare, and B222's and B223's pushes to `main`
  were rejected under the lock, each paying a second acquire and merge.
- **One engine feature, built once.** A child about to build a feature first checks
  `git log origin/main` for another walk having built it.
- **One batch per child.** It ships, updates its walk's hand-off line and stops.

## A recheck round

The set walk ended 2026-10-27. Its successor is the need-keys plan's **recheck
lists** (`docs/plans/need-keys-after-the-walk.md`, Phase 1 step 2): frozen lists
of about 100 already-triaged cards each, `engine/data/recheck/R1.txt` … `R9.txt`,
written by `npm run cards:needs -w engine -- --recheck --freeze`. A recheck round
runs this skill with these changes; everything else (the rules above, batch
numbers, the landing lock, watching, reporting, archiving) is the same.

- **Step 0**: list sessions with the tag `recheck` too. A list still being worked
  is owned until it lands.
- **Step 1, instead of ranges**: the lists. `BACKLOG.md`'s "Next: work down the
  need keys" line says which are done or assigned. Take up to five lists not yet
  done, lowest first. **Re-freeze only between rounds** (no list assigned and
  unlanded): re-freezing rewrites every list, renumbering what's left. Do it when
  the lists are stale, meaning most cards on them have landed or a round of
  feature work has built keys they need (`--recheck` then shows more cards than
  the lists hold). R1 holds the 61 meta-only cards, which need a full triage, so
  it's the slowest list.
- **Step 2**: record the assignment on that BACKLOG line: each list and its
  child's batch number. Land it on `main` the same way.
- **Step 3**: fill **`child-prompt-recheck.md`** instead (placeholders: `LIST`,
  for example `R3`; `CARDCOUNT`, the list's card lines; `BATCHNUM`). Title
  `Recheck <LIST> (<BATCHNUM>)`, tags `["recheck"]`.

## 0. Orient

- `node scripts/unmerged-branches.mjs` prints nothing actionable, and this checkout is level
  with `origin/main` (`git fetch origin main && git status -sb`). A batch of this session's
  own still in flight lands first.
- `mcp__claude-code-remote__list_sessions` (tag `set-walk`): no earlier child still running.
  One that is still running owns its range until it lands; leave that range out. One left
  idle by an earlier round, its batch on `main`, was never archived: archive it now.
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

Each child's batch is ~80–120 cards: one set, or two small ones. Three sessions was the size
through round twelve, five from round thirteen (2026-10-26): with the landing lock and the
verify run before it, more sessions cost a few minutes' wait each, not re-checks. Split the oldest-first walk's long range
for the extra middle walks.

## 2. Record the assignment and land it

Edit `BACKLOG.md`'s `author-by-set` line: each walk's range (its first and last set by name
and code) and each child's batch number, plus the rule for later batches (the highest
`B<N>` on `origin/main` plus one, checked again before landing). Update the oldest-first
line's end too if a middle walk now bounds it. Commit (`Docs: the set walks' ranges for
parallel sessions`) and land it on `main` (`git push origin HEAD:main` after a fetch and
merge).

## 3. Start the sessions

There is **no report-in trigger**: a child can't `send_message` this session, and firing a
trigger bound to it doesn't wake it either. A fired trigger starts a fresh, repo-less session
of its own (round three, 2026-10-25: the B164 child's `fire_trigger` minted
`⚡ Set-walk children report in`, which pushed the user a confused notification and woke
nothing here; rounds two and three lost every report-in that way). The timed safety net in
step 4 is how this session learns a child is done.

Fill `child-prompt.md` beside this file once per child (its placeholders: `SKILL` —
`author-by-set` or `author-by-set-oldest`; `WALK` — "the newest-first walk", "the middle
walk", "the oldest-first walk"; `RANGE` — the range as recorded; `BATCH_SETS` — this batch's
sets with their left counts; `HOW_TO_PICK` — for a middle walk the `--set <code>` sentence,
else empty; `BATCHNUM`). Start all of them in **one message**:

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

Arm **one safety net** with `mcp__claude-code-remote__send_later` about 90 minutes out,
naming every child's session id and batch (round two's batches landed 55, 69 and 89 minutes
after their start; round three's 47, 57 and 118, the last held up by a fuzzer-found engine
bug). Don't poll in between: each turn here re-reads the coordinator's whole context. When it
fires, read as little as answers the question:

- `git fetch origin main && git log --oneline origin/main` shows which batches landed;
  `node scripts/landing-lock.mjs status` who is landing now. A lock held by a child that
  has stopped is taken over by the next child after 45 minutes.
- Only for a child whose batch isn't on `main`: `get_session` (`status_bucket`
  `failed` means its last turn errored; `idle` with no landed batch means it stopped early),
  then its last words — `list_events` with `kinds: ["assistant", "result"]` and `limit: 20`,
  never the whole transcript.
- A stalled or failed child: `send_message` it a correction (it continues with its context),
  or tell the user what blocks it. Don't redo its batch here. Re-arm the safety net 30 minutes
  out while one is still working.
- When the last child is in: cancel any pending safety net (`delete_trigger` on its id), and
  report to the user.

## 5. Report and close

When every child has landed: the batches and their sets, cards authored and blocked per
batch (each child's commit message has them), any feature built and by whom, any merge that
needed a fix. Then `archive_session` each child whose batch is on `main` (the user's standing
call, 2026-10-25: archiving is part of the wrap-up, not a separate ask; it frees the child's
container, and its transcript stays readable). Leave open a child that stopped without landing:
its context is what a correction or a resumed batch needs. Offer the next round, with each walk's next sets, but don't start it unasked.
