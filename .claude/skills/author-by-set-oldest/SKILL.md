---
name: author-by-set-oldest
description: Add the next batch of cards set by set in reverse, starting from the oldest set (Limited Edition Alpha) and walking forward in time, taking each whole set's own new cards (its Commander-legal first printings), most-played first; auto-finish what the scaffolder reads whole, author the rest the engine runs faithfully, record what blocks the others, test, and ship. The mirror of `author-by-set`, which walks newest first. Use when the user asks for the reverse or oldest-first set walk, to start from the oldest sets, to walk forward from Alpha, to do the next old set, or runs this skill with no other instructions.
---

# Add the next set batch, oldest first

The mirror of **`author-by-set`** (`.claude/skills/author-by-set/SKILL.md`):
the same whole-set walk, the same tools, rules and records, but **oldest set
first, heading forward in time** (the user's call, 2026-10-21). Each set is
taken whole: every Commander-legal first printing, in EDHREC rank order
within the set, the cards EDHREC hasn't ranked yet last. A set is done when
every one of its new cards is in the pool or triaged; then the next *newer*
set. Cards already triaged by any other walk (`author-by-set`,
`author-top-cards`, the commander skill) are skipped, and their records
stand, so the two set walks can't author a card twice. **They meet in the
middle**: once this walk reaches a set `author-by-set` has already finished,
every set is walked, so say so and stop.

What's different about the old sets:

- **Oracle text, never the printed text.** Old cards were reworded many
  times. Author from the Oracle snapshot (`card:brief`, `card:lookup`), and
  read the rulings: old cards gather many of them, and a ruling often decides
  a card.
- **Old mechanics.** Banding, rampage, cumulative upkeep, echo, buyback,
  licids and so on. Check what exists first (`card:vocab`, `cards:needs --
  --feature <key>`, `top-commanders-gaps.json`'s `built`), since several are
  built already (phasing, shadow and flanking, for instance). A mechanic that
  blocks five or more cards gets built, exactly as in the newest-first walk.
- **Ante cards aren't Commander-legal**, so they never show up in the walk.
  Cards banned in Commander do show up and are authored like any other.
- **Many old cards are already in** from the EDHREC-rank walk (Alpha has 127
  of 273 done), so a set's batch is what's left.

**The tools**: all of `author-by-set`'s, plus **`--oldest`** on `cards:sets`:

- `npm run cards:sets -w engine -- --oldest --sets [N]`: the oldest N sets,
  with new cards, kept, done, triaged and left for each.
- `npm run cards:sets -w engine -- --oldest --next 60`: the next untriaged
  cards, oldest set first.
- `--set LEA`: one set's cards, each marked done / triaged / todo (the same
  in either direction).

An old set's card list hasn't been fetched yet, so the first runs fetch it
from Scryfall (cached for three days in `engine/.cache/`). The script waits
out Scryfall's rate limit (`Retry-After`) by itself, so a first `--sets 60`
takes a few minutes.

## 0. Orient

As `author-by-set` step 0 — unmerged branches first (`node
scripts/unmerged-branches.mjs`: merge whatever it lists before authoring), then `git status`, `npm run build -w engine`,
`BACKLOG.md`'s "Card backlog" (its line for this walk says which set is
next), AUTHORING.md §0-1 and §15 if they're not in context yet. The old sets
are all in the Oracle snapshot.

## 1. Pick the batch

1. `npm run cards:sets -w engine -- --oldest --sets 30`: where the walk is,
   the oldest set with cards left.
2. `npm run cards:sets -w engine -- --oldest --next 60`: the batch. An old
   expansion is often 100–250 cards left. Take **one whole set per batch**
   (the `feedback_whole_set_batches` memory) across 4–5 agents of ~25 cards
   each, or split a 250-card set into two batches.
3. Then as `author-by-set` steps 1.3–1.4: **scaffold the whole batch first**,
   read every `review/` card against its Oracle text and rulings, and sort the
   rest into authorable and blocked (need keys from `top-commanders-gaps.json`
   or `engine/data/needs-vocabulary.json`; add a new key when none fits).

**Parallel agents**: the procedure is `author-by-set`'s **`agent-batches.md`**
and **`agent-brief.md`** (in `.claude/skills/author-by-set/`), unchanged. Use
the set's code for the brief's `SET_CODE` and `set-<code>-batch-<N>` for its
test prefix. In the brief's notes section, add the set's old mechanics and
which of them the pool already has.

## 2. Build a feature, if one leads

As `author-by-set` step 2: a missing feature that blocks **five or more**
cards of the batch gets built first, with its test file, its AUTHORING.md
entry and a scaffolder template, and then every card it unblocks gets
authored, in the set or not. The lead builds the features and the agents only
author cards (the `feedback_features_lead_agents_author` memory).

## 3. Author, test, record, ship

As `author-by-set` step 3, with this walk's labels:

- **Test file**: `engine/src/test/set-<code>-batch-<N>.test.ts`.
- **Record**: `engine/data/sweep-3/B<N>.json`. Both walks share one batch
  number sequence, so take the number after the highest `B*.json` **as you
  commit**, since a newest-first batch may have landed meanwhile. Its
  `"ranks"` names the set and the walk, for example `"Limited Edition Alpha
  (LEA, 1993-08-05): whole set (oldest-first walk)"`.
- **BACKLOG.md**, "Card backlog": this walk's own line says which set is
  next. A finished set goes on `COMPLETED.md`, and the batch summary goes in
  `docs/card-blockers.md` ("the oldest-first set walk: <set>").
- **Commit**: `Cards: <Set name> — <three or four headline cards> and <count>
  more`, or `Engine, Cards: <the feature>, and <Set name>'s …` when a feature
  was built.
- Run `npm run verify` before pushing each batch: it runs the full set only
  every third batch on its own (`scripts/verify-state.json`, commit it when it
  changes) and a quick one in between, so a cleared session keeps the cadence.

## 4. Report and offer the next

In a few lines: how many of the set's new cards are in now, how many are
blocked and which feature blocks the most, and anything built or taught to the
scaffolder. Then offer the next batch: the rest of the set, or the next
*newer* set. Don't start it unasked.

**One batch per session** (`.claude/skills/author-by-set/agent-batches.md`, "One batch per session"): after
the push and the report, stop. Leave the hand-off in this skill's `BACKLOG.md`
line — the next batch, and any feature already researched for it — and offer
the next batch as a new session (`/author-by-set-oldest`), not in this one —
unless the user asks to carry on here: the lead's growing context costs more
than the agents do.
