import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 21381.
//
// Rulings:
//   [2020-09-25] Because targets are chosen as you cast a spell, you can't have Inscription of
//     Ruin return a creature card and then destroy that creature.
//   [2020-09-25] If a card in a player's graveyard or a creature on the battlefield has {X} in its
//     mana cost, X is considered to be 0.
//   [2020-09-25] If you kick Inscription of Ruin, you can't choose any one mode more than once.
//   [2020-09-25] If any targets become illegal, the other targets will still be affected as
//     appropriate.
//   [2020-09-25] If more than one mode is chosen, perform them in the order written. Nothing can
//     happen in between, however, and no player may choose to take actions. Any abilities that
//     trigger will be put onto the stack after the spell has finished resolving.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

export default defineCard({
  name: "Inscription of Ruin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {2}{B}{B}\nChoose one. If this spell was kicked, choose any number instead.\n• Target opponent discards two cards.\n• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n• Destroy target creature with mana value 3 or less.",
  // TODO(scaffold): Kicker {2}{B}{B} Choose one.
  // TODO(scaffold): If ~ was kicked, choose any number instead.
  // TODO(scaffold): • Target opponent discards two cards.
  // TODO(scaffold): • Return target creature card with mana value 2 or less from your graveyard to the battlefield.
  // TODO(scaffold): • Destroy target creature with mana value 3 or less.
});
