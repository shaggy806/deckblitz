import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31342.
//
// Rulings:
//   [2004-10-04] Forbidden Lore grants an activated ability to the enchanted land. Only that
//     land's controller can activate the ability.

const GRANT_TEXT = 'Enchanted land has "{T}: Target creature gets +2/+1 until end of turn."';

export default defineCard({
  name: "Forbidden Lore",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "{T}: Target creature gets +2/+1 until end of turn.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
