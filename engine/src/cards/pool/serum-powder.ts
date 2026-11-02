import { defineCard } from "../define.js";

// Rule 103.5b: "any time you could mulligan" is a time its holder would declare,
// in any round of mulligans; they then declare over the new hand. The card goes
// with the rest of the hand, so a second use takes a second Powder.

export default defineCard({
  name: "Serum Powder",
  manaCost: "{3}",
  types: ["artifact"],
  text: "{T}: Add {C}.\nAny time you could mulligan and this card is in your hand, you may exile all the cards from your hand, then draw that many cards. (You can do this in addition to taking mulligans.)",
  mulliganHandAbility: "exile-hand-draw-that-many",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
});
