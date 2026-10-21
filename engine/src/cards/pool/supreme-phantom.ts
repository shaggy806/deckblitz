import { defineCard } from "../define.js";

export default defineCard({
  name: "Supreme Phantom",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nOther Spirits you control get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", subtype: "Spirit" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other Spirits you control get +1/+1.",
    },
  ],
});
