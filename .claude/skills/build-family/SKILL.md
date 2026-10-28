---
name: build-family
description: Build the next family of missing engine features in the need-keys plan's greedy order (Phase 2 of docs/plans/need-keys-after-the-walk.md) — pick the family that `cards:needs -- --greedy --groups` puts first, build its top two to four generalisation groups as general implementations in one context load, then author every card they unblock through card-author agents, record what's still blocked with narrow keys, test, ship, and hand off the next family. One family per session, in series. Use when the user says to build the next family, build features in greedy order, work down the need keys, do Phase 2, or runs this skill with no other instructions.
---

# Build the next feature family

Phase 2 of `docs/plans/need-keys-after-the-walk.md` (read its *Phase 2*
section once). The set walk and the recheck lists are done. Every card left is
blocked on need keys, and the keys are merged into **generalisation groups**:
keys one general implementation covers (`groups` in
`engine/data/needs-vocabulary.json`, each `{ keys, shape }`). The build unit
is a group, not a key. A session takes **one family**, builds its top groups
together while that code is in context, and authors what they free.

**Families run in series** (the user's call, 2026-10-28): one session, one
family, landed on `main` before the next session starts. The next session
re-runs the greedy order, because building one family frees cards in others.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly*. A record's needs were
triaged by people and Haiku reading Oracle text, so they over-count in both
directions. Read every card's text before counting it as freed.

The authoring mechanics are `author-by-set`'s: read its `SKILL.md` steps 2–3
and `agent-batches.md` (agents, staging, briefs, integrating, verifying,
landing). Only what's below differs.

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

## 1. Pick the family and its groups

1. `npm run -s cards:needs -w engine -- --greedy --groups --top 30` gives
   the build order. Each step is a group (its open keys, built together)
   or one key alone. It shows the cards freed, the running total, the
   family, the keys, and the group's shape. Reads `dist/`, so build
   `engine` first if it's stale.
2. **The family is the first step's family**, unless it needs something
   out of reach for one session. Banding (`keyword:banding`, 46 cards) is a
   whole session of its own: rule 702.22 rewrites combat damage
   assignment. Take it when it comes up first, but alone, with no second
   group.
3. `npm run -s cards:needs -w engine -- --greedy --groups --family <F>`
   shows that family's own order. Take **its top two to four units**,
   aiming at roughly 60–120 cards freed. Fewer is fine when the first unit
   is big or hard.
4. `npm run -s cards:needs -w engine -- --brief <F> --open-only` gives each
   key's description. A key with `checked: …partial` names only what's
   missing. Read the family's **built** keys too: the new code usually
   extends one of them.
5. **The cards**: `npm run -s cards:needs -w engine -- --feature <key>`
   for each key in the chosen units. Keep the cards whose every open need
   is among those keys (`--greedy` counted exactly these). Then
   `card:brief` them all, in one call or a few. For each card, confirm
   (a) it really needs this feature, and (b) nothing else it needs is
   missing. A card that fails either goes in the record with the narrow key
   that names what's really missing, as `author-recheck` step 1.2 says.
   Don't add it to your build.
6. **Tier B rides along.** Check `--brief <F>`'s other open keys of 2–9
   cards. If the code you're about to write covers one with a parameter or
   a branch, add it and its cards. Don't widen the build for a key that
   needs code of its own.

## 2. Build

Build each unit as **one general implementation**, shaped the way the
group's `shape` describes. Don't build one special case per key: the group
exists because the keys are the same feature. Follow `engine/CLAUDE.md`:

- every decision is a dispatched action with a `decisions/` module;
- `Game` is the only writer of state;
- cite rule numbers, grepped from `docs/rules/MagicCompRules_20260925.txt`.

For each unit:

- the engine change, and its own `engine/src/test/<feature>.test.ts`;
- the feature's entry in AUTHORING.md's vocabulary, and in
  `neededCards-features.md`'s index;
- **every key it covers added to `engine/src/cards/top-commanders-gaps.json`'s
  `built` array**. That array is what `cards:needs` reads as built;
- **the scaffolder taught**: a template for the line in
  `scripts/oracle-parse.mjs`, checked by `npm run card:parse-check -w
  engine` (zero disagreements) and pinned in `test/oracle-parse.test.ts`.
  The cards then come pre-drafted, so scaffold them again once it lands.

**A new player decision is a client change too.** That means the prompt UI
in `client/`, a bot answer (read `docs/plans/bot-effect-knowledge.md`
before changing how a bot picks), and `docs/manual-checks.md` tests, each
with its board in `client/src/builder/manualChecks.ts`. Check it live with
Playwright in a 2- and a 4-player room at ~768px tall (`dev-up` /
`dev-down`), plus `npm run test:e2e -w client`. `decision:choose-card-name`
(46 cards) is one of these.

If the agents' cards don't depend on the feature, dispatch them first and
build alongside them (`agent-batches.md`, "A feature alongside the
agents"). In this skill, usually every card depends on it: build first,
then dispatch.

## 3. Author

The freed cards go through the batch procedure (`agent-batches.md`): the
lead authors the cards that test each feature, and `card-author` agents
take the rest, up to five on a cloud session. `fill-brief.mjs` takes
`--set-names "cards freed by the <family> family" --set-code <short family
slug> --test-prefix family-<slug>`. The batch's `notes.md` names each
feature just built, its shape, a pool card to copy, and the narrow-key rule
for a card that turns out still blocked.

## 4. Test, record, ship

As `author-by-set` step 3, with these differences:

- **Test file**: `engine/src/test/family-<slug>.test.ts` for the cards,
  beside each feature's own test file.
- **Record**: `engine/data/sweep-3/B<N>.json`, the highest `B<N>` on
  `origin/main` plus one. Its `"ranks"` line reads `"Need-keys Phase 2:
  the <family> family (<units>)"`. Every card considered goes in it,
  authored or still blocked, with its narrow key.
- **Docs**:
  - `BACKLOG.md`'s "Next: work down the need keys" line: add the family to
    the families built, with cards authored and still blocked. Name the
    next family from a fresh `--greedy --groups --top 5`, run after the
    build.
  - `COMPLETED.md`: an entry for the features.
  - The plan: a line under *Phase 2* (a progress list, started by the
    first session).
  - `docs/card-blockers.md`: the batch summary.
  - `docs/architecture/engine.md`: entries for the files whose shape
    changed.
- **Commit**: `Engine, Cards: <the features in words> — <three or four
  headline cards> and <count> more`. Split the engine change from the
  agents' cards where the history does.
- **Verify**: `npm run verify -- --fuzz-new` in the background once the
  cards are committed. Then merge `origin/main` and run one `npm run
  verify`. After a fix, `--only <step>`. An engine change triggers the bot
  gate and the server and client suites, so expect a full run's length.
- **Land on `main`**: `node scripts/landing-lock.mjs acquire B<N> --wait`,
  then merge `origin/main`. If the merge brought anything, run `npm run
  verify -- --landing`. Then `git push origin HEAD:main` and `release`. The
  families run in series, so the lock is normally free at once; it still
  guards against a session started by hand.

## 5. Report and offer the next

A few lines:

- the family and the units built (keys covered);
- cards authored, and cards still blocked with their top narrow keys;
- any Tier B keys that rode along;
- client changes and manual checks added;
- the commit on `main`;
- the greedy order's next family, from the fresh run.

One family per session. Offer the next, to run in a fresh session (`/clear`,
then this skill), and don't start it here.
