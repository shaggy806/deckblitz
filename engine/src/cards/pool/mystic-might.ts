import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age (ICE). EDHREC rank 32010.

const UPKEEP = cumulativeUpkeep("{1}{U}");
const GRANT_TEXT = 'Enchanted land has "{T}: Target creature gets +2/+2 until end of turn."';

export default defineCard({
  name: "Mystic Might",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${UPKEEP.text}\n${GRANT_TEXT}`,
  targets: ["land-you-control"],
  triggered: [UPKEEP],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          resolve: null,
          text: "{T}: Target creature gets +2/+2 until end of turn.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
