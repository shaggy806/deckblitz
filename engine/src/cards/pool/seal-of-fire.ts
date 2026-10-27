import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 18300.

const TEXT = "Sacrifice this enchantment: It deals 2 damage to any target.";

export default defineCard({
  name: "Seal of Fire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
