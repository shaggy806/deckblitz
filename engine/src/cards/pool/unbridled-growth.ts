import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 12422.
//
// Abundant Growth's grant, plus a sacrifice-to-draw.

const GRANT_TEXT = 'Enchanted land has "{T}: Add one mana of any color."';
const SAC_TEXT = "Sacrifice this Aura: Draw a card.";

export default defineCard({
  name: "Unbridled Growth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}\n${SAC_TEXT}`,
  targets: ["land"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: GRANT_TEXT,
    },
  ],
});
