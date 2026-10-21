import { defineCard } from "../define.js";

export default defineCard({
  name: "Spirit of the Spires",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nOther creatures you control with flying get +0/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "flying", excludeSelf: true },
      grantPt: [0, 1],
      text: "Other creatures you control with flying get +0/+1.",
    },
  ],
});
