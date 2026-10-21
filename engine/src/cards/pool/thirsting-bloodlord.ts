import { defineCard } from "../define.js";

// EDHREC rank 17584.

export default defineCard({
  name: "Thirsting Bloodlord",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: "Other Vampires you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Vampire", excludeSelf: true },
      grantPt: [1, 1],
      text: "Other Vampires you control get +1/+1.",
    },
  ],
});
