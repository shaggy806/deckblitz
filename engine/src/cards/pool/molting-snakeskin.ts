import { defineCard } from "../define.js";

// EDHREC rank 23053. The regeneration ability is granted to the creature, so
// only its controller can activate it (the ruling) — Consecrated by Blood's
// `grantsActivated`.

const STATIC_TEXT = 'Enchanted creature gets +2/+0 and has "{2}{B}: Regenerate this creature."';

export default defineCard({
  name: "Molting Snakeskin",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsActivated: [
        {
          cost: { mana: "{2}{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{2}{B}: Regenerate this creature.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
