import { defineCard } from "../define.js";

// The card is chosen at random as the ability resolves, from whatever creature
// cards are in the graveyard then — nothing is targeted (its rulings).
export default defineCard({
  name: "Haunted Fengraf",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{3}, {T}, Sacrifice this land: Return a creature card at random from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { type: "creature" },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "{3}, {T}, Sacrifice this land: Return a creature card at random from your graveyard to your hand.",
    },
  ],
});
