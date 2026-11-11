# Authoring a batch: the steps the authoring skills share

Steps 2 and 3 of the set walks' procedure (the walks finished in November 2026), kept
because `author-freed`, `author-flagged`, `author-top-cards` and `author-top-commanders` follow them.
Where a step says "the set", read the batch the calling skill picked. `agent-batches.md` beside
this file is the procedure for batches authored by agents.

## 2. Build a feature, if one leads

If one missing feature blocks **five or more** cards of the batch — a set's
new mechanic usually does — build it (engine change + its own test file
+ the AUTHORING.md vocabulary entry, following `engine/CLAUDE.md`) while the
agents author the cards that don't need it (`agent-batches.md`, "A feature
alongside the agents"; first, before dispatching, only when its cards are
most of the batch), then author every card it unblocks (`cards:needs -- --feature <key>`), in the set
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
- **Verify** as `agent-batches.md`'s Integrating step 4 says: the new-cards
  fuzzer early (`npm run verify -- --fuzz-new`, beside the docs), then merge
  `origin/main`, then one `npm run verify`, then `--only <step>` after a fix.
- **Land it on `main`** (a cloud session): push the session branch, then
  `git fetch origin main && git merge origin/main && git push origin HEAD:main`
  — the next session starts from `main`, and a batch left on a session branch
  gets walked again. If `main` moved during the verify and the merge brings
  engine code, `npm run verify -- --only fuzzwith`; only other batches' cards
  and docs need just `gen:cards` and the build to come out clean.

