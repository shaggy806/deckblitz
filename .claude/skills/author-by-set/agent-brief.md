You are authoring Magic: The Gathering cards for the MTG-Engine repo (a rules engine). You are in your own git worktree. Your group is **GROUP_LETTER**: the cards listed at the end, from SET_NAMES. Author every one the engine can run *exactly*; block the rest with a reason. You author cards only — never change engine source (`engine/src/*.ts`, `engine/src/cards/*.ts` helpers, `game.ts`, `effects.ts`, scripts). If a card needs an engine change, it is BLOCKED.

## Setup — do exactly this, nothing more (≈1 minute)

From the worktree root (Git Bash is fine for git; the junction needs PowerShell):

1. `git merge --ff-only main` — your worktree starts from `origin/main`, which can be behind the lead's local `main` (the features this batch needs). If it says it can't fast-forward, stop and report.
2. Link the main checkout's node_modules, **with the PowerShell tool** (the worktree guard refuses `cmd /c mklink`):
   `New-Item -ItemType Junction -Path "<worktree root>\node_modules" -Target "C:\Users\Toby Ens\Desktop\Programming\MTG Engine\node_modules"`
   Never delete, move or `rm -rf` that junction or anything inside it. Don't run `npm install`.
3. Copy your drafts in: `cp STAGING_DIR/scaffold/*.ts engine/src/cards/scaffold/` (and `STAGING_DIR/review/*.ts` into `engine/src/cards/review/` if that folder exists). They are the lead's `card:scaffold` output for your cards — **don't run `card:scaffold` or `npm run build`** (neither is needed: `card:brief`, `card:find`, `gen:cards`, `typecheck` and `vitest` all read the sources).
4. Read `STAGING_DIR/briefs.txt`: every card's Oracle text, rulings, triage records and the pool's closest authored abilities — the `card:brief` output, already run. Run `card:brief` again only for a card you need more analogs for.

## Read before authoring

- `engine/CLAUDE.md`, then `engine/src/cards/AUTHORING.md` §0 (rule zero), §1, §15 (what the engine can't express).
- **`DIGEST_PATH`** — the whole definition vocabulary on one page: every effect, amount, target, trigger, condition, cost and static field, each with its fields, the first sentence of its doc, how many cards use it and the smallest one to copy. Read it through once (it's ~100 KB: three `Read`s in one message), then **triage every card against it before authoring any** — authorable, or blocked and why. Reach for `card:find`, `card:vocab` or a grep of the engine sources only for what the digest leaves open (a field's exact type, an option's full doc); past agents spent most of their first ten minutes grepping `effects.ts` for options the digest lists. Use the rest of AUTHORING.md as a reference per card.
- **Rule zero**: never author a card the engine can't run exactly — no dropped clause, no hardcoded number, no choice made for the player, no "close enough". A missing card costs nothing; a wrong one lies at the table. When in doubt, BLOCK it. Every card's **rulings** are in the briefs — a ruling often decides it, and the ruling beats a precedent.

## Working rules (each cost past agents minutes)

- **Batch your tool calls.** Every turn re-reads your whole context (~200K tokens), so the number of turns is most of what your work costs. Put independent calls in one message: the setup's reads together; one `card:find`/`card:vocab`/Grep per open question, all at once; **write three or four finished card files in one message**; run gen:cards and the typecheck in one Bash call (`npm run gen:cards -w engine && npm run typecheck -w engine`). Past agents batched one turn in ten.

- **Read files with the Read tool and search with Grep/Glob** — not `cat | grep | sed | awk` pipelines or `cd … && …` chains, which the worktree guard refuses. Keep shell commands to single npm/npx/git commands run from the worktree root.
- Keep tool output small: pipe test output through `| tail -40`, and grep the parts you need from long files rather than printing them whole.
- Tests are fast now (a file in ~10–20 s): run your test file as often as you like, `--maxWorkers=2`.

## Tools (run from the worktree root)

- `npm run card:find -w engine -- "<phrase>" [--kind triggered] [--json "<substring>"] [--limit N]` — pool abilities that read like a phrase, with their authored shape. The fastest way to an example.
- `npm run card:brief -w engine -- "A" "B" …` — the briefs again, for more analogs.
- `npm run card:vocab -w engine -- <term>` — what the vocabulary can say about a term.

## Files

- Each authored card: move its draft from `scaffold/` (or `review/`) to `engine/src/cards/pool/<kebab-name>.ts`, finish every `TODO(scaffold)`, and remove the SCAFFOLD/REVIEW header comment. Tokens go in `engine/src/cards/tokens/`, reusing an existing token file when one matches exactly (`Glob engine/src/cards/tokens/*<word>*`). Name a new one by what it is, never by your card — `"Crab Token"` in `tokens/crab-token.ts`, not `"Crab Token (Scuttletide)"` — since another agent may be making the same token right now, and the same name is how the lead merges the two.
- A card's `text` stays close to its Oracle text.
- Tests: `engine/src/test/TEST_FILE_PREFIXGROUP_LETTER.test.ts`, on `engine/src/test/harness.ts` (read it; `table()` deals each player an 8-card hand, so count hands relative to a "before"; `enter()` then `settle()` can leave the game past main phase — `toStep` back for a sorcery-speed activation). One focused test per card whose behaviour is more than a stat line or an exact copy of an already-tested pattern; test the clause most likely to be wrong.
- Delete the drafts of the cards you BLOCK (and anything left in `scaffold/` or `review/` that's yours) before committing. `scaffold/winter-cynical-opportunist.ts` is tracked and not yours — leave it.

## Checks (all must pass before you commit)

From the worktree root:
1. `npm run gen:cards -w engine && npm run typecheck -w engine` — one call (the typecheck covers your test file too)
2. `npx vitest run TEST_FILE_PREFIXGROUP_LETTER pool.test --maxWorkers=2` from `engine/`

The lead runs `oracle-parse` (it reads the engine build, which your worktree doesn't have), `card:verify`, the fuzzer and the full suites after integrating — don't.

A card you can't make pass in reasonable time: drop it (delete its file, regenerate) and report it as BLOCKED with the reason, rather than debugging the engine.

## Commit

Commit on your worktree's branch **only** your card files, token files and your test file (`git add` them by path). Do **not** commit `engine/src/cards/generated.ts`, `generated-index.ts`, `engine/src/cards/shards/`, any doc, or the node_modules junction. Don't push. Message: `Cards: SET_CODE group GROUP_LETTER (N authored)` plus the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Report (your final message)

1. The branch name and commit hash.
2. AUTHORED: one line each — card name, file, tested yes/no.
3. BLOCKED: one line each — card name, need key(s), one-line why. Need keys come from `engine/data/needs-vocabulary.json` (its `features`, or an `aliases` key) or `engine/src/cards/top-commanders-gaps.json`'s `features`; grep them for a fitting key. If none fits, propose a new key in the same style (`effect:…`, `trigger:…`, `static:…`, `cost:…`, `decision:…`, `filter:…`, `condition:…`, `amount:…`, `replacement:…`, `mechanic:…`) and say it's new.
4. Anything that looks like an engine bug or a rules gap (one line each).

## Your cards (GROUP_LETTER)

CARD_LIST
