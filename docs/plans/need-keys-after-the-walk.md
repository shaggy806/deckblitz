# Working down the need keys, after the set walk

**Status:** planned (2026-10-27; a Sonnet-against-Haiku trial added as Phase 0.5). Starts when the set walk's round twenty is on `main`
(`set-walk-last-rounds.md`). No phase started yet.

Once the walk ends, every Commander-legal first printing has been either authored or triaged with
a blocked record (`{ name, needs, why }` in `engine/data/sweep-2/`, `sweep-3/` and
`top-commanders-gaps.json`). What's left is the records. This plan works them down. Four things
come first: check that each record is still really blocked, merge keys that mean the same
feature, find which builds unblock the most (pairs included), and then build in that order. Most
of the counting is done by scripts, with the model only judging, so tokens per card stay low.

## Where the records stand (2026-10-27, before rounds eighteen to twenty)

From `scripts/needs-vocabulary.mjs`'s library (`loadVocabulary`, `loadRecords`, `poolNames`).
For each card not in the pool, its latest record:

- **6,531 blocked cards** and **2,548 open keys**. Round eighteen to twenty will add ~600 cards.
- Keys by cards waiting: **1,431 block one card**, 800 block 2–4, 228 block 5–9, 89 block 10 or
  more. 1,169 cards wait only on a key no other card shares.
- Open needs per card: 5,268 cards have one, 563 have two, 27 have three. Three quarters of
  the cards are one feature away.
- **673 records list no open need**: every key they name is in `built`. `--stale` shows only 38
  of them, the ones whose key was built *after* the record was written. The other ~635 name
  keys that were built before triage, so each key is too coarse (the card needs a variant the
  key doesn't name) or the card was never rechecked. 21 of them are double-faced cards whose
  front face is in the pool under its face name, which `poolNames` misses. Those are already
  done.
- Greedy order (each step builds the key that fully unblocks the most cards): **10 keys free
  299 cards, 25 free 583, 50 free 908, 100 free 1,349, 200 free 1,991, 400 free 2,856**. The
  first ~100 keys are where the cards are. Past ~400 each feature frees two cards or fewer.
- 43 families hold ten or more open keys. The largest are combat-restriction extensions (171
  cards), choices by other players (167), damage modification (149) and new amount variants
  (133).

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

## Phase 0: tooling (one session, script work only)

Add to `scripts/needs-vocabulary.mjs`, tested on the current records:

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
2. **The ~673 all-built records.** First the parser: `oracle-parse` and
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
4. **"Does the engine already do this?" for keys with five or more cards (~320).** Agents (the trial's model for this step) get 20
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
