import { defineCard } from "../define.js";

const TEXT = "{3}{R}, Sacrifice this enchantment: It deals 5 damage to target player or planeswalker.";

export default defineCard({
  name: "Font of Ire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
