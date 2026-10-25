import { defineCard } from "../define.js";

// EDHREC rank 23586. The regeneration ability is granted to the creature, so
// only its controller can activate it (the ruling) — Molting Snakeskin.
const STATIC_TEXT = 'Enchanted creature gets +2/+2 and has "{1}{G}: Regenerate this creature."';

export default defineCard({
  name: "Savage Silhouette",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: "{1}{G}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{1}{G}: Regenerate this creature.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
