# Authoring a batch with parallel agents

The procedure every authoring skill uses once a batch has more cards than the
lead should author alone — `author-by-set`, `author-by-set-oldest`, `author-top-cards` and
`author-top-commanders` alike. The agents author **cards only**; the lead
builds every engine feature the batch needs (and authors the cards that test
it). When the batch has a feature to build, the agents start first, on the
cards that don't need it, and the lead builds the feature while they work
("A feature alongside the agents" below).

## Sizing

By the `feedback_agents_only_over_15_cards` memory: ≤15 authorable cards the
lead does alone; 16–39 one agent; 40+ split into groups of **~18 cards**, as
many agents as that takes **up to six** (five on a cloud session — "On a
cloud session" below) — a set's tail of commons (100–150 cards) is five or
six agents, not four. Smaller groups finish sooner at about the same
tokens per card (an agent re-reads its whole context every turn, so a shorter
list keeps every turn cheaper); past six, the machine's cores set the pace,
not the agents (B143's four agents of 27 took 14–22 minutes on a 4-core
cloud session). Each is a **`card-author`** agent (`subagent_type`;
`.claude/agents/card-author.md`: only the file and shell tools, so a smaller
fixed context on every turn than the general-purpose agent's) in
`isolation: "worktree"`, started in the background, all in one message.

## A feature alongside the agents

Building the feature first left five agents' worth of cards waiting on it:
B164 spent ~22 minutes on tribute before dispatching, though only 6 of its
104 cards needed it. So once step 1 of the skill has triaged the batch:

1. **Split off the feature's cards**: those whose only blocker is the
   feature (`cards:needs -- --feature <key>`, in the batch or not). Everything
   else is the agents' batch, staged and dispatched from the current `HEAD`
   exactly as below, before the feature exists — the digest and briefs don't
   need it, since none of those cards use it.
2. **Build the feature while they run**, in the main checkout as step 2 of
   the skill says (engine change, its test file, the scaffolder template, the
   AUTHORING.md entry), and commit it. The agents' worktrees read their own
   sources, so the lead's edits and builds don't reach them. **Every build,
   typecheck and test run of the lead's goes through
   `node scripts/typecheck-turn.mjs <command>` while agents run** (`npm run
   build -w engine` as much as the typecheck — either takes ~6 GB), so it
   queues with theirs instead of running the box out of memory.
3. **The feature's cards**: scaffold them again once the template has
   landed, and the lead authors them (it writes the feature's tests on them
   anyway). If there are more than ~15, they're one more group, dispatched
   from the feature's commit once an agent has reported (keep within the five
   at once on a cloud session).
4. **Integrate** as below: the agents' commits touch only `cards/pool/`,
   `cards/tokens/` and their test files, so they cherry-pick onto the
   feature's commit cleanly; `gen:cards` regenerates the rest.

Build first, as before, only when the feature's cards are most of the batch
(more than half), or when the feature changes something the other cards'
definitions would be written against (a shared field, a renamed shape).

## The lead's shared work, before dispatching

B109's six agents spent half their ~44 minutes before their first card — a
stale base, a refused junction, their own build, scaffold and briefs under
six-way contention — so the lead does this once:

1. **Commit** whatever the batch needs first — the lead's own cards, a token
   several cards share (a feature only when it's built first — "A feature
   alongside the agents" above). Agents fast-forward to local `main`
   (their worktree starts from `origin/main`).
2. **Scaffold the whole batch** in one `npm run card:scaffold -w engine --
   …` run, after the feature's scaffolder templates landed (so its lines come
   pre-drafted). Move the finished `review/` cards you've checked into `pool/`.
3. **Make the tokens once**: `card:scaffold` writes one token draft per card
   that makes one, so two cards making the same 1/1 come out as two files.
   Keep one, named by what it is (`"Kor Warrior Token"`, not `"Kor Warrior
   Token (Nahiri)"`), point the other drafts at it, and commit it with the
   feature — or put it in the one group that makes it.
4. **Stage each group** in a staging dir of the batch's own,
   `<scratchpad>/stage-B<N>/` — never one an earlier batch used:
   `fill-brief.mjs` briefs every `group-*` it finds there, so a stale group
   would be dispatched again (after a `/clear` the scratchpad is still the
   last batch's). In it, `group-<x>/scaffold/` (and
   `review/`) — that group's drafts, **moved** out of the repo, not copied
   (they're untracked, and a `git add -A` would sweep them into your commit;
   `scaffold/winter-cynical-opportunist.ts` is tracked — never delete it). A
   double-faced card scaffolds as one file per face: keep both in one group
   (they're named by face, so check none are left behind in `scaffold/`).
   **Deal the cards out** in rank order snaking across the groups, so each
   gets a mix of long and short cards. Then `group-<x>/briefs.txt`: `npm run
   -s card:brief -w engine -- <the group's cards> --analogs 2 --width 300 >
   …/briefs.txt` (two analogs a line, their shapes clipped: an agent carries
   the briefs in every turn's context, and asks `card:find` for more). Paths
   use forward slashes (Git Bash's `cp` eats backslashes).
5. **Stage the digest** once for all of them: `npm run card:digest -w engine
   -- --out <staging>/digest.md` — the whole definition vocabulary on one
   page, after the batch's feature has landed so it lists it.
6. **Brief each agent** with **`fill-brief.mjs`** beside this file — never a
   shell heredoc (the brief's backticked commands run in an unquoted one; they
   once ran `npm install` and `git reset --hard` on the main checkout). Put
   each group's card names in `group-<x>/cards.txt` and the batch's **notes**
   in `<staging>/notes.md` — the feature just built and its shapes (with a
   pool card to copy), the batch's other mechanics and where the pool already
   has them, what's known blocked (a need key to use), the tokens already
   made — then `node .claude/skills/author-by-set/fill-brief.mjs --staging
   <staging> --set-names "…" --set-code <CODE> --test-prefix
   set-<code>-batch-<N>` writes every `group-<x>/brief.md` from
   **`agent-brief.md`** (its placeholders: `GROUP_LETTER`, `SET_NAMES`,
   `STAGING_DIR`, `TEST_FILE_PREFIX`, `SET_CODE`, `DIGEST_PATH`,
   `BASE_COMMIT` — the lead's HEAD, which the agents bring their worktree to,
   since the harness may branch it from elsewhere — `MAIN_CHECKOUT`,
   `CARD_LIST`). Agent prompt: just the brief's path and its letter.

**On a cloud session** (4 cores, ~15 GB) five agents' typechecks at once
run the machine out of memory: the engine's tests typecheck peaks at ~6.3 GB
(measured 2026-10-26). In batch 156 every agent had one killed (exit 137);
in batch 164 the agents had their cards written by 22:25 and spent until 22:59
in OOM kills, heap tweaks and retry loops. So agents typecheck through
`scripts/typecheck-turn.mjs`, a queue shared by every worktree on the machine
(one slot per ~7 GB of RAM beyond 3 GB: one on a cloud session, more on a
bigger machine, beside other slots only while ~7 GB is free; `TYPECHECK_SLOTS`
overrides the count), and wait their turn instead of fighting. A `verify`
takes every slot (`scripts/machine-slots.mjs`), so a typecheck also waits
while one runs. Five agents stay the cloud session's ceiling: a typecheck is
~40 s since it became one pass (2026-10-26: the engine's `typecheck` was a
source pass and then a tests pass over the same source, ~70 s), and each
agent typechecks once its tests pass rather than after every fix. Two slots
on a cloud session would not fit: one typecheck peaks at 6.2-6.6 GB resident
even with a smaller heap limit (measured 2026-10-26).

Agents run gen:cards, the typecheck and their own test file with `pool.test`
only — no build, no `card:scaffold`, no `card:verify`, no `oracle-parse` (it
reads `dist/`); the lead runs those and the suites after integrating.

## One batch per session

The lead's context is the batch's biggest cost, not the agents': every lead
turn re-reads the whole conversation. Measured 2026-10-23, a session that ran
six batches back to back averaged ~480K tokens a turn over 536 turns — 256M
input, more than its 15 agents together (153M for 471 cards). So:

- **One batch per session.** Ship it, report, and stop: the next batch is the
  next session's (`/author-by-set` again), which starts under 100K. Before
  stopping, leave the hand-off in `BACKLOG.md`'s line for the skill: the next
  set and its left count, and any feature already researched for it (its
  cards' count, the code sites to mirror). The next session reads that line
  in step 0 and needs nothing from this one.
- **Wait, don't poll.** A long run (the checks, an agent) gets one
  background wait — `until grep -q DONE <log>; do sleep 5; done` with
  `run_in_background` — and its notification; never a turn spent asking
  whether it's done yet.
- **Nothing rebuilds while a check runs.** `card:scaffold` runs `npm run
  build` first, and a build rewrites `engine/dist` under a running fuzzer or
  server test, which then fails for no reason of the batch's (two reruns on
  2026-10-23). Scaffold the next batch before starting the checks, or after
  them.
- **Read flags, not files** (Integrating step 2).

## While they run

The lead's own work that doesn't touch their files: the batch record's lead
part, the docs, and **this batch's feature** when it has one ("A feature
alongside the agents" above) — through `typecheck-turn.mjs`, like every build
and check while they run.
Integrate each group as it reports rather than waiting for all of them. Don't poll them; each one's completion arrives as a
notification.

## Integrating

1. **Cherry-pick** each branch onto `main` (after checking each commit
   touches only `cards/pool/`, `cards/tokens/` and its own test file).
2. **Review** with `node scripts/batch-review.mjs --since <the commit before
   the batch> --out <scratchpad>/review.txt` (from `engine/`): it writes every
   card file beside its Oracle text to the file and prints only the cards
   worth reading in full — untested ones with a condition, a replacement, a
   cost paid as it resolves, a delayed trigger, a library choice or several
   target slots; dense tested ones; any stats or cost that disagree with
   Oracle. Read those from the file (`grep -A40 "=== <path>"`) against their
   rulings (`card:brief`); a rulings line often decides a card. Read the
   agents' reports for the calls they flagged themselves. Don't print the
   whole batch into the conversation — that was ~360 card files in one
   2026-10-23 session. Fix or drop what's wrong. Check each agent's BLOCKED list too: a card
   blocked for a reason the digest answers is authorable, and its need key
   must exist in `needs-vocabulary.json` (add proposed ones with a `family`).
3. **Check `tokens/`** for two files making the same token (merge them into
   one and repoint the cards).
4. **Verify once, and start its slow step early** (the 2026-10-26 audit of
   batches 173-175: verify took 10-34 minutes a batch on a cloud session's 4
   cores, a third of B175's whole session, and only its new-cards fuzzer ever
   found anything):
   - `gen:cards`, **squash** the group commits into the batch commit, then
     start **`npm run verify -- --fuzz-new`** in the background — the
     new-cards fuzzer alone, on the cards just committed — and write the
     skill's record and docs while it runs. Don't run the engine suite,
     `card:verify` or a build of your own first: verify runs them minutes
     later (`card:parse-check` too: `oracle-parse.test.ts` is in the suite).
     Your own test file you've already run while reviewing.
   - Once it passes: commit the docs, **then** `git fetch origin main && git
     merge origin/main` — before verifying, not after: a merge after a green
     verify meant a second whole run (B174) — and then **`npm run verify`**,
     once. It skips the new-cards fuzzer when the merge brought no engine code
     and you changed no card since. Commit what it rewrites (the re-marked
     lists, `scripts/verify-state.json`) in one commit.
   - **A step fails**: fix it with its own test, then **`npm run verify --
     --only <step>`** (`--only fuzzwith` for a fuzzer find): gen:cards, build,
     typecheck and the engine suite always run, the rest only as named. Not
     the whole run again for a six-line fix; CI runs everything on the push.
   - **A fuzzer game times out**: its line says where the game was ("last
     seen at turn 109 …, 161x Phoenix Fleet Airship …"). A turn in the
     hundreds or a battlefield of one card's copies is a game running long,
     not a hang: if no card of this batch is in that picture, record it in
     `BACKLOG.md` and go on. Never replay it at a longer `--timeout` to find
     out — B174 waited ten minutes that way to learn what the first line
     says.
5. **Remove the worktrees** the `feedback_worktree_agents` memory's way:
   unlink each `node_modules` junction (Windows) or symlink (Linux: `rm` the
   link, no trailing slash, after checking `-L`) by absolute path first, and
   check none is left before `git worktree remove --force` — a worktree an
   agent still holds is *locked* (its lock names the agent), and once that
   agent has reported, `git worktree remove -f -f` is the way; delete the
   branches after their worktrees are gone (git refuses a checked-out one),
   then `git worktree list` shows the main checkout alone. Delete the batch's
   staging dir too.

**A stopped agent can't be resumed** (SendMessage refuses it). Its worktree
and files stay: start a fresh agent in that worktree with a short
`continue.md` — the original brief, plus "the previous agent left these
files; re-read each one against its Oracle text, finish what's unfinished,
judge the deleted drafts again from the staging dir, then run the checks and
commit". MH2's six took ~8–10 minutes each that way.

## Measuring the cost

Tokens per card are the batch's cost: measure them as the
`feedback_agent_token_counting` memory says (usage once per message id), per
card handled (authored + blocked) as well as per authored card, since a
batch's tail blocks more. B111 0.78M per card handled, B112 0.41M (the
brief's "batch your tool calls"), B113 0.35M (the `card-author` agent: 19K
fixed context a turn against 57K). The levers: fewer turns, a smaller fixed
context, smaller groups.
