import { defineCard } from "../define.js";

// Arabian Nights.
//
// "Discard the last card you drew this turn" is a discard cost of one card
// matching `lastDrawnThisTurn`: the activator's latest draw this turn, still
// in their hand. With none drawn this turn, or that card gone from the hand
// (even with an earlier draw still there), the cost can't be paid.

const RING = "{2}, {T}, Discard the last card you drew this turn: Draw a card.";

export default defineCard({
  name: "Jandor's Ring",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: RING,
  activated: [
    {
      cost: { mana: "{2}", tap: true, discard: { count: 1, filter: { lastDrawnThisTurn: true } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: RING,
    },
  ],
});
