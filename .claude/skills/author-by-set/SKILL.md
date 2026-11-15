---
name: author-by-set
description: Fully complete one set — every Commander-legal card it first printed that isn't in the pool yet, whatever its EDHREC rank: re-read each against its Oracle text, author the ones the engine already runs, and build the engine features the blocked ones need so they land too, asking the user only about major features; test, record, verify, ship, and report what's left and why. Takes an optional set code (`/author-by-set TRK`, or a set and its Commander set as `TRK,TRC`); with none, the newest set with cards left. A new set's cards are played long before EDHREC ranks them, so the by-rank skills never reach them. Use when the user says to complete, finish or fully author a set (Star Trek, a new release), to work on a set by its code, or runs this skill with or without a set code.
---

# Complete a set

The goal is **one set, whole**: every Commander-legal card the set first
printed is in the pool, or is one of the few left for a reason the user has
agreed to. A new set's cards are met in games from release day, but EDHREC
ranks them in the 20,000s for months, so `author-top-cards` and `build-family
--by-rank` don't reach them. This skill takes the set as its order instead.

It replaces the set walk's skill (retired 2026-11-10, when every set had been
walked once). The walk authored what the engine ran and **triaged the rest as
blocked**, building a feature only when it blocked five or more cards of the
batch. That left each set a tail of blocked cards. Here the tail is the work:
**build first, don't block** (the user's call, 2026-11-12, as in
`author-top-cards`) — a card the engine can't run gets the feature it needs,
built in this run, and is authored on it.

## The argument

- **`/author-by-set <CODE>`** — that set (`TRK`). Several codes by comma
  (`TRK,TRC`) are one run. A main set's Commander set (same release date,
  type `commander` in `cards:sets -- --sets`) belongs to the same run unless
  the user named only one and said so: say that you're including it.
- **No code** — `npm run cards:sets -w engine -- --sets`: the newest set with
  cards `left` or `triaged` (not `done`), sets not out yet first.
- Anything after the code is the user's instruction for the run ("only the
  legends", "skip the Sagas"): follow it, and record what was left out.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly*. Completing a set never
means approximating its last cards; a card that can't be run exactly gets its
feature built, or stays out with the reason recorded.

## 0. Orient

- `node scripts/unmerged-branches.mjs` (the SessionStart hook has printed it
  if there's anything): merge a listed branch first, or ask.
- `git status` clean enough to work on; `npm run build -w engine` (the set
  tool reads `dist/`).
- `BACKLOG.md`, "Card backlog", the set-walk line: what's already known about
  the set (cards waiting on release rulings, previews to re-read).
- `engine/src/cards/AUTHORING.md` §0-1 and §15 if not in context this session.
- **Is the snapshot current for the set?** The Oracle snapshot
  (`engine/data/oracle/cards.jsonl`) is what every tool reads. If it was taken
  before the set's release (`git log -1 --format=%cd -- engine/data/oracle/cards.jsonl`),
  the set's cards are previews in it: no rulings, some text since changed,
  some cards missing ("not in the snapshot" in the list below). Refresh it
  first — `npm run gen:oracle -w engine` — then `npm run card:verify -w engine
  -- --offline` and `npm run card:text -w engine -- --offline`, which name
  every pool card whose released text differs from what was authored from the
  preview. **Fix those before anything else**: they're the set's cards already
  in the pool, and wrong. Commit the snapshot and the fixes on their own
  (`Tooling: refresh the Oracle snapshot`, `Cards: <Set>'s previews re-read
  against the released text`).

## 1. The list

```bash
npm run cards:sets -w engine -- --set <CODE>[,<CODE>] --left
```

Every card of the set not in the pool, by EDHREC rank, each with where it
stands (its latest triage record, read through the need vocabulary):

- **`untriaged`** — never looked at. Brief it and sort it like the rest.
- **`every need built … re-read it`** — an earlier batch blocked it on a need
  that has since been built. A built need means "recheck this card", never
  "author it blind": the record named the first thing missing, not always
  the only thing.
- **`<need key> (+ …)`, with the record's why** — blocked. The why is a lead
  from whoever triaged it, often an agent that read one line of the engine:
  about a tenth of recorded needs turn out to exist already (the
  `project_need_keys_overcount` memory). Check before building.
- **`not in the snapshot`** — step 0's refresh brings it.

Then `npm run card:brief -w engine -- "A" "B" …` over the whole list (write it
to a scratchpad file; read each card's Oracle text, rulings and records, and
the analogs for the lines in question). Sort every card into:

- **Ready** — the engine runs it as it is (an untriaged card, a built need,
  or a recorded need that `card:vocab` / `card:find` shows already exists).
- **Small feature** — a field, an amount, a filter clause, a condition, a
  trigger event, an effect built from existing pieces. One line each on what
  the engine lacks, with its need key (`engine/data/needs-vocabulary.json` or
  `top-commanders-gaps.json`'s `features`; narrow or re-key a record whose
  key says the wrong thing).
- **Major feature** — a new kind of player decision with its own UI, a new
  subsystem, or a change to a core rule (turn structure, layers, priority).
- **Waits on something outside** — a ruling not yet published that the card
  turns on. Stays blocked, with what it waits for.

Order the features by cards freed, then by the best rank: two cards on one
key (`amount:dilemmas-faced-this-turn`) before a one-card key.

## 2. Ask once about the majors

If any card needs a major feature, put them all to the user in one
`AskUserQuestion` before building: each feature, the cards it brings, what
building it involves. Options: build it this run, leave it (recorded blocked,
`"size": "major"`), or a narrower version they name. A feature you're unsure
is major counts as small: build it.

## 3. Author the ready cards

Fifteen or fewer, the lead writes them; more, `card-author` agents in their
own worktrees while the lead builds step 4's features —
`.claude/authoring/agent-batches.md` is the whole procedure, `agent-brief.md`
beside it (`SET_NAMES` the set's name, `SET_CODE` its code,
`TEST_FILE_PREFIX` `set-<code>-batch-<N>`). Each card as `author-top-cards`
step 3 says: a file in `engine/src/cards/pool/`, tokens reused or added in
`tokens/`, `text` close to Oracle, a scaffolded draft read against the Oracle
text, then `npm run gen:cards -w engine`.

## 4. Build what the rest need

Every small feature, and each major the user said to build, following
`engine/CLAUDE.md` (every decision a dispatched action; `Game` the only
writer; rules accuracy with rule numbers checked in `docs/rules/`) and the
entry for each file in `docs/architecture/engine.md`:

- **General, not per-card.** A general read or combinator over an option
  that fits one card: the set's mechanics come back in the next set. Look at
  the engine's own "one record" rules in `engine/CLAUDE.md` (prohibitions,
  play permissions, the journal, trigger events) before adding a field.
- Its own test file (or cases in the mechanic's), the AUTHORING.md vocabulary
  entry, the key in `top-commanders-gaps.json`'s `built` array, and the
  file's `docs/architecture` entry.
- Then author its cards on it, and any other card `npm run cards:needs -w
  engine -- --feature <key>` lists, in the set or not.
- A new player decision is a client change too: check it live in a 2- and a
  4-player room (`dev-up`, `dev-down`) at ~768px tall, and add its quick test
  to `docs/manual-checks.md` with a board in
  `client/src/builder/manualChecks.ts`.
- **Teach the scaffolder** when the line will recur (the set's keyword, a
  templated sentence): a template in `scripts/oracle-parse.mjs`, `npm run
  card:parse-check -w engine` at zero disagreements, pinned in
  `test/oracle-parse.test.ts`.
- A recorded **bug** (`bug:…` keys: a card authored, then dropped because the
  engine got it wrong) is reproduced in a test first, then fixed; the card
  comes back with that test.

One commit per feature with its cards (`Engine, Cards: <the feature> —
<its cards>`), each after its own tests and `npm run typecheck -w engine`
pass, so the run can stop at any commit.

**Keep going until the list is empty.** One session works the whole set:
after each feature, re-run step 1's command and take the next. Stop early
only at a clean commit, when the session's context is past ~400K or the user
says to; the cards not reached are recorded with their key and
`"size": "small"`, and the hand-off names the next feature.

## 5. Test

- `engine/src/test/set-<code>-batch-<N>.test.ts` (the code lower case; N the
  next after that set's existing files), on `src/test/harness.ts`: one focused
  test per card whose behaviour is more than a stat line — the clause that
  blocked it. A test that could pass by accident: break the card or the
  feature once and watch it fail.
- `npm run card:text -w engine -- --offline`: no MISSING/EXTRA line from the
  set.
- While working, only the touched files (`npx vitest run set-<code> pool.test`
  from `engine/`, `--maxWorkers=8` for the whole suite).
- `npm run verify -- --fuzz-new` as soon as a group of cards is written (the
  situation fuzzer and the forced-in games find most card bugs), then one
  `npm run verify` before the push; `--only <step>` after a fix.

## 6. Record and ship

- **The batch**: `engine/data/sweep-3/B<N>.json` (the next number), the usual
  shape, `"ranks"` naming the set and "completing the set". `authored` holds
  every card that landed; `blocked` only what's still out — each with its
  narrow key, `size`, and a why that says what was tried — so the newest
  record for a card is the true one.
- **`BACKLOG.md`**, "Card backlog", the set-walk line: the set is whole, or
  the cards left and what each waits for. A set finished goes on
  `COMPLETED.md`'s set-walk line; the batch summary in
  `docs/card-blockers.md`; a feature that was a BACKLOG item moves to
  `COMPLETED.md`.
- The `ship` skill. Card commits: `Cards: <Set name> — <headline cards> and
  <count> more`. A cloud session lands on `main` as the root `CLAUDE.md`
  says.

## 7. Report

A few lines: the set's count now (`cards:sets -- --set <CODE>`: done of
total), the features built and the cards each brought, and **every card
still out, by name, with why** — a major the user deferred, a ruling not
out, a feature not reached. If the set is whole, say so.
