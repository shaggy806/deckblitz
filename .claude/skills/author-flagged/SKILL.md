---
name: author-flagged
description: Build the cards the user flagged "Build ASAP" in the card library's dev-only view (`engine/data/build-asap.json`), ahead of EDHREC rank — see where each stands (`cards:needs -- --asap`), author the ones the engine already runs, triage the untriaged, build the engine features the blocked ones need, test, record, verify, ship, and unflag what landed. Run as `/author-flagged overnight` (optionally `overnight until 8am`), it coordinates instead — four fresh agents at once in their own worktrees, as `build-family`'s overnight mode does, reviewed, picked, verified and pushed every few cards — so it works down the whole flagged list unattended. Use when the user says to author or build the flagged cards, the ASAP cards, the cards they picked in the library, to run the flagged cards overnight or with agents, or runs this skill with no other instructions.
---

# Author the flagged cards

The user browses the card library's **"Not in the pool yet"** view in
development (`npm run dev -w client`, the `dev-up` skill) and flags cards
**★ ASAP**: cards they want in the pool now, whatever their EDHREC rank. Each
flag is a line in **`engine/data/build-asap.json`** (`{ name, flagged }`), written
by the Vite dev server's `/__build-asap` endpoint (`client/vite.config.ts`) and
committed like any data file. The library's **"Build ASAP (dev)"** view lists
them.

`cards:needs` already puts flagged cards first, marked `[ASAP]`: in `--by-rank`
(build-family's order), `--next` (author-top-cards') and `--stale --next`
(author-freed's). So the other skills pick them up too. This skill works through
the whole flagged list at once, whichever kind of work each card needs.

**Rule zero governs everything here** (`engine/src/cards/AUTHORING.md` §0):
never author a card the engine can't run *exactly*. A flag asks for the card
soon, not for a shortcut.

**Two ways to run it.** Interactively (the default) you do the work yourself,
steps 0–4, a few blocked cards a session. **Overnight** — invoked as
`/author-flagged overnight` or `/author-flagged overnight until 8am`, or when
the user asks to run the flagged cards with agents or leave it running — you
coordinate instead, and keep going until the flagged list is done or the
budget or the time runs out. See *Overnight* at the end.

## 0. Orient

- **Unmerged work first**: the SessionStart hook prints
  `scripts/unmerged-branches.mjs`. Merge any branch it lists, or ask whether
  it's abandoned. `git fetch origin main && git status -sb`: be level with
  `origin/main`. A cloud session's clone is shallow: `git fetch --unshallow
  origin main` first, or `--stale` and the build dates read wrong.
- Build `engine` if `dist/` is stale: `card:scaffold` reads it.
- **`npm run -s cards:needs -w engine -- --asap --prune`**: every flagged card
  and where it stands, and the ones already in the pool unflagged (commit
  `engine/data/build-asap.json` if it changed). Each card is one of:
  - **untriaged**: no triage record yet;
  - **every need built (B<N>)**: its record's needs have all been built since;
  - **blocked: key + key**: its record's open need keys.

  No flags: say so, and that the user flags cards in the library's dev view.

## 1. The cards the engine may already run

The untriaged and every-need-built cards, together as one batch.

1. **Scaffold them all** in one `npm run card:scaffold -w engine -- "A" "B" …`
   run, and read each finished draft in `review/` against its Oracle text and
   rulings before moving it into `pool/`.
2. **Triage the rest** with `card:brief` (one call, or a few). For each card,
   decide: the engine runs it exactly (author it), or something's missing.
   A card that's missing something gets a **narrow need key** in
   `engine/data/needs-vocabulary.json`'s `features`, with `family`, a one-line
   `description` and the card as `example`, as `author-freed` step 1.3 says.
   Reuse a key another card already has (`cards:needs -- --brief <family>`).
   It then joins the blocked cards for step 2.
3. **Who authors**: up to ~15 authorable cards, yourself; past that,
   `card-author` agents in groups of 60–75, as
   `.claude/skills/author-by-set/agent-batches.md` sets out
   (`fill-brief.mjs --set-names "cards flagged to build ASAP" --set-code ASAP
   --test-prefix asap-b<N>`).

## 2. The blocked cards

Each blocked card's open keys are engine features, built as the
**`build-family`** skill builds them: read its steps 1 (from 1.3 on: a key's
other cards, its group, its brief, existing machinery first) and 2 (one
general implementation, its own test file, the proving cards, the key in
`top-commanders-gaps.json`'s `built` array, the scaffolder taught). Here the
flagged card is always one of the proving cards, and authored whole.

- **Order**: the flagged cards in the order `--by-rank` lists them (it puts
  them first, then by rank), unless the user named an order.
- **How many a session takes**, as `build-family` step 1.2: a card that adds a
  new player decision goes alone, with its client UI, manual checks and live
  check; engine-only cards three or four a session, stopping near ~300K tokens.
  Hand the rest off in the report.
- **Try the card first**: a record often over-counts, and the card may need
  nothing but a parser template.
- A card blocked on a design call for the user (a rule that rewrites combat,
  say) isn't a stopping point: note it and take the next.
- Other cards a built key frees are not this skill's: they wait for
  `author-freed` in `--stale`.

## 3. Test, record, ship

- **Tests**: `engine/src/test/asap-b<N>.test.ts` for step 1's cards (an
  agent's `asap-b<N><LETTER>.test.ts`); step 2's features get their own test
  files, as in `build-family`. One focused test per card whose behaviour is more
  than a stat line, the clause most likely to be wrong.
- **Record**: `engine/data/sweep-3/B<N>.json`, the highest `B<N>` on
  `origin/main` plus one, `"ranks": "Build ASAP: cards flagged in the
  library"`, with every flagged card considered: authored, or blocked with its
  narrow keys.
- **Unflag what landed**: `cards:needs -- --asap --prune` once the cards are in
  the pool, and commit `build-asap.json` with the cards. A card still blocked
  stays flagged.
- **Docs**: `COMPLETED.md` (an entry for the batch, and for each feature);
  `BACKLOG.md`'s "Next: work down the need keys" line if keys were built;
  `docs/card-blockers.md`'s batch summary; `docs/architecture/engine.md` for
  any file whose shape changed; `docs/manual-checks.md` for a new decision.
- **Commit**: `Cards: the flagged cards — <headline cards> and <count> more`,
  or `Engine, Cards: <the features in words> — <the flagged cards>` with a
  feature, then the docs and record.
- **Verify**: `npm run verify -- --fuzz-new` in the background once the cards
  are committed; then merge `origin/main` and run one `npm run verify` (an
  engine change brings the bot gate and the server and client suites). After a
  fix, `--only <step>`.
- **Land on `main`**: merge `origin/main`; if it brought anything, `npm run
  verify -- --landing`. Then `git push origin HEAD:main`.

## 4. Report and offer the next

A few lines: the flagged cards authored, the features built for them, the cards
still flagged and what each waits on (from a fresh `--asap`), and the commits on
`main`. While flags remain, offer this skill again in a fresh session (`/clear`,
then the skill); otherwise the usual order (`author-freed` while `--stale` has
cards, then `build-family`). Don't start it here.

## Overnight: agents through the flagged list

The user's call, 2026-11-07: run the flagged list the way `/build-family
overnight` runs the by-rank order — unattended, for hours, fresh agents doing
the work so no context carries one card's code into the next. **Follow
`build-family`'s *Overnight* section** (`.claude/skills/build-family/SKILL.md`,
from "## Overnight" to the end) for everything it covers: auto mode, never
asking a question, keep-awake, the budget and time checks, four agents at once
in their own worktrees, the dispatch prompt and `agent-brief.md`, reviewing
reports and their "unsure" sections as work, `pick.py`, verifying and pushing
every 4-6 commits' worth (once at `--full`), Playwright only when the client
changed, cleaning up worktrees, and the stop rules. Only these differ:

1. **Orient** with step 0 here: `--asap --prune`, and commit
   `build-asap.json` if it changed. No flags: say so and stop.
2. **Step 1's cards first.** If any flagged card is untriaged or has every
   need built, the first agent takes all of them (a `card-author` agent per
   group of 60–75 past 15, as step 1.3 says), with steps 1 and 3 of this skill
   in its prompt beside the brief: author what the engine runs, give each
   card that's missing something a narrow need key, tests in
   `asap-b<N><LETTER>.test.ts`, one commit for the cards, and the new keys
   reported. A card it keys joins the blocked cards for the pick.
3. **Pick** only flagged cards: `node scripts/needs-vocabulary.mjs --by-rank
   --top 150 | grep ASAP | cut -c1-130` from `engine/`, in that order, minus
   the skip list and the cards already with an agent. Three or four a group,
   as build-family picks; a card adding a player decision goes with at most
   one other. An unflagged card that shares a key with a flagged one may ride
   along as a proving card, but no agent is given unflagged cards alone.
4. **Unflag as cards land**: after each pick, `npm run -s cards:needs -w
   engine -- --asap --prune`, and commit `build-asap.json` with that verify
   round's docs.
5. **One record for the run**: `engine/data/sweep-3/B<N>.json` (the highest
   `B<N>` on `origin/main` plus one, taken at setup and named on BACKLOG's Next
   line so no other session takes it), updated at each verify-and-push with
   every flagged card the run considered: authored, or blocked with its keys
   and the agent's reason. Write `COMPLETED.md`, `docs/card-blockers.md`'s
   batch summary and the other step 3 docs from the agents' reports, as
   build-family's coordinator does.
6. **The run ends** when every flagged card is on `main`, skipped, or blocked
   on a design call — or at build-family's budget, time or failure stops. It
   doesn't go on to unflagged cards.
7. **Morning report**: build-family's, plus step 4 here (a fresh `--asap` for
   what's still flagged and what each waits on). The `PushNotification` says
   "author-flagged overnight: N flagged cards on main, M skipped, K still
   flagged".
