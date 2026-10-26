import { defineCard } from "../define.js";

// EDHREC rank 21106.

const HELLBENT_TEXT =
  "Hellbent — Enchanted creature gets an additional +2/+0 as long as you have no cards in hand.";

export default defineCard({
  name: "Taste for Mayhem",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+0.\n${HELLBENT_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 0], text: "Enchanted creature gets +2/+0." },
    {
      affects: { scope: "attached" },
      condition: { kind: "hand-size", atMost: 0 },
      grantPt: [2, 0],
      text: HELLBENT_TEXT,
    },
  ],
});
