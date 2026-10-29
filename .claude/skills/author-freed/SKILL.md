---
name: author-freed
description: Author the cards that built engine features have freed — the need-keys plan's queue of triaged cards whose every recorded need is now built (`cards:needs -- --stale`), left there by the `build-family` skill. Re-read each against its Oracle text, author the ones the engine runs exactly through card-author agents, give each one still blocked a narrow new need key, test, record, verify and ship as one batch. Use when the user says to author the freed cards, author what the families unblocked, do an authoring batch after build-family, or runs this skill with no other instructions.
---

# Author the freed cards

The authoring half of Phase 2 of `docs/plans/need-keys-after-the-walk.md`.
The `build-family` skill builds engine features and marks their need keys
built; it authors only the few cards that prove each feature. Everything else
a family frees waits here: **`npm run -s cards:needs -w engine -- --stale`**,
its first section ("Every need built since triage — recheck these"), each card
with the keys built since its triage and the batch that triaged it.

A record's needs were triaged by people and Haiku reading Oracle text, so
they over-count in both directions: a built key often covers only some of
its cards. Most of the queue authors cleanly; some doesn't, and the job is
to find out which, card by card. **Rule zero governs everything here**
(`engine/src/cards/AUTHORING.md` §0): never author a card the engine can't
run *exactly*.

The authoring mechanics are `author-by-set`'s: read its `SKILL.md` steps 2–3
and `agent-batches.md` (agents, staging, briefs, integrating, verifying,
landing). Only what's below differs.

**Sessions run in series** with `build-family`'s (one session at a time,
landed on `main` before the next starts), and one batch a session.

## 0. Orient

- **Unmerged work first**: the SessionStart hook prints
  `scripts/unmerged-branches.mjs`. Merge any branch it lists, or ask
  whether it's abandoned. `git fetch origin main && git status -sb`: be
  level with `origin/main`.
- `BACKLOG.md`'s "Next: work down the need keys" line: the families built
  since the last authoring batch, and how many cards they freed.
- Build `engine` if `dist/` is stale: `cards:needs` and `card:scaffold` read
  it.

## 1. Take the batch

1. `npm run -s cards:needs -w engine -- --stale` — the first section is the
   queue. Take it whole if it's up to ~150 cards; past that, the cards of the
   oldest-built keys first (the dates on each line), so a family's cards land
   together.
2. **Scaffold the whole batch** in one `npm run card:scaffold -w engine --
   …` run: the families taught the scaffolder their lines, so many come out
   finished in `review/`. Read each finished draft against its Oracle text
   and rulings like any other; move the good ones into `pool/`.
3. **Triage the rest** (`card:brief` them, in one call or a few). For each
   card, confirm (a) the built feature really covers it, and (b) nothing
   else it needs is missing. One that fails either is **still blocked**:
   name what's actually missing as a **new, narrow key**
   (`<prefix>:<what's missing>`) in `engine/data/needs-vocabulary.json`'s
   `features`, with `family` set to the built key's family, a one-line
   `description` and the card as `example` — never the built key again, or
   the card comes straight back to this queue. Reuse a narrow key another
   card already got, and check `cards:needs -- --brief <family>` for an open
   key that already says it. When a built key turned out narrower than its
   description, add a clause to that description saying what it does *not*
   cover, pointing at the new key.
4. **Agents**: the authorable cards past ~15 go to `card-author` agents as
   in `agent-batches.md` (groups of ~18-25, up to six; five on a cloud
   session). `fill-brief.mjs` takes `--set-names "cards freed by the
   <families> families" --set-code FREED --test-prefix freed-b<N>`. The
   batch's `notes.md` names each feature the cards wait on, its shape and a
   pool card that uses it (the proving cards `build-family` authored —
   `card:find` them), and the narrow-key rule above for a card that turns
   out still blocked.

## 2. A feature, if one is missing

Not this skill's job: a card blocked on something unbuilt gets its narrow key
and waits for `build-family`, whose greedy order will rank it. The one
exception is a fix to a built feature the batch shows is wrong (a bug, not a
missing branch) — fix it with its own test, as `bug-report` would.

## 3. Test, record, ship

As `author-by-set` step 3, with these differences:

- **Test file**: `engine/src/test/freed-b<N>.test.ts` for the lead's cards;
  each agent's `freed-b<N>-<letter>.test.ts`.
- **Record**: `engine/data/sweep-3/B<N>.json`, the highest `B<N>` on
  `origin/main` plus one. Its `"ranks"` line reads `"Need-keys Phase 2:
  cards freed by <the families>"`. Every card considered goes in it,
  authored or still blocked, with its narrow key.
- **Docs**:
  - `BACKLOG.md`'s "Next: work down the need keys" line: the batch, cards
    authored and still blocked (with their top narrow keys), and what's left
    on the queue.
  - `COMPLETED.md`: an entry for the batch.
  - The plan: a line under *Phase 2*'s progress list.
  - `docs/card-blockers.md`: the batch summary.
- **Commit**: `Cards: the cards freed by <the families> — <three or four
  headline cards> and <count> more`, then the docs and record.
- **Verify**: `npm run verify -- --fuzz-new` in the background once the
  cards are committed. Then merge `origin/main` and run one `npm run
  verify`. After a fix, `--only <step>`. A cards-only batch skips the bot
  gate and the server and client suites.
- **Land on `main`**: merge `origin/main`. If the merge brought anything,
  run `npm run verify -- --landing`. Then `git push origin HEAD:main`.

## 4. Report and offer the next

A few lines: cards authored, cards still blocked with their top narrow keys,
what's left on the queue, the commit on `main`. Offer the next — another
batch if the queue is long, else `build-family` — to run in a fresh session
(`/clear`, then the skill). Don't start it here.
