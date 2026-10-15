import { defineCard } from "../define.js";

// EDHREC rank 10238.
export default defineCard({
  name: "White Lotus Reinforcements",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nOther Allies you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Ally", excludeSelf: true },
      grantPt: [1, 1],
      text: "Other Allies you control get +1/+1.",
    },
  ],
});
