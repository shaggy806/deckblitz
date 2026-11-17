# Rules audit, November 2026

Status: **two slices done** (2026-11-17). The first (players who leave the game, combat, the
turn's skip rules) found three violations, fixed, and a fourth recorded for a design call. The
second (casting, resolving, how a multiplayer game goes on) found none in the engine and one in
the client's log wording. Thirty-four probes stay as tests. The slices to take next are at the
end.

## Why

On 2026-11-17 the user read a live four-player game's log and found three double-striking
attackers dealing their second strike to a player their first strike had already killed. Rule
800.4e forbids it, and the engine had never implemented it. The user asked whether it is worth
reading through the rules for more like it. It is, but not cover to cover: the engine is 70,000
lines against a 9,000-line rulebook, and most of it is tested rule by rule. The places worth
looking are the ones the tests don't reach by themselves: what happens once a player is gone
(nearly every test is two-player), and turn structure nobody writes a test for because nothing
seems to happen in it.

## Method

1. **Uncited rules are the leads.** `npm run rules:uncited -w engine -- 506 508 800` lists the
   rules of those sections whose number appears nowhere in `engine/src` outside the card pool
   and the tests; `-- --all` gives cited over total for every section. Uncited is a lead, not a
   verdict: 508.8 was uncited and missing, 506.4b was uncited and right.
2. **Triage** each lead: a variant the engine doesn't play, implemented without the citation,
   or a suspected gap.
3. **Probe** a suspected gap with a small test on `engine/src/test/harness.ts` before reading
   much code. A probe that passes stays as a test; one that fails is the bug's test.
4. **Read the user's logs.** 508.8 was in the same exported log, on a turn with no attack: the
   log is every event, so a step that shouldn't exist is a line in it.

## What was found

| Rule | What was wrong | Fix |
| --- | --- | --- |
| 800.4e | Combat damage was assigned to a player who had left the game: a double striker's second strike, a creature without first strike beside it, trample over a blocker. Lifelink and damage triggers fired a second time. | `Game.combatDamageAssignments` drops it. `combat-damage-player-left.test.ts`. |
| 508.8 | A combat with no attacker still played its declare blockers and combat damage steps, a round of priority each. | The step after declare attackers is end of combat when nothing attacked (`nothingAttackedThisCombat`: none declared this combat phase, by the journal, and none attacking now). `combat-no-attackers.test.ts`. |
| 506.8f | Follows from 508.8: "cast only during combat after blockers are declared" is authored as the declare blockers step and the two after it, so it would have been castable in the end of combat step of a combat with no blockers declared. | The `turn-structure` condition refuses it there. Same test file (Chaotic Strike). |

Three older tests encoded the old step flow and were brought to the rule (`game.test.ts`,
`cmdr-ruric-thar.test.ts`, `additional-upkeep-steps.test.ts`).

**Found and recorded, not fixed: 603.6c.** Leaves-the-battlefield abilities trigger "when a
phased-in permanent leaves the game because its owner leaves the game", and another player's
"whenever another creature leaves the battlefield" (Extractor Demon) doesn't trigger for what a
departing player owned. `Game.leaveGame` leaves those permanents on the board, inert, and
announces nothing. It needs a design call about how they are represented, not a patch;
`docs/engine-gaps.md` has the reproduction and an outline, `BACKLOG.md` the line.

## What was probed and is sound

Kept as tests in `player-left-audit.test.ts` and `combat-rules-audit.test.ts`.

A player who has left the game (104.5, 800.4): is no opponent for "each opponent" damage or
life loss; draws nothing when each player draws; can't be targeted or attacked; a spell aimed at
them before they left does nothing; an attack already declared at them deals nothing; an attack
trigger aimed at the player attacked (Hellrider) does nothing; a trampler blocked by their
creature deals them nothing; their Aura leaves another player's creature and a creature they
had taken with Control Magic goes home; another player's Aura on their creature goes to its
owner's graveyard; "until this leaves the battlefield" ends and the exiled card returns;
"whenever a player loses the game" triggers for a concession and for life running out (603.9).

Combat: a blocker tapped after it blocks still deals and takes damage, and an attacker untapped
after it attacks is still attacking (506.4b); a blocked attacker whose blocker is gone deals
nothing to the player (509.1h, 510.1c); an attacker that changes controller leaves combat (506.4); a
creature put onto the battlefield attacking doesn't trigger "whenever a creature attacks"
(508.2a, Hero of Bladehold beside Hellrider); one put there "attacking that opponent" after
that opponent has left enters and attacks nobody (506.3c, Kaalia of the Vast), while one with no
player named goes at an opponent still in the game (508.4, Hero of Bladehold's Soldiers).

Settled by reading: a band can't be declared at different defenders (802.3b,
`combat/banding.ts`); a battle whose protector has left the game is covered by
`battles.test.ts` (704.5x-y).

Already cited and implemented, read but not probed again: 800.4a-d, 800.4i-m, 725.4, 726.4,
103.5c and 103.8 (the multiplayer mulligan and first draw, which 800.6 and 800.7 restate).

## Second slice: casting, resolving, and how a game goes on (same day)

No new violation. The uncited rules of 601, 602, 605, 608 and 614-616 are nearly all definitions
or restate a sibling the source does cite (602.5a is 302.6; 903.5d is implemented through 305.6
in `identity.ts`; 119.8 and 614.7a are cited or written out). So the slice probed behaviour
instead, where a two-player test suite looks least. All of it holds, and the probes stay:

- `multiplayer-flow-audit.test.ts`: a player lost during their own turn (the turn finishes
  without them, the next player gets theirs: 800.4j); the attacking player lost in their own
  combat; two players lost together leaving a winner; every player lost at once, a draw (104.4a).
- `combat-rules-audit.test.ts`, three more: a double-striking trampler whose blocker died to its
  first strike sends the second strike all at the player (702.19e); a blocked double striker
  without trample deals nothing more (510.1c); a creature given first strike after the first
  damage step still deals its damage in the second (510.4).
- `stack-and-sba-audit.test.ts`: a spell whose only target is gone does nothing, its card draw
  included (608.2b); a creature taken this turn can't attack (302.6); an empty library loses
  nothing until a draw from it (104.3c, 704.5b); the legend rule's choice (704.5j); +1/+1 and
  -1/-1 counters going together (704.5q); triggers of two players stacked active player first
  (603.3b).

**The exported log, read by script.** Life totals follow from one line to the next throughout;
nothing happens to a player after they lose but the second strikes 800.4e fixed; no player is
given priority in an untap or cleanup step; every turn's steps are in order, with the two extra
combat steps on each of the eighteen turns nobody attacked (508.8). What the scan did find is the
client's: 27 of the engine's 207 event types had no sentence and printed as their JSON, fixed in
`client/src/format.ts` with a switch the build now checks is exhaustive.

## Known and not modeled

- **800.4f-h**: a player who has left being asked to pay or choose. `Game.whyCannotConcede`
  refuses a concession from a player who owes a decision, and the server answers it for them
  first, so the case doesn't arise by conceding. A player *losing* while they owe a decision
  (state-based, with a choice of theirs still open) is the path left; `BACKLOG.md`, "Engine
  rules gaps".
- **Variants the engine doesn't play**: limited range of influence (801), attack left and right
  (803), deploy creatures (804), shared team turns (805), Two-Headed Giant (810), Emperor (809),
  Grand Melee (807), Planechase (901), Archenemy (904), ante (407, 800.4n), Brawl and Commander
  Draft (903.12-13). Their rules are uncited by design.

## Leads not followed yet

Uncited, plausible, and not probed, in the order I'd take them:

- **506.3d**: a creature put onto the battlefield attacking during the declare blockers step or
  later is unblocked (ninjutsu's usual case is tested; the general one isn't).
- **104.3f**: a player who would win and lose at once loses.
- **704.5r, 704.5t**: counter caps; a completed dungeon leaving the command zone.
- **603.2g**: an event that was prevented or replaced triggers nothing.

## Next slices

By how far the citations fall short and how much play runs through them (`rules:uncited --
--all`):

1. **More logs, first.** Both violations that mattered came out of one exported log, not out
   of the rulebook: a log is every event, so a step, a trigger or a hit that shouldn't be there
   is a line in it. A log with every hand revealed (BACKLOG, Client / UI) would show more. The
   scans used here are a few lines each: life arithmetic, events after a loss, each turn's steps.
2. **702**, keywords: 496 of 771 cited. Long, and each keyword has its own test file; take the
   uncited subrules of the twenty most-played keywords first, probing interactions between two
   keywords rather than one alone.
3. **903**, Commander: 18 of 49, a third of the rest being Brawl and Draft. Merged and melded
   commanders (903.3c, 903.9c) are the uncited ones with behaviour.
4. **614-616** by interaction: two replacement effects on one event, with the affected player's
   choice (616.1a-g). The single-effect cases are cited and tested.
5. **601-608** has little left: its uncited rules were read in the second slice.
