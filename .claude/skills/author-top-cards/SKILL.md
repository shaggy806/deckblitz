---
name: author-top-cards
description: Add the next batch of cards to the pool, going down the Commander-legal cards by EDHREC rank (most-played first) — recheck cards whose blockers have been built, pick the next untriaged ones by rank, build the engine feature that unblocks the most when one clearly leads, author every card the engine runs faithfully, record what blocks the rest, test, and ship the batch. Use when the user says to work on cards, author cards, do the next card batch, grow the pool, continue the card backlog, or runs this skill with no other instructions.
---

# Add the next card batch

The goal is **more real cards in the pool**, taken in EDHREC rank order
(most-played Commander cards first). One run = one batch, shipped. Nothing
else sets the order — not the precons' stand-ins, not the commander list —
though a card that happens to be one of those still counts.

**The tools, in the order a card uses them** (each prints what you'd
otherwise grep for — reach for them first):

- `npm run cards:needs -w engine -- --next 60` — the next 60 Commander-legal
  cards by EDHREC rank that are neither in the pool nor triaged.
- `npm run cards:needs -w engine -- --stale | --rank | --feature <key>` —
  what's been built since triage, what blocks the most triaged cards, one
  need's cards.
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
nothing; a wrong one lies at the table. When in doubt, it's blocked.

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

1. **`npm run cards:needs -w engine -- --stale`** first: cards whose recorded
   blockers have all been built since are the cheapest cards there are.
2. **`npm run cards:needs -w engine -- --next 60`**: the next untriaged cards
   by rank.
3. **`npm run cards:needs -w engine -- --rank`**: what blocks the most
   triaged cards. Every triaged card left is blocked by something, so
   building the leading feature is how the most-played cards get in.

For each candidate: `npm run card:brief -w engine -- "Name" …` (several names
per call). Sort into:

- **Authorable now** — every clause expressible with the existing
  vocabulary. The brief's analogs show how the pool already says each line;
  `card:vocab <term>` answers the rest (several "missing" mechanics have
  turned out to exist, unused). `npm run card:scaffold -w engine -- "Name" …`
  writes skeletons into `cards/scaffold/`; a card the parser reads whole goes
  to `cards/review/`.
- **Blocked** — name the missing feature with a key from the need vocabulary
  (`top-commanders-gaps.json`'s `features` or `engine/data/needs-vocabulary.json`'s;
  add a new one there, with its `family`, when none fits —
  `test/needs-vocabulary.test.ts` fails on an unknown key), with one line of
  why.

## 2. Build a feature, if one leads

If one missing feature blocks **five or more** cards of the batch, or leads
`cards:needs -- --rank` (the BACKLOG's **Next** line) and blocks at least
three of the batch, build it before authoring: engine change + its own test
file + the AUTHORING.md vocabulary entry, following `engine/CLAUDE.md`'s
rules (every decision is a dispatched action; `Game` is the only writer;
rules accuracy with rule numbers). Then author every card it unblocks —
`cards:needs -- --feature <key>` lists them, batch or not. A feature needing a
new player decision is also a client change — check it live in a 2- and a
4-player room (`dev-up`, `dev-down`) at ~768px tall. **Teach the scaffolder
too**: a template for the feature's keyword line or sentence in
`scripts/oracle-parse.mjs`, checked by `npm run card:parse-check -w engine`
(zero disagreements) and pinned in `test/oracle-parse.test.ts`, so its cards
come pre-drafted. Otherwise, skip feature work this run and note the leader
for the next.

## 3. Author

Target 30-50 cards. **Past ~15 authorable cards, use parallel agents**:
`card-author` agents in their own worktrees, the lead doing the shared work
once (the feature and the cards that test it first, one scaffold run, tokens
made once, drafts moved into staged groups, briefs with `--analogs 2 --width
300`, the digest) and reading every file they write —
**`.claude/skills/author-by-set/agent-batches.md`** is the whole procedure,
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

- The blocked cards: `engine/data/sweep-3/B<N>.json`, same shape as the
  others (`batch`, `status`, `ranks`, `authored: [{name, files, tested}]`,
  `blocked: [{name, needs, why}]`), so `--next` skips them from then on.
- A feature that landed: add its key to `top-commanders-gaps.json`'s `built`
  array (`cards:needs -- --stale` then flags every card that waited on it).
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
<N> — <three or four headline cards> and <count> more` (or `Engine, Cards:
<the feature>, and <cards>` when one was built), the rank range, the cycles,
and any engine fix found on the way, each with why.

## 7. Report and offer the next

A few lines: how many authored (with the rank range), how many blocked and
the feature blocking the most of them, anything built or fixed. Then offer the
next batch — don't start it unasked.

**One batch per session** (`.claude/skills/author-by-set/agent-batches.md`, "One batch per session"): after
the push and the report, stop. Leave the hand-off in this skill's `BACKLOG.md`
line — the next batch, and any feature already researched for it — and offer
the next batch as a new session (`/author-top-cards`), not in this one —
unless the user asks to carry on here: the lead's growing context costs more
than the agents do.
