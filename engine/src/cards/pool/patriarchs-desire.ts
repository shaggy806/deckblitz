import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31086.

const THRESHOLD =
  "Threshold — Enchanted creature gets an additional +2/-2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Patriarch's Desire",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/-2.\n${THRESHOLD}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, -2],
      text: "Enchanted creature gets +2/-2.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "threshold" },
      grantPt: [2, -2],
      text: THRESHOLD,
    },
  ],
});
