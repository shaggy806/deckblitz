import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Ruling: +1/+1 per creature however many types it shares; "you" is this
// Equipment's controller.

const PT_TEXT = "Equipped creature gets +1/+1 for each other creature you control that shares a creature type with it.";

export default defineCard({
  name: "Stoneforge Masterwork",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PT_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you" },
        sharesCreatureTypeWithAffected: true,
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      text: PT_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
