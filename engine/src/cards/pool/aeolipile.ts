import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 27170.
const TEXT = "{1}, {T}, Sacrifice this artifact: It deals 2 damage to any target.";

export default defineCard({
  name: "Aeolipile",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
