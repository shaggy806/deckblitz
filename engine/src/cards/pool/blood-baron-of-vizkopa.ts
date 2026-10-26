import { defineCard } from "../define.js";

// EDHREC rank 16665.
//
// Rulings:
//   [2013-04-15] In a Two-Headed Giant game, Blood Baron of Vizkopa gets +6/+6 and has flying as
//     long as your team has 30 or more life and an opposing team has 10 or less life.
//
// Serra Ascendant's condition and Ruthless Cullblade's, joined by `all`.

export default defineCard({
  name: "Blood Baron of Vizkopa",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: "Lifelink, protection from white and from black\nAs long as you have 30 or more life and an opponent has 10 or less life, this creature gets +6/+6 and has flying.",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W", "B"] },
      text: "Protection from white and from black",
    },
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "life-total", who: "you", atLeast: 30 },
          { kind: "life-total", who: "opponent", atMost: 10 },
        ],
      },
      grantPt: [6, 6],
      grantKeywords: ["flying"],
      text: "As long as you have 30 or more life and an opponent has 10 or less life, this creature gets +6/+6 and has flying.",
    },
  ],
});
