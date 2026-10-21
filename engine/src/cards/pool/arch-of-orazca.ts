import { defineCard } from "../define.js";

// EDHREC rank 2618.

export default defineCard({
  name: "Arch of Orazca",
  colors: [],
  types: ["land"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n{T}: Add {C}.\n{5}, {T}: Draw a card. Activate only if you have the city's blessing.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{5}, {T}: Draw a card. Activate only if you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
