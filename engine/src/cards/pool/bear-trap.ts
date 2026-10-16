import { defineCard } from "../define.js";

// EDHREC rank 18265.

export default defineCard({
  name: "Bear Trap",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: "Flash\n{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: "{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.",
    },
  ],
});
