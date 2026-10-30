# Working down the need keys, after the set walk

**Status:** in progress. Phase 0 (the tooling) and Phase 0.5 (the Sonnet-against-Haiku trial)
are done (2026-10-27): Haiku takes both judging steps (*Trial results*, below). Phase 1's steps 1, 3
and 4 are done (2026-10-27, *Phase 1 progress*). Its step 2, the recheck batches, is next: nine
batches that `cards:needs -- --recheck` lists, worked as a parallel authoring round from a fresh
session.
The set walk ended 2026-10-27 (batch 234).

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

## Phase 0.5: a trial of Sonnet against Haiku (one session, before Phase 1) — done 2026-10-27

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

### Trial results (2026-10-27)

**Haiku takes both judging steps.** For the existence check (step 1.4), run it **twice per page and
count a key as *exists* only when both runs say so**. The prompts are
`engine/scripts/needs-prompts/exists.md` and `merge.md`, beside `--brief`. Each agent got a
one-line pointer to its prompt file, the same for every model.

**The sample.** For the existence check, 40 keys in two pages of 20, shuffled, with card counts
left out so built keys didn't stand out:
- 20 open keys of five or more cards, evenly spaced down the count ranking;
- 10 keys built before 2026-10-22, in their current wording;
- 10 keys built since 2026-10-22 by an engine commit, in the wording they had before it.

For merging, three families: combat-restriction extensions (50 open keys), damage modification
(54) and token-copy options (16).

**The answer key needed hand-checking.** Opus answered every key once, and the coordinator checked by
hand wherever runs disagreed. Opus was wrong three times: twice a false *exists*, once a false
*partial*.
- `keyword:emerge` is partial: nothing grants emerge to another spell, so Herigast is still
  blocked.
- `cost:exile-from-graveyard-additional` is partial: Gorex needs "any number, {2} less each" and
  only a fixed count exists.
- `trigger:deals-damage-once-per-event` is built (commit `e25db3585`). Opus read the separate
  batched trigger instead.

**Controls.** Eight of the 20 built controls came back **partial**, and correctly so. Each key's
own card works, but another card still filed under that key needs more:
- Elvish Soultiller needs a filtered graveyard shuffle;
- Ao, the Dawn Sky needs a total-mana-value cap on look-and-choose;
- Everything Comes to Dust needs a filter for "shares a type with a convoker";
- Aggravate needs a "dealt damage this way" mass filter;
- and four more like them.

The 704 records whose keys were all built before triage are mostly this: a key built for one
card and reused for a broader need. Phase 1 step 2 should expect most of them to stay blocked
under a narrower new key.

Existence check, 40 keys per run (Haiku and Sonnet ran twice each):

| Run | False *exists* (costly) | False *missing* | Partial ↔ missing swaps | Parsed | Wall time | Cost |
|---|---|---|---|---|---|---|
| Haiku A | 1 | 1 | 4 | yes | 6.6 min | $0.27 |
| Haiku B | 0 | 1 | 4 | yes | 5.4 min | $0.19 |
| Sonnet A | 2 | 0 | 6 | yes | 7.5 min | $3.26 |
| Sonnet B | 2 | 1 | 4 | yes | 6.1 min | $3.13 |
| Opus (before the hand check) | 2 | 1 | — | yes | 3.7 min | $3.42 |

Merging, per family (combat, damage, token-copy):

| Model | Wrong aliases (costly) | Missed aliases | Group pairs agreeing with the key (precision / recall) | Parsed | Time | Cost |
|---|---|---|---|---|---|---|
| Haiku ×2 | 0, 0, 0 | 0, 1, 0 (both runs) | 0.65–1.0 / 0.19–0.65 | yes | 0.5–2.2 min | $0.007–0.021 |
| Sonnet ×2 | 0, 0, 0 | 0, 1, 0 (both runs) | 0.66–0.77 / 0.25–0.66 | yes | 0.2–0.5 min | $0.10–0.16 |
| Opus (the key) | — | — | — | yes | 0.3–0.8 min | $0.18–0.33 |

Costs use list prices per million tokens: Sonnet 5.5 $2 in, $0.20 cache read, $10 out; Haiku 5.5
$0.10 in, $0.50 out, with its cache read taken as $0.01. Cache writes are counted at 1.25× input.
Most of every agent's input is its own cached context read again on each request (4–8M tokens a
page for the existence check), which is why Sonnet costs so much more there.

**What decided it.**
- **Existence check.** Haiku's costly errors (1 and 0) are under Sonnet's (2 and 2), it parsed
  every time, and it costs about a fourteenth as much. The two Haiku runs never made the same
  false *exists*, so requiring both to agree removes it. That is still ~7× cheaper than one
  Sonnet run.
- **Merging.** No model made a wrong alias. Every Sonnet and Haiku run missed the same subtle
  one: `effect:prevent-combat-damage-to-and-by-source` →
  `effect:prevent-combat-damage-by-source`, where only the "by" half is missing. A missed alias
  is the cheap error. Groups agree with Opus about as well from either model. Haiku costs a
  sixth as much and needs one run.
- **Haiku writes far more output.** It used ~28K output tokens on a 50-key family against
  Sonnet's ~4K, and was 4–5× slower. Its price absorbs that, and the steps run in parallel.

**The prompt changed after the trial.** Every false *exists* came from judging a key by its
description or its own example card while another quoted card still needed more. `exists.md` now
says *exists* must hold for every quoted card, and that *partial* names the card that needs
more. That wording is untested, so Phase 1's first pages should be spot-checked.

**Projected Phase 1 cost.** Step 1.4 is 336 keys, or 17 pages, at two Haiku runs a page: about
$4–8. Step 1.3 is 43 families at one Haiku run each: about $1.

**Found on the way.** Cecil, Dark Knight waits only on `trigger:deals-damage-once-per-event`,
which was built 2026-10-25, so it belongs in the first recheck batch. Strict Proctor is all that
keeps `effect:counter-ability` (nine cards waiting) partial. Disallow and the other plain
"counter target activated or triggered ability" cards look writable now.

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
3. **Merge keys (Haiku, one run, by family; `needs-prompts/merge.md`).** Each of the 43 families with ten or more keys gets
   one agent with `--brief <family>` and `--audit`'s merge candidates for it.
   The smaller families go in pages of about 40 keys. The agent returns only alias additions for
   `needs-vocabulary.json` (`"old-key": "kept-key"`), plus **generalisation groups**: keys one
   general implementation would cover (three "can't block unless" variants are one static with
   a condition). The coordinator applies the JSON. Nobody re-edits the records: the aliases
   resolve their keys.
4. **"Does the engine already do this?" for keys with five or more cards (336).** Haiku agents (`needs-prompts/exists.md`, two runs a page, *exists* only when both agree) get 20
   keys each from `--brief` plus the vocabulary digest (`card-digest.mjs`), about 16 agent runs.
   Each key comes back **exists**, **partial** (what's missing, in one line) or **missing**. An
   *exists* key's cards go into the step-2 recheck batches. A *partial* key's description is
   rewritten to name only the missing part. Keys under five cards are skipped: their cards are
   rechecked when built.

After Phase 1 every open key is merged, and every key of five or more cards is confirmed
missing. Re-run `--greedy` for Phase 2's order.

### Phase 1 progress (2026-10-27)

- **Step 1 (mechanical)** needed nothing new. The face-name fix drops no record, and the tools
  read every card from its latest record.
- **Step 3 (merge).** 84 Haiku jobs ran, one per family of ten or more open keys (43) and one per
  page of about 40 keys from the 1,049 smaller families (41). The agents wrote their JSON to
  files. They proposed 24 aliases, and the review rejected one: Ormos's draw replacement and its
  discard cost are separate features. 23 were applied, two of them onto built keys:
  - `effect:cast-free-while-exiled` → `zone:impulse-permission-options`;
  - `bug:token-copy-as-enters-choices` → `bug:as-enters-choices-any-entry`.

  A merged feature stays in `needs-vocabulary.json`, marked `mergedInto`, and resolves through
  its alias. **617 generalisation groups over 1,623 keys** went into the vocabulary's new `groups`
  list for Phase 2: 380 pairs, 144 threes and 93 of four or more. Open keys went from 2,602 to
  2,579.

  Haiku was conservative. It refused many aliases because the built key in question has no
  description. Writing descriptions for the bare built keys would let a later pass merge more.
- **Step 4 (does it exist?).** 333 keys of five or more cards ran in 17 pages, twice each (34 Haiku
  runs). Two runs dropped the key's prefix, and the apply step mapped those back by suffix. The
  runs disagreed on 99 keys, and the agreement rule settled them:
  - **4 exist**, covering 21 cards: `effect:forced-block-this-combat`,
    `effect:mill-controller-of-target`, `effect:skip-next-untap-step` and
    `stat:treasure-mana-spent-count`. Each was checked against the code.
  - **213 are partial.** The description now names only what is missing, the old text is kept in
    `wasDescription`, and the evidence of what's there follows.
  - **114 are missing.**
  - **2 went unjudged**, left out by one run.

  Every judged key carries `checked: "2026-10-27: <verdict>"`. So few *exists* is the strict rule
  working as intended. The partial rewrites are the main result: Phase 2 builds from a
  description of what is actually missing.
- **Step 2 (recheck)** is prepared but not run. `npm run cards:needs -w engine -- --recheck` lists
  863 cards in nine batches of 100, sorted by need so a batch shares features. Use `--batch K` for
  a batch's names. The 863 are:
  - 781 with every need built (71 built since triage, 710 before);
  - 21 whose open needs were judged to exist;
  - 61 that name only a meta key.

  `card:scaffold -- --dry-run` over the no-open-need cards auto-finishes only 6, so the rest is
  authoring work. The lists are frozen in `engine/data/recheck/R1.txt` to `R9.txt`
  (`--recheck --freeze`): R1 holds the 61 meta-only cards, and the rest go in need order. Each
  list goes to an `author-recheck` session, run as a parallel round by
  `author-walks-parallel` ("A recheck round"). That means a parallel round run from a fresh session under
  `author-walks-parallel`'s rules, with a recheck batch per child in place of a range of sets. A
  card still blocked gets a narrow new key, and the coarse key's description is tightened.
- **Greedy after the merge:** 10 keys free 331 cards, 50 free 1,002, 100 free 1,466 and 400 free
  3,043. `--greedy` doesn't score the groups yet; that is Phase 2's first tooling item (done 2026-10-28:
  `--greedy --groups`, below).

## Phase 2: build in greedy order, a family per session

- **The build unit is a group, not a key.** A generalisation group from step 1.3 counts as one
  build. `--greedy` scores a group by the cards it frees, so "which unblock others" is answered
  by the score itself, pairs included.
- **Tier A** (each group frees ten or more cards, ~100 groups and ~1,350 cards): one session per
  family. It builds that family's top two to four groups in one context load, then authors every
  card `--feature <key>` lists for them through `card-author` agents (a normal batch, ~100
  cards, one verify). From 2026-10-29 the two halves are separate sessions: `build-family`
  builds families with only their proving cards, and `author-freed` batches the freed cards. Up to five sessions run in parallel, each on its own families, under
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

### Phase 2 progress

- **2026-10-28: the order and the skill.** Phase 1 step 2 finished (all nine recheck lists, B235–B243:
  270 of the 863 authored, the other 593 on narrow keys). `cards:needs -- --greedy --groups [--family F]`
  scores each generalisation group as one build unit beside every open key alone: 3,504 units, the
  first 25 freeing 813 cards (grant-protection's two keys 66, variable target counts 48, card naming
  46, banding 46). The families run **in series**, one per session, under the **`build-family`**
  skill (the user's call): a session re-runs the order, builds its family's top two to four units,
  authors what they free and hands off the next.
- **2026-10-28: the grant-protection family (B244).** Its top group (`effect:grant-protection-choice`
  + `effect:grant-protection-temporary`, 72 cards counted by `--feature`, 66 by `--greedy`): the
  `grant-protection` effect and the chosen-colour Aura static (rule 702.16n). 62 authored (8 by the
  lead, 54 by three agents), 10 still blocked, 3 of them on new narrow keys. The tier B keys of the
  family (sharing protection, protection from own colours, a protection filter) needed code of
  their own and didn't ride along. Next: `decision:variable-target-count` (48).
- **2026-10-28: the variable-target-count family (B245).** Its top group (four keys, 49 cards by
  `--greedy`) and the in-mode key: an amount as an ability's group bound, read as its targets are
  chosen; a total mana value cap and different mana values; groups in a modal spell's mode (the
  client now asks X after the modes). Building it found a modal trigger's group resolving with only
  its last member. 38 authored (10 by the lead, 28 by two agents), 18 still blocked, four on new
  narrow keys. `decision:mixed-zone-targets` (4) and `decision:twice-x-target-count` (1) stay open:
  code of their own. Next: `decision:choose-card-name` (47), then banding (46).
- **2026-10-28: the choose-card-name family (B246).** Its one key, `decision:choose-card-name`
  (53 cards counted by `--feature`): a new decision kind with a client picker over every card name,
  asked as a permanent enters or as an effect resolves, and the name read back by `chosenName`
  filters or substituted as `hasName`. Building it found a cast prohibition reading a split card's
  whole instead of the half cast, and cycling's cost skipping ability taxes. 26 authored (14 by the
  lead, 12 by two agents), 27 still blocked — ten of them the Memoricide searches, which
  `effect:search-opponent-library` (next in the order) frees; three new narrow keys.
- **2026-10-28: the banding family (B247).** `keyword:banding` alone (46 cards), as the skill says:
  rule 702.22 rewrites combat. Bands on the attack declaration, a blocker of one member blocking
  the band, a blocker dividing its damage among several attackers (510.1d — new: no blocker blocked
  more than one before), and the other side dividing damage (702.22j-k), with a band builder in
  the client's attack bar and the damage prompt for the other side. The 32 cards after the lead's
  14 scaffolded to 21 finished and 11 drafts, so the lead authored all 44 (sizing: 15 or fewer
  left, no agent); 2 still blocked on new narrow keys. Next: `effect:search-opponent-library` (44).
- **2026-10-28: the search-opponent-library family (B248).** Its one group
  (`effect:search-opponent-library` + `effect:extract-same-name`, 48 cards by `--feature`):
  `search-library`'s `whose`, the graveyard-hand-library zones, `all` against "any number" (rule
  701.23b), exile face down and playable, a cast from the library, and `then` over the finds.
  Building it found a countered spell's "its controller" read as its owner once it left the stack
  (Counterbore's ruling), and Deicide's "the exiled card" needing the card in exile rather than the
  permanent it was. The new scaffolder template auto-finished 15 of the 29 left after the lead's
  10, so the lead authored all 39; 9 still blocked — four on `effect:exile-chosen-from-revealed-hand`
  (another family), two new narrow keys. Next: `static:static-lose-all-abilities` (38).
- **2026-10-28: three families in one batch (B249)** — the user's call mid-session: several
  families a session, one verify. `static:static-lose-all-abilities` (with
  `static:static-set-characteristics`, 38 by `--greedy`), `static:combat-restriction-extensions`
  (36) and `effect:set-types-temporary` with `effect:set-creature-type` (28): a static loss of
  all abilities read by every ability check, in dependency order and as a permanent enters
  (614.12 — found by an agent's Alpine Moon); block limits with the client's block builder;
  "becomes a [type]" one-shots. 98 authored (16 by the lead, 27 auto-finished by the new
  templates and checked, 53 by three agents, Alpine Moon after the 614.12 fix), 22 still blocked,
  five on new narrow keys. Next: `replacement:damage-modification` (34),
  `effect:target-spec-additions` (34), `effect:repeat-process` (32).

- **2026-10-28: the damage-modification family (B250).** Its top seven groups and both
  can't-be-prevented keys, 33 keys as three general pieces: static damage replacements (a host,
  "your side", redirection, N / all but N / half), damage that can't be prevented (615.12), and
  the one-shot `damage-rule` over recipient and source scopes and durations with prevention's
  follow-up. The agents found a next-time shield spent on the first recipient of a simultaneous
  event (615.8), fixed. 148 authored (24 by the lead, 10 auto-finished, 114 by six agents), 65
  still blocked — 18 new narrow keys, `decision:prevention-shield-allocation` (615.7) and
  `effect:prevent-next-damage-each-creature` the largest.
- **2026-10-28: three families again (B251)** — `effect:choices-by-other-players`' top group (31),
  `effect:target-spec-additions`' graveyard group and its same-controller key (40), and
  `effect:repeat-process` (32, more once the needs tool dated `built` keys right). The user pointed
  out mid-session that "each player chooses" was close to the vote and sacrifice machinery; it was:
  rule 101.4's hold now covers a scoped discard and an `each-player-may`'s entries, "each player
  chooses" is a `vote` with `choose`, and `with-choices` substitutes what was chosen. Also the
  `sameController` relation and `repeat`, each pass its own "this way". An agent found a modal
  spell's later mode reading its slot relations against the flat list (fixed, `concatModeSpecs`). 81
  authored (25 by the lead, 10 auto-finished, 56 by five agents), 27 still blocked on 17 new narrow
  keys. A shared hints page (the Need-Key Hints artifact) now lets the user note existing machinery per
  unit, read back with `ArtifactData`.
- **2026-10-29: four families (B253)** — grant-static-to-permanent (29), basic-land-type-mana (29),
  the land-type-on-resolution unit of choose-creature-type-on-resolution (19, its land-type code
  shared with the second) and control-change-extensions' exchange group (28), with the target-player
  scopes of `gain-control-all` and `grant-keyword-all` riding along. 106 cards freed: 90 authored
  (12 by the lead, 78 by six agents), 31 blocked counting 15 already on other open keys. The agents
  found three bugs in the morning's features, fixed before landing: a granted static's granted
  abilities weren't seen by `Game`'s scans (Huatli), a type-setter scoped by subtype applied by
  timestamp instead of after the setter it depends on (Glaciers, Conversion — 613.8a), and an Aura's
  damage couldn't name the creature it enchants (Earthbind). `effect:targets-share-type` now blocks
  six.

- **2026-10-29: four families (B254)** — remove-counters-from-chosen (27, with
  `cost:remove-counter-any-kind` riding along), modal-activated-targeted-modes (27),
  cast-and-activate-restrictions' host-lock unit (27) and amount-fields-dynamic's fixed-field unit
  (27): the `remove-counters` decision (the 28th kind) for chosen counter costs and a new
  `remove-counters` effect, modal activated abilities offered once per mode set, `hostOfSource`
  prohibitions, and a scoped sacrifice's count read per player. 112 authored (12 by the lead, 21
  auto-finished by the new templates, 79 by five agents), 26 blocked — 17 on other open keys,
  four new narrow keys. The agents found several of the batch's "still blocked" guesses wrong
  (Banquet Guests' twice X, Chisei's unless, Death Cloud already worked). Next:
  `trigger:dies-after-dealt-damage-by-source` (26), `effect:choices-by-other-players`' chooser
  group (26), `decision:separate-into-piles` (24), `effect:switch-pt` (24).

- **2026-10-29: five families, features only** — the user split the session shape: `build-family`
  now builds family after family with a few proving cards each, and the new `author-freed` skill
  authors what they free from `cards:needs -- --stale`. Built: dies-after-dealt-damage-by-source
  (`damagedThisTurnBy.source`, by stint), switch-pt (layer 7d), the defending player's attack
  restrictions (`PlayerTest`), a target slot's player as `for-each-player`/`vote` chooser,
  `discard-chosen` destinations (the revealed-hand family; the scaffolder now reads Duress-style
  spells whole) and a triggered ability's targets chosen by another player (`targetsChosenBy`).
  The spell/activated form of other-player targets and opponent-chosen modes stay open: they need
  a pause mid-cast. 125 freed cards queued. Next: `decision:separate-into-piles` (24),
  `decision:choose-player` (23), `amount:count-for-chosen-player` (24).
- **2026-10-29: separate-into-piles, one family** — rule 700.3 as the `separate-into-piles` effect
  and two new decisions (`separate-piles`, `choose-pile`), the client's pile popup and board
  piles; 4 proving cards. Left for `author-freed` to narrow: three random piles (Whims of the
  Fates), piles to the bottom in any order, play or search from a pile, Bend or Break, the combat
  piles. 145 freed cards queued. Next: `decision:choose-player` (23),
  `amount:count-for-chosen-player` (24), `decision:choose-permanent` (24).
- **2026-10-29: choose-player, one family** — `choosePlayerOnEnter` through the existing
  player-option decision (no new kind), `GameObject.chosenPlayer` read by a `"chosen-player"`
  scope, step trigger subject, `maxHandSize` and filter; `choose-opponent`'s `remember`,
  non-random `anyPlayer` and `mostLife`; a chosen-player flag on the client's tile; 7 proving
  cards. One family only: the session neared ~300K tokens with the account's weekly limit at
  98%. 155 freed cards queued. Next: `amount:count-for-chosen-player` (24, builds on
  `chosenPlayer`), `decision:choose-permanent` (24), `effect:discard-all-matching` (22).
- **2026-10-29: count-for-chosen-player and player-scope-extensions, two engine-only
  families** — a `countOf` counted from one named player's side (`forPlayer`), the chosen
  player's side for a CDA or count-scaled bonus (`forChosenPlayer`), a per-player graveyard
  count, and "its controller draws / discards / gets a poison counter"; 10 proving cards.
  Stopped at two with the account's weekly limit at 99%. 188 freed cards queued. Next:
  `decision:choose-permanent` (24), `effect:discard-all-matching` (22),
  `effect:look-and-choose-target-opponent-library` (22).
- **2026-10-30: choose-permanent's first unit, engine-only** — on the existing
  `choose-permanents` decision: a permanent chosen as another enters (`choosePermanentOnEnter`,
  `GameObject.chosenPermanent`, the `"chosen"` ref and static scope), another player as the
  chooser, an amount minimum, "another" sparing the trigger's object; 9 proving cards. One
  family: the session passed ~300K tokens. 204 freed cards queued. Next:
  `effect:discard-all-matching` (22), `effect:look-and-choose-target-opponent-library` (22),
  `mechanic:outside-the-game` (21).
- **2026-10-30: discard-all-matching and look-and-choose-target-opponent-library, engine-only**
  — `discard`'s and `discard-hand`'s `filter` (with `reveal` and a target `who`), and
  `look-and-choose`'s `from`, `"graveyard"` destination and `"top-any-order"` leftover; 12
  proving cards. Two families: the session neared ~300K tokens. 234 freed cards queued. Next:
  `mechanic:outside-the-game` (21), `condition:player-state-thresholds` (21),
  `static:skip-untap-step` (21).
- **2026-10-30: outside-the-game, with a real sideboard** (the user's call, over keeping
  "outside the game is empty") — `DeckList.sideboard` as `zone: "outside"` objects (none in
  Commander, rule 903.5e), `search-library`'s `outside` and `faceUpExile`, `learn()` whole,
  and the sideboard through the wire, import, deck editor, player panel and builder; 5 proving
  cards, 4 manual checks. Alone: it touched every workspace. 250 freed cards queued. Next:
  `condition:player-state-thresholds` (21), `static:skip-untap-step` (21),
  `decision:choose-card-name`'s chosen-value group (21).
- **2026-10-30: player-state-thresholds and defending-player-controls, engine-only** —
  `of-player` (any condition read from that player's, the active player's, a target's or the
  defending player's seat; "that player" now reaches an intervening-if as it triggers),
  `player-compare`, `for-each-player`'s `whoIf`, `{ startingPlus }` life bounds, `controls`'
  `anyController`, `monarch` `"nobody"`; 16 keys, 14 proving cards, the scaffolder's
  `playerStateIf`. 71 freed (321 queued). Next: `static:skip-untap-step` (21),
  `decision:choose-card-name`'s chosen-value group (21),
  `effect:prevent-combat-damage-to-and-by-target` (20).
- **2026-10-30: skip-untap-step and prevent-combat-damage-to-and-by-target, engine-only** —
  a static's `skipsSteps` and the one-shot `skip-step` (next, or this turn's), a skipped
  upkeep or draw step passed in `enterStep` (rules 500.11, 614.10, 614.10a); 4 keys, 7
  proving cards. The second family needed no engine code: its keys predate B250's
  `damage-rule`, so it was the scaffolder taught and 3 keys marked built, 4 proving cards.
  28 freed (349 queued). Skipped `decision:choose-card-name`'s chosen-value group, first in
  the order: it adds decisions, so it goes alone. Next: that group (21),
  `effect:amount-new-variants` (20), `static:combat-restriction-extensions` (19).

## Rough size

Phase 0 is one session, and the trial a short one. Phase 1 is one cheap-agent session (steps 1.3 and 1.4), plus up to six
recheck batches in one parallel round. Phase 2 Tier A is ~100 groups at three or four a
session, so ~25–30 sessions, or five or six parallel rounds, freeing ~1,350 cards plus whatever
Phase 1 turns up. Tier B and the top of Tier C follow if the user wants to go further.
