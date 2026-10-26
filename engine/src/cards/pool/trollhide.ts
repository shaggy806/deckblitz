import { defineCard } from "../define.js";

// EDHREC rank 18772.
const STATIC_TEXT = 'Enchanted creature gets +2/+2 and has "{1}{G}: Regenerate this creature."';

export default defineCard({
  name: "Trollhide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT} (The next time the creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)`,
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
