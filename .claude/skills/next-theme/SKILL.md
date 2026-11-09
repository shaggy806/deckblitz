---
name: next-theme
description: Build the next undone piece of docs/plans/need-key-themes.md, start to finish, in this session — find what the plan says is next, write its design note, migrate every user of the old shapes and delete them, teach the bots, prove it with flagged and top-ranked cards, mark the keys built, verify, and land it on main; when no theme is left, hand over to author-freed and then build-family. Use when the user says next theme, next step of the plan, carry on with the need-key themes, continue the plan, do the next piece, or runs this skill with no other instructions.
---

# Build the next need-key theme

One piece of `docs/plans/need-key-themes.md` a session, landed as its own commits on `main`. One a
session because each piece changes types that everything else touches; two at once would fight.

## 1. Pick the piece

Read *The plan* at the top of the doc: the line starting `- Next:` under step 7 says what's next.
If the user named a theme, that one instead. Check `git log -8` and `COMPLETED.md` to be sure it
hasn't landed. Say in one line which piece you're starting.

When `Next:` says the themes are done, the plan's own work is over:

1. `npm run cards:needs -w engine -- --stale` lists cards with every need built: if there are any,
   run the `author-freed` skill.
2. Otherwise run the `build-family` skill, which works down what's left key by key.

## 2. Read and measure before designing

- The theme's section, and the two newest `Design note` + `As built` pairs in the doc. They are the
  template for the form and the depth.
- `ROADMAP.md`'s *Architecture constraints*, the `docs/architecture/*.md` entry of each file you'll
  change, and `engine/CLAUDE.md`'s invariants. Those list the shared shapes this piece must build on
  (`Duration`, `ChooserRef`, `inSet`, `ObjectRef`, `CharacteristicsPatch`, `TRIGGER_EVENTS`, the
  journal, `KeywordValue`), so a new need doesn't become a parallel form.
- `npm run cards:needs -w engine -- --asap`, then `-- --by-rank`, then `--feature <key>` for the
  theme's keys: which cards each waits on, flagged first.
- **Check `engine/data/needs-vocabulary.json`'s keys against what the pool can already say.** Try
  writing a key's card before building anything for it; earlier rounds found several keys needing
  no engine code, or one small fix.
- **Count the reads of whatever you plan to change.** A warning in the doc ("read in about 40
  places") is a question to answer with a number, and the number can change the shape: theme 16
  moved replicate off `kicker` because of one.

## 3. Write the design note

Under the theme, in the same headings the others use: *What's wrong today*, *Where it lives*,
*Rules* (grep `docs/rules/` for each number and its wording), *Moved or not, decided before
building*, *Bots*. Decide what isn't moving and say why.

If the theme has parts and they turn out too large for one session, build the first, say so in the
note, and leave the rest on the step list.

## 4. Build it

1. Migrate **every** user of the old shapes and delete them, or the next key adds a field to them
   again. Add a pool test refusing the removed spellings, with a long timeout (`60_000`): it reads
   every card file and times out under verify's load otherwise.
2. Teach the bots the new shape (`docs/plans/bot-effect-knowledge.md`).
3. Prove it with cards: flagged ones first, then the theme's top keys by rank, about 15-20 in all.
   `npm run gen:cards -w engine` after adding any. Read `engine/src/cards/AUTHORING.md` first.
4. Test in `engine/src/test/`, starting from `harness.ts`. Test state-based actions through a real
   spell, because `debugApplyEffect` doesn't run them. `npm run typecheck -w engine` as you go:
   vitest doesn't type-check tests.
5. Mark the keys built in `engine/src/cards/top-commanders-gaps.json`'s `built` array, and write
   `engine/data/sweep-3/B<N>.json` (next number after the highest there; copy the last one's shape).
   Leave the other freed cards in `--stale` for `author-freed`.

Scripts are where these sessions lose work:

- Write a migration script with the Write tool, not a Bash heredoc, which mangles backslashes.
- Read and write in binary mode so CRLF survives. **Encode before opening the file**:
  `data = t.encode(enc)`, then `with open(p, "wb") as f: f.write(data)`. `open(p, "wb").write(t.encode())`
  truncates first, so an encode error leaves 0 bytes (it emptied `game.ts` once).
- `game.ts` has a NUL byte: read it as latin-1, turn any text you add into that view
  (`.encode("utf-8").decode("latin-1")`), and copy it to the scratchpad before a script touches it.
  `grep -a` to search it. If one is lost anyway, `~/.claude/file-history/<session>/` has a copy from
  before the first Edit, and the session's `.jsonl` holds every Edit to replay.
- Before writing a new card or test file, check the name is free: if Write says "updated" rather
  than "created", you've overwritten something.

## 5. Anything a player sees

Add a test to `docs/manual-checks.md` with its board in `client/src/builder/manualChecks.ts`, for
each new decision or careful rules call. Play it live in the builder (`dev-up`, then `dev-down`
before verifying) at 1366x768, in a 2-player and a 4-player game. Read the builder by `find` and
refs: its manual-checks select holds thousands of options. No new player decision means no check.

## 6. Verify and land

1. `npm run verify -- --full` if the change moves a widely used type (the `Action`, a definition
   field, `GameObject`), else `npm run verify`. If you added manual checks and verify ran quick, run
   the server suite too (`npm test -w server`): the test tying each check to its board lives there
   and a quick verify can skip it.
2. Docs, in the same landing: the note's *As built* (what moved, differences from the note,
   behaviour changes, cards, keys, what's left unbuilt and why); `docs/architecture/engine.md`;
   `engine/CLAUDE.md` if an invariant changed; `AUTHORING.md` for a new spelling; a `COMPLETED.md`
   line; `BACKLOG.md`'s step-7 line. In the plan, the Status line, a `Done` entry on the step list,
   and **rewrite the `- Next:` line** to name what's next, since step 1 of this skill reads it.
3. Check line endings before committing (bytes, not `wc`; `git diff --stat` looking too large is the
   sign). Commit as the last pieces did: `Engine, Cards: <what>`, then
   `Docs, Data: B<N>, theme <T>'s design note and As built, the keys it built, verify's stamp`,
   with `scripts/verify-state.json` if verify rewrote it. Then `git fetch origin main`, merge and
   re-check if it moved, and `git push origin HEAD:main` (standing authorization: root `CLAUDE.md`).

## 7. Close

Update the project-state memory. Tell the user what landed, what's left unbuilt, and anything that
went wrong. Then propose the next piece as a session card: `start_session` with `initiation:
"own_initiative"`, `context: "fresh"`, and the prompt `/next-theme`, so starting it is one click.
