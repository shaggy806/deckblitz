import { defineCard } from "../define.js";

// Every player's buyback costs (rule 702.27a), not optional; only a buyback
// cost's own generic mana, never below {0}, nor the rest of the spell's cost
// or a buyback cost that isn't mana (its rulings).

export default defineCard({
  name: "Memory Crystal",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Buyback costs cost {2} less.",
  static: [{ affects: { scope: "self" }, buybackCostReduction: 2, text: "Buyback costs cost {2} less." }],
});
