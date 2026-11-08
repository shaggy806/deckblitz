import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 2399.
//
// Rulings:
//   [2020-09-25] If the second mode is chosen and each creature the target player controls has
//     negative power, that player doesn't gain or lose life.
//   [2020-09-25] If more than one mode is chosen, perform them in the order written. Nothing can
//     happen in between, however, and no player may choose to take actions. Any abilities that
//     trigger will be put onto the stack after the spell has finished resolving.
//   [2020-09-25] If either target creature is an illegal target as Inscription of Abundance
//     resolves with its last mode chosen, no creature will deal or be dealt damage.
//   [2020-09-25] If you kick Inscription of Abundance, you can't choose any one mode more than
//     once.
//   [2020-09-25] If any targets become illegal, the other targets will still be affected as
//     appropriate.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

export default defineCard({
  name: "Inscription of Abundance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {2}{G}\nChoose one. If this spell was kicked, choose any number instead.\n• Put two +1/+1 counters on target creature.\n• Target player gains X life, where X is the greatest power among creatures they control.\n• Target creature you control fights target creature you don't control.",
  // TODO(scaffold): Kicker {2}{G} Choose one.
  // TODO(scaffold): If ~ was kicked, choose any number instead.
  // TODO(scaffold): • Put two +1/+1 counters on target creature.
  // TODO(scaffold): • Target player gains X life, where X is the greatest power among creatures they control.
  // TODO(scaffold): • Target creature you control fights target creature you don't control.
});
