import { defineCard } from "../define.js";

export default defineCard({
  name: "Elemental Masterpiece",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Create two 4/4 blue and red Elemental creature tokens.\n{U/R}{U/R}, Discard this card: Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  effect: { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 2 },
  activated: [
    {
      cost: { mana: "{U/R}{U/R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{U/R}{U/R}, Discard this card: Create a Treasure token.",
      zone: "hand",
    },
  ],
});
