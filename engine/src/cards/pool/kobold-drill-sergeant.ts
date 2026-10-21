import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 20848.

const TEXT = "Other Kobold creatures you control get +0/+1 and have trample.";

export default defineCard({
  name: "Kobold Drill Sergeant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kobold", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Kobold" },
      grantPt: [0, 1],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
