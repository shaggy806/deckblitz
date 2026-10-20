---
name: author-by-set
description: Add the next batch of cards set by set — newest set first, then backwards — taking each whole set's own new cards (its Commander-legal first printings), most-played first, so the cards people are seeing in games right now get in even before EDHREC ranks them highly; auto-finish what the scaffolder reads whole, author the rest the engine runs faithfully, record what blocks the others, test, and ship. Use when the user says to author by set, do the next set, work through recent sets, add the new set's cards, or runs this skill with no other instructions.
---

# Add the next set batch

The goal is **the cards people meet in games now**: a set's new cards are
played far more than their EDHREC rank says while they're new, so the order
is **set by set, newest first**, and **each set whole** — every Commander-legal
first printing, in EDHREC rank order within the set, the cards EDHREC hasn't
ranked yet last (the user's call, 2026-10-14; the walk first took each set's
top half). A set is done when every one of its new cards is in the pool or
triaged; then the next older set. Cards already triaged by any other skill
(`author-top-cards`, the commander skill) are skipped — their records stand.
A set walked before 2026-10-14 had only its top half taken: its bottom half
is the same walk, picked up by `--next` like any card left.

**The tools** (each prints what you'd otherwise grep for):

- `npm run cards:sets -w engine -- --sets [N]` — the newest N sets: new
  cards, kept, done, triaged, left. `--set FRA` lists one set's cards, each
  marked done / triaged / todo. `--next 60` — the next untriaged cards, set
  by set. The whole set is the default; `--top 50` narrows it to that share of
  the set's ranked cards and `--ranked-only` drops the unranked ones, for a
  quicker pass when asked. `--refresh` refetches Scryfall (cached three days
  in `engine/.cache/`). Reads `dist/`: build first.
- `npm run card:scaffold -w engine -- "A" "B" …` — writes each card from the
  Oracle snapshot; a card whose every line the parser reads goes, finished,
  to `engine/src/cards/review/` (check it, then move it into `pool/`), the rest
  to `cards/scaffold/` with a `// TODO(scaffold)` per unread line.
- `npm run card:brief -w engine -- "A" "B" …` — Oracle text, rulings, triage
  records and the pool's closest authored abilities per line.
- `npm run card:find -w engine -- "<phrase>" [--kind triggered] [--json
  "<substring of spec>"] [--limit N]` — the pool's abilities that read most
  like a phrase, with card, file, text and authored shape, in well under a
  second: the quick way to find an example to copy.
- `npm run card:vocab -w engine -- <term>`, `npm run cards:needs -w engine --
  --rank | --feature <key>` — as in `author-top-cards`.

Edit files with the Edit tool (`game.ts` included — it keeps its CRLF and
NUL), not with scripts that rewrite text.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly*. A scaffolder-finished
card is a draft like any other — its templates match sentences, not meaning
— and gets read against its Oracle text and rulings before it moves.

## 0. Orient

- `git status` clean enough to work on (the `sync-check` skill if on a
  different machine). `npm run build -w engine`.
- `BACKLOG.md`, "Card backlog": anything to merge or fix first.
- `engine/src/cards/AUTHORING.md` §0-1 and §15 if not already in context
  this session.
- **The snapshot has the set?** `cards:sets -- --set <code>` flags every card
  the Oracle snapshot lacks ("not in the snapshot"). A set released since the
  snapshot was taken needs `npm run gen:oracle -w engine` before its cards can
  be briefed or scaffolded. That rewrites `data/oracle/cards.jsonl` (new cards,
  and EDHREC ranks moved for the rest): commit it on its own (`Tooling:
  refresh the Oracle snapshot`), after `npm run card:verify -w engine --
  --offline` and the engine suite pass on it.

## 1. Pick the batch

1. `npm run cards:sets -w engine -- --sets` — where the walk is: the newest
   set with cards left.
2. `npm run cards:sets -w engine -- --next 60` — the batch: the next 60
   untriaged cards, newest set first (the rest of one set, then the next),
   ranked ones first. A set's bottom half is mostly commons and uncommons:
   batches there can run larger (100-150 across 4-5 agents), since most
   cards are short.
3. **Scaffold first**: `npm run card:scaffold -w engine -- "A" "B" …` over the
   batch. Each card in `review/` is nearly done — read it against its Oracle
   text and rulings (`card:brief`), fix what's wrong or move it back to the
   hand-authored pile, then into `pool/`. The rest go to authoring.
4. For the rest: `card:brief` each, and sort into **authorable now** and
   **blocked** (a need key from `top-commanders-gaps.json`'s `features` or
   `engine/data/needs-vocabulary.json`; add a new one with its `family` when
   none fits), exactly as `author-top-cards` step 1.

**Parallel agents**: a batch past ~15 authorable cards goes to `card-author`
agents in their own worktrees, the lead doing the shared work once (the
feature and its cards first, one scaffold run, tokens made once, drafts
moved into staged groups, briefs with `--analogs 2 --width 300`, the digest)
and reading every file the agents write. **`agent-batches.md`** beside this
file is the whole procedure — sizing, staging, the brief (`agent-brief.md`),
integrating, a stopped agent, and measuring tokens per card. Use the set's
code for the brief's `SET_CODE` and `set-<code>-batch-<N>` for its test
prefix.

## 2. Build a feature, if one leads

If one missing feature blocks **five or more** cards of the batch — a set's
new mechanic usually does — build it first (engine change + its own test file
+ the AUTHORING.md vocabulary entry, following `engine/CLAUDE.md`), then
author every card it unblocks (`cards:needs -- --feature <key>`), in the set
or not. **Teach the scaffolder too**: a template for the mechanic's keyword
line or sentence in `scripts/oracle-parse.mjs`, checked by `npm run
card:parse-check -w engine` (zero disagreements) and pinned in
`test/oracle-parse.test.ts` — the next set with it then comes pre-drafted.
A feature needing a new player decision is a client change too — check it
live in a 2- and a 4-player room at ~768px tall.

## 3. Author, test, record, ship

As `author-top-cards` steps 3–6, with these differences:

- **Test file**: `engine/src/test/set-<code>-batch-<N>.test.ts` (the set's
  code, lower case; N counts that set's batches), on `src/test/harness.ts`.
- **Record**: `engine/data/sweep-3/B<N>.json` in the usual shape, the next
  batch number after the highest `B*.json`, with `"ranks"` naming the set and
  the share: `"Reality Fracture (FRA, 2026-10-02): top 50% by EDHREC rank"`.
  Every card of the batch is in it — authored or blocked — so `cards:sets
  -- --next` and `cards:needs -- --next` skip them from then on. The `"ranks"`
  line says "whole set" (or "the rest of the set" for a set first walked by
  its top half).
- **BACKLOG.md**, "Card backlog": which set is next, on the line for this
  skill; a set finished goes on `COMPLETED.md`'s set-walk line; the batch
  summary goes in `docs/card-blockers.md`.
- **Commit**: `Cards: <Set name> — <three or four headline cards> and <count>
  more` (or `Engine, Cards: <the feature>, and <Set name>'s …` when one was
  built), the set and share, and any engine or scaffolder change with why.

## 4. Report and offer the next

A few lines: how many of the set's new cards are in now,
how many blocked and the feature blocking the most, anything built or taught
to the scaffolder. Then offer the next batch — the rest of the set, or the
next older set — but don't start it unasked.
