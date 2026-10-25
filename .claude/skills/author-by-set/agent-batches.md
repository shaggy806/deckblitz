# Authoring a batch with parallel agents

The procedure every authoring skill uses once a batch has more cards than the
lead should author alone — `author-by-set`, `author-by-set-oldest`, `author-top-cards` and
`author-top-commanders` alike. The agents author **cards only**; the lead
builds every engine feature the batch needs (and authors the cards that test
it), then hands out the rest.

## Sizing

By the `feedback_agents_only_over_15_cards` memory: ≤15 authorable cards the
lead does alone; 16–39 one agent; 40+ split into groups of **~18 cards**, as
many agents as that takes **up to six** — a set's tail of commons (100–150
cards) is six agents, not four. Smaller groups finish sooner at about the same
tokens per card (an agent re-reads its whole context every turn, so a shorter
list keeps every turn cheaper); past six, the machine's cores set the pace,
not the agents (B143's four agents of 27 took 14–22 minutes on a 4-core
cloud session). Each is a **`card-author`** agent (`subagent_type`;
`.claude/agents/card-author.md`: only the file and shell tools, so a smaller
fixed context on every turn than the general-purpose agent's) in
`isolation: "worktree"`, started in the background, all in one message.

## The lead's shared work, before dispatching

B109's six agents spent half their ~44 minutes before their first card — a
stale base, a refused junction, their own build, scaffold and briefs under
six-way contention — so the lead does this once:

1. **Commit** whatever the batch needs first — a feature, the lead's own
   cards, a token several cards share. Agents fast-forward to local `main`
   (their worktree starts from `origin/main`).
2. **Scaffold the whole batch** in one `npm run card:scaffold -w engine --
   …` run, after the feature's scaffolder templates landed (so its lines come
   pre-drafted). Move the finished `review/` cards you've checked into `pool/`.
3. **Make the tokens once**: `card:scaffold` writes one token draft per card
   that makes one, so two cards making the same 1/1 come out as two files.
   Keep one, named by what it is (`"Kor Warrior Token"`, not `"Kor Warrior
   Token (Nahiri)"`), point the other drafts at it, and commit it with the
   feature — or put it in the one group that makes it.
4. **Stage each group** in the scratchpad: `group-<x>/scaffold/` (and
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
part, the docs, and **the next set's feature** — build and commit it now, so
the next session (or this one) can dispatch the next set straight away.
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
4. `gen:cards`, the whole engine suite, `card:verify -- --offline`,
   `card:parse-check`, then the skill's own record, docs and `npm run
   verify`. **Squash** the group commits into the batch commit.
5. **Remove the worktrees** the `feedback_worktree_agents` memory's way:
   unlink each `node_modules` junction (Windows) or symlink (Linux: `rm` the
   link, no trailing slash, after checking `-L`) by absolute path first, and
   check none is left before `git worktree remove --force`; delete the
   branches.

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
