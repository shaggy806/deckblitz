---
name: build-family
description: Build the missing engine features the most-played blocked cards need (Phase 2 of docs/plans/need-keys-after-the-walk.md), in order of the best EDHREC-ranked card each key unlocks — take the first cards `cards:needs -- --by-rank` lists, build what they need as general implementations, prove each with its own tests and the real cards that exercise it, mark the keys built, teach the scaffolder, verify, ship, and hand off. Features only: the other cards they free are authored later by the `author-freed` skill. Run as `/build-family overnight` (optionally `overnight until 8am`), it coordinates instead — four fresh agents at once in their own worktrees, reviewed, picked, verified and pushed every few cards — so it can run unattended for hours. Use when the user says to build by rank, build the next keys or family, work down the need keys, do Phase 2, run families overnight or with agents, or runs this skill with no other instructions.
---

# Build the next feature families

Phase 2 of `docs/plans/need-keys-after-the-walk.md` (read its *Phase 2*
section once). The set walk and the recheck lists are done. Every card left is
blocked on need keys, and the keys are merged into **generalisation groups**:
keys one general implementation covers (`groups` in
`engine/data/needs-vocabulary.json`, each `{ keys, shape }`). A key is built
with its group when the group is one implementation.

**The order is by EDHREC rank** (the user's call, 2026-11-04): the keys of the
best-ranked blocked card first, `cards:needs -- --by-rank --top 40`. All the
greedy order's units of 5 or more cards were built by 2026-11-05, and past them
cards freed per key is nearly flat, so how much a card is played decides. There's
no floor to stop at. `--greedy --groups` remains the view of what a key's group
is and what else it frees, not the build order.

**This skill builds features only** (the user's call, 2026-10-29). A session
takes the top of the order, builds card after card while the engine code is in
context, and authors **only the cards that prove each feature works**: the card
itself, whole, and one or two more where they prove a branch. The rest of what a
key frees waits in `cards:needs -- --stale` for the **`author-freed`** skill,
which authors it in batches with `card-author` agents. **`author-freed` comes
first now** (the user's call, 2026-11-04): this skill is the last of the work,
for once `--stale`'s queue is done. If the queue still has cards when this is
invoked, say so and offer `author-freed` instead. Don't stage, scaffold
or dispatch a batch here.

**Sessions run in series** (the user's call, 2026-10-28): one session at a
time, landed on `main` before the next starts.

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
- As soon as step 1 settles the cards and their keys, **replace the list**
  (`update_plan` with `items`) with one step per key — "Engine: <key>",
  "Tests and proving cards: <cards>" — then the scaffolder and gaps array,
  docs, verify and land. A card taken later gets its own steps the same way.
- **Advance** with the call that starts each step, and send a fresh `items`
  list whenever the plan changes (a unit dropped, a Tier B key added, a
  verify failure to fix).

**Two ways to run it.** Interactively (the default) you build the cards'
keys yourself, steps 0–4 below. **Overnight** — invoked as `/build-family
overnight` or `/build-family overnight until 8am`, or when the user asks to run
several with agents or leave it running — you coordinate instead: four fresh
agents at once, while your own context stays small. See *Overnight* at the end;
`agent-brief.md` beside this file is the agents' instructions.

## 0. Orient

- **Unmerged work first**: the SessionStart hook prints
  `scripts/unmerged-branches.mjs`. Merge any branch it lists, or ask
  whether it's abandoned. `git fetch origin main && git status -sb`: be
  level with `origin/main`.
- `BACKLOG.md`'s "Next: work down the need keys" line: what's been built so
  far, and the cards handed off as next (a suggestion; step 1's fresh order
  decides). A draft left by the last run may be named there.
- `engine/CLAUDE.md` and `ROADMAP.md`'s *Architecture constraints*, if
  they're not already in context. You're changing the engine.
- The **Need-Key Hints** artifact's notes (the `reference_need_key_hints`
  memory): the user's leads on existing machinery per unit. A lead to verify,
  not a verdict.

## 1. Pick the cards and their keys

1. `npm run -s cards:needs -w engine -- --by-rank --top 40` gives the build
   order: the blocked cards by EDHREC rank, each with its open keys. Reads the
   pool and the records, not `dist/`.
2. **Take the first card**, and decide how many this session takes by what it
   needs (the user's call, 2026-10-29, for token use):
   - **It adds a new player decision** (a new `decisions/` kind, so client
     UI, manual checks and a live check): **that card alone**. Ship it,
     hand off, and the next starts from a fresh session. Every tool
     call re-reads the whole context, and a decision family alone ends near
     450K tokens (B256, separate-into-piles); more on top costs more than a
     fresh session's ~30K of orientation.
   - **Engine-only** (no new decision kind; an existing decision reused is
     fine): take the next cards too, three or four in all. Stop adding once the
     session passes ~300K tokens (`get_usage`) or the next one adds a decision.

   Re-run the order after each lands: a key built takes other cards off the
   list. A card that needs something out of reach is a design call for the user,
   not a stopping point: note it and take the next (banding, `keyword:banding`,
   was a session of its own, rule 702.22 rewriting combat damage assignment).
   **Try the card first:** the records overstate what's missing (9 of the first
   42 needed no engine code), and then the key is the card and a parser template.
3. For each key, `npm run -s cards:needs -w engine -- --feature <key>` lists
   its other cards, and `--greedy --groups --family <F>` shows the group it's in.
   Build the whole group when its shape is one implementation.
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
Then `npm run test:e2e -w client` (the quick set; an overnight agent leaves it
to the coordinator). `decision:choose-card-name`
(46 cards) is one of these. A feature that reuses an existing decision
(`for-each-player` handing a look-and-choose to a targeted player) needs
none: check the client already reads that decision's answer from the engine
(per-attacker defenders come from the offer's `defendersFor`).

Commit each card when its keys pass (typecheck, the engine suite,
`card:parse-check`): `Engine, Cards: <the features in words> — <the proving
cards>`.

## 3. Record, docs, ship

- **No batch record** (`sweep-3/B<N>.json`): that's `author-freed`'s, for
  the cards it authors and the ones it finds still blocked.
- **Docs**:
  - `BACKLOG.md`'s "Next: work down the need keys" line: add the cards built,
    with the `--stale` count. Name the next cards from a fresh `--by-rank --top
    5`, run after the build. Keep the line that says how many freed cards wait
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

- the cards and keys built, and any Tier B keys;
- the proving cards authored;
- how many cards the build freed (`cards:needs -- --stale`), waiting for
  `author-freed`;
- client changes and manual checks added;
- the commits on `main`;
- the next cards by rank, from the fresh run.

Offer the next, for a fresh session (`/clear`, then the skill): `author-freed`
while `--stale`'s queue has cards, more keys once it's empty.

## Overnight: four agents, by rank

The user's call, 2026-10-31: let a session run the order unattended, for hours, by handing the work to fresh agents. This overrides, for
this mode only, "features by me, agents author" and the per-session budget in step 1.2: each agent starts from ~40K of orientation and ends
with its cards, so no context carries one card's code into the next. You, the coordinator, never read engine code beyond reviewing diffs. Your
context grows ~10K per agent's card group, so a night is about 12-20 agents.

**The settings, as measured** (detail under *What the settings came from*): four agents at once, each in its own worktree, started as a slot
frees. Each takes three or four cards in rank order, one commit a card, and a near neighbour on the same key rides along. A four-card agent
takes about 70 minutes, a two-card one 25. Verify alongside the agents every 4-6 commits' worth; Playwright only when `client/`, `protocol/` or
`engine/src/view.ts` changed since its last pass. Local agents only, no cloud sessions.

**Before starting.** The user starts the session in **auto mode** (an unattended run can't answer permission prompts) and runs `/build-family
overnight`, perhaps with a time to stop by (`until 8am`). Nothing else is asked of them until morning; never stop to ask a question. A choice
that is genuinely theirs (a card needing a design call) is a skip with a reason, for the morning report.

### Setup

1. Step 0's orient, briefly: unmerged branches, level with `origin/main` (a worktree is cut from `origin/main`, so push first), the BACKLOG Next
   line. Don't read `engine/CLAUDE.md` or the roadmap yourself. A branch the hook lists that's plainly superseded can stay for the morning report.
2. `ToolSearch` `select:mcp__ccd_host__request_keep_awake,mcp__ccd_session_mgmt__get_usage,PushNotification,SendMessage`, then request
   keep-awake for the night (the PC mustn't sleep under a running agent).
3. Task list: one step per running agent, naming its cards, plus "Verify and push" steps. Replace the list with `items` as agents are picked.
4. Keep a **skip list** in your context: cards an agent found blocked, with the reason. Never hand one out again this run.

### The loop

Whenever a slot is free:

1. **Budget** (`get_usage`). Stop starting agents (go to *Morning report* once they've landed) when your own context passes ~500K, the weekly
   all-models window passes 90%, or extra usage has spent 80% of its monthly limit. When the **5-hour window** passes 90%, wait it out rather
   than stop: a Bash `sleep <seconds until resetsAt, plus 60>` with `run_in_background` (you're notified when it exits; a foreground sleep is
   refused), then carry on.
2. **The time.** With a time to stop by, the last landing has to fit: a final verify and Playwright take ~25 minutes on an idle machine. So the
   last agents start about 30-60 minutes before it with two cards and a report-by time ~10 minutes before the final verify, and none after. A
   card unfinished by then comes back reverted, as a patch. Save a far-along patch somewhere that lasts (`engine/.cache/`, not the scratchpad),
   and name it on BACKLOG's Next line.
3. **Pick.** `node scripts/needs-vocabulary.mjs --by-rank --top 40 | cut -c1-130` from `engine/`. Take the next cards in order that aren't on
   the skip list or already with an agent. A card whose keys need only one implementation with another's can ride along with it.
4. **Dispatch** one `general-purpose` agent with `isolation: "worktree"` and this prompt; don't do its work meanwhile and don't poll:

   > Read your brief first: `.claude/skills/build-family/agent-brief.md`, and follow it. The main checkout is at `<path>`. End each commit
   > message with `<the co-author line this session's attribution gives>`.
   >
   > Your cards, in order:
   > 1. **<Card>** — `<key>` + `<key>`
   > ...
   >
   > Your E2E ports, if you need a live check: E2E_WEB_PORT=52NN E2E_SERVER_PORT=42NN E2E_CONTROL_PORT=43NN. (A number no other agent has had
   > this run.) *[With a time to stop by:]* The run ends at <time> (check `date`). Commit each card as it's finished, and report by <time>.

5. **Review** each report (see *Reviewing*), then pick its commits (*Picking*). Read its "unsure" section as work: send a real problem back with
   `SendMessage`, which keeps the agent's context and worktree, and take the slot's next agent meanwhile.
6. **Verify and push** every 4-6 commits' worth, once at `--full`, and when the run ends: `git fetch origin main && git merge origin/main`,
   `npm run verify` in the background (logged to a file in the OS temp dir; read it when notified), a failure fixed and re-checked with `--only
   <step>`, the Playwright quick set if the client changed, then the docs, then `git push origin HEAD:main`. Commit `scripts/verify-state.json`
   if verify rewrote it. A failure you can't fix in two tries **stops the run**: nothing broken is pushed; the commits stay local, named in the
   report. Don't pick while a verify or Playwright runs: they read the working tree.

Three cards blocked in a row also stops the run: something is wrong with the order or the brief, which a person should look at.

### Picking

`python .claude/skills/build-family/pick.py <commit>...` picks an agent's commits onto `main`, in the order its report gives, resolving the routine
conflicts (`oracle-parse.test.ts` and `manualChecks.ts` as whole blocks; the `built` array, the long-line docs). On anything else, `game.ts`
above all, it stops naming the files: keep both sides by hand (usually mechanical, but read the hunk), `git add` them, and run it again with the
commits it says are left. After `game.ts`, its CRLF count must equal its line count, with one NUL byte: `pick.py` prints them.

Then `npm run gen:cards -w engine`, commit the generated files, and `npx tsc -p tsconfig.tests.json --noEmit` from `engine/` through the
machine gate, because two agents can add the same field (`look-and-choose`'s `prompt`). `npx tsc -b` from `client/` needs `engine/dist` rebuilt, so
leave it to verify's build. Read a doc `pick.py` flags with "READ THIS": two sentences inserted at one spot can interleave. Write the shared docs from
the reports yourself; agents don't touch them.

**Clean up** when a verify has passed on an agent's commits and nothing's left to send back, and at the end of the run, in the background (~1
minute a worktree). Every commit's subject should be on `main` (`git cherry` can't tell, because resolved picks change the patch):

1. Unlink every junction by absolute path, `[IO.Directory]::Delete("<path>", $false)` (`node_modules`, `client/node_modules/{engine,protocol}`,
   `server/node_modules/{engine,protocol}`, `protocol/node_modules/engine`), and confirm none is left.
2. In each worktree, `git checkout -- engine/src/cards` (the generated files an agent left), and delete `.claude/settings.local.json` once it matches
   the main checkout's: the harness copies it in, and `git worktree remove` refuses while it's there.
3. `git worktree remove` (never `--force`, which follows junctions into main's node_modules), then delete the branch. A worktree locked by the harness
   (`claude agent ... (pid N)`) stays for the morning report: its lock isn't yours to override.

### What the settings came from

How each setting above was arrived at, oldest first. The user's calls still hold; the mechanics are superseded where the sections above differ.

- **Integrate** after both report (or one, while the other still runs, when
  it touches different files): `git cherry-pick <commit>` each onto `main`
  (`.git/info/attributes` holds `engine/src/game.ts merge=text`). Resolve by
  keeping both sides: the `built` array's union, both parser templates and
  pins, both engine.md edits. After any conflict in `game.ts`, check its CRLF
  count equals its line count and it still holds one NUL byte. Then `npm run
  gen:cards -w engine`, commit the generated files, run both families' test
  files and `card:parse-check`, and write the shared docs from the reports.
- **Verify and push after every pair**, as one run.
- **Later the same night** (the user's call): **three agents at once, each given two related
  families** (code that overlaps — two filter groups, attach and granted statics), committed one
  by one; start the next agent as soon as one lands rather than waiting for a pair. Cloud
  sessions take fixed family lists of their own and land on `main` themselves (they don't edit
  BACKLOG's Next line); a session can only be started from a message typed in the desktop app, so
  over Remote Control hand the user the prompt to paste into claude.ai/code. After a pick that
  touched the parser, `npm run build -w engine` before `oracle-parse.test.ts` (it imports
  helpers from `dist/`). The same-file conflicts are routine: the `built` array (keep both, fix
  the comma), parser templates and pins (keep both blocks, each closed), engine.md and AUTHORING
  (a word-level merge; check the length is base plus both sides).
- **Found on 2026-11-01:** an engine-only agent must still run `npx tsc -b` from `client/` when it
  extends a union the client maps in a total table (`format.ts`'s `RESTRICTION_TEXT` broke the build).
  Keeping both sides of a parser or `oracle-parse.test.ts` conflict can drop a closing `});` or
  declare a `const` twice: `node --check` the parser and run the engine's `tsc -p tsconfig.tests.json`
  after every pick. A later engine change can make a conflict real in code (`decisions/attackers.ts`):
  read any hunk outside the routine files. Let a verify finish before picking onto `main`: it reads
  the working tree. Keep a coordinator's per-agent review small; 15 agents and 34 families took about
  460K of context.
- **Found on the next night (18 agents, 32 families, ~470K of context):** agents touch `App.tsx`,
  change what an offer says, or ship a card only partly reached, then say so under "unsure". Read
  that section as work: send the agent back with `SendMessage` for manual checks and a fix (it keeps
  its context and worktree; `E2E_WEB_PORT`, `E2E_SERVER_PORT` and `E2E_CONTROL_PORT` let two run
  live checks at once), and put "a proving card runs its whole text" in the brief. `card:verify` is
  the only check that catches a wrong mana cost, so a family isn't done until a verify has run on
  it. A Bash `cd` persists and can move the session (into a worktree, even): use `git -C` and
  subshells. Most pick conflicts are mechanical (the `built` array, `neededCards-features.md`, one
  long line of `engine.md`), so a small helper script for those saves a lot of context. After a
  merge, run Playwright once: verify doesn't, and client work from several agents has only met there.
- **Measured on 2026-11-03 (the user's settings from then on):** local agents only, no cloud
  sessions: they keep re-verifying as `main` moves. **Verify alongside the builds, every 4-6
  families.** 15 families that way took about 13 minutes a family; 12 with one verify at the end took
  about 18, because a verify overlaps the agents' work and an end-of-run one overlaps nothing. **Four
  agents at once**, a trial: three have been the norm, and agent time is what sets the pace (engine
  pairs 32-52 minutes, client pairs 68-73). **Playwright once a round, by the coordinator**, also a
  trial: tell client agents to rely on `run-check` and skip `test:e2e`, which cost each about 18
  minutes. Say in the report what the trial changed, and use `--full` at least once a night: verify
  counts card batches, so a run of families alone stays quick and skips the plain fuzzer.
- **Measured on 2026-11-04 (the same settings):** 52 families from 16 agents, starting each as a slot freed. Seven verifies
  alongside, three of which found real bugs: an unrated-slot ratchet, a pre-existing Bond of Agony offer, eight cards missing colors
  (only `card:verify` catches that). Playwright once a round was enough: its only failures were load timeouts that passed alone. A full verify's
  fuzzer can time out games of 150+ turns at its 120 s limit, with or without agents: replay them alone before calling it a failure. The
  skill's merge helper stops on `manualChecks.ts`, `client.md` and a long-line doc whose word merge conflicts; those are mechanical too.
  An agent's reports need reading as work: four of the 16 went back with `SendMessage` for a real fix (a test that claimed too much,
  rule 701.47b, a batching guess, a prompt nobody had played).
- **The user's call, 2026-11-04:** agents no longer run the whole engine suite, which repeated verify's. Its failures now reach the
  coordinator, so keep each agent's worktree and branch until a verify has passed on its commits, and send a failure back with
  `SendMessage` while the agent still has its context. `text-change.test.ts` is the one failure last night's list wouldn't catch.
- **The user's call, 2026-11-04, on Playwright:** agents never run `test:e2e`. The coordinator runs the quick set (`npm run test:e2e -w
  client`, about 11 minutes) only when a pick changed `client/`, `protocol/` or `engine/src/view.ts` since its last pass (`git diff
  --name-only <last pass>..HEAD -- client protocol engine/src/view.ts`). Tutorials and the larger screens are in `test:e2e:full`, which
  GitHub runs daily. The suite can't simply go parallel: 4 workers took 7.2 minutes with 19 failures, mostly different tests from run to run.
- **The user's call, 2026-11-04, past the 5-card units:** don't stop at the floor. Build keys by the highest EDHREC-ranked card each
  unlocks (`cards:needs -- --by-rank --top 40`), Gemstone Caverns first, a few cards an agent: the card is the first proving card and runs its
  whole text. Those records overstate more than the families' do (9 of 42 needed no engine code), so an agent tries the card first.
  That night: 20 families and 42 by-rank cards from 19 agents, four at once; a four-card agent took about 70 minutes, a two-card one 25. A
  deadline in the brief ("report by 7:40") mostly worked: one of three cards ran out of time and was reverted to a patch. Nine of the 19 went
  back with `SendMessage` for a fix, so read "unsure" as work: two were
  rules bugs in existing code (life at exactly the amount, rule 119.4; a copied spell's delayed `whenever`).

### Reviewing

Read the report first, its "unsure" section as work. Then, keeping your context small, only what checks it: `git show --stat <commit>`, and
for anything that looks like a special case, the engine hunks of `git show <commit> -- engine/src ':!engine/src/cards'` (cap the output). Check
that the implementation is one general shape and not a special case per card, that each rule number cited exists (`grep` the Comprehensive
Rules), and that the `built` array changed. A check the report says ran before its last commit, or a manual check it stopped short of playing,
goes back with the rest. Verify runs the tests. A BLOCKED report: add the card to the skip list, and record it on BACKLOG's Next line as skipped
with its reason (one clause), committed with the next docs or at the end.

### Morning report

When the run stops, for whatever reason: push what's verified, then re-run
`--by-rank --top 5`. Send a `PushNotification` ("build-family overnight: N cards
on main, M skipped") and end with the report of step 4 for every card, plus: why
the run stopped, the skipped cards with reasons, any patch left and where, any
commits left unpushed and why, the plan usage at the end, and anything from your
reviews the user should look at.
