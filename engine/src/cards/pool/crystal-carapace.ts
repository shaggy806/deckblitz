import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15166.

const STATIC_TEXT = "Enchanted creature gets +3/+3 and has ward {2}.";

export default defineCard({
  name: "Crystal Carapace",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{2}" },
  text: `Enchant creature\n${STATIC_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantsTriggered: [ward({ mana: "{2}" })],
      text: STATIC_TEXT,
    },
  ],
});
