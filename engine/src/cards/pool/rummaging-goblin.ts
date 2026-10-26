import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] Discarding a card is part of the cost to activate Rummaging Goblin's ability. If
//     you don't have a card in your hand, you can't pay this part of the cost and you can't
//     activate the ability.

export default defineCard({
  name: "Rummaging Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{T}, Discard a card: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Discard a card: Draw a card.",
    },
  ],
});
