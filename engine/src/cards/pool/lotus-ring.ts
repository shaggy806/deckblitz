import { addManaAbility, equip } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 11934.
//
// Summoning Materia's grant, with a Black Lotus for the mana ability: "this
// creature" in a granted ability is the creature that has it, so it
// sacrifices the equipped creature, not the Ring.
const GRANT_TEXT =
  'Equipped creature gets +3/+3 and has vigilance and "{T}, Sacrifice this creature: Add three mana of any one color."';

export default defineCard({
  name: "Lotus Ring",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["indestructible"],
  text: `Indestructible\n${GRANT_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["vigilance"],
      grantsActivated: [
        addManaAbility({
          mana: "any-color",
          amount: 3,
          sacrifice: "self",
          text: "{T}, Sacrifice this creature: Add three mana of any one color.",
        }),
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
