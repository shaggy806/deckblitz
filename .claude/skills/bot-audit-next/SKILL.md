---
name: bot-audit-next
description: Build the next step of docs/plans/bot-audit-fixes.md (the fixes for what the November 2026 bot audit found), start to finish, in this session — find the step the plan's Progress list says is next, read its findings in docs/plans/bot-audit-2026-11.md, build it with its scenarios or measurements, verify, land it on main, and tick it off; step 2b deploys and tests live. Use when the user says bot audit next, next audit step, next bot fix, carry on with the bot audit fixes, continue the bot plan, or runs this skill with no other instructions.
---

# The next step of the bot audit's fixes

`docs/plans/bot-audit-fixes.md` orders the work; `docs/plans/bot-audit-2026-11.md` holds each
finding (S1-S8 speed, Q1-Q8 decision quality) with its evidence, cause and proposed fix. **One
step a session**, landed as its own commits on `main`. A step that turns out too large is cut at a
commit that leaves the bots working, and the rest stays on the Progress list.

## 1. Pick the step

- `git fetch origin main && git status -sb`: level with `origin/main`. Merge any branch the
  SessionStart hook lists first, or ask.
- Read the plan's **Progress** section: the line starting `- Next:` names the step. If the user
  named one, that one instead. Check `git log -8 --oneline` and `COMPLETED.md` that it hasn't
  landed.
- Say in one line which step you're starting and what it will change.

When every box is ticked, say so and stop: what's left is the plan's "does not take on" list,
which needs a design of its own.

## 2. Read before building

- The step's section in the plan, whole, and **each finding it names** in the audit: the
  evidence, the cause with its file and line, the fix, and the checker's corrections folded into
  it. The corrections are the part that's easy to skip and they change the fix (which callers
  misread an aborted rollout, what the window memo's signature must hold, why the general
  characteristics cache is unsound).
- `docs/plans/bot-effect-knowledge.md` is still the bots' plan of record: read the section on
  whatever you're changing (the turn plan, the rollout policies, the evaluation's features).
- `engine/CLAUDE.md`, and the `docs/architecture/engine.md` entry of each file you'll change
  (one very long line each: read it by line number).
- **Check each cited line still says what the audit says.** The audit read the code on
  2026-11-10; a line number that has moved is fine, a function that has changed shape means
  re-reading the finding against today's code before trusting its fix.
- The audit's probes: in `engine/scripts/` (`bot:anatomy`, and `bot:timings`, which is the
  audit's `harvest.mjs`: `bot:harvest` was taken); for the positions behind Q3-Q7, in `.scratch/bot-audit/` on
  the development PC (git-ignored: `blood.mjs`, `interact.mjs`, `stun.mjs`, `ablate.mjs`,
  `check-planner/q6.mjs`, `check-rules/q7.mjs`). If `.scratch/bot-audit/` isn't there, rebuild
  the position from the audit's description; each is a few cards.

## 3. Build it

**A decision-quality fix** (steps 1, 5, parts of 2 and 4):

1. Write the gate scenario first, in `engine/src/bot/scenarios.ts`, from the audit's position.
   `npm run build -w engine && npm run bot:scenarios -w engine`: **watch it fail** on today's
   code. A scenario that passes before the fix tests nothing.
2. Make the change the plan describes, as one general rule, not a case for the scenario's cards.
3. Gate green, the new scenario included. Then `bot:diff` against `origin/main` (the
   `decision-diff` skill) on about six bench games, and read every group of changed decisions:
   each should be the fix at work. A change you can't explain is a bug or a second finding.
4. No `bot:ab` unless the plan's step asks for one (only step 5's end does); say why first if
   you think one is needed.

**A speed fix** (steps 3 and 4, parts of 2):

1. Measure first, on the fixed positions step 0 checked in (`engine/data/bot-positions/`):
   `bot:anatomy` for ms a simulation and ms a tick, one process, nothing else running.
2. Make the change.
3. **Same answers**: the engine suite, and for an engine change the fuzzers with
   `MTG_CACHE_CHECK=1` and the end state of a rollout equal before and after on those positions.
   For a search change, `bot:diff` should show no changed decision at count budgets unless the
   step says otherwise.
4. Measure again, same positions, same conditions. Write both numbers into the step's *As
   built*. A gain much smaller than the audit's estimate is a result to record, not to hide.

**Either kind**: `npm run typecheck -w engine` as you go (vitest doesn't type-check tests); edit
`game.ts` with the Edit tool only (CRLF and one NUL byte; `grep -a` to search it); at most 8
workers for any batch run; stop every process you start.

## 4. Step 2b: deploy, and test live

Running this skill when `Next` is step 2b **is** the user asking for the deploy: they added the
step on 2026-11-10. Say that a deploy ends every game in progress, then go on unless they said to
wait.

1. Run the **`deploy`** skill.
2. Play the two blitz games the step describes, in the browser, on deckblitz.net; read by `find`
   and refs, not screenshots. Note the turn and board size of anything the step lists to watch
   for.
3. Read the server's figures as the step says, and the development PC's for the same decks from
   `bot:timings`.
4. Write them under the plan's *Live figures*, and move `Next` to step 3 or step 4 by the rule in
   the step, with the reason.

Nothing is built in this step. A fault that isn't one of the audit's goes to `bug-report` or
`bot-misplay`.

## 5. Verify and land

1. `npm run verify` (an engine or bot change brings the bot gate and the server and client
   suites); `-- --full` if the step changed a type many files read. After a fix to what one step
   found, `-- --only <step>`.
2. If anything a player sees changed (step 2's server status page, say), check it live with
   `dev-up`, then `dev-down`.
3. Docs, in the same landing:
   - the plan: tick the step in **Progress** with the date and commit, move `- Next:`, and add an
     *As built* paragraph under the step — what changed, where it differs from the plan, the
     numbers before and after;
   - `COMPLETED.md` (Bots): one entry; `BACKLOG.md`: the audit line's "step N next", and any
     item below it that the step settled, moved to `COMPLETED.md`;
   - `docs/plans/bot-effect-knowledge.md` if how a bot picks actions changed;
   - `docs/architecture/engine.md` (and `server.md`) for each file whose shape changed;
   - `docs/plans/README.md`'s entry when the plan's status changes.
4. Commit in logical pieces (`Bots: …`, `Engine: …`, `Docs: …`), merge `origin/main`, push to
   `origin/main`. Commit `scripts/verify-state.json` if verify rewrote it.

## 6. Report

A few lines: the step, what changed in the bots' play or speed with the numbers, the scenarios
added, the commits on `main`, anything the step left on the list, and what `Next` now names.
Offer this skill again in a fresh session (`/clear`, then `/bot-audit-next`); don't start the
next step here.
