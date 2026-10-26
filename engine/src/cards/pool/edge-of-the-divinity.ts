import { defineCard } from "../define.js";

// EDHREC rank 13815.
//
// Rulings:
//   [2008-08-01] If the enchanted creature is both of the listed colors, it will get both bonuses.
//
// Shield of the Oversoul's shape: each clause its own static, gated on the
// enchanted creature's colour as it is now.
const WHITE_TEXT = "As long as enchanted creature is white, it gets +1/+2.";
const BLACK_TEXT = "As long as enchanted creature is black, it gets +2/+1.";

export default defineCard({
  name: "Edge of the Divinity",
  manaCost: "{W/B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${WHITE_TEXT}\n${BLACK_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
      grantPt: [1, 2],
      text: WHITE_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      grantPt: [2, 1],
      text: BLACK_TEXT,
    },
  ],
});
