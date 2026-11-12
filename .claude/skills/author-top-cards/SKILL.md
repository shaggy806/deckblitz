---
name: author-top-cards
description: Triage and author the next untriaged Commander-legal cards by EDHREC rank (the tail past the top 5000; `cards:needs -- --next`) — author every card the engine runs faithfully as it is, and build the engine features the rest need so they land in the same batch, asking the user only about major features (a new kind of decision, a new subsystem, a core rule changed); test, record and ship. Use when the user says to triage or author the next untriaged cards by rank, or runs this skill with no other instructions; for cards earlier features freed, `author-freed`.
---

# Add the next card batch

The goal is **more real cards in the pool**, taken in EDHREC rank order
(most-played Commander cards first). One run = one batch, shipped. Nothing
else sets the order — not the precons' stand-ins, not the commander list —
though a card that happens to be one of those still counts.

**Build first, don't block** (the user's call, 2026-11-12). The pool is near the
end of the missing cards, so almost every feature left unblocks only one to
three cards: waiting for a feature to block five cards before building it
means never building it. So a card the engine can't run yet gets the engine
feature it needs, built in this batch, and is authored on it. Only a **major**
feature — a new kind of player decision with its own UI, a new subsystem
(Attractions, text-changing effects, a new zone), or a change to a core rule
(turn structure, layers, priority) — is put to the user first (step 2); the
rest are built without asking.

**The tools, in the order a card uses them** (each prints what you'd
otherwise grep for — reach for them first):

- `npm run cards:needs -w engine -- --next 60` — the next 60 Commander-legal
  cards by EDHREC rank that are neither in the pool nor triaged.
- `npm run cards:needs -w engine -- --stale | --feature <key>` — what's been
  built since triage, and every card waiting on one need (so a feature built
  for this batch brings older triaged cards along).
- `npm run card:brief -w engine -- "A" "B" …` — Oracle text and rulings, the
  card's triage records (each need flagged if built since), and per Oracle
  line the pool's closest authored abilities with their files. `--test`
  adds a test outline. Reads the pool index (`engine/.cache/`), which
  rebuilds itself when a card changes: no build needed.
- `npm run card:find -w engine -- "<phrase>" [--kind triggered] [--json
  "<substring of spec>"] [--limit N]` — the pool's abilities that read most
  like a phrase, with card, file, text and authored shape, in well under a
  second: the quick way to find an example to copy.
- `npm run card:vocab -w engine -- <term>` — whether the vocabulary can say
  something: usage with small example cards, declarations with docs, the
  guide's lines.
- `engine/src/test/harness.ts` — the shared test table.
- `npm run verify` — every check, the fuzzer with the batch's new cards in.

Edit files with the Edit tool (`game.ts` included — it keeps its CRLF and
NUL), not with scripts that rewrite text.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly* — no dropped clause, no
hardcoded number, no choice made for the player. A missing card costs
nothing; a wrong one lies at the table. When the engine can't run a card
exactly, the answer is to build what it needs (step 2), never to approximate.

## 0. Orient (read, don't skim)

- **Unmerged work first**: `node scripts/unmerged-branches.mjs` (the
  SessionStart hook has already printed it, if there's anything). A branch it
  lists holds commits `main` doesn't — merge it into `main` before authoring,
  or ask the user whether it's abandoned. Starting a batch over it is how five
  sets were walked twice (2026-10-25).
- `git status` clean enough to work on (the `sync-check` skill if on a
  different machine than last time). `npm run build -w engine`.
- `BACKLOG.md`, "Card backlog": the counts, the line marked **Next**,
  anything to merge first.
- `engine/src/cards/AUTHORING.md` §0-1 and §15 (what the engine can't
  express) if not already in context this session; §3-10 as each card needs.
- `engine/src/cards/neededCards-features.md`, "Open: the card backlog", for
  features already ranked.

If BACKLOG lists something to do *before* authoring (a branch to merge, a
broken build), do that first or tell the user.

## 1. Pick the batch

1. **`npm run cards:needs -w engine -- --next 60`**: the next untriaged cards
   by rank — the batch.
2. **`npm run cards:needs -w engine -- --stale`**: triaged cards whose
   recorded needs have all been built since. A short list joins the batch as
   ready cards; a long one is `author-freed`'s.

For each candidate: `npm run card:brief -w engine -- "Name" …` (several names
per call; for 60 cards, write it to a scratchpad file and read the Oracle
lines, not the whole thing). Sort into:

- **Ready** — every clause expressible with the existing vocabulary. The
  brief's analogs show how the pool already says each line; `card:vocab
  <term>` answers the rest (several "missing" mechanics have turned out to
  exist, unused). `npm run card:scaffold -w engine -- "Name" …` writes
  skeletons into `cards/scaffold/`; a card the parser reads whole goes to
  `cards/review/`.
- **Needs a feature** — name it with a key from the need vocabulary
  (`top-commanders-gaps.json`'s `features` or `engine/data/needs-vocabulary.json`'s;
  add a new one there, with its `family`, when none fits —
  `test/needs-vocabulary.test.ts` fails on an unknown key), with one line of
  what the engine lacks, and size it: **small** (a field, an amount, a filter
  clause, a trigger event, an effect built from existing pieces) or **major**
  (as defined above). These are step 2's list.

When the batch goes to agents (step 3), they triage too: a card they find
blocked comes back with a need key and joins step 2's list, so the lead
builds its feature after integrating them, in the same batch.

## 2. Build what the batch needs

**Ask once about the majors.** If any card needs a major feature, put them to
the user in one `AskUserQuestion` before building (and before the agents
finish, so the answer doesn't hold the batch up): each major feature, the
cards it would bring and their ranks, and what building it involves. The
options: build it this batch, leave it for later (the cards are recorded
blocked with `"size": "major"`), or a narrower version they name. A feature
you're unsure is major counts as small: build it.

**Build every small feature**, best-ranked card first, while the agents
author the ready cards — `.claude/authoring/agent-batches.md`, "A feature
alongside the agents" (its `typecheck-turn.mjs` rule for every build and
check while they run). Each feature, following `engine/CLAUDE.md`'s rules
(every decision is a dispatched action; `Game` is the only writer; rules
accuracy with rule numbers, from `docs/rules/`):

- **General, not per-card**: a general read or combinator over a one-card
  option (the `project_need_keys_overcount` memory) — the next card that
  needs it should find it already there. Check `card:vocab` and `card:find`
  first: about one "missing" feature in five turns out to exist.
- Its own test file, the AUTHORING.md vocabulary entry, and the key in
  `top-commanders-gaps.json`'s `built` array.
- Then the lead authors its cards on it (they test it), and any other card
  `cards:needs -- --feature <key>` lists, batch or not.
- A new player decision is also a client change — check it live in a 2- and
  a 4-player room (`dev-up`, `dev-down`) at ~768px tall, and add it to
  `docs/manual-checks.md` (step 5).
- **Teach the scaffolder** only when the line will recur (a keyword, a
  templated sentence other unauthored cards share): a template in
  `scripts/oracle-parse.mjs`, checked by `npm run card:parse-check -w engine`
  (zero disagreements) and pinned in `test/oracle-parse.test.ts`. A one-card
  sentence needs none.

Several small features go in one engine commit each (`Engine, Cards: <the
feature> — <its card>`), as the history does. **If the list outruns the
session** (the lead's context past ~400K, or the user's time), stop building
at a clean commit: the cards not reached are recorded blocked with their key
and `"size": "small"` (step 5), and the BACKLOG hand-off names the next
feature to build.

## 3. Author

The ready cards. **Past ~15 of them, use parallel agents** (they start as soon
as the batch is staged, and the lead builds step 2's features while they
run): `card-author` agents in their own worktrees, the lead doing the shared
work once (one scaffold run, tokens
made once, drafts moved into staged groups, briefs with `--analogs 2 --width
300`, the digest) and reading every file they write —
**`.claude/authoring/agent-batches.md`** is the whole procedure,
with `agent-brief.md` beside it (`SET_NAMES` "EDHREC ranks <a>–<b>",
`SET_CODE` "batch <N>", `TEST_FILE_PREFIX` `top10000-batch-<N>`). Each card,
whoever writes it:

- File in `engine/src/cards/pool/` (kebab-case name); tokens in `tokens/`,
  reusing an existing token file when one matches exactly. `text` stays close
  to Oracle.
- Anything the scaffolder filled in, **read against the Oracle text** — its
  templates match sentences, not meaning.
- Cycles and families: a shared helper in `cards/helpers.ts` beats ten copies.
- `npm run gen:cards -w engine` after adding files.

## 4. Test

- `engine/src/test/top10000-batch-<N>.test.ts` (next N after the existing
  ones; an agent's is `top10000-batch-<N><letter>`), written on `src/test/harness.ts` — `card:brief -- "Name" --test`
  prints an outline: one focused test per card whose behaviour is more than a
  stat line or a copy of a tested pattern — the clause most likely to be
  wrong. For a test that could pass by accident, break the card and watch it
  fail.
- `npm run card:text -w engine -- --offline` (no new MISSING/EXTRA lines from
  this batch).
- While authoring, run only the touched tests (`npx vitest run
  top10000-batch-<N> pool.test` from `engine/`).
- Then **`npm run verify`** (in the background, before landing on `main` — it
  finds the batch's new cards against `origin/main`, so pushing the session branch first is fine): the build, typecheck (tests
  included), the engine suite, card:verify and the fuzzer with every card the
  batch adds forced in, every time; **every third batch** it decides on its own
  to run the full set — both fuzzer table sizes, the bot gate, the server and
  client suites — and records that in `scripts/verify-state.json` (commit it
  with the batch). It also re-marks the backlog lists and drops any
  sample-deck stand-in whose original is now in the pool.

## 5. Record

- The batch: `engine/data/sweep-3/B<N>.json`, same shape as the others
  (`batch`, `status`, `ranks`, `authored: [{name, files, tested}]`,
  `blocked: [{name, needs, size, why}]`), so `--next` skips them from then
  on. `blocked` should hold only the majors the user left for later and any
  small ones the session didn't reach; the `ranks` line names the features
  built.
- Each feature that landed: its key in `top-commanders-gaps.json`'s `built`
  array (`cards:needs -- --stale` then flags every other card that waited on it).
- `BACKLOG.md`: the implemented count, the next untriaged rank, and the
  **Next** line if the ranking of blockers changed; the batch's summary
  (authored headliners, what blocks the rest) goes in `docs/card-blockers.md`,
  not BACKLOG; `neededCards-features.md` if a feature landed or a new one now
  leads. A feature that landed and was a BACKLOG item: its line to
  `COMPLETED.md`.
- A new player decision or a careful rules call: an entry in
  `docs/manual-checks.md` — quick tests, one thing each (the doc's intro has the format) — each
  with its own board in `client/src/builder/manualChecks.ts`.

## 6. Ship

Use the `ship` skill. Commit message in the history's style: `Cards: batch
<N> — <three or four headline cards> and <count> more`, the rank range, the
cycles, and any engine fix found on the way, each with why; each feature in
its own commit before it (`Engine, Cards: <the feature> — <its cards>`).

## 7. Report and offer the next

A few lines: how many authored (with the rank range), the features built and
the cards each brought, what's left blocked and why (the majors the user
deferred, the small ones not reached), anything fixed on the way. Then offer
the next batch — don't start it unasked.

**One batch per session** (`.claude/authoring/agent-batches.md`, "One batch per session"): after
the push and the report, stop. Leave the hand-off in this skill's `BACKLOG.md`
line — the next batch, the next small feature if any weren't reached, and any
feature already researched — and offer
the next batch as a new session (`/author-top-cards`), not in this one —
unless the user asks to carry on here: the lead's growing context costs more
than the agents do.
