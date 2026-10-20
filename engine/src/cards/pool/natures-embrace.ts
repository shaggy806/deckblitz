import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// Rulings:
//   If the enchanted permanent is both a land and a creature, it gets both benefits.

const CREATURE_TEXT = "As long as enchanted permanent is a creature, it gets +2/+2.";
const LAND_TEXT = 'As long as enchanted permanent is a land, it has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Nature's Embrace",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or land\n${CREATURE_TEXT}\n${LAND_TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [2, 2],
      text: CREATURE_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "land" } } },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: LAND_TEXT,
    },
  ],
});
