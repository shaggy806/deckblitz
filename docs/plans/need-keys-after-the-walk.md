# Working down the need keys, after the set walk

**Status:** in progress. Phase 0 (the tooling) is done (2026-10-27); Phase 0.5, the
Sonnet-against-Haiku trial, is next, in a session of its own. The set walk ended 2026-10-27
(batch 234).

Once the walk ends, every Commander-legal first printing has been either authored or triaged with
a blocked record (`{ name, needs, why }` in `engine/data/sweep-2/`, `sweep-3/` and
`top-commanders-gaps.json`). What's left is the records. This plan works them down. Four things
come first: check that each record is still really blocked, merge keys that mean the same
feature, find which builds unblock the most (pairs included), and then build in that order. Most
of the counting is done by scripts, with the model only judging, so tokens per card stay low.

## Where the records stand (2026-10-27, after the set walk, measured by Phase 0's tools)

From `scripts/needs-vocabulary.mjs` (`--audit`, `--greedy`, `--rank`). For each card not in the
pool, its latest record:

- **6,932 cards with a record**: **6,096 still blocked** and **836 with no open need**.
  **2,602 open keys**. (The first count, before rounds eighteen to twenty, was 6,531 cards and
  2,548 keys.)
- Keys by cards waiting: **1,463 block one card**, 803 block 2–4, 239 block 5–9, 97 block 10 or
  more. **336 keys block five or more** (Phase 1 step 4's set). 1,432 cards wait on at least one
  key no other card shares, and 1,206 wait on nothing else.
- Open needs per card: 5,485 cards have one, 587 have two, 24 have three. Nine in ten blocked
  cards are one feature away.
- **The 836 with no open need** split three ways: **71** whose key was built *after* the record
  (`--stale`'s recheck list), **704** whose keys were all built *before* triage (each key too
  coarse, or the card never rechecked), and **61** that name only a meta key
  (`new:unverified-in-mass-pass` and the like: never really triaged).
- **Face names: none now.** `poolNames` now matches a multi-face card by its full name and every
  face, from the Oracle snapshot. It counts only a face that names no other card, because a
  prepare card's back face can be a card of its own (Stensian Sanguinist // Exsanguinate beside
  Exsanguinate) or shared by several fronts (Soul Tether). On today's records it drops nothing.
  The ~21 the first count gave did not reproduce; matching by any face without that guard finds
  only those three prepare cards, which are not in the pool.
- **371 cards have more than one record**, and for 298 of them the needs disagree. The latest
  record wins, but an older record often names a need the newer one dropped.
- No open key lacks both a `description` and an `example`.
- **Merge candidates: 316 pairs** in 133 families. 10 have the same suffix under two prefixes
  (`static:damage-cant-be-prevented` 16 and `effect:damage-cant-be-prevented` 9), 143 have one
  suffix inside another and 163 share most tokens. These are candidates for step 1.3, not
  merges: many pairs are a narrow open key beside the built general one.
- **Greedy order** (each step builds what fully unblocks the most): **10 keys free 323 cards, 25
  free 632, 50 free 978, 100 free 1,440, 200 free 2,120, 400 free 3,020**, and all 2,602 free
  6,096. Pairs first matter at step 57 (`cost:kicker-nonmana-cost` + `effect:cost-discarded-card-ref`,
  21 cards). Built one key at a time, the order strands 36 cards that only a pair frees (2,535
  keys free 6,060). The top three are `decision:choose-card-name` (46), `keyword:banding` (46)
  and `effect:grant-protection-choice` (41).
- **587 cards wait on exactly two keys**, over 554 distinct pairs, nearly all one card each.
  No pair frees more than four cards of its own: `amount:count-for-chosen-player` +
  `decision:choose-player` and `decision:choose-creature-type-excluding` +
  `effect:set-creature-type` (the latter 24 cards with its keys' own 20).
- **43 families hold ten or more open keys.** The largest by cards waiting are choices by other
  players (58 keys, 177 cards), damage modification (54, 173), combat-restriction extensions
  (50, 162), new amount variants (61, 139), target-spec additions (43, 131) and cast-and-activate
  restrictions (39, 127). `--brief static:combat-restriction-extensions` runs to two pages.

## Rules that keep tokens low

- **Scripts count, models judge.** No session reads a sweep record file, the whole vocabulary or
  `--rank`'s full output. Each model call gets a generated brief instead. The brief covers one
  family's open keys, each with its count, description and at most two one-line `why`s.
- **Work by family, not by card or key.** One context load of a family's code serves every key
  in it. That holds for the audit, for building and for authoring.
- **Cheap models for classification.** Merging keys and the "does the engine already do this?"
  check are short reading tasks for a Sonnet or Haiku agent with a brief (Phase 0.5 picks which, per step). Building a feature and
  authoring cards use the usual `card-author` agents and sessions.
- **One phase step per session, coordinated from a fresh session.** The same rule as
  `author-walks-parallel`. Parallel sessions own families the way the walks owned sets: they
  never overlap, are recorded in `BACKLOG.md` before starting, and land under the landing lock.
- **Singletons wait for the card.** A key that blocks one card is checked when that card is
  attempted, never on its own.

## Phase 0: tooling (one session, script work only) — done 2026-10-27

Added to `scripts/needs-vocabulary.mjs` and tested on the current records (the numbers are
above). `--greedy` takes a pair as one step when the two free more together than the best
single key would free per key built. The `poolNames` fix keys on the Oracle snapshot's
multi-face names. The pool index caches its answer, so the index's `VERSION` went up.

1. **`--audit`** prints counts, then lists to a file in the OS temp dir:
   - records whose card is in the pool by a face name (fix `poolNames` to match faces, so these
     drop out everywhere)
   - records with every need built, split into built since triage (`--stale`'s list) and built
     before
   - cards with more than one record (the latest wins; flag where the needs disagree)
   - keys with no `description` and no `example`
   - merge candidates: keys in one family whose suffixes share most tokens, or which differ only
     by prefix (`effect:x` and `static:x`), or where one key's suffix contains another's
2. **`--greedy [--top N] [--family F]`** runs over all records, the way `cmdrs:gaps` already does
   for the commanders. It prints the build order with cards freed per step and the running
   total, plus **pairs**: two keys that free more cards together than apart. Those are the
   cards with two needs, 563 now.
3. **`--brief <family> [--open-only]`** prints the compact text a model judges from. That is
   each open key in the family with its count, description and up to two short `why`s, and the
   `built` keys of the same family, so "is this a variant of something built?" can be answered.
   It stays under ~4K tokens a family. A large family is paged.

These stay in one script beside `--rank`, `--stale` and `--feature`. No new data files: the
vocabulary JSON stays the single store.

## Phase 0.5: a trial of Sonnet against Haiku (one session, before Phase 1)

Steps 1.3 and 1.4 below are where the cheap agents do the judging. Before they run at scale, a
small trial picks the model for each step. It runs on Phase 0's `--brief` output, so it costs
nothing more to set up.

- **One fixed sample, with answers known up front.**
  - *Existence check (step 1.4):* 40 keys. Twenty are open keys of five or more cards. Ten are
    keys already in `built`, as controls that should come back **exists**. Ten are keys whose
    cards were authored right after their feature landed (from `COMPLETED.md`), given in their
    pre-build wording, also controls. The open twenty are answered once by an Opus agent and
    checked by hand where it hedges. Those answers are the key.
  - *Merging (step 1.3):* three families of different shapes. One is large with obvious
    duplicates (combat-restriction extensions), one is mid-sized and subtle (damage
    modification), and one is small (about 15 keys). The answer is the Opus agent's merges and
    groups, reviewed by the coordinator.
- **The same brief and prompt for each model.** Two Sonnet runs and two Haiku runs of each
  task, to see how far a model's answers vary between runs.
- **Measured per run:** accuracy against the key, split into false *exists* and false
  *missing* for step 1.4, and wrong merges and missed merges for step 1.3. Also tokens in and
  out, wall time, and whether the output parsed as the requested JSON without a retry.
- **What decides it:**
  - **False *exists* is the costly error.** It sends a blocked card into an authoring batch,
    which costs far more tokens than the check saves. A **wrong merge** is costly the same way:
    it hides a real need behind a built key.
  - Haiku takes a step if its costly errors are no more than Sonnet's plus one on the sample,
    and its output parses.
  - Otherwise Sonnet takes it, or Haiku goes first with Sonnet re-checking only its *exists*
    answers and merges, if that is cheaper than Sonnet doing it all.
- **Writing it down.** The results table (model × task: accuracy, costly errors, tokens, time)
  and the choice go into this file under a *Trial results* heading. The prompts the trial
  settled on go beside `--brief`, so Phase 1 runs them unchanged.

## Phase 1: check that every record is really blocked

Run in order, cheapest first.

1. **Mechanical (no model).** After the `poolNames` fix, the face-named records drop out.
   Duplicate records keep the latest.
2. **The 836 records with no open need** (~673 at the first count). First the parser: `oracle-parse` and
   `card:scaffold -- --report` over these names say which ones the scaffolder reads whole. Those
   are auto-finished into `review/` and checked the way the set walk checks its auto-finished
   cards. The rest are authoring work: recheck batches of ~100, worked like a set-walk batch
   (`card-author` agents, the digest, one verify), up to six batches in one parallel round.
   A card that is still blocked gets a new, correctly narrow key, and its key's `description` is
   tightened, so the next record doesn't repeat the mistake.
3. **Merge keys (the trial's model for this step, by family).** Each of the 43 families with ten or more keys gets
   one agent with `--brief <family>` and `--audit`'s merge candidates for it.
   The smaller families go in pages of about 40 keys. The agent returns only alias additions for
   `needs-vocabulary.json` (`"old-key": "kept-key"`), plus **generalisation groups**: keys one
   general implementation would cover (three "can't block unless" variants are one static with
   a condition). The coordinator applies the JSON. Nobody re-edits the records: the aliases
   resolve their keys.
4. **"Does the engine already do this?" for keys with five or more cards (336).** Agents (the trial's model for this step) get 20
   keys each from `--brief` plus the vocabulary digest (`card-digest.mjs`), about 16 agent runs.
   Each key comes back **exists**, **partial** (what's missing, in one line) or **missing**. An
   *exists* key's cards go into the step-2 recheck batches. A *partial* key's description is
   rewritten to name only the missing part. Keys under five cards are skipped: their cards are
   rechecked when built.

After Phase 1 every open key is merged, and every key of five or more cards is confirmed
missing. Re-run `--greedy` for Phase 2's order.

## Phase 2: build in greedy order, a family per session

- **The build unit is a group, not a key.** A generalisation group from step 1.3 counts as one
  build. `--greedy` scores a group by the cards it frees, so "which unblock others" is answered
  by the score itself, pairs included.
- **Tier A** (each group frees ten or more cards, ~100 groups and ~1,350 cards): one session per
  family. It builds that family's top two to four groups in one context load, then authors every
  card `--feature <key>` lists for them through `card-author` agents (a normal batch, ~100
  cards, one verify). Up to five sessions run in parallel, each on its own families, under
  `author-walks-parallel`'s rules: ranges become families, and the same lock, numbering and
  hand-off apply. Banding (46) and other single large keys get a session of their own.
- **Tier B** (2–9 cards each, ~1,000 keys and ~1,500 cards): no session of their own. A Tier A
  session building in a family also takes that family's Tier B keys when the same code covers
  them. Whatever is left runs as one last family sweep per family, only if its greedy score
  justifies it.
- **Tier C** (single-card keys, ~1,170 cards) is ranked by the card, not the key. The card's
  EDHREC rank and whether it's a top-500 commander decide. The top few hundred by rank get
  bespoke support in family sessions. The rest stay recorded and are not worked. A `deferred`
  list in the vocabulary, beside `built`, makes the tools stop offering them.
- **After every round:** `--stale` and `--greedy` are re-run (free) and `BACKLOG.md`'s next
  families are re-picked. Building one family often frees cards in another (a card with two
  needs), which only a fresh `--greedy` shows.

## Rough size

Phase 0 is one session, and the trial a short one. Phase 1 is one cheap-agent session (steps 1.3 and 1.4), plus up to six
recheck batches in one parallel round. Phase 2 Tier A is ~100 groups at three or four a
session, so ~25–30 sessions, or five or six parallel rounds, freeing ~1,350 cards plus whatever
Phase 1 turns up. Tier B and the top of Tier C follow if the user wants to go further.
