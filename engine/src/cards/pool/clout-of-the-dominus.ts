import { defineCard } from "../define.js";

// EDHREC rank 6954.
//
// Rulings:
//   [2008-08-01] If the enchanted creature is both of the listed colors, it will get both bonuses.
//
// Steel of the Godhead's shape: each clause its own static on the enchanted
// creature, gated on its colour as it is now — a creature both blue and red
// gets both.
const BLUE_TEXT =
  "As long as enchanted creature is blue, it gets +1/+1 and has shroud. (It can't be the target of spells or abilities.)";
const RED_TEXT = "As long as enchanted creature is red, it gets +1/+1 and has haste.";

export default defineCard({
  name: "Clout of the Dominus",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BLUE_TEXT}\n${RED_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["U"] } } },
      grantPt: [1, 1],
      grantKeywords: ["shroud"],
      text: BLUE_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["R"] } } },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: RED_TEXT,
    },
  ],
});
