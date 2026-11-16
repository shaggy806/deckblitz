---
name: decision-diff
description: Show what a bot change actually changed in play — every seat plays on the current build while the same bot at an older commit (default origin/main) is asked the same question at every decision, and each disagreement is listed in words and grouped. Use when the user asks what a bot change does, why a bench moved, to evaluate the bot's decision making after a change, or to compare old and new bot choices.
---

# Diff the bot's decisions across commits

A bench says whether a change won; this says what it changed. It is how the
2026-09-27 v1 changes were judged — 690 disagreements read by kind, nearly
all intended, one misread found (Scavenging Ooze priced as removal).

## Run

`npm run build -w engine` first (the working side is a frozen copy of
`engine/dist`; the baseline builds itself into `.scratch/baseline/`).

```bash
cd "$(git rev-parse --show-toplevel)/engine" && npm run bot:diff -- --base origin/main --bot v2 --games 6
```

- `--bot v2` (default): six four-player games take ~15 minutes — run it in
  the background with a 3-minute check-in. `--bot v1` is fast; use 40 games.
- A v1 change: diff **both** — v1 directly, and v2, whose rollouts v1 plays.
- Keep `--parallel` at 6 or below: each game holds two card pools and two
  searching bots, and more at once has died silently for lack of memory.
- Zero disagreements is a real answer when the change can't show at that
  table (a four-token cap in two-player games); say so rather than doubting
  the tool — `--base` an older commit to check it sees anything.

## Reading it

The summary groups disagreements by kind, card and move; every one, with its
seed, turn, seat and life, is in `.scratch/diff-<bot>-<sha>.ndjson`.

For each group, say whether the **new** choice is right, wrong or a judgment
call, in plain Magic terms ("draws off Isperia now — right"; "pumps an
opponent's attacker — the known BACKLOG habit"). Open the NDJSON for the
odd ones and look at the actual board if needed (`replay-seed` with
`--snapshot-at` that turn). Lead with anything wrong; a list of "all
intended" is a fine result. A wrong one found this way is a bug to fix, or a
training scenario to capture.

## When the diff comes back empty, or can't say which is better

The diff plays the sample decks, which hardly raise some decisions: an
optional payment is 1 in 12,000 decisions there and ten a game on the strong
decks. A change to one of those diffs as zero and is still live. Ask that
kind of decision on decks that raise it:

```bash
cd "$(git rev-parse --show-toplevel)/engine" && npm run bot:judge -- --kind attacks --seeds 1-3 --decks "Token Triumph,Grave Danger,World Shaper,Mardu Surge;Token Triumph,Grave Danger;The Ur-Dragon,Lathril,Atraxa,Giada"
```

`--kind payments | discards | attacks | blocks | removal`; `--base` as above.
`removal` is what a removal is aimed at and whether it is fired, judged two
of the decider's turns on (an engine shows later than a block); it shadows
each seat with the old build, so a game takes about twice as long. Add
`--to-end` to play each line to the end of the game and count who won, and
`--weights '{"tokenEngines":4}'` to judge evaluation weights without a build. Each deck
set (`;` between them) and seed is a game, played `--parallel` at a time
(default 6) and totalled at the bottom; a game is a few seconds to four
minutes. Each disagreement is played on by v2 and scored ("new better by 5.4
(own life +3, opponents' −4)"), and the total says how much, not only how
often: the net in evaluation points, gained and lost, the largest gap each
way, life, and the lines only one answer lived through. Report the net first.
That verdict is v2's own play and evaluation: trust it where the two lines
did the same things or one did more, and read the big gaps on their boards,
as above. On 2026-11-15 it stopped two changes the gate and the diff both
passed, and a third that made eleven of twelve changed attacks "no attack".
