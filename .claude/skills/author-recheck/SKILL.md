---
name: author-recheck
description: Work one frozen recheck list of the need-keys plan (engine/data/recheck/R<K>.txt): cards already triaged as blocked whose needs have all been built, or judged to exist, or were never really triaged. Re-brief each, author the ones the engine now runs exactly, and give each one still blocked a narrow new need key that says what's really missing; test, record and ship like a set-walk batch. Use when told to run a recheck list or batch (R1–R9), or when author-walks-parallel starts a recheck round.
---

# Work one recheck list

Phase 1 step 2 of `docs/plans/need-keys-after-the-walk.md`. Each card on a list
has a triage record that blocked it, but every need that record names is now
built, or was judged to exist already (`checked: "…: exists"`), or the record
names only a meta key (`new:unverified-in-mass-pass`): it was never really
triaged. Most of the "built before triage" ones are still blocked: their key
was built for one card and reused for a broader need (the Phase 0.5 trial found
8 of 20 built keys like that). The job is to find out which, card by card.

The mechanics are `author-by-set`'s: read its `SKILL.md` and
`agent-batches.md` (agents, staging, briefs, integrating, verifying, landing).
Only what's below differs. Rule zero holds as always (`AUTHORING.md` §0):
never author a card the engine can't run exactly.

## 0. Orient

As `author-by-set` step 0. Then read your list:
`engine/data/recheck/R<K>.txt` (one card per line, a tab, then the need keys
its latest record names). The list is frozen: never take your cards from
`cards:needs -- --recheck` itself, whose batches move as other lists land.
Skip a card already in the pool (`card:brief` says "in the pool").

## 1. Sort the list

1. **Scaffold first**: `npm run card:scaffold -w engine -- "A" "B" …` over the
   whole list (dry-run first if you like). A card it finishes goes to
   `review/`, read against its Oracle text and rulings like any draft.
2. `card:brief` the rest. Its triage-records section shows each old record,
   with `[BUILT …]` on what's been built since. For each card decide:
   - **authorable now**: the built feature (or the existing one the check
     found) really covers the card. Author it.
   - **still blocked**: name what's actually missing as a **new, narrow key**
     (`<prefix>:<what's missing>`) in `engine/data/needs-vocabulary.json`'s
     `features`, with `family` set to the coarse key's family, a one-line
     `description` and the card as `example`. Never block on the old key
     again: it's built, so the card would come straight back to a recheck
     list. Reuse a narrow key another card on the list already got, and
     check `cards:needs -- --brief <family>` for an open key that already
     says it.
   - **tighten the coarse key**: when a built key turned out narrower than
     its description, add to that feature's description what it does *not*
     cover (one clause, pointing at the new key), so the next triage doesn't
     reuse it.
   - a **meta-only** card (`(meta only)` on the list) gets a full triage, as
     `author-top-cards` step 1.
3. **Agents**: authorable cards past ~15 go to `card-author` agents as in
   `agent-batches.md`. `fill-brief.mjs` takes `--set-names "the need-keys
   recheck list R<K>" --set-code R<K> --test-prefix recheck-r<k>`; the batch's
   `notes.md` says the cards are rechecks and lists, per card, the feature the
   old record waited on and where the pool uses it (`card:find`), plus the
   rule above for one still blocked.

## 2. A feature, if one leads

As `author-by-set` step 2: if one missing feature now blocks five or more of
the list's cards, build it (first checking `git log origin/main` for another
session having built it) and author what it unblocks.

## 3. Test, record, ship

As `author-by-set` step 3, with these differences:

- **Test file**: `engine/src/test/recheck-r<k>.test.ts`.
- **Record**: `engine/data/sweep-3/B<N>.json` (your batch number), its
  `"ranks"` line `"The need-keys recheck list R<K> (Phase 1 step 2)"`. Every
  card on the list goes in it, authored or blocked, with its new narrow key.
  The new record is later than the card's old one, so the tools read it from
  then on, and a card blocked on a narrow open key drops off the recheck.
- **BACKLOG.md**: mark R<K> done on the recheck line ("Next: work down the
  need keys"), with authored / still-blocked counts. The batch summary goes
  in `docs/card-blockers.md` as usual: list the coarse keys found too
  coarse.
- **Commit**: `Cards: recheck list R<K> — <three or four headline cards> and
  <count> more`, with how many were still blocked and the keys tightened.
- **Verify and land** exactly as `author-by-set` and, in a parallel round,
  the child prompt says (the landing lock).

## 4. Report

A few lines: authored, still blocked, the narrow keys added (most-used
first), the coarse keys tightened, anything built. One list per session; offer
the next list but don't start it.
