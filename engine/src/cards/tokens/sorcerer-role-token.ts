import { defineCard } from "../define.js";

const SCRY_TEXT = "Whenever this creature attacks, scry 1.";

// Rule 111.10n: a colorless Aura Role enchantment token named Sorcerer.
export default defineCard({
  name: "Sorcerer Role Token",
  art: "https://cards.scryfall.io/art_crop/back/6/b/6b8a810b-8538-41c3-a792-dbd1a1845faa.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: `Enchant creature\nEnchanted creature gets +1/+1 and has "${SCRY_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "scry", amount: 1 },
          resolve: null,
          text: SCRY_TEXT,
        },
      ],
      text: `Enchanted creature gets +1/+1 and has "${SCRY_TEXT}"`,
    },
  ],
});
