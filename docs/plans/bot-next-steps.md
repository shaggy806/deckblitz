# Bots: the next steps

Status: **in progress** (written 2026-11-15; steps 1, 2 and 4 built the same day, step 7,
which permanents to answer, measured (not by salt; a judge for removal targets is next), step 6, the
swing-back margin, measured and left as it is, and step 5,
added that day from the user, checked and its own-hand half built; step 3 open, now read
through step 4's screen). The
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

*1c, our own attack in our own turn's rollouts (explored 2026-11-27, off by default).* A move
that sets up an attack (an equip, a pump, a land for a commander) is scored by the attack the
rollout then makes, and on our own turn that is v1's, in the priority rollouts before attackers
are declared and in the turn plan's step through combat and its passing out. Kept game A2TMG-1
showed the cost: v1 held a menace Slicer home from a lone Etali at 20 commander damage, so the
Beamtown Beatstick equip that wins read as two mana for nothing (fixed in v1 itself the same
day). Built as an option, `rolloutAttacks: "v2"` (`RealAttacksController`: our attack by a
small v2 attack search, `REAL_ATTACK_SIMULATIONS` 24, `lightAttacks`: against v1's blocks with
none of 1a's checks; the turn plan's seat through `withOurAttackSeat`). Measured:

- **It finds the menace equip by itself.** With the v1 fix taken out, the live position passes
  under v1 rollouts and equips under v2 rollouts (513 ms against 343 ms for the decision).
- **The gate** passes either way (350 of 350), but takes 96 s against 29 s.
- **A decision diff** (six sample-deck games, count budgets): 78 of 12,114 decisions differ,
  where the day's other change made 10; the games took 28 minutes against about 12. Most
  changes are priority moves on our own turn. Tapping attackers for an effect is now held
  (Selesnya Evangel's token, seven times; Nullmage Shepherd tapping four, six) — the rollout
  attack now uses them. Lathliss, Dragon Queen's "+1/+0 until end of turn" is activated in the
  first main phase ten times where it passed, and five the other way: a pump before attackers
  are declared now shows in the rollout's attack, but a pump is better made once blocks are
  known, so this one is probably worse. The rest are one or two each, casts reordered.

Then, the same day, the three things it needed before it could be turned on:

- **A cache.** The rollout's attack is kept by the combat board for the rest of the decision
  (`combatBoardKey`: life, poison, commander damage, every creature as combat reads it), and its
  search cut to 12 simulations: the gate 96 s → 54 s (29 s without the option).
- **Pumps held until blocks**, in both modes (`controller.ts`'s `wastedNow`: an instant-speed
  pump of power and toughness alone, before blocks, with nothing to answer).
- **A judge for it**: `bot:judge --kind priority` (every move of the decider's own turn with
  nothing on the stack, the old side shadowing every decision), with `--options` for the new
  side and `--base self` for this build's defaults as the old.

**Judged and left off.** `--kind priority --base self --options '{"rolloutAttacks":"v2"}'` over
Token Triumph v Grave Danger, World Shaper v Mardu Surge and Edgar, Giada, Ureni and Pantlaza,
seeds 1-3 (9 games, 13 minutes): 40 moves changed, **4 better, 12 worse, 24 even**, net −791
points (−530 of it one turn), the decider's life −81 and its opponents' +3, and two lines out of
the game under the new move alone. The changes are not about attacks set up: Edgar Markov cast
Olivia's Wrath over Bloodthirsty Conqueror and fell to 2 life; Giada and Ureni were cast over
Archangel of Tithes and Ancient Copper Dragon and did worse. The likely reason, not checked: the
rollout's attack is searched against v1's blocks with none of 1a's checks, an optimistic
attack, so a move that clears or adds to the board reads as the swing it would make and nothing
of what comes back. The full search with 1a's checks in every rollout is too dear. So v1 stays
the rollout's attacker, and the menace gap is closed in v1 itself (2026-11-27).

**Three follow-ups the same evening**, each judged the same way over twelve games (the three deck
sets, seeds 1-4), beside a control (`{"rolloutAttacks":"v1"}` against `--base self`: 0 moves
differ, so every difference below is the option's):

- **Why Olivia's Wrath won**, rebuilt from the judged game (seed 3, turn 17, every seat on the
  option). Under v1's rollout neither line attacks and Bloodthirsty Conqueror leads by 1.8. Under
  v2's both attack, Conqueror's for 11 with lifelink, and the Wrath's line still comes out 1.6
  ahead: a v1 blocker of the third opponent's traded itself away into the attack (a kill the
  real table doesn't give), and the rollout ends as the next player's turn begins, so the swing
  back at a board that attacked is only the `threat` estimate. Played on, the bot took 28 that
  round. Generous blocks and no crackback, together.
- **`"v2-when-v1-holds"`**: v1's attack wherever it sends anything, the light search only where
  it would send nothing (the timid case the menace Slicer was). The gate as fast as v1 (29 s),
  the Olivia position Conqueror again, and the menace position (v1's fix taken out) equips.
  Judged: **24 moves changed, 4 better, 5 worse, 15 even, net −9.2 points**, own life −9,
  opponents' −22, one line out under each. Even, not better.
- **`"v2-full"`**: the whole attack search in the rollout, its answer checked against the
  defenders' own blocks and the swing back (1a). Eleven of the twelve games (the twelfth, the
  long four-player one, had run over an hour and was stopped): **35 changed, 7 better, 11 worse,
  17 even, net about −744**, two lines out under the new move alone, and the Olivia's Wrath turn
  as before (−530.6). The real blocks don't fix it; the crackback past the rollout's end is the
  larger part, and it costs far more.

So all three stay off, and `"v2-when-v1-holds"` is the one worth keeping in mind: cheap, it
catches the timid misses, and it judged level. What would change the verdict is a rollout that
sees the swing back after our attack (the turn passed on through the opponents' attacks, as the
tap guard's `simulateSwingBack` does), and that is a horizon question, not an attacker one.

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

**Widened, 2026-11-25**: to every choice of modes in our own turn, not only a payment, after a
kept game where bots under Fatespinner skipped their own main phase 42 times in 74 choices (the
rollout passing our seat saw nothing lost); and an answer that leaves no main phase is priced by
the turn played out without one. The same game's choices, asked again: Main 16, Draw 50.

**Left.** The planner never planned with a card in our library, so a card it may play from
there was invisible to this price: fixed 2026-11-16 for the top card the seat can see
(`unknownCards`, the gate's "pays a shock land's life to cast the spell it sees on top of
its library"; Oracle of Mul Daya, Augur of Autumn, Thundermane Dragon, Bolas's Citadel and
Conspicuous Snoop are in the bots' decks). The Ur-Dragon's bot left Stomping Ground tapped
where the old answer paid and then cast a Farseek that wasn't in its hand (old better by
7.1). That was guessed to be a card off the top of the library, and isn't: its list has
nothing that plays from there. Its cause is still to find (replay that game's turn). `KEPT_PER_MANA` stays for the decisions the plan can't price. And v2's turn
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

**Built, 2026-11-15** (`npm run bot:losses -w engine`, `engine/scripts/bot-losses.mjs`, a
process a game like the judge; taken before step 3 because it says where step 3 should look).
For each seat eliminated it prints the attack that killed it against the block arithmetic,
its own last turn, what it did after it, and its hand, and flags the loss when:

- **tapped away** / **attacked itself open**: with the creatures it had tapped for something
  other than an attack, or the ones it attacked with on its last turn, untapped, the
  arithmetic survives the attack;
- **blocks**: the arithmetic had it alive as it declared its blocks, and it died;
- **answer held**: it was offered a cast of removal, a wipe or damage prevention in the turn
  it died and still held the card (a counterspell counts only for a loss outside combat);
- **wipe unplayed**: a wipe it could cast on its own last turn, before dying to creatures;
- **life spent**: four life or more paid, lost to its own effects or dealt by its own
  sources since its last turn began, and more than it died by;
- **own turn**: it lost on its own turn.

The attack is read when the defender blocks, not when it is declared: the first run flagged
three losses in three games that were an attack trigger (Atarka's double strike, Kangee's
+2/+0, Drakuseth's damage) landing after the declaration. A flag is a reason to read, never
a verdict. Each flagged loss prints its `bot:watch` line: `--count` plays the same count
budgets (so the seed is the same game) and `--turns A-B` prints those turns alone, both new,
with `--snapshot-at N` to save the board a probe rebuilds the decision on.

**First run** (20 four-player games on the upgraded precons and the strong decks, about
five minutes a game at ten at a time; a Krenko game was stopped after half an hour): 60
losses, 14 flagged. Read on their boards:

- *Tapped away, a misplay, fixed.* Grave Danger, on 30 life with nine creatures tapped from
  its own attack, blocked Mardu Surge's tokens with its last three and then tapped those
  three to Cryptbreaker for a card. The next player sacrificed a 12/12 to Jarad and swung 20
  power into no blockers. The tap guard was asked in our own turn only; it is asked in every
  turn now, and `crackback` counts the players still to attack before we untap (the turn's
  player while its attack is to come, and those between it and us).
- *Blocks, a misplay, fixed.* Sultai Arisen, on 16 life, put all five blockers on 1/1
  Warrior tokens and let a 17/17 Yahenni through. v1's blocks are made for value first and
  chump with what is left, which was nothing; v2's climb starts from them, taking a block
  off is just as dead, and the wide block was tried only when it was more blocks than the
  ones that lost. v1 now moves the blocker stopping the least onto the attacker that kills
  it and chumps with the creature worth least; v2 tries the wide block whenever it differs.
- *Dead anyway, a judgment call, logged.* Sultai Arisen, dead on paper to Grave Danger's
  twelve tapped Zombies two turns on, took the kill on Grave Danger with everything
  (`alphaStrike`'s `deadAnyway`) and died to World Shaper's 45 power the turn after. Home, it
  survives World Shaper by arithmetic, World Shaper most likely kills Grave Danger itself,
  and two Jarad activations then finish World Shaper on 5. Seeing that takes an opponent's
  turn played out, not arithmetic. In BACKLOG.
- *Forced.* Grave Danger "lost on its own turn" attacking six creatures into Blood Artist at
  4 life: Kardur, Doomscourge had been recast, and its creatures had to attack.
- *Not misplays.* Two thin "attacked itself open" (an opponent's board tripled in the three
  turns between), the Y'shtola deck dying with a hand of counterspells and tutors (the list a
  bot can't pilot, already in BACKLOG), small life payments.

So two real faults in 20 games, both in under an hour of reading, against the four an hour of
whole-game reading found on one deck: the screen is the way into step 3.

**The same games on the fixed build** (18 of them, without the Krenko pod; 565 s at six at a
time): 54 losses, 10 flagged, and none of the ten a misplay by what the bot could know.
Four are the Y'shtola list dying with life spent and a full hand (the list a bot can't
pilot). Three are a board that grew in the turn it killed: Grave Danger tapped three Zombies
to Cryptbreaker in World Shaper's upkeep with 14 life to spare on the board as it stood, and
World Shaper then cast Moraug with three fetch lands for extra combats; two "blocks" were a
one-life margin on paper finished by a trigger. The rest are attacks made turns before the
board that punished them existed. What the arithmetic can't see is a hand: the growth margin
(`crackbackGrowth`) is one number for every opponent, whatever they hold or have shown.

**The flags sharpened on what those runs showed** (the same day). *Tapped away* counts only
creatures the seat's own spells, abilities and costs tapped (`permanent-tapped` events), not
ones that entered tapped (Victimize's two, a mobilize token) or that an opponent tapped.
*Blocks* asks that combat dealt more than the arithmetic allowed, so a death the rest of
which was a drain engine or a trigger is noted and not flagged. *Attacked itself open* is
read against the killer's board as it stood when the seat attacked: flagged when that board
was lethal through the blockers left home or within half again of it, and otherwise noted as
a board that grew (Reign of Dragons attacked into 26 power and died to 92). A game past
`--game-minutes` (15) is stopped and named, so one long game doesn't hold a batch.

**Fresh seeds** (4 to 6 on the same pods, 17 games; a Jeskai pod stopped at its time): 51
losses, 6 flagged before the last of those changes, 5 of them "attacked itself open". Read
with the board at the time of the attack, two were boards that grew, and the others were an
attack that killed a player and left the attacker a close call against the next (Token
Triumph killed Grave Danger with everything at 22 life, with 16 through from Abzan Armor's
board as it stood, and died to a Towering Titan that had grown to 30). No new misplay. So
after the two fixes the screen's rate is about one flag in ten losses, and what it flags is
mostly the bet an attack makes on an opponent's board not growing, which is a tuning
question (`crackbackGrowth`, `crackbackParanoia`) and not a fault to rebuild.

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
races when the next swing kills it either way; since 2026-11-16 it no longer taps out when
only a later player has it dead (`diesSooner`: the opponents it lives through with its
creatures home are read one at a time, `COMPLETED.md`). And whether the bots wipe for a
table's sake is unmeasured.

## 6. The swing-back margin

**Why.** After the two fixes, nearly every loss the screen flagged was one shape: a bot attacks
or taps with a margin that is safe on the board as it stands, and the board grows before it
untaps. The margin is one number for every opponent (`crackbackGrowth`, the damage through
times 1.5). The idea was to scale it by what each opponent could add: cards in hand, lands.

**Measured first, and the idea was wrong** (2026-11-15; `npm run bot:crackback -w engine --
--pool upgraded --games 96 --workers 8`, 94 games finishing, each swing now logging every
opponent's hand, lands, board power and what that opponent then dealt; `--pool upgraded` is
new, the bench seatings on each deck's upgraded build). 1,659 attack decisions, 1,189 that
sent something, 162 of those dead before untapping.

- *What an opponent holds predicts nothing.* When an opponent attacked, it dealt 5 or more
  over what its board projected in 21%, 17%, 20% and 21% of attacks at 0-1, 2-3, 4-6 and 7+
  cards in hand; 20%, 20%, 20% and 14% at 0-5, 6-8, 9-11 and 12+ lands. On average the
  projection is right (10.3 projected, 10.8 dealt). Nor does how much its board grew the
  round before (17% to 28%, in no order).
- *A haste enabler does.* An opponent showing one (Lightning Greaves, Swiftfoot Boots, Dragon
  Tempest, Arena of Glory, Crashing Drawbridge) went over by 5 or more in 33% of its attacks
  against 18%, dealing 11.8 for 8.9 projected.
- *The margin is not where the deaths are.* On the bot's own reading it was already dead
  whatever it held back at 173 decisions, and 76% of those died whether it then sent
  everything (73%), some (77%) or nothing (77%): racing costs nothing there. Where the
  reading was safe after what it sent, 4.5% of full swings died, 9.5% of partial ones and
  7.4% of the turns it sent nothing: a full swing that passes the check dies less often than
  staying home does. Of the 93 that died out of a safe reading, 46 took more from one
  opponent than that opponent's whole board had in power at the swing, 21 took damage past
  blockers that were gone by then, 19 were chipped by several, 7 were drained.
- *What a stricter rule would buy,* read back over the logged swings: doubling the damage
  through instead of half again calls 12 more of the deaths unsafe and 84 more swings that
  lived; 2 a castable card, 9 and 51; 8 for an opponent showing a haste enabler, 10 and 15
  (4: 5 and 5; 10: no more than 8).

**Tried: the enabler alone, and not shipped.** Each opponent showing a haste enabler added 8
to the grown reading, weighted as the rest of its swing is (a weight, `crackbackHaste`, a
`showsHasteEnabler` in `combat-math.ts`; built, tested, and taken out again). Judged by
`bot:judge --kind attacks` against the build without it: 11 games on three pods changed one
attack, and the 16 games in which the log says the rule changes a verdict changed eleven
more. Of the twelve: two better for it (one a death avoided, one by 6.5 points), five worse
(one a death caused: it called off Atarka's attack that killed a player, and the bot died
anyway; the others by 9.3, 3.5, 2.0 and 2.0 points, each an attack not made), five even
(three of them out of the game either way). A death for a death, and 6.5 points for 16.8.

**What the count read back over a log can't say** is what the attack not made costs, and the
log itself says it: a full swing that passes the check dies less often than a turn spent at
home. The read-back counted ten deaths "caught"; played out, the bot that stayed home died as
often and its opponents kept their life. So the margin stays as it is, and the lesson is for
the next idea of this kind: a rule that forbids attacks is judged by playing its changed
decisions on, not by counting the deaths behind the attacks it would have forbidden.

**What the measurement does point at.** Half the eliminations (131 of about 250) were dead on
the bot's own reading at their last attack decision whatever they did: lost earlier, on the
board. And of the deaths out of a safe reading, half were one opponent dealing more than its
whole board had in power a turn before: an engine already on the battlefield (Lathliss and
her tokens, Eshki's counters, Titania's Elementals, a Towering Titan), not a hand. That is a
question about which permanents the bots answer and when, not about how they attack. In
BACKLOG.

## 7. Which permanents to answer: salt, labels, or what the card does

**The question** (the user, 2026-11-15, after step 6): the deaths out of a safe reading come
from an engine already in play, so which permanents should a bot answer, and can a number we
already have say so? The user's hope was EDHREC's salt score; the fallback was labelling
cards by hand as threats.

**Measured** (`npm run bot:engines -w engine`, new: `engine/scripts/bot-engines.mjs` logs,
`bot-engines-report.mjs` reads). Every turn a player takes is logged with the cards it had in
play as the turn began, which is what the table had a round to answer, beside what the turn
then *brought past its board*: the more of the damage it dealt and the power it ended with,
less the power it began with (capped at 40; a turn of 15 or more is a "big turn"). Every
removal a bot aims at an opponent's card is logged with what else was there. 93 games on the
upgraded precons (3,062 turns) and 45 on the strong decks (1,523 turns).

- *Salt does not sort the cards.* Counting a board's cards by salt band, on the strong
  decks, where the salty cards are, one more card adds 1.5%, 1.3%, 1.1% and 0.8% to the
  chance of a big turn at salt up to 0.3, to 0.6, to 1.0 and over 1.0: nothing, and the
  wrong way round. Toward winning the game it is 7.5%, 7.2%, 0.9% and 8.0%: a card is a
  card. On the precons the middle of the range looks better (2.0%, 6.9%, 9.1%, then 1.5%
  over 1.0), which is where precon commanders and their engines happen to sit (Teval 0.70,
  Moraug 0.70, Lathliss 0.41). Card by card, salt orders the measured cards against their
  lift at 0.11 and 0.24 (Spearman; 1 is the same order), EDHREC rank at -0.05 and -0.11.
  Salt is what players resent (Rhystic Study 2.82, Smothering Tithe 2.62, Sol Ring 1.59),
  and what they resent is mostly cards and mana, not the turn that kills them.
- *The bots' own `engineScore` does no better* (0.06 and 0.13): it reads draws, tokens and
  drains, and the draw engines it rates highest come before no big turn at all.
- *What does mark a card: it is the commander, and then that it makes tokens.* Strong decks:
  one more commander in play adds 7.4% to the chance of a big turn and 3.2 to what a turn
  brings, a token maker 5.6% and 1.6, anything else under 2%, a draw engine -3.5%. Card by
  card the commanders are the top of the table in both pools: a big turn on 71% of Ureni's
  turns with Ureni in play against 27% without, Pantlaza 36% against 2%, Krenko 22% against
  2%, Teval 44% against 15%, Lathliss 36% against 9%, Szarel 35% against 12%. Both marks are
  read off the game and the definition, with no label and no table.
- *None of it says much.* Sorting by what the card does explains 20% of what a strong
  deck's turn brings and 8.5% of a precon's (salt's bands 18% and 9.7%), hardly more than
  counting cards (17.6% and 8.2%). Most of a big turn is what is cast that turn onto a board
  that is simply larger.
- *The bots already aim at these.* Of 484 and 255 removals (5.2 and 5.7 a game: about one
  and a third a bot), a commander was taken 0.33 and 0.30 times for each one there to take,
  a token maker 0.26 and 0.27, a plain card 0.12 and 0.16. Their aim is blind to salt
  (taken 0.41 against 0.39 at random on the precons; 0.73 against 0.67 on the strong decks).

**What it means for labels.** A table of threats made by hand can't be checked this way: in
a singleton format 93 games measure 69 cards well enough to rank, and the lift of any one
card is within its own noise. So a hand label would be a judgment, and the test of it is not
this log but the games a bot plays aiming by it. The same goes for salt as a design choice
(bots that kill what players expect to see killed), which this measurement neither supports
as strength nor rules out as feel.

**The instrument, built** (the user: "Build the judge first, we can ignore bot feel for
now"). `bot:judge --kind removal`: every window where either build casts or activates
something that destroys, exiles, bounces, burns or steals at an opponent's permanent, or
picks such a target for a trigger. Each seat is shadowed by a second controller of the old
build, shown every decision the seat makes, so both sides have a turn's plan in hand (asked
afresh at each window instead, half the removals went unjudged: one cast as a step of a
planned turn was never the fresh answer). A build shadowing itself agrees at every decision
(checked: a strong-deck game, 0 of its removal decisions differing). A disagreement is
played on to the decider's turn two rounds on (`--rounds`), since an engine shows later than
a block does, and with `--to-end` to the end of the game as well, counting who won: the
evaluation that judges is the one that aims the removal today, so the plain counts and the
wins are the reading that isn't circular. `--weights JSON` puts evaluation weights on the
new side alone, so a weight is judged without a build of its own. A game takes about twice
as long as the other kinds' (the shadow thinks too), and a game raises few removal decisions
(two to six), so a rule needs dozens of games to say anything.

**The rule judged, 2026-11-16: not kept as it stands.** "Weigh an opponent's commander and
its token makers more when a removal picks among targets" was built two ways and judged with
`--weights '{"opposingCommander":5,"opposingTokenEngines":4}' --to-end`.

- *As terms of the evaluation* (21 games): better each of the five times it only changed
  which permanent a removal took, worse both times it fired a removal in place of developing.
  So the premium was moved out of the evaluation.
- *On the aim alone* (`bot/aim.ts`: added only where one removal chooses among its own
  targets; 23 games on five pods before it was stopped, about 0.75 changed aims a game): 17
  changed aims, **3 better, 4 worse, 10 even**. Played to the end, the decider won under the
  new aim and not the old twice, and under the old and not the new twice.

| the new aim | changed | better | worse | even |
|---|---|---|---|---|
| an opponent's commander | 12 | 2 (8.0; the old aim out of the game) | 4 (2.1, 11.1, 189.8; the new aim out of the game) | 6 |
| a token maker that isn't one | 4 | 1 (39.1) | 0 | 3 |
| neither (the two builds' own noise) | 1 | 0 | 0 | 1 |

The commander half is the one that fails, and the largest loss says why: Tear Asunder exiled
Teval, the Balanced Scale where the old aim exiled River Kelpie. A commander removed goes to
the command zone and comes back for two more mana (rules 903.9a, 903.8), so a removal spent on it
buys a turn or two, where the same removal on an engine that isn't the commander is for
good. What the log measured (a commander in play comes before big turns) is true and doesn't
make it the right target. The token-maker half has four cases, too few to say.

**Next:** token makers alone (`{"opposingTokenEngines":4}`), over enough games to have a few
dozen changed aims; and for commanders, only removal that keeps one away (a tuck, a theft, an
Aura that locks it down), if anything. The weights stay 0 until a run says otherwise.
