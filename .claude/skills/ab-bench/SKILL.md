---
name: ab-bench
description: Bench the current bot against the same bot at an older commit (default origin/main) at four players — one seat on the working build, three on the baseline — to measure whether a bot change made it stronger. Use when the user asks to bench a bot change, A/B test the bots, compare the bot to main or an earlier commit, or check whether a change helped or hurt the bot's win rate.
---

# A/B bench the bot across commits

`bot:bench` compares weight vectors within one build; this compares **builds**:
the current engine's bot in one seat against the baseline commit's in the
others, seeded and seated exactly as `bot:bench` seats them.

## Before

- `npm run build -w engine` — the working side is a frozen copy of
  `engine/dist`, so it must include the change. (The baseline is built from
  `git archive` into `.scratch/baseline/<sha>/` the first time, about a minute.)
- Pick the baseline: `origin/main` when the change is uncommitted or
  unpushed; otherwise the commit before it (`HEAD~1`, or the commit named).
- `--bot v2` (default) is what live rooms seat. `--bot v1` only for a change to
  `HeuristicBotController` on its own — v1 is also v2's rollout policy, so a
  v1 change needs a v2 bench too.
- Nothing else heavy running (`dev-down` if unsure): count budgets are CPU,
  and the user wants the cores used. More workers are more games an hour but
  not faster games: 8 workers buy about 3.2 times one worker's throughput, and
  at 18 each game ran about 2.3 times slower than at 8 (E-cores and shared
  P-cores; the bot audit's S7), so more long games hit the wall-time stop.
  Each worker's heap is capped (`scripts/worker-limits.mjs`): uncapped, a
  worker grew to ~1 GB of garbage and 18 of them ran the machine out of memory
  (2026-10-02). A worker here holds two builds, so two card pools, and its cap
  is the two-build one, 1.5 GB (2026-11-16: at the one-build 768 MB every game
  of an 18-worker run ended "JS heap out of memory"). The default worker count
  is therefore the cores less two **or what the free memory holds** at 1.7 GB a
  worker, whichever is fewer — 9 on this 32 GB machine with nothing else
  running. Don't pass more `--workers` than that.

- **Not across a change to the shape of the game state.** Every game is played on the working engine, so the baseline bot reads and simulates a state its own code doesn't know: 77 of 105 games ran out of worker memory against a baseline from before the need-key themes (2026-11-09). Compare such builds apart: `tune-bot.mjs bench` in each, same seeds and workers, the old one from `.scratch/baseline/<sha>/engine` with `git archive <sha> engine/scripts engine/data` unpacked there.
- **Stopping a bench:** stopping the background shell leaves its `node` processes running on every core; check `Get-CimInstance Win32_Process` and stop them, or the next bench only times out.

## Run

Background, with a check-in every few minutes (Monitor on the output file,
3-minute interval — the user likes to see progress):

```bash
cd "$(git rev-parse --show-toplevel)/engine" && npm run bot:ab -- --base origin/main --bot v2 --games 400 > "$TEMP/bot-ab.log" 2>&1
```

400 four-player games resolve about ±4 points. At 9 workers v2 plays about
1.8 games a minute (2026-11-16), so 400 is three and a half hours, not the
hour this said when 18 workers fit. Interrupted? Rerun the same command — it
resumes from its NDJSON (`.scratch/ab-<bot>-<sha>-4p.ndjson`).

**The games can be watched** (2026-11-17, the user asked for it): the run's
second line is `watch the games at http://localhost:4020/` (the next free
port if 4020 is taken; `--watch-port N`, `--no-watch`). Give the user that
address when the bench starts. The page shows every game being played as a
small tile (turn, each seat's deck and build, life, cards, permanents, the
stack, the last plays), the finished games and the running share with its
interval. A tile that goes dim has sent nothing for 20 seconds: one long
decision, or a game on its way to the timeout. `scripts/watch.mjs`.

**Watch it and stop when it's settled** (the user, 2026-11-16: "check it as it
goes so we don't keep running it after the data is conclusive"). The check-in
reads the NDJSON and prints the share with its interval; say beforehand what
ends the run — at least 100 games and a 99% interval clear of 25% either way
is a fair bar when it's read every ten minutes (a 95% one read that often
calls a lucky streak a result) — and stop there, or when the user says the
answer is plain enough. A one-seat share of 32% takes about 230 games to
clear that bar.

**How far back a baseline can go:** to the last change in the shape of the
game state (see "Not across…" above). On 2026-11-16 a baseline of 2026-11-09
midday, just after the need-key themes, played 157 of 158 games out.

## Reading it

Even is 25% at four players. Report the result with its interval, and:

- **Level** (interval spans 25%): no measured change — a fix a player can see
  ships on that plus a scenario (the plan's rule), a change meant to add
  strength didn't.
- **Leaning one way but not resolved**: don't grind more games by reflex. The
  user prefers reading what changed: offer `decision-diff` instead, which says
  *why* in a few games.
- **Timeouts/errors**: listed by seed. A timeout is worth a `replay-seed`
  look (seed 50 hid three problems); an error is a bug — reproduce it on both
  builds before blaming the change.

Stop early when the answer can no longer change the decision.
