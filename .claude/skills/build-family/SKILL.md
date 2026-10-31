---
name: build-family
description: Build the next families of missing engine features in the need-keys plan's greedy order (Phase 2 of docs/plans/need-keys-after-the-walk.md) — pick the families that `cards:needs -- --greedy --groups` puts first, build their generalisation groups as general implementations, prove each with its own tests and the few real cards that exercise it, mark the keys built, teach the scaffolder, verify once, ship, and hand off. Features only: the cards they free are authored later by the `author-freed` skill. Use when the user says to build the next family, build features in greedy order, work down the need keys, do Phase 2, or runs this skill with no other instructions.
---

# Build the next feature families

Phase 2 of `docs/plans/need-keys-after-the-walk.md` (read its *Phase 2*
section once). The set walk and the recheck lists are done. Every card left is
blocked on need keys, and the keys are merged into **generalisation groups**:
keys one general implementation covers (`groups` in
`engine/data/needs-vocabulary.json`, each `{ keys, shape }`). The build unit
is a group, not a key.

**This skill builds features only** (the user's call, 2026-10-29). A session
takes the top of the greedy order, builds family after family while the
engine code is in context, and authors **only the cards that prove each
feature works** — a handful per unit, the ones its tests are written on. The
rest of what a family frees waits in `cards:needs -- --stale` for the
**`author-freed`** skill, which authors it in batches with `card-author`
agents. Don't stage, scaffold or dispatch a batch here.

**Sessions run in series** (the user's call, 2026-10-28): one session at a
time, landed on `main` before the next starts. Each family re-runs the greedy
order, because building one family frees cards in others.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly*. A record's needs were
triaged by people and Haiku reading Oracle text, so they over-count in both
directions: a key you mark built may cover only some of its cards. That's
expected — `author-freed` gives each card that's still blocked a narrow key.

**Keep the task list current** (the user's call, 2026-10-30): the app's
pinned task list is how the user follows a long session, so it has to move
as the work does, not sit on "Orient" for an hour.

- Start it with the first tool call: Orient, Pick, Build, Docs, Verify and
  land.
- As soon as step 1 settles the family and its units, **replace the list**
  (`update_plan` with `items`) with one step per unit — "Engine: <unit>",
  "Tests and proving cards: <cards>" — then the scaffolder and gaps array,
  docs, verify and land. A second family taken later gets its own steps the
  same way.
- **Advance** with the call that starts each step, and send a fresh `items`
  list whenever the plan changes (a unit dropped, a Tier B key added, a
  verify failure to fix).

## 0. Orient

- **Unmerged work first**: the SessionStart hook prints
  `scripts/unmerged-branches.mjs`. Merge any branch it lists, or ask
  whether it's abandoned. `git fetch origin main && git status -sb`: be
  level with `origin/main`.
- `BACKLOG.md`'s "Next: work down the need keys" line: the families built
  so far, and the one handed off as next (a suggestion; step 1's fresh
  order decides).
- `engine/CLAUDE.md` and `ROADMAP.md`'s *Architecture constraints*, if
  they're not already in context. You're changing the engine.
- The **Need-Key Hints** artifact's notes (the `reference_need_key_hints`
  memory): the user's leads on existing machinery per unit. A lead to verify,
  not a verdict.

## 1. Pick the family and its units

1. `npm run -s cards:needs -w engine -- --greedy --groups --top 30` gives
   the build order. Each step is a group (its open keys, built together)
   or one key alone. It shows the cards freed, the running total, the
   family, the keys, and the group's shape. Reads `dist/`, so build
   `engine` first if it's stale.
2. **Take the first family**, and decide how many this session takes by
   what the first one needs (the user's call, 2026-10-29, for token use):
   - **It adds a new player decision** (a new `decisions/` kind, so client
     UI, manual checks and a live check): **that family alone**. Ship it,
     hand off, and the next family starts from a fresh session. Every tool
     call re-reads the whole context, and a decision family alone ends near
     450K tokens (B256, separate-into-piles); a second family on top costs
     more than a fresh session's ~30K of orientation.
   - **Engine-only** (no new decision kind; an existing decision reused is
     fine): take the next family too, two or three in all, preferring ones
     whose code overlaps (B249's static loss of all abilities and its
     type-setting effects shared layer 4). Stop adding families once the
     session passes ~300K tokens (`get_usage`) or the next one adds a
     decision.

   Re-run the order after each family lands. A family that needs something
   out of reach goes alone too: banding (`keyword:banding`, 46 cards) was a
   session of its own, rule 702.22 rewriting combat damage assignment.
3. `npm run -s cards:needs -w engine -- --greedy --groups --family <F>`
   shows the family's own order. Take **its top units**. A unit is worth
   building when its shape is one implementation; leave a long tail of
   one-card units for later.
4. `npm run -s cards:needs -w engine -- --brief <F> --open-only` gives each
   key's description. A key with `checked: …partial` names only what's
   missing. Read the family's **built** keys too: the new code usually
   extends one of them. **Look for existing machinery before designing**:
   `card:find` the Oracle phrase and `card:vocab` the term — B255's
   "target opponent chooses a creature they control" turned out to be B251's
   `vote` with `choose`, needing only a target-slot chooser.
5. **Read the cards' Oracle text** (`cards:needs -- --feature <key>` for
   each key, then the text: `card:brief`, or the snapshot in
   `engine/data/oracle/cards.jsonl`). Not to author them — to learn the
   shapes the implementation has to cover (B255's restriction family:
   "controls an Island", "is the monarch", "is poisoned", "you control more
   creatures than"). Note the cards that need something else as well; the
   key still gets built, and `author-freed` narrows them.
6. **Tier B rides along.** Check `--brief <F>`'s other open keys of 2–9
   cards. If the code you're about to write covers one with a parameter or
   a branch, add it. Don't widen the build for a key that needs code of its
   own.

## 2. Build

Build each unit as **one general implementation**, shaped the way the
group's `shape` describes. Don't build one special case per key: the group
exists because the keys are the same feature. Follow `engine/CLAUDE.md`:

- every decision is a dispatched action with a `decisions/` module;
- `Game` is the only writer of state;
- cite rule numbers, grepped from `docs/rules/MagicCompRules_20260925.txt`;
- a new effect kind needs its `target-polarity.ts` entry (the bots' read of
  which side it helps) and, if it's an until-end-of-turn effect,
  `effect-worth.ts`'s `onlyUntilEndOfTurn`.

For each unit:

- the engine change, and its own `engine/src/test/<feature>.test.ts`;
- **the proving cards**: author the few real cards the tests are written on
  (two or three a unit, picked to cover the shape's branches — B255 took
  Sengir Vampire, Kumano's Pupils and Vampiric Embrace for "this", the
  replacement and "host"). Each is a full, faithful card (`AUTHORING.md`),
  in `cards/pool/`, then `gen:cards`;
- the feature's entry in AUTHORING.md's vocabulary, and in
  `neededCards-features.md`'s index;
- **every key it covers added to `engine/src/cards/top-commanders-gaps.json`'s
  `built` array**. That array is what `cards:needs` reads as built, and what
  puts the freed cards on `author-freed`'s queue (`cards:needs -- --stale`);
- **the scaffolder taught**: a template for the line in
  `scripts/oracle-parse.mjs`, checked by `npm run card:parse-check -w
  engine` (zero disagreements) and pinned in `test/oracle-parse.test.ts`.
  The freed cards then come pre-drafted for `author-freed`.

**A new player decision is a client change too.** Work from the checklist
in `docs/plans/decision-registry.md` ("Adding a decision kind" — every file
to touch, the silent ones marked) rather than rediscovering it from an
earlier commit. That means the prompt UI
in `client/`, a bot answer (read `docs/plans/bot-effect-knowledge.md`
before changing how a bot picks), and `docs/manual-checks.md` tests, each
with its board in `client/src/builder/manualChecks.ts` (give the decision a
4-player board too). Check it live with `client/e2e/run-check.mjs`, one run
per manual check, the 4-player one included — not by driving the browser
pane by hand:
`node client/e2e/run-check.mjs "<check title>" "cast:<card>" wait
"click:<button>"` plays the check at 1366x768 on ports of its own and prints
the banner, popups by pile, badges and every player's counts after each
step (steps: `cast:`, `card:`, `click:`, `player:`, `pass`, `wait`; see the
file's header). Open a step's screenshot only when the text can't settle it.
Then `npm run test:e2e -w client`. `decision:choose-card-name`
(46 cards) is one of these. A feature that reuses an existing decision
(`for-each-player` handing a look-and-choose to a targeted player) needs
none: check the client already reads that decision's answer from the engine
(per-attacker defenders come from the offer's `defendersFor`).

Commit each family when its units pass (typecheck, the engine suite,
`card:parse-check`): `Engine, Cards: <the features in words> — <the proving
cards>`.

## 3. Record, docs, ship

- **No batch record** (`sweep-3/B<N>.json`): that's `author-freed`'s, for
  the cards it authors and the ones it finds still blocked.
- **Docs**:
  - `BACKLOG.md`'s "Next: work down the need keys" line: add the families
    built, with the cards each frees (`--stale` count) and the proving cards
    authored. Name the next family from a fresh `--greedy --groups --top 5`,
    run after the build. Keep the line that says how many freed cards wait
    for `author-freed`.
  - `COMPLETED.md`: an entry for the features.
  - The plan: a line under *Phase 2*'s progress list.
  - `docs/architecture/engine.md`: entries for the files whose shape
    changed.
- **Verify** once, after the last family: `git fetch origin main && git
  merge origin/main`, then `npm run verify`. An engine change triggers the
  bot gate and the server and client suites, so expect a full run's length.
  After a fix, `--only <step>`.
- **Land on `main`**: merge `origin/main` again if it moved. If the merge
  brought anything, run `npm run verify -- --landing`. Then `git push origin
  HEAD:main`. The landing lock is off (`ENABLED` in
  `scripts/landing-lock.mjs`, since 2026-10-28).

## 4. Report and offer the next

A few lines:

- the families and units built (keys covered), and any Tier B keys;
- the proving cards authored;
- how many cards the build freed (`cards:needs -- --stale`), waiting for
  `author-freed`;
- client changes and manual checks added;
- the commits on `main`;
- the greedy order's next family, from the fresh run.

Offer the next: more families (`/clear`, then this skill), or a batch of the
freed cards (`/clear`, then `author-freed`). Don't start it here.
