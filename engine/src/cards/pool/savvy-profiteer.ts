import { defineCard } from "../define.js";

// EDHREC rank 31939.
// Makes Treasure → use "Treasure Token".

export default defineCard({
  name: "Savvy Profiteer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ferengi", "Rogue"],
  power: 2,
  toughness: 1,
  text: "{T}: Add {R}.\n{3}, {T}: Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{3}, {T}: Create a Treasure token.",
    },
  ],
});
