import { defineCard } from "../define.js";

// EDHREC rank 19684.
// Makes Goblin Soldier → use "Goblin Soldier Token".

export default defineCard({
  name: "Goblin Trenches",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: "{2}, Sacrifice a land: Create two 1/1 red and white Goblin Soldier creature tokens.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Soldier Token", count: 2 },
      resolve: null,
      text: "{2}, Sacrifice a land: Create two 1/1 red and white Goblin Soldier creature tokens.",
    },
  ],
});
