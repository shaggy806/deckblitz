---
name: author-walks-local
description: Run several set-walk card batches at once on this PC instead of in the cloud — start a local Claude Code session per walk, each in its own git worktree with its own card-author agents, on its own range of sets, sharing the machine's cores and memory through the machine-wide gate (`scripts/machine-slots.mjs`) — assign the ranges and batch numbers, record them on main, start the sessions, and report as each lands on main. The local twin of `author-walks-parallel`. Use when the user asks to run the set walks in parallel locally, on this machine or PC, with local agents or sessions, or to use this machine's CPU/RAM for the card authoring.
---

# Run the set walks in parallel local sessions

The local twin of **`author-walks-parallel`** (read its "The rules that make it safe" and steps
1–2 — they hold here unchanged: ranges never overlap and live in `BACKLOG.md`, batch numbers are
assigned before starting, the assignment lands on `main` first, one engine feature built once,
one batch per child, each child lands its own batch under the landing lock). What differs is
where the children run: each is a **local session** (`mcp__ccd_session__start_session`) in a
git worktree of its own on this PC, not a cloud container. This session is the
**coordinator**: it assigns, starts and reports, and authors nothing itself. Coordinate from a
fresh session, as the cloud skill says.

## What this machine holds

The PC is an i5-13600K, 20 threads, 32 GB — five times a cloud session's cores but only about
twice its memory, and Chrome, Steam and other sessions share it (15 GB of 32 free at idle,
2026-10-26). **Memory sets the size**, measured 2026-10-26:

| step | peak | gated |
|---|---|---|
| engine tests typecheck | ~6.3 GB | a slot (`typecheck-turn.mjs`) |
| engine build | ~6 GB | a slot (`typecheck-turn.mjs`) |
| one test file (`vitest run <file>`) | ~4.2 GB | no |
| engine suite, 8 workers | ~18.5 GB | the whole machine (`verify`) |

`scripts/machine-slots.mjs` is the gate every worktree shares: four slots on this PC (one per
~7 GB beyond 3 GB), a slot beside others only while ~7 GB is free for it, and **a verify takes
the whole machine** — one verify at a time, no typecheck or build beside it. `npm run verify`
takes it on its own, so the children queue their verifies without being told; a wait of
several minutes for "another verify on this machine" is the gate working.

So a round is **three children, at most four `card-author` agents each** (twelve agents; batches
of ~70–100 cards, groups of ~18–25). A round in which no child reports an out-of-memory kill
(exit 137) or a typecheck wait past ~5 minutes can go to four children next time; record the
result here.

## 0. Orient

As the cloud skill's step 0, plus:

- `mcp__ccd_session_mgmt__list_sessions` with `linked: true`, and `git worktree list`: no child
  of an earlier round still running (it owns its range until it lands) and no worktree left
  behind. A leftover worktree under `.claude/worktrees/` whose branch is on `main` is removed
  the `feedback_worktree_agents` way (junctions unlinked first).
- This checkout may hold the user's own uncommitted work (`git status`): leave it alone. Commit
  only `BACKLOG.md` in step 2, and bring the checkout level with `git merge --ff-only
  origin/main` only when that doesn't touch their files.
- Ask for keep-awake (`mcp__ccd_host__request_keep_awake`) for the round: a local child stops
  when the PC sleeps, which a cloud one doesn't.

## 1–2. Choose the walks, record and land the assignment

The cloud skill's steps 1 and 2, with three walks by default (newest-first, one middle,
oldest-first). In the `BACKLOG.md` line, say the round runs in local sessions.

## 3. Start the sessions

Fill `child-prompt.md` beside this file once per child (the cloud skill's placeholders:
`SKILL`, `WALK`, `RANGE`, `BATCH_SETS`, `HOW_TO_PICK`, `BATCHNUM`). Start them all in **one
message**, after a `mcp__ccd_session__mark_chapter` ("Set walks, round N"):

```
mcp__ccd_session__start_session({
  initiation: "user_asked",
  context: "fresh",
  use_worktree: true,
  name: "walk-<batchnum, lower case>",
  branch_name: "set-walk-<batchnum, lower case>",
  title: "Set walk, <walk>: <sets> (<BATCHNUM>)",
  prompt: <the filled prompt>,
  background: "One of three card-authoring sessions running in parallel on this PC, each on its own range of sets; the coordinator recorded the ranges in BACKLOG.md and lands nothing itself.",
  wake_when_done: true,
})
```

Leave `permission_mode` and `model` inherited: a `plan` child would stall waiting for an
approval nobody gives. A child stopped at a permission prompt shows as waiting for the user in
the sidebar; tell the user which.

## 4. Watch them

No timer and no polling: the app continues this session with a `<side-sessions-event>` when a
child ends a turn. Then read as little as answers the question — the event's quoted report,
`git fetch origin main && git log --oneline origin/main` for which batches landed, and
`node scripts/landing-lock.mjs status` for who is landing. A child that ended its turn without
landing: read its last words (`mcp__ccd_session_mgmt__list_events`, a small `limit`), then
`SendMessage` it a correction (by its `local_…` id) or tell the user what blocks it. Don't redo
its batch here.

**Never type into a running child yourself** (nor ask the user to) unless it's stuck: an
interrupt silently stops every agent it has running (the `feedback_interrupt_kills_agents`
memory).

## 5. Report and close

When every child has landed: the cloud skill's report (batches and sets, cards authored and
blocked per batch, features built and by whom, merges that needed a fix), plus how long each
child waited on the gate if it said. Then:

- `git worktree list`: each child removed its agents' worktrees before stopping; any left is
  removed now (junctions first — they point at the child's own `node_modules`, never this
  checkout's).
- `mcp__ccd_session_mgmt__archive_session` each child whose batch is on `main` (it frees the
  worktree; the transcript stays readable). Leave open one that stopped without landing.
- Bring this checkout level with `origin/main` if step 0's condition holds, and release
  keep-awake.
- Offer the next round, with each walk's next sets; don't start it unasked.
