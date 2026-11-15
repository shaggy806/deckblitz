# Bots: the next four steps

Status: **in progress** (written 2026-11-15; step 1 started the same day). The plan of record
for the bots is still `bot-effect-knowledge.md`; this is the order of work after the overnight
session of 2026-11-15, and why it isn't "give them more time".

## Why not more time

The user asked whether the bots should think longer. Not as things stand:

- **They don't use the time they have.** At the live clock (1 s a decision) four watched
  four-player games ran 40 to 60 turns in about 45 seconds of thinking for the whole table. A
  searched decision averaged 10 to 13 simulations and the most was about 70. The search stops
  on its own caps, or with nothing better left to try, long before the clock.
- **The misplays reproduce with no clock at all.** Every fault found that night was rebuilt as
  a gate scenario, which runs on simulation counts. Each was the model: life from lifelink
  blockers not counted, a token stack read as one blocker, a candidate (a batch) scored
  without a check its single moves get. A longer search over a wrong model returns the same
  answer.
- **Time costs.** Solo games run the bots in the browser on the player's machine, the slowest
  being a low-end laptop, and every second a bot thinks is a second the person at the table
  waits.

So the spare budget goes where a prediction is known to be wrong (step 1), not to a larger
limit. A longer budget was not measured that night; if it is ever tried, the yardstick is
`bot:benchmarks` and the gate at `--budget`, not a bench.

## 1. A rollout's defender blocks the way v2 does

**What is wrong.** Every simulated combat is played by v1 on every seat. v1's blocks are a
narrow policy: a block that kills and survives, a trade for a clearly better creature, a gang
block that pays, a free block, and chumps only until the damage left isn't lethal. v2's own
block search, asked for real, blocks differently. Three open items are this one gap:

- *Attackers sent into blocks v1 doesn't make.* Mentor of the Meek went in beside Emmara and
  died to a double block (BACKLOG, "An attack's blocks are predicted with v1's"). Only a wide
  attack is checked against real blocks, since 2026-11-15.
- *Blockers tapped away on the attacker's turn.* At 15 life in front of 16 power, Token Triumph
  tapped four of five lifelink Soldiers to Nullmage Shepherd. In the rollout the Soldiers left
  home blocked nothing (one chump keeps it alive either way), so tapping them was free
  (training scenario "does not tap its token blockers away in the attacker's main phase for a
  Sol Ring").
- *The wide attack's check is a special case* of checking any attack.

**The shape.** Not v1 made to block like v2 (its blocks are in every rollout of every decision,
and what it does there is deliberately cheap), and not v2's block search in every rollout (a
block search is some 24 simulations, inside each of an attack search's). Real blocks are asked
where a decision turns on them:

- **1a. The attack that was chosen is checked.** After the search, the chosen attack is scored
  once more with each defender seated as v2's block search (`simulateCombat`'s `seatFor`,
  `REAL_BLOCK_SIMULATIONS`). If that score holds up against the predicted one, nothing more is
  asked. If it doesn't, the attack with each attacker left out, and no attack, are scored the
  same way and the best of them is declared. The wide attack's own check folds into this.
- **1b. Our own blocks in a priority rollout.** On an opponent's turn, before blocks, with
  creatures of ours untapped and theirs able to attack, our seat in the rollout blocks with a
  small v2 block search instead of v1's blocks, so what a candidate taps or sacrifices is
  priced by the blocks it would have made.

**Measured by.** `bot:judge --kind attacks` on token and creature decks at two and four
players (each changed attack played on by v2 and scored), the training scenario above (a gate
scenario if it turns), the gate, a v2 decision diff, and the time a watched game takes at the
live clock before and after.

**Done when** the judged games show the changed attacks better on balance with none badly
worse, the training scenario passes, and a watched game's thinking time is not noticeably up.

## 2. Mana priced by v2's own turn planner

**What is wrong.** A rollout passes our own seat, so mana a choice spends looks free, and v1
is a poor stand-in for "what else would this mana do": three versions of "the rollout plays
our turn on as v1" were built on 2026-11-15 and dropped (`bot-effect-knowledge.md`, "What a
declined payment costs"). What shipped is a margin per mana on v1's declined payments. Left
open: v2's turn isn't steady in mana (one mana less once ended a turn 36 points better), and
the `"acting"` rollouts under-price it.

**The untried idea.** For a decision that spends mana before or during our own turn, score
each answer by the turn v2's planner then finds (`planTurn`), not by a rollout that passes.
The planner already searches lines of casts and activations across both main phases; asked
from the board each answer leaves, its best line's value is the price of the mana.

**Measured by.** `bot:judge --kind payments` on the strong decks (ten payment decisions a
game there, one in 12,000 on the sample decks), and `.scratch/judge/mana-steady.mjs` for the
turn's steadiness.

**Done when** the per-mana margin (`KEPT_PER_MANA`) can go, or the measurement says it can't.

## 3. Watched games, one archetype at a time

**Why.** An hour on one token deck found four faults. `bot:watch` plays a game at the live
clock in about a minute and prints every decision with how it was reached.

**How.** A pass per archetype the decks cover: tokens (done 2026-11-15), aristocrats and
sacrifice, spellslinger, voltron and equipment, reanimator, big-mana Dragons. For each: two or
three games, the losses read first from the last turns backwards. Each suspected misplay is
rebuilt on its exact board before it is called one (three of the first five logged were
judgment calls on their boards). **After a fix, the same seed is watched again**: a simplified
scenario went green on 2026-11-15 while the real board still made the play.

**Done when** each archetype has had a pass and what it found is fixed or in BACKLOG.

## 4. A screen for suspicious losses

**Why.** Reading is the bottleneck of step 3. Most games have nothing to find.

**What.** A script over self-play games (count budgets, so a seed replays) that records, for
each seat eliminated, what it did on its own last turn and in the windows after it: creatures
tapped for a cost, an attack that left fewer blockers home than the damage that killed it
needed, removal or a counterspell left in hand with the mana to cast it, life paid. It prints
the games worth reading with the seed and turn. `bot:crackback` already does this for attacks
alone and is the pattern.

**Done when** `bot:watch`'s reader can be pointed at a list of seeds and turns instead of
whole games.
