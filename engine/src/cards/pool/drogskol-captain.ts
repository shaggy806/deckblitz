import { defineCard } from "../define.js";

// EDHREC rank 8384.

export default defineCard({
  name: "Drogskol Captain",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nOther Spirit creatures you control get +1/+1 and have hexproof. (They can't be the targets of spells or abilities your opponents control.)",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Spirit" },
      grantPt: [1, 1],
      grantKeywords: ["hexproof"],
      text: "Other Spirit creatures you control get +1/+1 and have hexproof.",
    },
  ],
});
