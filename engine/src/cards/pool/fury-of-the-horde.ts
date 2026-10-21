import { defineCard } from "../define.js";

// EDHREC rank 6006.
//
// Rulings:
//   [2006-07-15] If it’s somehow not a main phase when Fury of the Horde resolves, all it does is
//     untap all creatures that attacked that turn. No new phases are created.
//   [2006-07-15] You can’t exile a card from your hand to pay for itself. At the time you would
//     pay costs, that card is on the stack, not in your hand.
//   [2006-07-15] Paying the alternative cost doesn’t change when you can cast the spell. A
//     creature spell you cast this way, for example, can still only be cast during your main phase
//     while the stack is empty.
//   [2006-07-15] If you don’t have two cards of the right color in your hand, you can’t choose to
//     cast the spell using the alternative cost.
//   [2006-07-15] You may pay the alternative cost rather than the card’s mana cost. Any additional
//     costs are paid as normal.

export default defineCard({
  name: "Fury of the Horde",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may exile two red cards from your hand rather than pay this spell's mana cost.\nUntap all creatures that attacked this turn. After this main phase, there is an additional combat phase followed by an additional main phase.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["R"] }, count: 2, text: "two red cards" } },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", attackedThisTurn: true } },
      { kind: "additional-combat" },
    ],
  },
});
