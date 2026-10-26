import { defineCard } from "../define.js";

// EDHREC rank 18799.

const TEXT = "Sacrifice two creatures: Create a 3/1 red Beast creature token named Carnivore.";

export default defineCard({
  name: "Tooth and Claw",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" }, count: 2 } },
      targets: [],
      effect: { kind: "create-token", token: "Carnivore Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
