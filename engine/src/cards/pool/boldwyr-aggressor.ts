import { defineCard } from "../define.js";

// EDHREC rank 16496.
//
// Rulings:
//   [2025-11-17] If a creature loses double strike after assigning damage in the first strike
//     combat damage step (due to Boldwyr Aggressor leaving the battlefield, for example), that
//     creature won't assign damage in the normal combat damage step.
export default defineCard({
  name: "Boldwyr Aggressor",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 2,
  toughness: 5,
  keywords: ["double-strike"],
  text: "Double strike\nOther Giants you control have double strike.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Giant" },
      grantKeywords: ["double-strike"],
      text: "Other Giants you control have double strike.",
    },
  ],
});
