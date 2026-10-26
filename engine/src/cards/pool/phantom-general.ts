import { defineCard } from "../define.js";

// EDHREC rank 13143.
//
// Rulings:
//   [2012-10-01] A creature token that's a copy of a nontoken creature is still a token. It will
//     get +1/+1, but the original nontoken creature will not.

export default defineCard({
  name: "Phantom General",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Creature tokens you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantPt: [1, 1],
      text: "Creature tokens you control get +1/+1.",
    },
  ],
});
