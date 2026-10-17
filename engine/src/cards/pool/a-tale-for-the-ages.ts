import { defineCard } from "../define.js";

// EDHREC rank 15186. Wilds of Eldraine. "Enchanted" is enchanted by any
// player's Aura (rule 303.4) — Greater Auramancy's scope.

export default defineCard({
  name: "A Tale for the Ages",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Enchanted creatures you control get +2/+2.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [2, 2],
      text: "Enchanted creatures you control get +2/+2.",
    },
  ],
});
