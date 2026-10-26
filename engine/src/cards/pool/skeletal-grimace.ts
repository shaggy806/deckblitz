import { defineCard } from "../define.js";

// EDHREC rank 18006.

const STATIC_TEXT = 'Enchanted creature gets +1/+1 and has "{B}: Regenerate this creature."';

export default defineCard({
  name: "Skeletal Grimace",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{B}: Regenerate this creature.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
