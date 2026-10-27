import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 29328. Seton's Desire's frame: the threshold is
// the Aura's controller's graveyard.

const THRESHOLD_TEXT =
  "Threshold — Enchanted creature gets +3/+0 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Kamahl's Desire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has first strike.\n${THRESHOLD_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "threshold" },
      grantPt: [3, 0],
      text: THRESHOLD_TEXT,
    },
  ],
});
