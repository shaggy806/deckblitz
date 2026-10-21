import { defineCard } from "../define.js";

// EDHREC rank 26486. Ikoria: Lair of Behemoths.

const SAC_TEXT = "{4}, {T}, Sacrifice this artifact: It deals 3 damage to any target.";

export default defineCard({
  name: "Springjaw Trap",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
