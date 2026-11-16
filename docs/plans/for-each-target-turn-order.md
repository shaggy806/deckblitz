# Targets handled in turn order, each group ordered as it resolves

**Status:** done (2026-11-16). Built for Soulfire Eruption (author-top-cards batch 333, approved as a
major feature that day), with Kaboom! as the second proving card. Code: `for-each-target`'s
`turnOrder` and `ownThisWay` (`engine/src/effects.ts`, `applyForEachTargetInTurn`), the
`choose-permanent-or-player` decision's `pickOnly` raise (`ResolutionContext.pickNextTarget`,
`Game.applyChoosePermanentOrPlayer`); tests in `engine/src/test/for-each-target-turn-order.test.ts`.

## The rules

Soulfire Eruption: "Choose any number of target creatures, planeswalkers, and/or players. For each
of them, exile the top card of your library, then Soulfire Eruption deals damage equal to that
card's mana value to that permanent or player." Its ruling (Kaboom! carries the same one):

> those targets will be handled one at a time in turn order. Start with targets that are either the
> player whose turn it is (probably you) or permanents that player controls. You choose the
> relative order of targets within that group. For whichever target you select first, exile the
> top card of your library, then Soulfire Eruption deals damage to that target. Repeat this process
> for each subsequent target in the group. After that group is done, move on to targets that are
> either the next player in turn order or permanents they control.

and a second ruling: with the top of your library revealed (Courser of Kruphix), "you'll see which
card is on top of your library before selecting from among the targets in each group".

The rule behind it is **608.2f**: an action on several players and objects that can't be processed
simultaneously is processed one at a time, "APNAP order is used to make the primary determination
of the order of those actions. Secondarily, if the action is to be taken on both a player and an
object they control or on multiple objects controlled by the same player, the player who controls
the resolving spell or ability chooses the relative order of those actions." The choice is one
made as the spell resolves (**608.2d**), and the second ruling makes it a choice made *each time*,
after the target before it is done, not one ordering announced up front.

## What was there

`for-each-target` already ran its members one at a time as a `sequence` of `for-target` steps, in
target order — except a group of players alone, sorted APNAP (101.4, Priest of Forgotten Gods), and
villainous choices, sorted by controller (701.55d). The per-target exile and damage existed
(Daredevil's `impulse-exile` then a `thisWay: "exiled"` mana-value sum; Erratic Explosion's
`reveal-until` binding the card found). Three things were missing:

1. groups by player in APNAP order when players and permanents are mixed;
2. the controller's pick within a group, as it resolves, after each member;
3. "that card" meaning this member's card alone: "this way" spans the whole resolution, so the
   second target's sum would read both cards.

## The shape

**`turnOrder: true`** on `for-each-target`. Each member goes in its player's group: a player in
their own, a permanent (or spell) in its controller's as the resolution begins (`controllerOf`).
The groups go from the active player in turn order (`playersInScope("each-player")`, APNAP — the
*active* player, not the caster, as the ruling says). A group of one runs; in a group of two or
more the controller picks the next member, it runs, and the controller picks again among the rest.

The loop is a `progress`-carrying effect, the pattern `repeat`, `each-player-may` and `guess`
already use: `progress.groups` is the members left (target indices), and the effect parks itself
through `resumeAfterDecisions` whenever a member's own effect stops to ask (Kaboom!'s "in any order"
bottom placement) or the controller is asked to pick. Parking keeps the whole resolution context —
targets, illegal targets, X, last-known refs — so nothing is rebuilt.

**The pick reuses `choose-permanent-or-player`**, the decision that already asks a player to click
one of a list of permanents and players (Comet, Stellar Pup). Its awaiting gains `pickOnly: { slot
}`: raised by `ResolutionContext.pickNextTarget` over the group's own targets, its answer is only
recorded — the `permanent-or-player-chosen` event, which the log already prints as "Alice chooses
Bob for Soulfire Eruption" — and the parked effect reads it back from the events since it asked
(`targetPickedSince`), as `each-player-may` reads its players' answers. `then` is kept for the
offer's side (its `polarity`, read at `slot`), never applied. So: no new decision kind, no new
`GameState` field, the offer's shape unchanged, and the client's existing click-a-permanent-or-
player banner serves it as it is.

A new kind (an "order these" list, like `order-triggers`) was the alternative and was rejected: an
order given up front is not what the second ruling describes, and the one-at-a-time pick is exactly
"for whichever target you select first … repeat".

**`ownThisWay: true`** gives each member's turn its own "this way", as a `repeat`'s pass has
(`scopeThisWay`), and restores the resolution's own start when the last member is done, so anything
after the loop reads every member's doing. It's separate from `turnOrder` because they're separate
facts: Kaboom! needs the order but reads its card through `reveal-until`'s binding; a card could
need its own "this way" per target with no ordering ruling.

Both are opt-in. 608.2f applies to any action that "can't be processed simultaneously", but for
almost every non-`simultaneous` `for-each-target` in the pool (pumps, taps, counters, keywords) the
order can't be seen, and asking would be noise; target order (the caster's, made as they targeted)
stands in for the secondary choice there. `turnOrder` is for a card whose members can tell the
order apart — each reads the library, or learns something the next pick could use — and the card's
rulings say so.

## The bots

The pick is a `choose-permanent-or-player` offer like Comet's, so both bots answer it as they
already do: v1's `defaultPermanentOrPlayer` (for harm, the opponent with the least life first,
then an opponent's permanent), v2's search over the module's `candidates` (ranked for the effect's
side — harm here — then judged by playout), the fuzzer's `randomAnswer`. Nothing new: with the
library hidden the order rarely matters, and when the top is known (Courser) v2's playouts see the
damage each order deals.

## What it leaves out

- 608.2f for the rest of the pool's non-simultaneous `for-each-target`s: their default order stays
  (APNAP for players alone, target order otherwise). A card whose members can see each other's
  results (a connive per target, say) and whose ruling orders them should take `turnOrder`.
- A member that left mid-loop is still offered and handled (its effect finds nothing to act on).
  Neither proving card can make one leave mid-resolution: nothing happens between the damage (the
  third ruling), and state-based actions wait for the resolution to end.
- No scaffolder template: each card's line is its own in the Oracle snapshot.
