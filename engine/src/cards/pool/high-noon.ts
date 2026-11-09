import { defineCard } from "../define.js";

// EDHREC rank 7812.

export default defineCard({
  name: "High Noon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Each player can't cast more than one spell each turn.\n{4}{R}, Sacrifice this enchantment: It deals 5 damage to any target.",
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "{4}{R}, Sacrifice this enchantment: It deals 5 damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", limit: 1 }],
      text: "Each player can't cast more than one spell each turn.",
    },
  ],
});
