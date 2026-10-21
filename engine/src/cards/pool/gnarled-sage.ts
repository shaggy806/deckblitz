import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] If Gnarled Sage gains vigilance after it has attacked, it won't become untapped.
//   [2020-06-23] Gnarled Sage gets +0/+2 just once, no matter how many cards you've drawn past the
//     second.

export default defineCard({
  name: "Gnarled Sage",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nAs long as you've drawn two or more cards this turn, this creature gets +0/+2 and has vigilance. (Attacking doesn't cause it to tap.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantPt: [0, 2],
      grantKeywords: ["vigilance"],
      text: "As long as you've drawn two or more cards this turn, this creature gets +0/+2 and has vigilance.",
    },
  ],
});
