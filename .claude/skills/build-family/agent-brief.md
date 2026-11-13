# Building need keys by EDHREC rank: an overnight agent's brief

You build what a few real cards need. Your prompt names the cards and their keys in order, your E2E ports, and perhaps a time to report
by. One commit a card. This is the user's order (2026-11-04): keys are built by the best-ranked card they unlock (`npm run -s cards:needs
-w engine -- --by-rank --top 40`). You are one of four agents building at once; nobody is watching, so never wait on a question.

**The card is your first proving card, and it must run its whole text.** Build each key as the general feature it is
(`cards:needs -- --feature <key>` shows its other cards; author one or two more where they prove a branch), not a special case for the one
card. Look for existing machinery first (`card:brief`, `card:find`, `card:vocab`): these records often overstate what's missing (9 of the
first 42 needed no engine code), and then the key is just that card and a scaffolder template.

Read `.claude/skills/build-family/SKILL.md` steps 2 and 3, then `engine/CLAUDE.md`, `ROADMAP.md`'s *Architecture constraints* and
`engine/src/cards/AUTHORING.md` §0 and §16's **Harness pitfalls**, and follow them: tests in `engine/src/test/<feature>.test.ts`, the keys in `top-commanders-gaps.json`'s
`built` array, the scaffolder taught where the line recurs (`npm run card:parse-check -w engine`: zero disagreements, pinned in
`test/oracle-parse.test.ts`), `docs/architecture/engine.md`, AUTHORING's vocabulary, `neededCards-features.md`. Cite only rule numbers you
grepped from `docs/rules/MagicCompRules_20260925.txt`.

A new player decision, or a change to what an offer says, means the client too, by `docs/plans/decision-registry.md`'s checklist, with
manual checks and their boards, each played **through to the end** with `client/e2e/run-check.mjs` on your own ports (a 4-player one too; a
`card:` step right after a popup opens can lose its click, so `wait` first). Never run `test:e2e`: the coordinator runs it.

**If your prompt names a lane**, your keys all live in one part of the engine (`engine/data/lanes.json` has its files and `game.ts`
landmarks), and another agent works in each other lane at the same time. Read the lane's notes file first (your prompt gives its path; it
may not exist yet), keep your changes in the lane's files and `game.ts` regions where the feature allows (a change elsewhere is fine when
it's the right place — say so in your report), build keys that share a shape as one general implementation, and before your report append
a note of at most 150 words to that notes file: what you built and where, any trap you hit, and what the lane's next keys will want. A card
you find needs a different key than recorded: give the key, its family and its lane in your report.

## Setup

You work in your own git worktree, beside other agents in theirs. `git merge --ff-only main`, then link the main checkout's node_modules
(your prompt gives its path) with PowerShell `New-Item -ItemType Junction -Path node_modules -Target "<main checkout>\node_modules"` (and the workspace links a client or
server check needs: `client/node_modules/{engine,protocol}`, `server/node_modules/{engine,protocol}`, `protocol/node_modules/engine` to your
worktree's own). Never delete through a junction or remove the worktree. Build the engine once before `cards:needs`, which reads `dist/`.

Run every typecheck, build and test run through the machine gate: `node scripts/typecheck-turn.mjs npm run typecheck -w engine`, and the
end-of-work tests as `node ../scripts/typecheck-turn.mjs npx vitest run --maxWorkers=4 <those files>` from `engine/`. `run-check` goes
outside the gate, which breaks quoted titles. Edit with the Edit tool, never `sed` or a script: many files are CRLF. Check whether a test
file exists before writing one: two agents overwrote one by mistake.

**Don't edit** `BACKLOG.md`, `COMPLETED.md`, the plan, `docs/engine-gaps.md` or `docs/client-gaps.md`: put the lines you'd have written there
in your report. Leave `cards/generated.ts`, `generated-index.ts` and `cards/shards/` out of your commits.

## Checks

`npm run typecheck -w engine`, `card:parse-check`, `npx tsc -b` from `client/` when you extend a union the client maps in a total table, and,
once at the end **on the final tree**, your test files with the tests a new card or effect is likeliest to trip: `<your test files>
src/cards/pool.test.ts src/test/needs-vocabulary.test.ts src/test/sample-decks.test.ts src/test/precon-standins.test.ts
src/test/local-bundle.test.ts src/test/target-polarity.test.ts src/test/art-pins.test.ts src/test/oracle-parse.test.ts
src/test/text-change.test.ts`. A card that replaces a sample deck's stand-in comes out of `sample-decks.ts` in the same commit.

Skip the whole engine suite, the fuzzer and `card:verify`: the coordinator's verify runs all three on your work and sends you back anything
they find. Search the card pool (~29,000 files) with the Grep tool, never a shell `grep … *.ts` in `cards/pool/` (a minute or two each);
keep `grep -a` for `game.ts` alone. Batch reads: several `sed -n` ranges or greps in one call, not one call each.

Don't run `npm run verify`, don't push, don't merge. Commit locally per card as `Engine, Cards: <the feature in words> — <the proving cards>`,
ending with the co-author line your prompt gives, and leave no process running.

## When something's in the way

If one can't be built faithfully tonight — it needs a design call, a rules question with no clear answer, or something out of reach — build
nothing half-way: revert your changes for it and report it BLOCKED with why, then carry on with the next. A key only partly covered is fine:
mark what you built, say what's left.

A bug you find in existing code that's small and confirmed: fix it, with a test, in its own commit. Don't leave it for later.

If your prompt gives a time to report by (check `date`), commit each card as it's finished. A card not finished by then is reverted, saved as
a patch beside your report if it's far along, and reported as not done, with how far it got.

## Your report

In under 200 words a card: BUILT or BLOCKED; the keys built; the proving cards; the commit hashes in pick order; each check you ran and its
result, saying if any ran before your last commit; whether it added a player decision or touched the client; the BACKLOG/COMPLETED/plan
lines; and anything you're unsure of, with file and line. The coordinator reads that section as work.
