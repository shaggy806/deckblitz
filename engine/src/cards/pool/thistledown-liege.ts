import { defineCard } from "../define.js";

// EDHREC rank 13552.
//
// Rulings:
//   [2008-05-01] The abilities are separate and cumulative. If another creature you control is
//     both of the listed colors, it will get a total of +2/+2.

const WHITE_TEXT = "Other white creatures you control get +1/+1.";
const BLUE_TEXT = "Other blue creatures you control get +1/+1.";

export default defineCard({
  name: "Thistledown Liege",
  manaCost: "{1}{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 1,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${WHITE_TEXT}\n${BLUE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: WHITE_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: BLUE_TEXT,
    },
  ],
});
