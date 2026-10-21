import { defineCard } from "../define.js";

// EDHREC rank 15745. Rivals of Ixalan.
//
// Arch of Orazca's "activate only if you have the city's blessing" on Candy
// Trail's sacrifice-for-life-and-a-card.

export default defineCard({
  name: "Orazca Relic",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n{T}: Add {C}.\n{T}, Sacrifice this artifact: You gain 3 life and draw a card. Activate only if you have the city's blessing.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{T}, Sacrifice this artifact: You gain 3 life and draw a card. Activate only if you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
