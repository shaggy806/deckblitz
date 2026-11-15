# Bots: the next steps

Status: **in progress** (written 2026-11-15; steps 1 and 2 built the same day, and step 5,
added that day from the user, checked and its own-hand half built; steps 3 and 4 open). The
plan of record
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

**Built, 2026-11-15.** Both parts, as `RealBlocksController` (v1's rollout stand-in whose
blocks are v2's block search at `REAL_BLOCK_SIMULATIONS`).

*1a took three versions, each judged.* Seating a whole v2 at each defender made eleven of
twelve changed attacks "no attack": it also casts and activates in the combat it is given,
which an attack pays for and no attack doesn't. Seating only its blocks was no better (eleven
changed: three better, three worse): the attack's own choices were still v1's, so
Glorybringer's exert went elsewhere, a 2/5 flyer blocked it for nothing, and an attack the
real table let through for 4 was called off. With our own seat deciding what its attack asks
of it too (`selfInRollouts`), 21 games (seven deck sets, three seeds, 225 attack declarations)
changed 20 attacks: **net +194 evaluation points** (274 gained, 80 lost; best +142, worst −51),
the decider's own life +48 and its opponents' +3 in total. Nearly every change sends fewer
attackers. The largest gain and the two largest losses are one turn (Moraug's three combats
at one table, +71 between them), where the judge's own play is the noise: after the new
answer its seat cast nothing for the rest of the turn, after the old one three spells.
(Looked at the same day: replayed on the later build the Moraug turn comes on turn 12, and
played on from no attack and from its attack the seat does the same things and passes its
second main phase the same way. Nothing held and never cast there; the old position itself
wasn't rebuilt, so that its three spells came off what the attack drew is a guess.) One
changed attack ended with the bot out of the game where the old
answer lived: a 2/2 Zombie kept home in a four-player round where the player it would have
hit finished on 1 life and killed it. Counted apart, and not a pattern.

*1b turned its scenario:* "does not tap its token blockers away in the attacker's main phase
for a Sol Ring" is a gate scenario now (253 of 253).

*Cost.* At the live clock, the same three seeds watched before and after: a creature-heavy
four-player pod 31 s to 44 s of thinking over 33 turns, the strong decks 28 s to 29 s over
61, a two-player game 19 s to 23 s over 27. A v2 decision diff on the sample decks: 8 of
13,090 decisions, all attack declarations.

*Left of step 1.* The climb itself still scores every candidate against v1's blocks; only its
answer is checked, against that answer less one attacker and no attack. No gate scenario
holds 1a (a board where v1's blocks and v2's differ wasn't found by hand): the judge is its
measure. And a rollout's *attacker* is still v1 everywhere.

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

**Built, 2026-11-15** (`EvalBotController.byTheTurnItLeaves`, `turn-plan.ts`'s
`restOfTurnValue`). For an optional payment asked in our own turn before or in a main phase
(a "you may pay", an echo, Mana Vault's upkeep), and for a shock land's 2 life, each answer is
resolved and then priced by the better of passing the turn out and the best line `planTurn`
finds from the board it leaves, never with a card that was in our library when the question
was asked. No margin there, and a shock land is no longer v1's call outright. Elsewhere (an
opponent's turn, our combat, the plan switched off) v1's answer and the margin stand.

Judged on the strong decks, 16 four-player games (two tables, seeds 1 to 8), each changed
payment played on by v2 to the end of the turn: **47 of 179 payment decisions changed, 31
better, 10 worse, 6 even, net +165 evaluation points** (231 gained, 66 lost; best +86, worst
−17.5). Optional payments alone, before shock lands were added, were 14 changed and +8 over
the first eight games: the gain is mostly the shock lands, paid now when the turn has a use
for the mana (Y'shtola's bot paid, again and again, on lands v1 had brought in tapped) and
not when it doesn't. The best single change is an extort paid that finished a player on 4 life. The
worst is one of four identical Smothering Tithe triggers in one draw step, three of which
came out better by 1.7: the judge's noise.

**Left.** The planner never plans with a card in our library, so a card it may play from
there is invisible to this price. The Ur-Dragon's bot left Stomping Ground tapped where the
old answer paid and then cast a Farseek that wasn't in its hand (old better by 7.1; off the
top of the library by the look of it, not checked). `KEPT_PER_MANA` stays for the decisions the plan can't price. And v2's turn
still isn't steady in mana.

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

## 5. Playing to its outs

The user, 2026-11-15: "check whether or not the bots play to their outs. If they are dead to
a player's giant board is there a chance someone else casts a board wipe? If so it might be
best to plan for that rather than to put more stuff on board that can't save them."

**What the bot does today.** It knows "dead whatever I do" in two places, and in both it
stops being careful: an attack drops the crackback constraint and races (`deadAnyway`), and
the tap guard stands down (`crackbackGuard`). Nowhere does it ask what would have to happen
for it to live, or play as though that happens. Its rollouts end with its own turn, so a board
it can't beat scores the same whether it holds three creatures or casts them.

**To check first** (nothing is built):

- How often it comes up: over self-play, the turns a seat ends dead to one opponent's board
  by the block arithmetic, and how many it survived anyway and why (a wipe by a third player,
  the big board attacking someone else, its own draw). Step 4's screen is the tool.
- What it does there: a scenario with a hand of creatures that can't block enough, at a
  table where another player could wipe. Does it dump the hand?
- What "an out" is, in order of how knowable: its own draw (a wipe, a fog, a lifegain swing
  left in its library); the threatening player choosing another target (at four players the
  crackback already counts a non-next opponent at `crackbackParanoia`); another player's
  wipe (their open mana and hand size are public, their deck's wipes are not, though a bot
  seat's list is known to the engine and must not be read: hidden information).

**The shape to try**, if the check says it matters: when the block arithmetic says dead to a
board and no line of its own changes that, score its candidates as though the board is wiped
before it untaps (what it kept in hand is what it rebuilds with, what it put on the
battlefield is gone), weighted by a chance that grows with the players still able to act and
their open mana. Holding creatures then beats casting ones that can't save it, and a play
that does save it (its own wipe, a chump that buys a turn) still wins outright.

**Done when** the check has numbers, and either a scenario gates the behaviour or the numbers
say it is too rare to build for.

**Checked, 2026-11-15** (`npm run bot:outs -w engine`, new: every turn a seat ends dead to one
opponent's creatures whatever it blocks with, followed to its next turn). Over 24 four-player
games on the upgraded precons and the strong decks, 1,025 turns ended and **58 (6%) were dead
on the board**. What happened next:

| | turns | |
|---|---|---|
| died | 46 | 79% |
| not attacked (the board went elsewhere, or nowhere) | 8 | 14% |
| attacked, lived | 3 | 5% |
| that board cut down by someone before it untapped | 1 | 2% |

So at a table of bots **another player's wipe is not an out worth planning for**: once in 58.
The out that comes is the big board choosing someone else, and nothing a seat casts changes
that. On 30 of the 58 the seat had cast a creature that turn, and 81% of those creatures were
still there a round later: holding them back would have saved little. (Bots may also wipe too
rarely on another player's behalf; a third player held a wipe on 12 of the 58 and the seat
died on 8 of them. Not looked at.)

**What was real is the seat's own out.** On 12 of the 58 it ended the turn with a wipe in its
own hand, and died on 8. Most couldn't be cast (one to three lands, after a land wipe). One
could and wasn't: First Flight at 10 life, ten lands, Aetherize in hand, cast three creatures
that couldn't save it and died with one land open. Rebuilt, it does the same; with the mana
open it casts Aetherize as the attackers are declared and lives. The block arithmetic knows
only creatures, so "dead either way" meant race and tap out.

**Built: the outs guard.** Dead on the board whatever stays home, holding an instant or a
flash card, the bot plays the swing back (`survivesSwing`): the opponents whose creatures
alone have it dead attack it with everything, the others play v1's combat, and its own seat,
once attackers are declared at it, casts the spell in hand that leaves it alive, if one does
(`AnsweringSeat`). If passing lives through that, the out exists, and a cast or activation
after which it doesn't is unsafe, the way a tap into the crackback is (`tapGuard.outs`, the
same check on a planned line's every step). Gate scenario "holds the mana for Aetherize when
the board has it dead without it" (red with the guard off: one land open). The first version
seated a whole v2 on the opponents' turns and took 21 seconds over that scenario's one turn;
the answerer that tries each spell once takes 1.4. And the first run of `bot:outs` with the
guard in showed a turn where the bot now cast nothing and died as before: the guard had
remembered a swing back by the state it started from, and the live game's state is one object
changed in place, so turn 34's "passing lives" was read back on turn 37. A decision's swing
backs are now its own (`bot-outs-guard.test.ts`). Nothing else in the bot may key a memo on
`view.state` across decisions.

*Measured again with the guard in*, the same 24 games: the First Flight turn is the one that
changes (it casts two creatures, keeps four lands, Aetherize returns seven attackers and it
lives), 45 deaths for 46, and the games take the same time (474 s for 468 s). A rare
position, then, played right when it comes.

**Left of step 5.** The answer is a spell from hand at the declaration of attackers: not an
activated ability on the battlefield (a fog engine, a sacrifice outlet), not a counterspell
held for a pump. A sorcery-speed out on its own turn (its own wipe over a board of nineteen
creatures: Grave Danger cast Crippling Fear instead of Necromantic Selection and died) is the
evaluation's call and didn't reproduce on a small board. An attack, dead on the board, still
races. And whether the bots wipe for a table's sake is unmeasured.
